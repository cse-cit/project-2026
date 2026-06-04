#include "lfw_bpf.h"
#include "lfw_bpf_shared.h"
#include "lfw_log.h"
#include <bpf/bpf.h>
#include <arpa/inet.h>
#include <stdio.h>
#include <string.h>
#include <errno.h>
#include <stdlib.h>

struct subnet_entry {
    lfw_u32 ip;
    lfw_u32 mask;
    struct rule_mask r_mask;
};

static inline int get_prefix_len(lfw_u32 mask)
{
    lfw_u32 host_mask = ntohl(mask);
    int len = 0;
    for (int b = 31; b >= 0; b--) {
        if ((host_mask >> b) & 1) len++;
        else break;
    }
    return len;
}

static bool subnet_contains(lfw_u32 ip_a, lfw_u32 mask_a, lfw_u32 ip_b, lfw_u32 mask_b)
{
    int len_a = get_prefix_len(mask_a);
    int len_b = get_prefix_len(mask_b);
    
    if (len_a > len_b)
        return false;
        
    return (ip_b & mask_a) == ip_a;
}

static void set_bit(struct rule_mask *mask, int bit_idx)
{
    int word = bit_idx / 64;
    int bit = bit_idx % 64;
    mask->bits[word] |= (1ULL << bit);
}

static void or_masks(struct rule_mask *dest, const struct rule_mask *src)
{
    for (int i = 0; i < 4; i++) {
        dest->bits[i] |= src->bits[i];
    }
}

static void clear_trie(int trie_fd)
{
    struct lpm_key keys[1024];
    int count = 0;
    struct lpm_key key = {}, next_key = {};
    
    int res = bpf_map_get_next_key(trie_fd, NULL, &next_key);
    while (res == 0 && count < 1024) {
        keys[count++] = next_key;
        key = next_key;
        res = bpf_map_get_next_key(trie_fd, &key, &next_key);
    }
    
    for (int i = 0; i < count; i++) {
        bpf_map_delete_elem(trie_fd, &keys[i]);
    }
}

lfw_status_t lfw_bpf_sync_rules(const lfw_rule_t *rules, lfw_u32 rule_count, lfw_action_t default_action)
{
    int rules_fd = lfw_bpf_get_rules_map_fd();
    int config_fd = lfw_bpf_get_config_map_fd();
    int src_trie_fd = lfw_bpf_get_src_ip_trie_fd();
    int dst_trie_fd = lfw_bpf_get_dst_ip_trie_fd();

    if (rules_fd < 0 || config_fd < 0 || src_trie_fd < 0 || dst_trie_fd < 0) {
        lfw_log_error("BPF maps not initialized");
        return LFW_ERR_GENERIC;
    }

    // 1. Update config map
    __u32 idx_def = 0;
    __u32 val_def = (default_action == LFW_ACTION_ACCEPT) ? 1 : 2;
    if (bpf_map_update_elem(config_fd, &idx_def, &val_def, BPF_ANY) != 0) {
        lfw_log_error("Failed to update config default action: %s", strerror(errno));
        return LFW_ERR_GENERIC;
    }

    __u32 idx_cnt = 1;
    __u32 val_cnt = rule_count > 256 ? 256 : rule_count;
    if (bpf_map_update_elem(config_fd, &idx_cnt, &val_cnt, BPF_ANY) != 0) {
        lfw_log_error("Failed to update config rule count: %s", strerror(errno));
        return LFW_ERR_GENERIC;
    }

    // 2. Clear old trie maps
    clear_trie(src_trie_fd);
    clear_trie(dst_trie_fd);

    // 3. Populate rules details map
    for (__u32 i = 0; i < 256; i++) {
        struct bpf_rule b_rule = {};
        if (i < val_cnt) {
            const lfw_rule_t *rule = &rules[i];
            b_rule.src_ip = rule->match.src_ip.addr;
            b_rule.src_mask = rule->match.src_mask.addr;
            b_rule.dst_ip = rule->match.dst_ip.addr;
            b_rule.dst_mask = rule->match.dst_mask.addr;
            
            b_rule.src_port_min = rule->match.match_src_port ? rule->match.src_port.min : 0;
            b_rule.src_port_max = rule->match.match_src_port ? rule->match.src_port.max : 65535;
            b_rule.dst_port_min = rule->match.match_dst_port ? rule->match.dst_port.min : 0;
            b_rule.dst_port_max = rule->match.match_dst_port ? rule->match.dst_port.max : 65535;

            b_rule.match_src_ip = rule->match.match_src_ip ? 1 : 0;
            b_rule.match_dst_ip = rule->match.match_dst_ip ? 1 : 0;
            b_rule.protocol = (rule->match.protocol == LFW_PROTO_TCP) ? 1 :
                              (rule->match.protocol == LFW_PROTO_UDP) ? 2 :
                              (rule->match.protocol == LFW_PROTO_ICMP) ? 3 : 0;
            b_rule.match_src_port = rule->match.match_src_port ? 1 : 0;
            b_rule.match_dst_port = rule->match.match_dst_port ? 1 : 0;
            b_rule.action = (rule->action == LFW_ACTION_ACCEPT) ? 1 : 2;
            b_rule.hit_count = 0;
            b_rule.byte_count = 0;
        }

        if (bpf_map_update_elem(rules_fd, &i, &b_rule, BPF_ANY) != 0) {
            lfw_log_error("Failed to write BPF rule #%u: %s", i + 1, strerror(errno));
            return LFW_ERR_GENERIC;
        }
    }

    // 4. Compile and sync Source subnets
    struct subnet_entry src_subnets[256];
    int src_subnet_count = 0;

    src_subnets[0].ip = 0;
    src_subnets[0].mask = 0;
    memset(&src_subnets[0].r_mask, 0, sizeof(struct rule_mask));
    src_subnet_count = 1;

    for (__u32 i = 0; i < val_cnt; i++) {
        const lfw_rule_t *rule = &rules[i];
        lfw_u32 ip = rule->match.match_src_ip ? rule->match.src_ip.addr : 0;
        lfw_u32 mask = rule->match.match_src_ip ? rule->match.src_mask.addr : 0;

        bool found = false;
        for (int j = 0; j < src_subnet_count; j++) {
            if (src_subnets[j].ip == ip && src_subnets[j].mask == mask) {
                found = true;
                break;
            }
        }

        if (!found && src_subnet_count < 256) {
            src_subnets[src_subnet_count].ip = ip;
            src_subnets[src_subnet_count].mask = mask;
            memset(&src_subnets[src_subnet_count].r_mask, 0, sizeof(struct rule_mask));
            src_subnet_count++;
        }
    }

    for (int j = 0; j < src_subnet_count; j++) {
        lfw_u32 ip = src_subnets[j].ip;
        lfw_u32 mask = src_subnets[j].mask;

        for (__u32 i = 0; i < val_cnt; i++) {
            const lfw_rule_t *rule = &rules[i];
            if (!rule->match.match_src_ip || (rule->match.src_ip.addr == ip && rule->match.src_mask.addr == mask)) {
                set_bit(&src_subnets[j].r_mask, i);
            }
        }
    }

    for (int j = 0; j < src_subnet_count; j++) {
        for (int k = 0; k < src_subnet_count; k++) {
            if (j == k) continue;
            if (subnet_contains(src_subnets[k].ip, src_subnets[k].mask, src_subnets[j].ip, src_subnets[j].mask)) {
                or_masks(&src_subnets[j].r_mask, &src_subnets[k].r_mask);
            }
        }
    }

    for (int j = 0; j < src_subnet_count; j++) {
        struct lpm_key key = {
            .prefixlen = get_prefix_len(src_subnets[j].mask),
            .ip = src_subnets[j].ip
        };
        if (bpf_map_update_elem(src_trie_fd, &key, &src_subnets[j].r_mask, BPF_ANY) != 0) {
            lfw_log_error("Failed to write BPF src trie element: %s", strerror(errno));
            return LFW_ERR_GENERIC;
        }
    }

    // 5. Compile and sync Destination subnets
    struct subnet_entry dst_subnets[256];
    int dst_subnet_count = 0;

    dst_subnets[0].ip = 0;
    dst_subnets[0].mask = 0;
    memset(&dst_subnets[0].r_mask, 0, sizeof(struct rule_mask));
    dst_subnet_count = 1;

    for (__u32 i = 0; i < val_cnt; i++) {
        const lfw_rule_t *rule = &rules[i];
        lfw_u32 ip = rule->match.match_dst_ip ? rule->match.dst_ip.addr : 0;
        lfw_u32 mask = rule->match.match_dst_ip ? rule->match.dst_mask.addr : 0;

        bool found = false;
        for (int j = 0; j < dst_subnet_count; j++) {
            if (dst_subnets[j].ip == ip && dst_subnets[j].mask == mask) {
                found = true;
                break;
            }
        }

        if (!found && dst_subnet_count < 256) {
            dst_subnets[dst_subnet_count].ip = ip;
            dst_subnets[dst_subnet_count].mask = mask;
            memset(&dst_subnets[dst_subnet_count].r_mask, 0, sizeof(struct rule_mask));
            dst_subnet_count++;
        }
    }

    for (int j = 0; j < dst_subnet_count; j++) {
        lfw_u32 ip = dst_subnets[j].ip;
        lfw_u32 mask = dst_subnets[j].mask;

        for (__u32 i = 0; i < val_cnt; i++) {
            const lfw_rule_t *rule = &rules[i];
            if (!rule->match.match_dst_ip || (rule->match.dst_ip.addr == ip && rule->match.dst_mask.addr == mask)) {
                set_bit(&dst_subnets[j].r_mask, i);
            }
        }
    }

    for (int j = 0; j < dst_subnet_count; j++) {
        for (int k = 0; k < dst_subnet_count; k++) {
            if (j == k) continue;
            if (subnet_contains(dst_subnets[k].ip, dst_subnets[k].mask, dst_subnets[j].ip, dst_subnets[j].mask)) {
                or_masks(&dst_subnets[j].r_mask, &dst_subnets[k].r_mask);
            }
        }
    }

    for (int j = 0; j < dst_subnet_count; j++) {
        struct lpm_key key = {
            .prefixlen = get_prefix_len(dst_subnets[j].mask),
            .ip = dst_subnets[j].ip
        };
        if (bpf_map_update_elem(dst_trie_fd, &key, &dst_subnets[j].r_mask, BPF_ANY) != 0) {
            lfw_log_error("Failed to write BPF dst trie element: %s", strerror(errno));
            return LFW_ERR_GENERIC;
        }
    }

    return LFW_OK;
}

static void format_rule(const struct bpf_rule *rule, char *buf, size_t buf_len)
{
    int offset = 0;
    offset += snprintf(buf + offset, buf_len - offset, "%s",
                       rule->action == 1 ? "allow" : "deny");

    const char *proto = "any";
    if (rule->protocol == 1) proto = "tcp";
    else if (rule->protocol == 2) proto = "udp";
    else if (rule->protocol == 3) proto = "icmp";

    if (rule->protocol != 0) {
        offset += snprintf(buf + offset, buf_len - offset, " %s", proto);
    }

    if (rule->match_dst_port) {
        if (rule->dst_port_min == rule->dst_port_max) {
            offset += snprintf(buf + offset, buf_len - offset, " %u", rule->dst_port_min);
        } else {
            offset += snprintf(buf + offset, buf_len - offset, " %u-%u", rule->dst_port_min, rule->dst_port_max);
        }
    }

    if (rule->match_src_ip) {
        char ip_str[32];
        struct in_addr in;
        in.s_addr = rule->src_ip;
        inet_ntop(AF_INET, &in, ip_str, sizeof(ip_str));

        int prefix = get_prefix_len(rule->src_mask);
        if (prefix == 32) {
            offset += snprintf(buf + offset, buf_len - offset, " from %s", ip_str);
        } else {
            offset += snprintf(buf + offset, buf_len - offset, " from %s/%d", ip_str, prefix);
        }
    } else {
        offset += snprintf(buf + offset, buf_len - offset, " from any");
    }

    if (rule->match_dst_ip) {
        char ip_str[32];
        struct in_addr in;
        in.s_addr = rule->dst_ip;
        inet_ntop(AF_INET, &in, ip_str, sizeof(ip_str));

        int prefix = get_prefix_len(rule->dst_mask);
        if (prefix == 32) {
            offset += snprintf(buf + offset, buf_len - offset, " to %s", ip_str);
        } else {
            offset += snprintf(buf + offset, buf_len - offset, " to %s/%d", ip_str, prefix);
        }
    } else {
        offset += snprintf(buf + offset, buf_len - offset, " to any");
    }
}

void lfw_bpf_dump_stats(const lfw_rule_t *orig_rules, lfw_u32 orig_rule_count, lfw_action_t default_action)
{
    (void)orig_rules;

    int conntrack_fd = lfw_bpf_get_conntrack_map_fd();
    int rules_fd = lfw_bpf_get_rules_map_fd();
    int config_fd = lfw_bpf_get_config_map_fd();

    if (conntrack_fd < 0 || rules_fd < 0 || config_fd < 0) {
        lfw_log_error("BPF maps not initialized for stats dump");
        return;
    }

    lfw_u32 conn_count = 0;
    struct conntrack_key key = {}, next_key = {};
    
    while (bpf_map_get_next_key(conntrack_fd, &key, &next_key) == 0) {
        conn_count++;
        key = next_key;
    }

    __u32 idx_cnt = 1;
    __u32 rule_count = 0;
    if (bpf_map_lookup_elem(config_fd, &idx_cnt, &rule_count) != 0) {
        rule_count = orig_rule_count;
    }

    lfw_log_info("=== eBPF/TC Firewall Statistics ===");
    lfw_log_info("Active Connections Table Count: %u", conn_count);
    lfw_log_info("Default Policy Verdict: %s",
                 default_action == LFW_ACTION_ACCEPT ? "ACCEPT" : "DROP");
    lfw_log_info("Installed Rules Count: %u", rule_count);

    for (__u32 i = 0; i < rule_count && i < 256; i++) {
        struct bpf_rule b_rule = {};
        if (bpf_map_lookup_elem(rules_fd, &i, &b_rule) == 0) {
            char rule_str[256];
            format_rule(&b_rule, rule_str, sizeof(rule_str));
            lfw_log_info("  Rule #%u [%s]: hits=%lu, bytes=%lu",
                         i + 1, rule_str, (unsigned long)b_rule.hit_count, (unsigned long)b_rule.byte_count);
        }
    }

    lfw_log_info("===========================");
}
