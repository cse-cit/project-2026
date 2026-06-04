#define __KERNEL__
#include <linux/bpf.h>
#include <linux/pkt_cls.h>
#include <linux/if_ether.h>
#include <linux/ip.h>
#include <linux/in.h>
#include <linux/tcp.h>
#include <linux/udp.h>
#include <bpf/bpf_helpers.h>
#include <bpf/bpf_endian.h>

#include "lfw_bpf_shared.h"

// Connection tracking timeouts in nanoseconds
#define TCP_TIMEOUT_NS (300ULL * 1000000000ULL)
#define UDP_TIMEOUT_NS (60ULL * 1000000000ULL)

struct {
    __uint(type, BPF_MAP_TYPE_HASH);
    __uint(max_entries, 4096);
    __type(key, struct conntrack_key);
    __type(value, struct conntrack_val);
} conntrack_map SEC(".maps");

struct {
    __uint(type, BPF_MAP_TYPE_LPM_TRIE);
    __uint(max_entries, 1024);
    __type(key, struct lpm_key);
    __type(value, struct rule_mask);
    __uint(map_flags, BPF_F_NO_PREALLOC);
} src_ip_trie SEC(".maps");

struct {
    __uint(type, BPF_MAP_TYPE_LPM_TRIE);
    __uint(max_entries, 1024);
    __type(key, struct lpm_key);
    __type(value, struct rule_mask);
    __uint(map_flags, BPF_F_NO_PREALLOC);
} dst_ip_trie SEC(".maps");

struct {
    __uint(type, BPF_MAP_TYPE_ARRAY);
    __uint(max_entries, 256);
    __type(key, __u32);
    __type(value, struct bpf_rule);
} rules_details_map SEC(".maps");

struct {
    __uint(type, BPF_MAP_TYPE_ARRAY);
    __uint(max_entries, 2);
    __type(key, __u32);
    __type(value, __u32);
} config_map SEC(".maps");

struct {
    __uint(type, BPF_MAP_TYPE_RINGBUF);
    __uint(max_entries, 256 * 1024);
} events_ringbuf SEC(".maps");

SEC("tc")
int lfw_tc_filter(struct __sk_buff *skb)
{
    void *data_end = (void *)(long)skb->data_end;
    void *data     = (void *)(long)skb->data;

    // Parse ethernet header
    struct ethhdr *eth = data;
    if ((void *)(eth + 1) > data_end)
        return TC_ACT_OK;

    if (bpf_ntohs(eth->h_proto) != ETH_P_IP)
        return TC_ACT_OK; // Only process IPv4

    // Parse IP header
    struct iphdr *ip = (void *)(eth + 1);
    if ((void *)(ip + 1) > data_end)
        return TC_ACT_OK;

    // Check minimum IPv4 header length
    __u32 ip_hdr_len = ip->ihl * 4;
    if ((void *)((__u8 *)ip + ip_hdr_len) > data_end)
        return TC_ACT_OK;

    __u8 proto = ip->protocol;
    __be32 src_ip = ip->saddr;
    __be32 dst_ip = ip->daddr;

    __be16 src_port = 0;
    __be16 dst_port = 0;
    __u8 lfw_proto = 0; // matching lfw_proto_t enum values (0: ANY, 1: TCP, 2: UDP, 3: ICMP)

    if (proto == IPPROTO_TCP) {
        lfw_proto = 1;
        struct tcphdr *tcp = (void *)((__u8 *)ip + ip_hdr_len);
        if ((void *)(tcp + 1) > data_end)
            return TC_ACT_OK;
        src_port = tcp->source;
        dst_port = tcp->dest;
    } else if (proto == IPPROTO_UDP) {
        lfw_proto = 2;
        struct udphdr *udp = (void *)((__u8 *)ip + ip_hdr_len);
        if ((void *)(udp + 1) > data_end)
            return TC_ACT_OK;
        src_port = udp->source;
        dst_port = udp->dest;
    } else if (proto == IPPROTO_ICMP) {
        lfw_proto = 3;
    }

    // Prepare conntrack key
    struct conntrack_key key = {};
    if (src_ip < dst_ip || (src_ip == dst_ip && src_port <= dst_port)) {
        key.src_ip   = src_ip;
        key.dst_ip   = dst_ip;
        key.src_port = src_port;
        key.dst_port = dst_port;
    } else {
        key.src_ip   = dst_ip;
        key.dst_ip   = src_ip;
        key.src_port = dst_port;
        key.dst_port = src_port;
    }
    key.proto = lfw_proto;

    __u64 now = bpf_ktime_get_ns();
    __u64 pkt_len = skb->len;

    // Conntrack check (only for TCP/UDP)
    if (lfw_proto == 1 || lfw_proto == 2) {
        struct conntrack_val *val = bpf_map_lookup_elem(&conntrack_map, &key);
        if (val) {
            __u64 timeout = (lfw_proto == 1) ? TCP_TIMEOUT_NS : UDP_TIMEOUT_NS;
            if (now - val->last_seen <= timeout) {
                // Connection is established/active
                val->last_seen = now;
                val->bytes    += pkt_len;
                val->packets  += 1;
                __u32 act = val->action;
                if (act == 1) // LFW_ACTION_ACCEPT
                    return TC_ACT_OK;
                else
                    return TC_ACT_SHOT;
            }
        }
    }

    // Rules evaluation
    struct lpm_key src_key = {
        .prefixlen = 32,
        .ip = src_ip
    };
    struct rule_mask *src_mask = bpf_map_lookup_elem(&src_ip_trie, &src_key);

    struct lpm_key dst_key = {
        .prefixlen = 32,
        .ip = dst_ip
    };
    struct rule_mask *dst_mask = bpf_map_lookup_elem(&dst_ip_trie, &dst_key);

    struct rule_mask intersected = {};
    if (src_mask && dst_mask) {
        #pragma unroll
        for (int i = 0; i < 4; i++) {
            intersected.bits[i] = src_mask->bits[i] & dst_mask->bits[i];
        }
    }

    __u8 decision_action = 0; // 0: undecided, 1: accept, 2: drop
    struct bpf_rule *matched_rule = NULL;

    #pragma unroll
    for (int i = 0; i < 4; i++) {
        __u64 mask_val = intersected.bits[i];

        for (int j = 0; j < 64; j++) {
            if (mask_val == 0)
                break;

            int bit_idx = __builtin_ctzll(mask_val);
            __u32 rule_idx = i * 64 + bit_idx;

            struct bpf_rule *rule = bpf_map_lookup_elem(&rules_details_map, &rule_idx);
            if (rule) {
                if (rule->protocol == 0 || rule->protocol == lfw_proto) {
                    __u8 port_match = 1;
                    if (lfw_proto == 1 || lfw_proto == 2) {
                        __u16 s_port = bpf_ntohs(src_port);
                        __u16 d_port = bpf_ntohs(dst_port);

                        if (rule->match_src_port) {
                            if (s_port < rule->src_port_min || s_port > rule->src_port_max)
                                port_match = 0;
                        }
                        if (rule->match_dst_port) {
                            if (d_port < rule->dst_port_min || d_port > rule->dst_port_max)
                                port_match = 0;
                        }
                    }

                    if (port_match) {
                        decision_action = rule->action;
                        matched_rule = rule;
                        break;
                    }
                }
            }

            mask_val &= (mask_val - 1);
        }

        if (decision_action != 0)
            break;
    }

    // Fallback to default action
    if (decision_action == 0) {
        __u32 config_idx_def = 0;
        __u32 *p_default_action = bpf_map_lookup_elem(&config_map, &config_idx_def);
        decision_action = p_default_action ? (__u8)*p_default_action : 2; // Default to drop (2)
    }

    // Update rule hit/byte metrics
    if (matched_rule) {
        __sync_fetch_and_add(&matched_rule->hit_count, 1);
        __sync_fetch_and_add(&matched_rule->byte_count, pkt_len);
    }

    // Submit telemetry event to Ring Buffer (slow path logs)
    if (decision_action != 0) {
        struct lfw_event *event = bpf_ringbuf_reserve(&events_ringbuf, sizeof(struct lfw_event), 0);
        if (event) {
            event->src_ip = src_ip;
            event->dst_ip = dst_ip;
            event->src_port = src_port;
            event->dst_port = dst_port;
            event->proto = lfw_proto;
            event->action = decision_action;
            event->pkt_len = pkt_len;
            event->timestamp = now;
            bpf_ringbuf_submit(event, 0);
        }
    }

    // Add to conntrack if accepted and protocol is TCP/UDP
    if (decision_action == 1 && (lfw_proto == 1 || lfw_proto == 2)) {
        struct conntrack_val new_val = {
            .last_seen = now,
            .bytes     = pkt_len,
            .packets   = 1,
            .action    = 1,
        };
        bpf_map_update_elem(&conntrack_map, &key, &new_val, BPF_ANY);
    }

    if (decision_action == 1)
        return TC_ACT_OK;
    else
        return TC_ACT_SHOT;
}

char _license[] SEC("license") = "GPL";
