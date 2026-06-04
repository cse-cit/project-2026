#ifndef LFW_BPF_SHARED_H
#define LFW_BPF_SHARED_H

#include <linux/types.h>

// 5-tuple for connection tracking key
struct conntrack_key {
    __be32 src_ip;
    __be32 dst_ip;
    __be16 src_port;
    __be16 dst_port;
    __u8   proto;
    __u8   pad[3]; // Align to 4 bytes boundary
};

// Value stored in conntrack map
struct conntrack_val {
    __u64 last_seen;
    __u64 bytes;
    __u64 packets;
    __u32 action;  // LFW_ACTION_ACCEPT (1) or LFW_ACTION_DROP (2)
    __u32 pad;     // Keep 8-byte alignment
};

// Rule structure for BPF rules map
struct bpf_rule {
    __be32 src_ip;
    __be32 src_mask;
    __be32 dst_ip;
    __be32 dst_mask;
    __u16  src_port_min; // Host byte order for range comparison
    __u16  src_port_max; // Host byte order for range comparison
    __u16  dst_port_min; // Host byte order for range comparison
    __u16  dst_port_max; // Host byte order for range comparison
    __u8   match_src_ip;
    __u8   match_dst_ip;
    __u8   protocol;
    __u8   match_src_port;
    __u8   match_dst_port;
    __u8   action;
    __u8   pad[2];
    __u64  hit_count;
    __u64  byte_count;
};

// LPM Key for BPF LPM Trie map
struct lpm_key {
    __u32 prefixlen;
    __be32 ip;
};

// Rule mask supporting up to 256 rules
struct rule_mask {
    __u64 bits[4];
};

// Telemetry event for Ring Buffer
struct lfw_event {
    __be32 src_ip;
    __be32 dst_ip;
    __be16 src_port;
    __be16 dst_port;
    __u8   proto;
    __u8   action; // 1: ALLOW, 2: DROP
    __u8   pad[2];
    __u64  pkt_len;
    __u64  timestamp;
};

#endif
