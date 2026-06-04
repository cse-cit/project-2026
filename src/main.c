#include <arpa/inet.h>
#include <bpf/bpf.h>
#include <bpf/libbpf.h>
#include <errno.h> // IWYU pragma: keep
#include <pthread.h>
#include <signal.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <time.h>
#include <unistd.h>

#include "lfw_bpf.h"
#include "lfw_bpf_shared.h"
#include "lfw_config.h"
#include "lfw_log.h"
#include "lfw_rules.h"

// Timeouts in nanoseconds (matching kernel BPF)
#define TCP_TIMEOUT_SYN_SENT_NS (20ULL * 1000000000ULL)
#define TCP_TIMEOUT_SYN_RECV_NS (20ULL * 1000000000ULL)
#define TCP_TIMEOUT_FIN_WAIT_NS (30ULL * 1000000000ULL)
#define TCP_TIMEOUT_ESTABLISHED_NS (300ULL * 1000000000ULL)
#define UDP_TIMEOUT_NS (60ULL * 1000000000ULL)

static volatile sig_atomic_t g_running = 1;
static volatile sig_atomic_t g_reload_requested = 0;
static volatile sig_atomic_t g_dump_requested = 0;

static lfw_rule_t *g_rules = NULL;
static lfw_u32 g_rule_count = 0;
static lfw_action_t g_default_action = LFW_ACTION_DROP;
static char g_config_path[256] = "/etc/lfw/lfw.rules";

static pthread_t g_gc_thread;
static bool g_gc_running = false;

static pthread_t g_telemetry_thread;
static bool g_telemetry_running = false;

static int handle_event(void *ctx, void *data, size_t data_sz) {
  (void)ctx;
  if (data_sz < sizeof(struct lfw_event))
    return 0;

  struct lfw_event *event = (struct lfw_event *)data;

  char src_ip_str[32];
  char dst_ip_str[32];
  struct in_addr src_in = {.s_addr = event->src_ip};
  struct in_addr dst_in = {.s_addr = event->dst_ip};
  inet_ntop(AF_INET, &src_in, src_ip_str, sizeof(src_ip_str));
  inet_ntop(AF_INET, &dst_in, dst_ip_str, sizeof(dst_ip_str));

  const char *proto = "unknown";
  if (event->proto == 1)
    proto = "tcp";
  else if (event->proto == 2)
    proto = "udp";
  else if (event->proto == 3)
    proto = "icmp";

  const char *action = (event->action == 1) ? "ALLOW" : "DROP";

  // Print telemetry log line as structured JSON
  lfw_log_info("{\"timestamp\": %llu, \"action\": \"%s\", \"proto\": \"%s\", "
               "\"src\": \"%s:%u\", \"dst\": \"%s:%u\", \"len\": %llu}",
               (unsigned long long)event->timestamp, action, proto, src_ip_str,
               ntohs(event->src_port), dst_ip_str, ntohs(event->dst_port),
               (unsigned long long)event->pkt_len);

  return 0;
}

static void *telemetry_loop(void *arg) {
  (void)arg;
  int ringbuf_fd = lfw_bpf_get_events_ringbuf_fd();
  if (ringbuf_fd < 0) {
    lfw_log_error("Failed to get Ring Buffer FD");
    return NULL;
  }

  struct ring_buffer *rb =
      ring_buffer__new(ringbuf_fd, handle_event, NULL, NULL);
  if (!rb) {
    lfw_log_error("Failed to initialize ring buffer");
    return NULL;
  }

  while (g_running) {
    int err = ring_buffer__poll(rb, 100);
    if (err < 0 && err != -EINTR) {
      lfw_log_error("Error polling ring buffer: %d", err);
      break;
    }
  }

  ring_buffer__free(rb);
  return NULL;
}

static void handle_signal(int sig) {
  if (sig == SIGINT || sig == SIGTERM) {
    g_running = 0;
  } else if (sig == SIGHUP) {
    g_reload_requested = 1;
  } else if (sig == SIGUSR1) {
    g_dump_requested = 1;
  }
}

static void *conntrack_gc_loop(void *arg) {
  (void)arg;
  while (g_running) {
    for (int i = 0; i < 10 && g_running; i++) {
      sleep(1);
    }
    if (!g_running)
      break;

    int fd = lfw_bpf_get_conntrack_map_fd();
    if (fd < 0)
      continue;

    struct conntrack_key key = {}, next_key = {};
    struct conntrack_val val = {};
    struct timespec ts;
    __u64 now = 0;

    if (clock_gettime(CLOCK_MONOTONIC, &ts) == 0) {
      now = (__u64)ts.tv_sec * 1000000000ULL + ts.tv_nsec;
    } else {
      continue;
    }

    int has_more = bpf_map_get_next_key(fd, NULL, &next_key) == 0;
    while (has_more) {
      key = next_key;
      has_more = bpf_map_get_next_key(fd, &key, &next_key) == 0;

      if (bpf_map_lookup_elem(fd, &key, &val) == 0) {
        __u64 timeout = UDP_TIMEOUT_NS;
        if (key.proto == 1) { // TCP
          if (val.state == LFW_TCP_STATE_SYN_SENT)
            timeout = TCP_TIMEOUT_SYN_SENT_NS;
          else if (val.state == LFW_TCP_STATE_SYN_RECV)
            timeout = TCP_TIMEOUT_SYN_RECV_NS;
          else if (val.state == LFW_TCP_STATE_FIN_WAIT)
            timeout = TCP_TIMEOUT_FIN_WAIT_NS;
          else
            timeout = TCP_TIMEOUT_ESTABLISHED_NS;
        }
        if (now - val.last_seen > timeout) {
          bpf_map_delete_elem(fd, &key);
        }
      }
    }
  }
  return NULL;
}

static void cleanup(void) {
  lfw_log_info("cleaning up BPF subsystem...");
  g_running = 0;

  if (g_telemetry_running) {
    pthread_join(g_telemetry_thread, NULL);
    g_telemetry_running = false;
  }

  if (g_gc_running) {
    pthread_join(g_gc_thread, NULL);
    g_gc_running = false;
  }

  lfw_bpf_cleanup();

  if (g_rules) {
    lfw_config_free_rules(g_rules);
    g_rules = NULL;
  }
  lfw_log_close();
}

int main(int argc, char **argv) {
  // Root privilege check
  if (geteuid() != 0) {
    fprintf(stderr, "[lfw] run as root\n");
    return 1;
  }

  if (argc < 2) {
    fprintf(stderr, "Usage: %s <interface> [rules_file_path]\n", argv[0]);
    return 1;
  }

  const char *ifname = argv[1];
  if (argc > 2) {
    strncpy(g_config_path, argv[2], sizeof(g_config_path) - 1);
  }

  lfw_log_init(LFW_LOG_SYSLOG);

  // Register signal handlers
  struct sigaction sa = {};
  sa.sa_handler = handle_signal;
  sigemptyset(&sa.sa_mask);
  sigaction(SIGINT, &sa, NULL);
  sigaction(SIGTERM, &sa, NULL);
  sigaction(SIGHUP, &sa, NULL);
  sigaction(SIGUSR1, &sa, NULL);

  atexit(cleanup);

  // 1. Load config rules
  lfw_status_t st = lfw_config_load_file(g_config_path, &g_default_action,
                                         &g_rules, &g_rule_count);

  if (st != LFW_OK) {
    lfw_log_error("failed to load config: %s", g_config_path);
    return 1;
  }

  // 2. Initialize BPF subsystem
  const char *bpf_obj_path = "/usr/local/share/lfw/lfw_bpf.o";
  if (access(bpf_obj_path, F_OK) != 0) {
    bpf_obj_path = "build/lfw_bpf.o";
  }
  st = lfw_bpf_init(ifname, bpf_obj_path);
  if (st != LFW_OK) {
    lfw_log_error("failed to initialize BPF on interface %s", ifname);
    return 1;
  }

  // Spawn telemetry thread
  if (pthread_create(&g_telemetry_thread, NULL, telemetry_loop, NULL) == 0) {
    g_telemetry_running = true;
  } else {
    lfw_log_error("failed to spawn telemetry thread");
    return 1;
  }

  // 3. Sync initial rules to BPF maps
  st = lfw_bpf_sync_rules(g_rules, g_rule_count, g_default_action);
  if (st != LFW_OK) {
    lfw_log_error("failed to sync rules to BPF maps");
    return 1;
  }

  // 4. Spawn connection tracking garbage collector thread
  if (pthread_create(&g_gc_thread, NULL, conntrack_gc_loop, NULL) == 0) {
    g_gc_running = true;
  } else {
    lfw_log_error("failed to spawn conntrack GC thread");
    return 1;
  }

  lfw_log_info("daemon starting on interface %s", ifname);
  lfw_log_info("config: %s, rules: %u, default: %s", g_config_path,
               g_rule_count,
               g_default_action == LFW_ACTION_ACCEPT ? "ACCEPT" : "DROP");

  // Main event loop
  while (g_running) {
    if (g_reload_requested) {
      g_reload_requested = 0;
      lfw_rule_t *new_rules = NULL;
      lfw_u32 new_rule_count = 0;
      lfw_action_t new_default_action = LFW_ACTION_DROP;

      lfw_status_t reload_st = lfw_config_load_file(
          g_config_path, &new_default_action, &new_rules, &new_rule_count);

      if (reload_st == LFW_OK) {
        // Sync new rules to BPF
        if (lfw_bpf_sync_rules(new_rules, new_rule_count, new_default_action) ==
            LFW_OK) {
          lfw_config_free_rules(g_rules);
          g_rules = new_rules;
          g_rule_count = new_rule_count;
          g_default_action = new_default_action;
          lfw_log_info("Rules configuration reloaded successfully");
        } else {
          lfw_config_free_rules(new_rules);
          lfw_log_error("Failed to sync reloaded rules to BPF");
        }
      } else {
        lfw_log_error("Failed to reload rules configuration file: %s",
                      g_config_path);
      }
    }

    if (g_dump_requested) {
      g_dump_requested = 0;
      lfw_bpf_dump_stats(g_rules, g_rule_count, g_default_action);
    }

    pause();
  }

  lfw_log_info("shutdown complete");

  return 0;
}
