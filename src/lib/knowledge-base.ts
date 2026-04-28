export interface KnowledgeTopic {
  id: string;
  title: string;
  titleZh: string;
  icon: string;
  description: string;
  descriptionZh: string;
  source: string; // e.g. "ELEC3120 Lecture 1"
  keyPoints: { point: string; pointZh: string; detail: string; detailZh: string }[];
}

export const knowledgeTopics: KnowledgeTopic[] = [
  {
    id: "network-fundamentals",
    title: "Network Fundamentals & Layering",
    titleZh: "網絡基礎與分層",
    icon: "Layers",
    source: "ELEC3120 L01 — Introduction",
    description: "Understanding the OSI and TCP/IP models, packet switching vs circuit switching, and basic network terminology.",
    descriptionZh: "理解OSI和TCP/IP模型、分組交換與電路交換，以及基本網絡術語。",
    keyPoints: [
      {
        point: "OSI 7-Layer Model",
        pointZh: "OSI七層模型",
        detail: "The OSI model consists of 7 layers: Physical, Data Link, Network, Transport, Session, Presentation, and Application. Each layer serves a specific function and provides services to the layer above it.",
        detailZh: "OSI模型由7層組成：物理層、資料鏈結層、網絡層、傳輸層、會話層、表示層和應用層。每一層都有特定功能併為上層提供服務。"
      },
      {
        point: "TCP/IP 5-Layer Model",
        pointZh: "TCP/IP五層模型",
        detail: "The Internet uses a 5-layer model: Physical, Data Link, Network, Transport, and Application. This is a practical simplification of the OSI model used in real networking.",
        detailZh: "互聯網使用五層模型：物理層、資料鏈結層、網絡層、傳輸層和應用層。呢是OSI模型的實際簡化版本。"
      },
      {
        point: "Packet Switching vs Circuit Switching",
        pointZh: "分組交換與電路交換",
        detail: "Packet switching divides data into packets that can take different routes, allowing efficient sharing. Circuit switching establishes a dedicated path. The internet primarily uses packet switching.",
        detailZh: "分組交換將數據分割成可以通過不同路由傳輸的分組，實現高效共享。電路交換建立專用路徑。互聯網主要使用分組交換。"
      },
      {
        point: "Delay Types in Networks",
        pointZh: "網絡中的延遲類型",
        detail: "Four types of delay: Nodal processing delay, Queuing delay, Transmission delay, and Propagation delay. Total delay = d_proc + d_queue + d_trans + d_prop.",
        detailZh: "四種延遲類型：節點處理延遲、排隊延遲、傳輸延遲和傳播延遲。總延遲 = d_proc + d_queue + d_trans + d_prop。"
      }
    ]
  },
  {
    id: "transport-layer",
    title: "Transport Layer: UDP & TCP",
    titleZh: "傳輸層：UDP與TCP",
    icon: "ArrowUpDown",
    source: "ELEC3120 L05 — Transport Layer Model",
    description: "Deep dive into UDP and TCP protocols, multiplexing/demultiplexing, and transport layer services.",
    descriptionZh: "深入學習UDP和TCP協定、多路複用/多路分解，以及傳輸層服務。",
    keyPoints: [
      {
        point: "UDP (User Datagram Protocol)",
        pointZh: "UDP（用户數據報協定）",
        detail: "UDP is connectionless, provides no reliability guarantees, no flow control, no congestion control. Header is only 8 bytes. Used for DNS, DHCP, SNMP, and real-time applications like video conferencing.",
        detailZh: "UDP是無連接的，不提供可靠性保證、流量控制或擁塞控制。頭部僅8字節。用於DNS、DHCP、SNMP和視頻會議等實時應用。"
      },
      {
        point: "TCP (Transmission Control Protocol)",
        pointZh: "TCP（傳輸控制協定）",
        detail: "TCP is connection-oriented, provides reliable data transfer, flow control, and congestion control. Uses full-duplex communication with a 20-byte header. Used for HTTP, FTP, SMTP, and SSH.",
        detailZh: "TCP是面向連接的，提供可靠數據傳輸、流量控制和擁塞控制。使用全雙工通信，頭部20字節。用於HTTP、FTP、SMTP和SSH。"
      },
      {
        point: "Multiplexing & Demultiplexing",
        pointZh: "多路複用與多路分解",
        detail: "Multiplexing gathers data from sockets and passes to transport layer. Demultiplexing delivers received segments to the correct socket. Uses source/destination port numbers (16-bit, 0-65535).",
        detailZh: "多路複用從套接字收集數據並傳遞畀傳輸層。多路分解將接收到的數據段交付到正確的套接字。使用源/目的端口號（16位，0-65535）。"
      },
      {
        point: "UDP Checksum",
        pointZh: "UDP校驗和",
        detail: "UDP provides optional error detection through checksum. The checksum covers the UDP header, data, and pseudo-header (source/dest IP, protocol, UDP length). If checksum fails, the segment is silently discarded.",
        detailZh: "UDP通過校驗和提供可選的錯誤檢測。校驗和覆蓋UDP頭部、數據和偽頭部（源/目的IP、協定、UDP長度）。如果校驗和失敗，數據段被靜默丟棄。"
      }
    ]
  },
  {
    id: "reliable-transmission",
    title: "Reliable Transmission Protocols",
    titleZh: "可靠傳輸協定",
    icon: "ShieldCheck",
    source: "ELEC3120 L05–L06 — Transport / TCP Basics",
    description: "RDT protocols, ARQ mechanisms, checksums, and error detection/correction techniques.",
    descriptionZh: "RDT協定、ARQ機制、校驗和以及錯誤檢測/糾正技術。",
    keyPoints: [
      {
        point: "RDT 1.0: Reliable over Perfect Channel",
        pointZh: "RDT 1.0：完美信道上的可靠傳輸",
        detail: "Assumes no bit errors, no packet loss. Simple send-and-receive. The FSM has only one state for both sender and receiver.",
        detailZh: "假設冇比特錯誤，冇數據包丟失。簡單的發送和接收。發送方和接收方的有限狀態機都只有一個狀態。"
      },
      {
        point: "RDT 2.0: Over Channel with Bit Errors",
        pointZh: "RDT 2.0：有比特錯誤信道上的可靠傳輸",
        detail: "Adds error detection (checksum), ACK/NAK messages, and retransmission. Uses stop-and-wait protocol. Requires handling corrupted ACKs/NAKs using sequence numbers.",
        detailZh: "添加錯誤檢測（校驗和）、ACK/NAK訊息和重傳。使用停等協定。需要使用序號來處理損壞的ACK/NAK。"
      },
      {
        point: "RDT 3.0: Over Lossy Channel with Errors",
        pointZh: "RDT 3.0：有丟包和錯誤的信道上的可靠傳輸",
        detail: "Adds timeout and retransmission to handle packet loss. Sequence numbers 0 and 1 alternate. Sender waits for ACK with timeout before retransmitting.",
        detailZh: "添加逾時和重傳來處理數據包丟失。序號0和1交替使用。發送方在逾時前等待ACK，然後重傳。"
      },
      {
        point: "Pipelining: Go-Back-N and Selective Repeat",
        pointZh: "流水線：回退N步和選擇重傳",
        detail: "Go-Back-N (GBN): Sender can have up to N unACKed packets. On error, retransmit all from first unACKed. Selective Repeat (SR): Sender and receiver each buffer up to N packets, only retransmit lost ones.",
        detailZh: "回退N步（GBN）：發送方最多可以有N個未確認的數據包。出錯時，從第一個未確認的開始重傳。選擇重傳（SR）：發送方和接收方各緩衝N個數據包，只重傳丟失的。"
      }
    ]
  },
  {
    id: "tcp-connection",
    title: "TCP Connection Management",
    titleZh: "TCP連接管理",
    icon: "Link",
    source: "ELEC3120 L06 — TCP Basics",
    description: "TCP three-way handshake, four-way termination, connection states, and sequence numbers.",
    descriptionZh: "TCP三次握手、四次揮手、連接狀態和序號管理。",
    keyPoints: [
      {
        point: "Three-Way Handshake",
        pointZh: "三次握手",
        detail: "1) Client sends SYN (seq=x). 2) Server responds with SYN-ACK (seq=y, ack=x+1). 3) Client sends ACK (ack=y+1). This establishes bidirectional communication.",
        detailZh: "1) 客户端發送SYN（seq=x）。2) 服務器回覆SYN-ACK（seq=y, ack=x+1）。3) 客户端發送ACK（ack=y+1）。呢建立了雙向通信。"
      },
      {
        point: "Four-Way Termination (FIN)",
        pointZh: "四次揮手（FIN）",
        detail: "1) Client sends FIN. 2) Server ACKs. 3) Server sends FIN. 4) Client ACKs. Each direction is closed independently. TIME_WAIT state lasts for 2×MSL.",
        detailZh: "1) 客户端發送FIN。2) 服務器確認。3) 服務器發送FIN。4) 客户端確認。每個方向的關閉是獨立的。TIME_WAIT狀態持續2×MSL。"
      },
      {
        point: "TCP Sequence Numbers & ACKs",
        pointZh: "TCP序號與確認號",
        detail: "Sequence numbers count bytes (not packets). ACK number is the next expected byte. Cumulative ACK acknowledges all bytes up to but not including the ACK number.",
        detailZh: "序號計算的是字節（不是數據包）。確認號是期望接收的下一個字節。累計確認確認到但不包括確認號的所有字節。"
      },
      {
        point: "TCP State Machine",
        pointZh: "TCP狀態機",
        detail: "Connection states: LISTEN → SYN_RCVD → ESTABLISHED → FIN_WAIT_1 → FIN_WAIT_2 → TIME_WAIT → CLOSED. Server side: LISTEN → SYN_RCVD → ESTABLISHED → CLOSE_WAIT → LAST_ACK → CLOSED.",
        detailZh: "連接狀態：LISTEN → SYN_RCVD → ESTABLISHED → FIN_WAIT_1 → FIN_WAIT_2 → TIME_WAIT → CLOSED。服務器端：LISTEN → SYN_RCVD → ESTABLISHED → CLOSE_WAIT → LAST_ACK → CLOSED。"
      }
    ]
  },
  {
    id: "flow-congestion-control",
    title: "Flow Control & Congestion Control",
    titleZh: "流量控制與擁塞控制",
    icon: "Gauge",
    source: "ELEC3120 L07 — Congestion Control",
    description: "Sliding window, TCP flow control, congestion control algorithms (AIMD, slow start, etc.).",
    descriptionZh: "滑動窗口、TCP流量控制、擁塞控制算法（AIMD、慢啓動等）。",
    keyPoints: [
      {
        point: "Sliding Window Protocol",
        pointZh: "滑動窗口協定",
        detail: "Sender maintains a send window of size N. Window advances as ACKs arrive. Provides both reliability and pipelining. Receive window (rwnd) limits how much unACKed data the receiver can buffer.",
        detailZh: "發送方維護大小為N的發送窗口。窗口隨着ACK的到達而滑動。同時提供可靠性和流水線功能。接收窗口（rwnd）限制接收方能緩衝的未確認數據量。"
      },
      {
        point: "TCP Flow Control (rwnd)",
        pointZh: "TCP流量控制（rwnd）",
        detail: "Receiver advertises rwnd in every ACK. If rwnd=0, sender enters persist mode and sends probe segments. Prevents sender from overwhelming receiver's buffer.",
        detailZh: "接收方在每個ACK中通告rwnd。如果rwnd=0，發送方進入堅持模式並發送探測數據段。防止發送方淹沒接收方緩衝區。"
      },
      {
        point: "TCP Congestion Control: Slow Start",
        pointZh: "TCP擁塞控制：慢啓動",
        detail: "cwnd starts at 1 MSS, doubles each RTT (exponential growth). Continues until cwnd reaches ssthresh or a loss event occurs. Slow start threshold (ssthresh) initially set to a large value.",
        detailZh: "cwnd從1個MSS開始，每個RTT翻倍（指數增長）。持續到cwnd達到ssthresh或發生丟失事件。慢啓動閾值（ssthresh）初始設為較大值。"
      },
      {
        point: "AIMD & Congestion Avoidance",
        pointZh: "AIMD與擁塞避免",
        detail: "Congestion Avoidance: cwnd increases by 1 MSS per RTT (linear). On loss: ssthresh = cwnd/2, cwnd = 1 (Tahoe) or cwnd = ssthresh (Reno). Three duplicate ACKs → Fast Retransmit + Fast Recovery.",
        detailZh: "擁塞避免：cwnd每個RTT增加1個MSS（線性）。丟包時：ssthresh = cwnd/2，cwnd = 1（Tahoe）或 cwnd = ssthresh（Reno）。三個重複ACK → 快速重傳 + 快速恢復。"
      }
    ]
  },
  {
    id: "web-http",
    title: "Web & HTTP Protocol Evolution",
    titleZh: "Web與HTTP協定演進",
    icon: "Globe",
    source: "ELEC3120 L02 — Web (HTTP & DNS)",
    description: "HTTP/1.0, HTTP/1.1, HTTP/2, HTTP/3 differences, web caching, cookies, and session management.",
    descriptionZh: "HTTP/1.0、HTTP/1.1、HTTP/2、HTTP/3的區別，Web緩存、Cookie和會話管理。",
    keyPoints: [
      {
        point: "HTTP/1.0 vs HTTP/1.1",
        pointZh: "HTTP/1.0 vs HTTP/1.1",
        detail: "HTTP/1.0: non-persistent connections (one object per TCP connection). HTTP/1.1: persistent connections by default (multiple objects per connection), supports pipelining.",
        detailZh: "HTTP/1.0：非持久連接（每個TCP連接一個對象）。HTTP/1.1：默認持久連接（每個連接多個對象），支援流水線。"
      },
      {
        point: "HTTP/2 Improvements",
        pointZh: "HTTP/2改進",
        detail: "Binary framing instead of text-based, multiplexing over a single TCP connection, header compression (HPACK), server push. Eliminates head-of-line blocking at the application layer.",
        detailZh: "使用二進制分幀代替基於文本的格式，在單個TCP連接上多路複用，頭部壓縮（HPACK），服務器推送。消除了應用層的隊頭阻塞。"
      },
      {
        point: "HTTP/3 & QUIC",
        pointZh: "HTTP/3與QUIC",
        detail: "HTTP/3 uses QUIC (based on UDP) instead of TCP. Solves TCP-level head-of-line blocking. Built-in TLS 1.3 encryption. Connection migration support. Faster connection establishment.",
        detailZh: "HTTP/3使用QUIC（基於UDP）代替TCP。解決了TCP級的隊頭阻塞。內置TLS 1.3加密。支援連接遷移。更快的連接建立。"
      },
      {
        point: "Web Caching & CDNs",
        pointZh: "Web緩存與CDN",
        detail: "Caching reduces response time and network traffic. Conditional GET uses If-Modified-Since header. CDNs distribute content geographically to reduce latency. Cache-Control headers manage freshness.",
        detailZh: "緩存減少響應時間和網絡流量。條件GET使用If-Modified-Since頭部。CDN在地理上分發內容以減少延遲。Cache-Control頭部管理新鮮度。"
      }
    ]
  },
  {
    id: "video-streaming",
    title: "Video Streaming Fundamentals",
    titleZh: "視頻流基礎",
    icon: "Play",
    source: "ELEC3120 L03 — Video Streaming",
    description: "DASH streaming, video compression, CDN delivery, and quality adaptation algorithms.",
    descriptionZh: "DASH串流、視頻壓縮、CDN分發和質量自適應算法。",
    keyPoints: [
      {
        point: "DASH (Dynamic Adaptive Streaming over HTTP)",
        pointZh: "DASH（HTTP動態自適應流）",
        detail: "Video is encoded at multiple bitrates, stored as chunks. Client adaptively requests chunks based on measured bandwidth. Manifest file (MPD) describes available encodings and chunk URLs.",
        detailZh: "視頻以多種比特率編碼，存儲為分塊。客户端根據測量的帶寬自適應地請求分塊。清單檔案（MPD）描述可用的編碼和分塊URL。"
      },
      {
        point: "Video Compression: Spatial & Temporal",
        pointZh: "視頻壓縮：空間與時間",
        detail: "Spatial: I-frames use intra-frame compression (like JPEG). Temporal: P-frames reference previous frames, B-frames reference both previous and future frames. GOP (Group of Pictures) structure.",
        detailZh: "空間：I幀使用幀內壓縮（類似JPEG）。時間：P幀參考前幀，B幀參考前後幀。GOP（圖像組）結構。"
      },
      {
        point: "CDN-based Video Delivery",
        pointZh: "基於CDN的視頻分發",
        detail: "CDNs use push or pull strategies to cache video at edge servers. Server selection based on network proximity (DNS-based, application-level redirect, or anycast). Netflix Open Connect is a private CDN example.",
        detailZh: "CDN使用推送或拉取策略在邊緣服務器緩存視頻。服務器選擇基於網絡鄰近度（基於DNS、應用層重新導向或任播）。Netflix Open Connect是私有CDN的例子。"
      },
      {
        point: "Quality Adaptation Algorithms",
        pointZh: "質量自適應算法",
        detail: "Throughput-based: estimate bandwidth and select highest sustainable bitrate. Buffer-based: maintain target buffer occupancy. Hybrid approaches combine both. Challenges include accuracy of throughput estimation.",
        detailZh: "基於吞吐量：估計帶寬並選擇最高可持續比特率。基於緩衝區：維持目標緩衝區佔用率。混合方法結合兩者。挑戰包括吞吐量估計的準確性。"
      }
    ]
  },
  {
    id: "advanced-congestion-control",
    title: "Advanced Congestion Control",
    titleZh: "高級擁塞控制",
    icon: "Zap",
    source: "ELEC3120 L08 — Advanced Congestion Control",
    description: "TCP Reno limitations, RTT unfairness, Jain's Fairness Index, Max-Min Fairness, Water Filling Algorithm, and alternative congestion control approaches.",
    descriptionZh: "TCP Reno的侷限性、RTT不公平性、Jain公平性指數、最大最小公平性、注水算法以及替代擁塞控制方法。",
    keyPoints: [
      {
        point: "TCP Reno Limitations",
        pointZh: "TCP Reno 的侷限性",
        detail: "Reno increases too slowly in high-bandwidth networks (takes hours to recover cwnd after loss). Assumes every loss indicates congestion (bad for WiFi). cwnd update speed proportional to RTT causes RTT unfairness. Fills queues causing large queuing delays.",
        detailZh: "Reno在高帶寬網絡中增長太慢（丟包後恢復cwnd需要數小時）。假設每次丟包都是擁塞（對WiFi不利）。cwnd更新速度與RTT成正比導致RTT不公平性。填滿隊列導致大排隊延遲。"
      },
      {
        point: "RTT Unfairness",
        pointZh: "RTT 不公平性",
        detail: "When flows with different RTTs share a link, the Mathis equation shows throughput ≈ (MSS/RTT) × (1/√p). A flow with RTT=10ms gets only ~1/6 of bandwidth against a flow with RTT=50ms on the same link, since longer RTT flows generate more packets per RTT.",
        detailZh: "當不同RTT的流共享鏈路時，Mathis公式表明吞吐量 ≈ (MSS/RTT) × (1/√p)。RTT=10ms的流相對於RTT=50ms的流僅獲得約1/6的帶寬，因為更長RTT的流每個RTT產生更多數據包。"
      },
      {
        point: "Jain's Fairness Index",
        pointZh: "Jain 公平性指數",
        detail: "Quantifies fairness: F(x) = (Σxi)² / (n × Σxi²). F=1 means perfectly fair (equal shares), F=0 means maximally unfair. Used to measure how equally bandwidth is distributed among flows.",
        detailZh: "量化公平性：F(x) = (Σxi)² / (n × Σxi²)。F=1表示完全公平（等分），F=0表示最大不公平。用於衡量帶寬在流之間分配的均勻程度。"
      },
      {
        point: "Max-Min Fairness & Water Filling",
        pointZh: "最大最小公平性與注水算法",
        detail: "Max-Min Fairness: each allocation ai = min(f, ri), where f is chosen so Σ(ai) = C. Water Filling Algorithm: pour bandwidth equally into all flows until a flow's demand is met, then continue serving remaining flows. Maximizes the minimum share — work-conserving and fair.",
        detailZh: "最大最小公平性：每個分配 ai = min(f, ri)，其中f的選擇使得Σ(ai) = C。注水算法：等量地向所有流注入帶寬，直到某個流的需求被滿足，然後繼續服務剩餘流。最大化最小份額——工作保持且公平。"
      }
    ]
  },
  {
    id: "queue-management",
    title: "Queue Management & Scheduling",
    titleZh: "隊列管理與調度",
    icon: "LayoutGrid",
    source: "ELEC3120 L09 — Queueing",
    description: "Fair Queueing, Weighted Fair Queueing, Token Bucket traffic shaping, and Network Calculus for reasoning about performance bounds.",
    descriptionZh: "公平隊列、加權公平隊列、令牌桶流量整形以及網絡微積分——用於推理性能邊界。",
    keyPoints: [
      {
        point: "Fair Queueing (FQ)",
        pointZh: "公平隊列（FQ）",
        detail: "Each flow gets its own queue. Scheduler serves packets in order of virtual finish times, approximating bit-by-bit round-robin. F_q,i = S_q,i + p_q,i. Work-conserving, enforces max-min fairness between flows.",
        detailZh: "每個流有自己的隊列。調度器按虛擬完成時間順序服務數據包，近似逐位輪詢。F_q,i = S_q,i + p_q,i。工作保持，在流之間實施最大最小公平性。"
      },
      {
        point: "Weighted Fair Queueing (WFQ)",
        pointZh: "加權公平隊列（WFQ）",
        detail: "Extension of FQ where each queue gets a weight w_q. Fq,i = Sq,i + pq,i × (Σwi/wq). Higher-weight flows get proportionally more bandwidth. Used by ISPs to implement different service tiers.",
        detailZh: "FQ的擴展，每個隊列分配一個權重w_q。Fq,i = Sq,i + pq,i × (Σwi/wq)。高權重流按比例獲得更多帶寬。ISP用它來實現不同的服務等級。"
      },
      {
        point: "Token Bucket Shaping",
        pointZh: "令牌桶整形",
        detail: "Tokens arrive at rate r into a bucket of capacity b. Each transmitted bit consumes one token. Allows bursty traffic up to b bits while maintaining average rate ≤ r. Average transmission rate is always ≤ r bits/sec.",
        detailZh: "令牌以速率r到達容量為b的桶中。每傳輸一個比特消耗一個令牌。允許最大b比特的突發流量，同時保持平均速率 ≤ r。平均傳輸速率始終 ≤ r bits/sec。"
      },
      {
        point: "Network Calculus: Arrival & Service Curves",
        pointZh: "網絡微積分：到達曲線與服務曲線",
        detail: "A(t) = r·t + b (arrival curve). S(t) = C·t (service curve). Vertical gap = max queue size. Horizontal gap = max queuing delay. Intersection point = time to drain queue. Used to bound worst-case latency.",
        detailZh: "A(t) = r·t + b（到達曲線）。S(t) = C·t（服務曲線）。垂直間距 = 最大隊列大小。水平間距 = 最大排隊延遲。交叉點 = 隊列排空時間。用於限制最壞情況延遲。"
      }
    ]
  },
  {
    id: "practical-tips",
    title: "Practical Development Tips",
    titleZh: "實用開發技巧",
    icon: "Code",
    source: "ELEC3120 Lab Material",
    description: "Socket programming, Wireshark tips, common networking tools, and debugging techniques.",
    descriptionZh: "套接字編程、Wireshark技巧、常用網絡工具和調試技術。",
    keyPoints: [
      {
        point: "Socket Programming Basics",
        pointZh: "套接字編程基礎",
        detail: "Client: socket() → connect() → send()/recv() → close(). Server: socket() → bind() → listen() → accept() → send()/recv() → close(). TCP uses SOCK_STREAM, UDP uses SOCK_DGRAM.",
        detailZh: "客户端：socket() → connect() → send()/recv() → close()。服務器：socket() → bind() → listen() → accept() → send()/recv() → close()。TCP使用SOCK_STREAM，UDP使用SOCK_DGRAM。"
      },
      {
        point: "Wireshark Packet Analysis",
        pointZh: "Wireshark數據包分析",
        detail: "Use display filters like tcp.port==80 or http.request. Follow TCP stream to see full conversation. Expert info shows warnings/errors. TCP analysis flags help identify retransmissions and out-of-order segments.",
        detailZh: "使用顯示過濾器如tcp.port==80或http.request。跟蹤TCP流查看完整對話。專家信息顯示警告/錯誤。TCP分析標誌幫助識別重傳和亂序數據段。"
      },
      {
        point: "Common CLI Networking Tools",
        pointZh: "常用CLI網絡工具",
        detail: "ping (ICMP echo), traceroute/tracert (path discovery), nslookup/dig (DNS queries), netstat/ss (socket statistics), curl (HTTP client), ifconfig/ip (interface config), tcpdump (packet capture).",
        detailZh: "ping（ICMP回聲）、traceroute/tracert（路徑發現）、nslookup/dig（DNS查詢）、netstat/ss（套接字統計）、curl（HTTP客户端）、ifconfig/ip（接口配置）、tcpdump（數據包捕獲）。"
      },
      {
        point: "Network Debugging Tips",
        pointZh: "網絡調試技巧",
        detail: "Check connection with ping and traceroute. Use netstat to check port status. Verify DNS with nslookup. Use curl -v for HTTP debugging. Check firewall rules (iptables/ufw). Monitor with tcpdump.",
        detailZh: "使用ping和traceroute檢查連接。使用netstat檢查端口狀態。用nslookup驗證DNS。使用curl -v進行HTTP調試。檢查防火牆規則（iptables/ufw）。用tcpdump監控。"
      }
    ]
  },
  // ==================== Lectures 10-18 ====================
  {
    id: "ip-protocol",
    title: "IP - Internet Protocol",
    titleZh: "IP - 互聯網協定",
    icon: "Network",
    source: "ELEC3120 L10 — IP (Network Layer)",
    description: "IPv4 addressing, subnetting, CIDR, NAT, DHCP, and the transition to IPv6.",
    descriptionZh: "IPv4尋址、子網劃分、CIDR、NAT、DHCP以及向IPv6的過渡。",
    keyPoints: [
      {
        point: "IPv4 Addressing & Header",
        pointZh: "IPv4尋址與頭部格式",
        detail: "IPv4 addresses are 32 bits (e.g., 192.168.1.1). The header is 20 bytes minimum with fields: Version, IHL, TOS, Total Length, Identification, Flags, Fragment Offset, TTL, Protocol, Header Checksum, Source/Dest IP. TTL prevents infinite looping.",
        detailZh: "IPv4地址為32位（如192.168.1.1）。頭部最小20字節，包含字段：版本、IHL、TOS、總長度、標識、標誌、片偏移、TTL、協定、頭部校驗和、源/目的IP。TTL防止無限循環。"
      },
      {
        point: "Subnetting & CIDR",
        pointZh: "子網劃分與CIDR",
        detail: "Subnetting divides a network into smaller subnets using subnet masks. CIDR (Classless Inter-Domain Routing) uses prefix notation (e.g., 192.168.1.0/24) allowing variable-length subnet masks. CIDR enables efficient address allocation and route aggregation (supernetting).",
        detailZh: "子網劃分使用子網遮罩將網絡劃分為更小的子網。CIDR（無類別域間路由）使用前綴表示法（如192.168.1.0/24），允許變長子網遮罩。CIDR實現高效地址分配和路由聚合（超網）。"
      },
      {
        point: "NAT (Network Address Translation)",
        pointZh: "NAT（網絡地址轉換）",
        detail: "NAT maps private IP addresses (10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16) to a single public IP. NAPT (Port-based NAT) maps (private IP, port) → (public IP, port) to support multiple internal hosts. Prolongs IPv4 lifespan but breaks end-to-end connectivity.",
        detailZh: "NAT將私有IP地址（10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16）映射到一個公有IP。NAPT（基於端口的NAT）將（私有IP，端口）映射到（公有IP，端口）以支援多個內部主機。延長了IPv4壽命但破壞了端到端連接。"
      },
      {
        point: "DHCP & IPv6",
        pointZh: "DHCP與IPv6",
        detail: "DHCP (Dynamic Host Configuration Protocol) auto-assigns IP addresses via DORA: Discover → Offer → Request → Ack. IPv6 uses 128-bit addresses (e.g., 2001:db8::1), supports auto-configuration (SLAAC), and eliminates the need for NAT with its vast address space.",
        detailZh: "DHCP（動態主機配置協定）通過DORA自動分配IP地址：Discover → Offer → Request → Ack。IPv6使用128位地址（如2001:db8::1），支援自動配置（SLAAC），憑藉巨大的地址空間消除了對NAT的需求。"
      }
    ]
  },
  {
    id: "bgp-routing",
    title: "BGP - Border Gateway Protocol",
    titleZh: "BGP - 邊界網關協定",
    icon: "Route",
    source: "ELEC3120 L11 — BGP (Inter-domain Routing)",
    description: "Inter-domain routing, Autonomous Systems, BGP path attributes, and iBGP vs eBGP.",
    descriptionZh: "域間路由、自治系統、BGP路徑屬性以及iBGP與eBGP的區別。",
    keyPoints: [
      {
        point: "Autonomous Systems (AS)",
        pointZh: "自治系統（AS）",
        detail: "An AS is a network under a single administrative control with a unified routing policy. Each AS is identified by a unique AS number (ASN). Intra-domain routing (within AS) uses protocols like OSPF, RIP. Inter-domain routing (between ASes) uses BGP.",
        detailZh: "自治系統是在單一管理控制下具有統一路由策略的網絡。每個AS由唯一的AS編號（ASN）標識。域內路由（AS內部）使用OSPF、RIP等協定。域間路由（AS之間）使用BGP。"
      },
      {
        point: "BGP Basics: eBGP & iBGP",
        pointZh: "BGP基礎：eBGP與iBGP",
        detail: "eBGP (external BGP) runs between different ASes to exchange routing information. iBGP (internal BGP) distributes external routes within an AS. BGP is a path vector protocol — routers advertise complete AS paths, not just distances. Runs over TCP port 179.",
        detailZh: "eBGP（外部BGP）在不同AS之間運行以交換路由信息。iBGP（內部BGP）在AS內部分發外部路由。BGP是路徑矢量協定——路由器通告完整的AS路徑，而非僅距離。運行在TCP端口179上。"
      },
      {
        point: "BGP Path Attributes",
        pointZh: "BGP路徑屬性",
        detail: "Key attributes: AS_PATH (list of ASes traversed, used for loop detection), NEXT_HOP (IP of next-hop router), LOCAL_PREF (preferred exit point from AS), MED (entry preference). Well-known mandatory: ORIGIN, AS_PATH, NEXT_HOP.",
        detailZh: "關鍵屬性：AS_PATH（經過的AS列表，用於環路檢測）、NEXT_HOP（下一跳路由器IP）、LOCAL_PREF（從AS離開的首選出口點）、MED（入口偏好）。公認必選屬性：ORIGIN、AS_PATH、NEXT_HOP。"
      },
      {
        point: "BGP Route Selection",
        pointZh: "BGP路由選擇",
        detail: "BGP selects best path through ordered criteria: 1) Highest LOCAL_PREF, 2) Shortest AS_PATH, 3) Lowest ORIGIN type (IGP < EGP < incomplete), 4) Lowest MED, 5) eBGP over iBGP, 6) Lowest IGP cost to NEXT_HOP. Hot-potato routing vs cold-potato routing determines inter-AS traffic engineering.",
        detailZh: "BGP通過有序標準選擇最佳路徑：1) 最高LOCAL_PREF，2) 最短AS_PATH，3) 最低ORIGIN類型（IGP < EGP < incomplete），4) 最低MED，5) eBGP優先於iBGP，6) 到NEXT_HOP的最低IGP開銷。熱土豆路由與冷土豆路由決定AS間流量工程策略。"
      }
    ]
  },
  {
    id: "internet-architecture",
    title: "Internet Architecture",
    titleZh: "互聯網架構",
    icon: "Building2",
    source: "ELEC3120 L12 — Internet Architecture",
    description: "ISP hierarchy, Internet Exchange Points, routing policies, content provider networks, and network topology.",
    descriptionZh: "ISP層級、互聯網交換點、路由策略、內容提供商網絡和網絡拓撲。",
    keyPoints: [
      {
        point: "ISP Hierarchy & Tiers",
        pointZh: "ISP層級結構",
        detail: "Tier 1 ISPs (global backbone, e.g., AT&T, NTT) connect to each other for free (peering). Tier 2 ISPs (regional) buy transit from Tier 1 and peer with others. Tier 3 ISPs (local/access) buy transit from Tier 2. Customers pay for connectivity at each level.",
        detailZh: "一級ISP（全球骨幹網，如AT&T、NTT）彼呢個免費互聯（對等）。二級ISP（區域性）從一級ISP購買傳輸服務並與他人對等。三級ISP（本地/接入）從二級ISP購買傳輸。每一級客户為連接付費。"
      },
      {
        point: "Internet Exchange Points (IXPs)",
        pointZh: "互聯網交換點（IXP）",
        detail: "IXPs are physical locations where multiple ISPs, content providers, and enterprises interconnect directly. They reduce latency and cost by enabling local traffic exchange without routing through upstream providers. Major IXPs include AMS-IX, DE-CIX, and HKIX.",
        detailZh: "IXP是多個ISP、內容提供商和企業直接互聯的物理位置。通過實現本地流量交換而無需經過上游提供商路由，降低了延遲和成本。主要IXP包括AMS-IX、DE-CIX和HKIX。"
      },
      {
        point: "Routing Policies & Economics",
        pointZh: "路由策略與經濟模型",
        detail: "ISP routing decisions are driven by economics, not just shortest path. Peering: settlement-free mutual exchange. Transit: paid service to reach all destinations. Customer-providers define direction of payment. Routing reflects business relationships, not technical optimality.",
        detailZh: "ISP路由決策由經濟驅動，而非最短路徑。對等：免費互惠交換。傳輸：付費服務以到達所有目的地。客户-提供商關系定義付費方向。路由反映商業關系，而非技術最優性。"
      },
      {
        point: "Content Provider Networks",
        pointZh: "內容提供商網絡",
        detail: "Large providers (Google, Netflix, Amazon) build private global networks bypassing the public Internet. They place servers in IXPs and PoPs close to users, reducing latency and cost. Netflix Open Connect caches content within ISP networks.",
        detailZh: "大型提供商（Google、Netflix、Amazon）構建私有全球網絡，繞過公共互聯網。他們在IXP和靠近用户的PoP部署服務器，降低延遲和成本。Netflix Open Connect在ISP網絡內部緩存內容。"
      }
    ]
  },
  {
    id: "lan-networks",
    title: "LAN - Local Area Networks",
    titleZh: "LAN - 局域網",
    icon: "EthernetPort",
    source: "ELEC3120 L13 — LAN",
    description: "Ethernet standards, MAC addresses, LAN switching, Spanning Tree Protocol, and VLANs.",
    descriptionZh: "以太網標準、MAC地址、LAN交換、生成樹協定和虛擬局域網。",
    keyPoints: [
      {
        point: "Ethernet & MAC Addresses",
        pointZh: "以太網與MAC地址",
        detail: "Ethernet is the dominant LAN technology (IEEE 802.3). MAC addresses are 48-bit (6 bytes) identifiers burned into NICs, typically shown as hex (e.g., 00:1A:2B:3C:4D:5E). First 3 bytes = OUI (manufacturer), last 3 bytes = unique. Broadcast address: FF:FF:FF:FF:FF:FF.",
        detailZh: "以太網是主導的LAN技術（IEEE 802.3）。MAC地址是燒錄在網卡中的48位（6字節）標識符，通常以十六進制表示（如00:1A:2B:3C:4D:5E）。前3字節為OUI（廠商），後3字節唯一。廣播地址：FF:FF:FF:FF:FF:FF。"
      },
      {
        point: "LAN Switching",
        pointZh: "LAN交換",
        detail: "Switches learn MAC-to-port mappings by examining source addresses of incoming frames. Forwarding: look up destination MAC in forwarding table. If unknown, flood to all ports except incoming. Switches provide full-duplex, per-port collision domains (no CSMA/CD needed).",
        detailZh: "交換機通過檢查傳入幀的源地址學習MAC到端口的映射。轉發：在轉發表中查找目的MAC。如果未知，則泛洪到除入口外的所有端口。交換機提供全雙工、每端口獨立的衝突域（無需CSMA/CD）。"
      },
      {
        point: "Spanning Tree Protocol (STP)",
        pointZh: "生成樹協定（STP）",
        detail: "STP (IEEE 802.1D) prevents broadcast storms caused by loops in switched networks. Algorithm: elect root bridge (lowest bridge ID), each non-root selects lowest-cost port to root (root port), on each LAN select designated bridge. Non-root/non-designated ports are blocked.",
        detailZh: "STP（IEEE 802.1D）防止交換網絡中環路引起的廣播風暴。算法：選舉根橋（最低橋ID），每個非根橋選擇到根橋最低開銷的端口（根端口），在每個LAN上選舉指定橋。非根/非指定端口被阻塞。"
      },
      {
        point: "VLANs (Virtual LANs)",
        pointZh: "VLAN（虛擬局域網）",
        detail: "VLANs logically partition a physical LAN into multiple broadcast domains. IEEE 802.1Q adds a 4-byte tag to Ethernet frames (12-bit VLAN ID, up to 4094 VLANs). Trunk ports carry traffic for multiple VLANs (tagged). Access ports carry single VLAN traffic (untagged). Improves security and manageability.",
        detailZh: "VLAN將物理LAN邏輯地劃分為多個廣播域。IEEE 802.1Q在以太網幀中添加4字節標籤（12位VLAN ID，最多4094個VLAN）。Trunk端口承載多個VLAN流量（帶標籤）。Access端口承載單個VLAN流量（無標籤）。提高安全性和可管理性。"
      }
    ]
  },
  {
    id: "distance-vector-routing",
    title: "Distance Vector Routing",
    titleZh: "距離矢量路由",
    icon: "GitBranch",
    source: "ELEC3120 L14 — Distance Vector Routing",
    description: "Distance vector algorithm, RIP, Bellman-Ford equation, count-to-infinity problem, and poison reverse.",
    descriptionZh: "距離矢量算法、RIP、貝爾曼-福特方程、計數到無窮問題以及毒性逆轉。",
    keyPoints: [
      {
        point: "Bellman-Ford Equation",
        pointZh: "貝爾曼-福特方程",
        detail: "dx(y) = min{ c(x,v) + dv(y) } over all neighbors v of x. Each node maintains distance vector with costs to all destinations. Nodes exchange distance vectors with neighbors periodically. Converges iteratively — each iteration may update costs based on neighbors' vectors.",
        detailZh: "dx(y) = min{ c(x,v) + dv(y) }，對所有鄰居v取最小值。每個節點維護到所有目的地的開銷距離矢量。節點定期與鄰居交換距離矢量。迭代收斂——每次迭代根據鄰居的矢量更新開銷。"
      },
      {
        point: "RIP (Routing Information Protocol)",
        pointZh: "RIP（路由信息協定）",
        detail: "RIP uses distance vector with hop count as metric (max 15 hops, 16 = infinity). Sends full routing table to neighbors every 30 seconds. Convergence time can be slow. RIPng supports IPv6. Uses UDP port 520. Suitable for small networks.",
        detailZh: "RIP使用距離矢量，以跳數為度量（最大15跳，16=無窮大）。每30秒向鄰居發送完整路由表。收斂時間可能較慢。RIPng支援IPv6。使用UDP端口520。適用於小型網絡。"
      },
      {
        point: "Count-to-Infinity Problem",
        pointZh: "計數到無窮問題",
        detail: "When a link fails, nodes may slowly increment their distance to the unreachable destination (e.g., 1→2→3→...→16). Because each node only sees its neighbor's distance, it cannot immediately detect the break. Convergence can take many iterations (counting to infinity).",
        detailZh: "當鏈路故障時，節點可能緩慢增加到不可達目的地的距離（如1→2→3→...→16）。因為每個節點只能看到鄰居的距離，無法立即檢測到中斷。收斂可能需要多次迭代（計數到無窮）。"
      },
      {
        point: "Poison Reverse & Split Horizon",
        pointZh: "毒性逆轉與水平分割",
        detail: "Split Horizon: don't advertise a route back to the neighbor from which it was learned. Poison Reverse: advertise the route back with infinite distance (16). These techniques help prevent two-node loops but cannot solve all routing loops. Triggered updates send routing changes immediately instead of waiting for periodic updates.",
        detailZh: "水平分割：不向學習路由的鄰居通告該路由。毒性逆轉：以無窮大距離（16）回傳路由。呢些技術有助於防止兩節點環路，但不能解決所有路由環路。觸發更新立即發送路由變更，而非等待定期更新。"
      }
    ]
  },
  {
    id: "link-layer",
    title: "Link Layer",
    titleZh: "鏈路層",
    icon: "Shield",
    source: "ELEC3120 L15 — Link Layer",
    description: "Error detection and correction, CRC, multiple access protocols (ALOHA, CSMA/CD, CSMA/CA), and link layer addressing.",
    descriptionZh: "錯誤檢測與糾正、CRC、多路存取協定（ALOHA、CSMA/CD、CSMA/CA）和鏈路層尋址。",
    keyPoints: [
      {
        point: "Error Detection: CRC & Checksums",
        pointZh: "錯誤檢測：CRC與校驗和",
        detail: "CRC (Cyclic Redundancy Check) treats data as polynomial, divides by generator polynomial, appends remainder as FCS. CRC-32 detects all single/double-bit errors and burst errors ≤ 32 bits. Internet checksum (1's complement addition) provides weaker detection but is simpler.",
        detailZh: "CRC（循環冗餘校驗）將數據視為多項式，除以生成多項式，附加餘數作為FCS。CRC-32檢測所有單/雙比特錯誤和≤32位的突發錯誤。互聯網校驗和（1的補碼加法）檢測能力較弱但更簡單。"
      },
      {
        point: "Multiple Access: ALOHA & Slotted ALOHA",
        pointZh: "多路存取：ALOHA與時隙ALOHA",
        detail: "Pure ALOHA: transmit anytime, max utilization ≈ 18% (1/2e). Slotted ALOHA: transmit only at slot boundaries, max utilization ≈ 37% (1/e). Both are simple but inefficient. Collisions require full retransmission.",
        detailZh: "純ALOHA：隨時發送，最大利用率≈18%（1/2e）。時隙ALOHA：僅在時隙邊界發送，最大利用率≈37%（1/e）。兩者簡單但效率低。衝突需要完整重傳。"
      },
      {
        point: "CSMA/CD & CSMA/CA",
        pointZh: "CSMA/CD與CSMA/CA",
        detail: "CSMA/CD (Collision Detection): sense channel before transmitting, abort on collision (used in wired Ethernet). Binary exponential backoff after collision. CSMA/CA (Collision Avoidance): used in WiFi (802.11), uses RTS/CTS handshake to reserve channel and ACK to confirm reception.",
        detailZh: "CSMA/CD（衝突檢測）：發送前偵聽信道，衝突時中止（用於有線以太網）。衝突後使用二進制指數退避。CSMA/CA（衝突避免）：用於WiFi（802.11），使用RTS/CTS握手預約信道，用ACK確認接收。"
      },
      {
        point: "Link Layer Addressing: ARP",
        pointZh: "鏈路層尋址：ARP",
        detail: "ARP (Address Resolution Protocol) maps IP addresses to MAC addresses. Process: sender broadcasts ARP query (who has IP X?), target replies with its MAC address. ARP cache stores mappings temporarily (typically 20 min). Gratuitous ARP announces IP-MAC binding to all hosts.",
        detailZh: "ARP（地址解析協定）將IP地址映射到MAC地址。過程：發送方廣播ARP查詢（誰有IP X？），目標回覆其MAC地址。ARP緩存臨時存儲映射（通常20分鐘）。免費ARP向所有主機通告IP-MAC綁定。"
      }
    ]
  },
  {
    id: "wireless-networks",
    title: "Wireless Networks",
    titleZh: "無線網絡",
    icon: "Wifi",
    source: "ELEC3120 L16 — Wireless",
    description: "WiFi (802.11), hidden terminal problem, RTS/CTS, 4G/5G cellular networks, and mobile networking.",
    descriptionZh: "WiFi（802.11）、隱藏終端問題、RTS/CTS、4G/5G蜂窩網絡和移動網絡。",
    keyPoints: [
      {
        point: "WiFi (IEEE 802.11)",
        pointZh: "WiFi（IEEE 802.11）",
        detail: "WiFi uses CSMA/CA with optional RTS/CTS. 802.11a/b/g/n/ac/ax standards differ in frequency (2.4/5/6 GHz), speed (11 Mbps to 9.6 Gbps), and MIMO support. BSS (Basic Service Set) = AP + associated stations. ESS connects multiple BSSs via distribution system.",
        detailZh: "WiFi使用CSMA/CA，可選RTS/CTS。802.11a/b/g/n/ac/ax標準在頻率（2.4/5/6 GHz）、速度（11 Mbps至9.6 Gbps）和MIMO支援上有所不同。BSS（基本服務集）= AP + 關聯站點。ESS通過分發系統連接多個BSS。"
      },
      {
        point: "Hidden Terminal Problem",
        pointZh: "隱藏終端問題",
        detail: "When two stations are both in range of the AP but not in range of each other, they cannot sense each other's transmissions and may transmit simultaneously, causing collisions at the AP. Solution: RTS/CTS mechanism — sender sends RTS (Request to Send), AP replies with CTS (Clear to Send), all stations hearing CTS defer.",
        detailZh: "當兩個站點都在AP範圍內但不在彼呢個範圍內時，無法感知對方的傳輸，可能同時發送導致AP處衝突。解決方案：RTS/CTS機制——發送方發送RTS（請求發送），AP回覆CTS（允許發送），聽到CTS的所有站點推遲發送。"
      },
      {
        point: "4G LTE Cellular Networks",
        pointZh: "4G LTE蜂窩網絡",
        detail: "4G LTE architecture: UE (device) → eNodeB (base station) → EPC (Evolved Packet Core) → PDN Gateway → Internet. Uses OFDMA for downlink, SC-FDMA for uplink. All-IP network with no circuit-switched domain. Typical speeds: 10-100 Mbps downlink.",
        detailZh: "4G LTE架構：UE（設備）→ eNodeB（基站）→ EPC（演進分組核心）→ PDN網關 → 互聯網。下行使用OFDMA，上行使用SC-FDMA。全IP網絡，無電路交換域。典型速度：下行10-100 Mbps。"
      },
      {
        point: "5G Networks & Mobile IP",
        pointZh: "5G網絡與移動IP",
        detail: "5G uses mmWave (24-100 GHz), massive MIMO, and network slicing for diverse services (eMBB, URLLC, mMTC). Speeds up to 10 Gbps, latency < 1 ms. Mobile IP allows seamless handoff: Home Agent tunnels packets to Care-of Address when mobile node roams.",
        detailZh: "5G使用毫米波（24-100 GHz）、大規模MIMO和網絡切片以支援多種服務（eMBB、URLLC、mMTC）。速度最高10 Gbps，延遲<1ms。移動IP支援無縫切換：移動節點漫遊時歸屬代理將數據包隧道傳輸到轉交地址。"
      }
    ]
  },
  {
    id: "new-networks",
    title: "New Network Technologies",
    titleZh: "新型網絡技術",
    icon: "Lightbulb",
    source: "ELEC3120 L17 — New Networks",
    description: "SDN (Software Defined Networking), NFV, CDN, P2P networks, IoT, and MQTT protocol.",
    descriptionZh: "SDN（軟件定義網絡）、NFV、CDN、P2P網絡、物聯網和MQTT協定。",
    keyPoints: [
      {
        point: "SDN (Software Defined Networking)",
        pointZh: "SDN（軟件定義網絡）",
        detail: "SDN separates control plane from data plane. Three layers: Infrastructure (forwarding elements), Control (SDN controller, e.g., OpenFlow), Application (network apps). Centralized control enables global network view, programmability, and faster innovation. OpenFlow is the dominant southbound API.",
        detailZh: "SDN將控制平面與數據平面分離。三層架構：基礎設施層（轉發元素）、控制層（SDN控制器，如OpenFlow）、應用層（網絡應用）。集中控制實現全局網絡視圖、可編程性和更快創新。OpenFlow是主要的南向API。"
      },
      {
        point: "NFV (Network Function Virtualization)",
        pointZh: "NFV（網絡功能虛擬化）",
        detail: "NFV replaces dedicated hardware appliances (firewalls, load balancers, NAT) with software running on general-purpose servers (COTS). Virtual Network Functions (VNFs) can be instantiated, scaled, and moved dynamically. Reduces CAPEX and OPEX, accelerates service deployment.",
        detailZh: "NFV用運行在通用服務器（COTS）上的軟件替代專用硬件設備（防火牆、負載均衡器、NAT）。虛擬網絡功能（VNF）可以動態實例化、擴展和遷移。降低資本支出和運營支出，加速服務部署。"
      },
      {
        point: "P2P (Peer-to-Peer) Networks",
        pointZh: "P2P（對等網絡）",
        detail: "P2P eliminates dedicated servers — every node is both client and server. File distribution time in P2P ≈ F/u_s + F/u_d (minimum). BitTorrent divides files into chunks, peers trade chunks using rarest-first strategy. Tracker coordinates peers; DHT enables trackerless operation.",
        detailZh: "P2P消除了專用服務器——每個節點既是客户端又是服務器。P2P檔案分發時間 ≈ F/u_s + F/u_d（最小值）。BitTorrent將檔案分成塊，節點使用最稀缺優先策略交換塊。Tracker協調節點；DHT實現無Tracker運行。"
      },
      {
        point: "IoT & MQTT Protocol",
        pointZh: "物聯網與MQTT協定",
        detail: "IoT connects billions of devices with limited resources. MQTT is a lightweight publish/subscribe protocol over TCP. Architecture: Broker mediates between publishers and subscribers using topics (hierarchical, e.g., 'home/temperature'). QoS levels 0 (at most once), 1 (at least once), 2 (exactly once). Ideal for constrained devices.",
        detailZh: "物聯網連接數十億資源受限的設備。MQTT是基於TCP的輕量級發布/訂閲協定。架構：Broker通過主題（層級化，如'home/temperature'）在發布者和訂閲者之間中介。QoS級別0（最多一次）、1（至少一次）、2（恰好一次）。非常適合受限設備。"
      }
    ]
  },
  {
    id: "network-security",
    title: "Network Security",
    titleZh: "網絡安全",
    icon: "Lock",
    source: "ELEC3120 L18 — Security",
    description: "Symmetric and asymmetric encryption, RSA, digital signatures, certificates, TLS/SSL, and firewalls.",
    descriptionZh: "對稱加密與非對稱加密、RSA、數字簽名、證書、TLS/SSL和防火牆。",
    keyPoints: [
      {
        point: "Symmetric & Asymmetric Encryption",
        pointZh: "對稱加密與非對稱加密",
        detail: "Symmetric encryption (AES, DES): same key for encryption and decryption. Fast, used for bulk data. Problem: key distribution. Asymmetric encryption (RSA): public key encrypts, private key decrypts (or vice versa). Slower but solves key distribution. Hybrid: use asymmetric to exchange symmetric key.",
        detailZh: "對稱加密（AES、DES）：加密和解密使用同一密鑰。速度快，用於大量數據。問題：密鑰分發。非對稱加密（RSA）：公鑰加密，私鑰解密（或反之）。較慢但解決密鑰分發。混合方案：用非對稱加密交換對稱密鑰。"
      },
      {
        point: "RSA Algorithm",
        pointZh: "RSA算法",
        detail: "Key generation: choose primes p, q. n = p×q, φ(n) = (p-1)(q-1). Choose e coprime to φ(n), compute d = e⁻¹ mod φ(n). Public key (n, e), private key (n, d). Encryption: c = m^e mod n. Decryption: m = c^d mod n. Security relies on difficulty of factoring large n.",
        detailZh: "密鑰生成：選擇素數p、q。n = p×q，φ(n) = (p-1)(q-1)。選擇與φ(n)互素的e，計算d = e⁻¹ mod φ(n)。公鑰(n, e)，私鑰(n, d)。加密：c = m^e mod n。解密：m = c^d mod n。安全性依賴於大數分解的困難性。"
      },
      {
        point: "Digital Signatures & Certificates",
        pointZh: "數字簽名與證書",
        detail: "Digital signature: sender signs hash(message) with private key. Receiver verifies with sender's public key. Provides authentication, integrity, and non-repudiation. CA (Certificate Authority) binds identity to public key via X.509 certificates. Certificate chain verifies CA hierarchy.",
        detailZh: "數字簽名：發送方用私鑰簽名hash(訊息)。接收方用發送方公鑰驗證。提供認證、完整性和不可否認性。CA（證書頒發機構）通過X.509證書將身份與公鑰綁定。證書鏈驗證CA層級。"
      },
      {
        point: "TLS/SSL & Firewalls",
        pointZh: "TLS/SSL與防火牆",
        detail: "TLS 1.3 handshake: client sends supported ciphers + key_share → server responds with chosen cipher + key_share + certificate → both derive session keys. Provides encryption, authentication, integrity. Firewalls filter traffic based on rules (source/dest IP, port, protocol). Stateful firewalls track connection states.",
        detailZh: "TLS 1.3握手：客户端發送支援的密碼套件+key_share → 服務器回覆選擇的密碼套件+key_share+證書 → 雙方派生會話密鑰。提供加密、認證、完整性。防火牆基於規則（源/目的IP、端口、協定）過濾流量。狀態防火牆跟蹤連接狀態。"
      }
    ]
  }
];
