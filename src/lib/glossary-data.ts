export interface GlossaryTerm {
  id: string;
  term: string;
  termZh: string;
  definition: string;
  definitionZh: string;
  category: 'fundamentals' | 'transport' | 'network' | 'application' | 'security';
  relatedTerms?: string[];
}

export const glossaryTerms: GlossaryTerm[] = [
  // ─── Fundamentals (8 terms) ─────────────────────────────────────────────
  {
    id: 'osi',
    term: 'OSI Model',
    termZh: 'OSI 模型',
    definition:
      'A 7-layer conceptual framework (Physical, Data Link, Network, Transport, Session, Presentation, Application) that standardizes network communication functions. Each layer serves the layer above and is served by the layer below.',
    definitionZh:
      '一個7層概念框架（物理層、資料鏈結層、網絡層、傳輸層、會話層、表示層、應用層），標準化網絡通信功能。每層為上層提供服務，同時使用下層的服務。',
    category: 'fundamentals',
    relatedTerms: ['tcp', 'ip', 'protocol-stack'],
  },
  {
    id: 'packet-switching',
    term: 'Packet Switching',
    termZh: '分組交換',
    definition:
      'Data is broken into small packets that are routed independently through the network, each packet may take a different path. Packets are reassembled at the destination. Used by the Internet (store-and-forward).',
    definitionZh:
      '數據被分割成小分組，各自獨立地在網絡中路由，每個分組可能走不同路徑。分組在目的地重新組裝。互聯網使用分組交換（存儲轉發方式）。',
    category: 'fundamentals',
    relatedTerms: ['circuit-switching'],
  },
  {
    id: 'circuit-switching',
    term: 'Circuit Switching',
    termZh: '電路交換',
    definition:
      'A dedicated communication path is established between sender and receiver before data transfer begins. Resources (bandwidth, circuit) are reserved for the entire duration. Used in traditional telephone networks.',
    definitionZh:
      '在數據傳輸開始之前，發送方和接收方之間建立專用通信路徑。整個通信期間預留資源（帶寬、電路）。傳統電話網絡使用電路交換。',
    category: 'fundamentals',
    relatedTerms: ['packet-switching'],
  },
  {
    id: 'delay',
    term: 'Network Delay',
    termZh: '網絡延遲',
    definition:
      'Four components: d_nodal = d_proc + d_queue + d_trans + d_prop. Processing delay (router inspection), queuing delay (waiting in buffer), transmission delay (L/R, pushing bits onto link), propagation delay (d/s, signal traveling across medium).',
    definitionZh:
      '四個組成部分：d_nodal = d_proc + d_queue + d_trans + d_prop。處理延遲（路由器檢查）、排隊延遲（在緩衝區等待）、傳輸延遲（L/R，將比特推送到鏈路）、傳播延遲（d/s，信號在介質中傳播）。',
    category: 'fundamentals',
    relatedTerms: ['rtt', 'throughput', 'bandwidth'],
  },
  {
    id: 'throughput',
    term: 'Throughput',
    termZh: '吞吐量',
    definition:
      'The rate at which bits are transferred over a link or end-to-end path. Throughput = min(R1, R2, ..., Rn) for a path with N bottleneck links. Often less than the capacity due to competing traffic.',
    definitionZh:
      '比特在鏈路或端到端路徑上的傳輸速率。對於有 N 個瓶頸鍊路的路徑，吞吐量 = min(R1, R2, ..., Rn)。由於競爭流量，通常小於鏈路容量。',
    category: 'fundamentals',
    relatedTerms: ['bandwidth', 'delay'],
  },
  {
    id: 'bandwidth',
    term: 'Bandwidth',
    termZh: '帶寬',
    definition:
      'The maximum data rate of a network link, measured in bits per second (bps). Represents the link capacity — the upper bound on how fast data can be transmitted. Higher bandwidth means more data per unit time.',
    definitionZh:
      '網絡鏈路的最大數據傳輸速率，以比特每秒（bps）為單位。表示鏈路容量——數據傳輸速率的上限。帶寬越高，單位時間內傳輸的數據越多。',
    category: 'fundamentals',
    relatedTerms: ['throughput'],
  },
  {
    id: 'latency',
    term: 'Latency',
    termZh: '延遲',
    definition:
      'The total time from when a sender initiates a request to when the first bit of the response arrives. Includes propagation delay, transmission delay, processing delay, and queuing delay at each node along the path.',
    definitionZh:
      '從發送方發起請求到響應的第一個比特到達的總時間。包括沿途每個節點的傳播延遲、傳輸延遲、處理延遲和排隊延遲。',
    category: 'fundamentals',
    relatedTerms: ['delay', 'rtt'],
  },
  {
    id: 'protocol-stack',
    term: 'Protocol Stack',
    termZh: '協定棧',
    definition:
      'A set of layered protocols where each layer provides services to the layer above and uses services from the layer below. The TCP/IP stack has 5 layers: Application, Transport, Network, Link, Physical.',
    definitionZh:
      '一組分層的協定，每層為上層提供服務並使用下層的服務。TCP/IP 協定棧有5層：應用層、傳輸層、網絡層、鏈路層、物理層。',
    category: 'fundamentals',
    relatedTerms: ['osi'],
  },

  // ─── Transport Layer (10 terms) ──────────────────────────────────────────
  {
    id: 'tcp',
    term: 'TCP',
    termZh: 'TCP 傳輸控制協定',
    definition:
      'Connection-oriented, reliable, byte-stream transport protocol. Features: three-way handshake for connection setup, sequence numbers, ACKs, retransmissions (timeout + fast retransmit), flow control (rwnd), congestion control (cwnd, ssthresh). Full-duplex, point-to-point.',
    definitionZh:
      '面向連接的、可靠的字節流傳輸協定。特性：三次握手建立連接、序列號、確認、重傳（逾時+快速重傳）、流量控制（rwnd）、擁塞控制（cwnd、ssthresh）。全雙工、點對點。',
    category: 'transport',
    relatedTerms: ['three-way-handshake', 'flow-control', 'congestion-control', 'udp', 'mss'],
  },
  {
    id: 'udp',
    term: 'UDP',
    termZh: 'UDP 用户數據報協定',
    definition:
      'Connectionless transport protocol with minimal overhead (8-byte header: src port, dst port, length, checksum). No connection setup, no reliability guarantees, no congestion control. Best for time-sensitive apps (DNS, streaming, gaming).',
    definitionZh:
      '無連接的傳輸協定，開銷極小（8字節頭部：源端口、目標端口、長度、校驗和）。無連接建立、無可靠性保證、無擁塞控制。適用於時間敏感的應用（DNS、串流、遊戲）。',
    category: 'transport',
    relatedTerms: ['tcp'],
  },
  {
    id: 'three-way-handshake',
    term: 'Three-Way Handshake',
    termZh: '三次握手',
    definition:
      'TCP connection establishment: (1) Client → SYN → Server, (2) Server → SYN-ACK → Client, (3) Client → ACK → Server. Synchronizes sequence numbers (ISN) and allocates buffers on both sides.',
    definitionZh:
      'TCP 連接建立：(1) 客户端 → SYN → 服務器，(2) 服務器 → SYN-ACK → 客户端，(3) 客户端 → ACK → 服務器。同步序列號（ISN）並在雙方分配緩衝區。',
    category: 'transport',
    relatedTerms: ['tcp'],
  },
  {
    id: 'flow-control',
    term: 'Flow Control',
    termZh: '流量控制',
    definition:
      'Prevents a fast sender from overwhelming a slow receiver. TCP uses receive window (rwnd) advertised in the ACK header — sender never has more than rwnd bytes of unacknowledged data in flight.',
    definitionZh:
      '防止快速發送方淹沒慢速接收方。TCP 使用接收窗口（rwnd），在 ACK 頭部中通告——發送方未確認的在途數據不超過 rwnd 字節。',
    category: 'transport',
    relatedTerms: ['tcp', 'sliding-window'],
  },
  {
    id: 'congestion-control',
    term: 'Congestion Control',
    termZh: '擁塞控制',
    definition:
      'TCP prevents network overload. Phases: Slow Start (cwnd doubles each RTT until ssthresh), Congestion Avoidance (cwnd grows linearly), Fast Retransmit (3 duplicate ACKs → retransmit), Fast Recovery (cwnd = ssthresh + 3*MSS). AIMD principle.',
    definitionZh:
      'TCP 防止網絡過載。階段：慢啓動（cwnd 每個 RTT 翻倍直到 ssthresh）、擁塞避免（cwnd 線性增長）、快速重傳（3個重複ACK→重傳）、快速恢復（cwnd = ssthresh + 3*MSS）。AIMD 原則。',
    category: 'transport',
    relatedTerms: ['tcp', 'sliding-window'],
  },
  {
    id: 'rtt',
    term: 'RTT',
    termZh: '往返時間',
    definition:
      'Round-Trip Time: time for a small packet to travel from sender to receiver and back. Used to calculate retransmission timeout: EstimatedRTT = (1-α)·EstimatedRTT + α·SampleRTT. DevRTT captures RTT variability.',
    definitionZh:
      '往返時間：一個小數據包從發送方到接收方再返回的時間。用於計算重傳逾時：EstimatedRTT = (1-α)·EstimatedRTT + α·SampleRTT。DevRTT 捕獲 RTT 的波動。',
    category: 'transport',
    relatedTerms: ['tcp', 'delay'],
  },
  {
    id: 'mss',
    term: 'MSS',
    termZh: '最大報文段長度',
    definition:
      'Maximum Segment Size: the largest amount of application-layer data (bytes) that TCP will send in a single segment. MSS is negotiated during handshake (typically 1460 bytes for Ethernet with MTU=1500). Does not include TCP/IP headers.',
    definitionZh:
      '最大報文段長度：TCP 在單個報文段中發送的最大應用層數據（字節）。MSS 在握手時協商（以太網 MTU=1500 時通常為1460字節）。不包括 TCP/IP 頭部。',
    category: 'transport',
    relatedTerms: ['tcp'],
  },
  {
    id: 'sliding-window',
    term: 'Sliding Window',
    termZh: '滑動窗口',
    definition:
      'A flow control mechanism where the sender maintains a window of outstanding (unacknowledged) segments. The window slides forward as ACKs arrive, allowing new segments to be sent. Window size = min(cwnd, rwnd).',
    definitionZh:
      '一種流量控制機制，發送方維護一個未確認報文段的窗口。隨着 ACK 到達，窗口向前滑動，允許發送新報文段。窗口大小 = min(cwnd, rwnd)。',
    category: 'transport',
    relatedTerms: ['tcp', 'flow-control', 'congestion-control'],
  },
  {
    id: 'reliable-data-transfer',
    term: 'Reliable Data Transfer',
    termZh: '可靠數據傳輸',
    definition:
      'Mechanisms to ensure data arrives correctly and in order: sequence numbers, cumulative ACKs, retransmission timers, checksums. TCP provides rdt over an unreliable network layer using pipelining (Go-Back-N or Selective Repeat concepts).',
    definitionZh:
      '確保數據正確有序到達的機制：序列號、累積確認、重傳計時器、校驗和。TCP 使用流水線技術在不可靠的網絡層上提供可靠數據傳輸（回退N步或選擇重傳概念）。',
    category: 'transport',
    relatedTerms: ['tcp', 'sliding-window'],
  },
  {
    id: 'multiplexing',
    term: 'Multiplexing / Demultiplexing',
    termZh: '複用 / 解複用',
    definition:
      'Multiplexing: gathering data from multiple sockets and adding transport headers before passing to network layer. Demultiplexing: delivering received segments to the correct socket using destination port number and source IP:port pair.',
    definitionZh:
      '複用：從多個套接字收集數據並添加傳輸層頭部後傳遞畀網絡層。解複用：使用目標端口號和源IP:端口對將接收到的報文段傳遞到正確的套接字。',
    category: 'transport',
    relatedTerms: ['tcp', 'udp'],
  },

  // ─── Network Layer (8 terms) ─────────────────────────────────────────────
  {
    id: 'ip',
    term: 'IP',
    termZh: 'IP 網際協定',
    definition:
      'Internet Protocol: the network layer protocol responsible for logical addressing (IP addresses) and routing packets across interconnected networks. Connectionless, best-effort delivery. IPv4 (32-bit) and IPv6 (128-bit) versions.',
    definitionZh:
      '網際協定：負責邏輯尋址（IP 地址）和路由數據包跨越互聯網絡的網絡層協定。無連接、盡力而為交付。IPv4（32位）和 IPv6（128位）兩個版本。',
    category: 'network',
    relatedTerms: ['ipv4', 'ipv6', 'subnet', 'routing'],
  },
  {
    id: 'ipv4',
    term: 'IPv4',
    termZh: 'IPv4',
    definition:
      'Internet Protocol version 4 with 32-bit addresses (~4.3 billion). Header: 20 bytes minimum, includes Total Length, Identification, TTL, Protocol, Header Checksum. Fragmentation occurs at routers if packet exceeds link MTU.',
    definitionZh:
      '互聯網協定第4版，32位地址（約43億）。頭部：最小20字節，包含總長度、標識、TTL、協定、頭部校驗和。如果數據包超過鏈路MTU，路由器會進行分片。',
    category: 'network',
    relatedTerms: ['ip', 'ipv6', 'subnet'],
  },
  {
    id: 'ipv6',
    term: 'IPv6',
    definitionZh: 'IPv6',
    termZh: 'IPv6',
    definition:
      'Internet Protocol version 6 with 128-bit addresses (2^128 ≈ 3.4×10^38). Simplified 40-byte fixed header. No fragmentation at routers (only at source). Built-in support for extension headers and IPsec security.',
    definitionZh:
      '互聯網協定第6版，128位地址（2^128 ≈ 3.4×10^38）。簡化的40字節固定頭部。路由器不分片（僅在源端分片）。內置對擴展頭和IPsec安全性的支援。',
    category: 'network',
    relatedTerms: ['ip', 'ipv4'],
  },
  {
    id: 'subnet',
    term: 'Subnetting',
    termZh: '子網劃分',
    definition:
      'Dividing a large network into smaller sub-networks using subnet masks. Format: a.b.c.d/n where n = number of network bits. Number of usable hosts = 2^(32-n) - 2. Improves address utilization and network management efficiency.',
    definitionZh:
      '使用子網遮罩將大型網絡劃分為更小的子網。格式：a.b.c.d/n，其中 n = 網絡位數。可用主機數 = 2^(32-n) - 2。提高地址利用率和網絡管理效率。',
    category: 'network',
    relatedTerms: ['ip', 'ipv4', 'nat', 'dhcp'],
  },
  {
    id: 'nat',
    term: 'NAT',
    termZh: '網絡地址轉換',
    definition:
      'Network Address Translation: translates private IP addresses (10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16) to a single public IP address for Internet access. NAT router maintains a translation table mapping (private IP:port → public IP:port).',
    definitionZh:
      '網絡地址轉換：將私有IP地址（10.0.0.0/8、172.16.0.0/12、192.168.0.0/16）轉換為單個公共IP地址以存取互聯網。NAT路由器維護轉換表（私有IP:端口 → 公共IP:端口）。',
    category: 'network',
    relatedTerms: ['ip', 'subnet', 'dhcp'],
  },
  {
    id: 'dhcp',
    term: 'DHCP',
    termZh: 'DHCP 動態主機配置協定',
    definition:
      'Dynamic Host Configuration Protocol: automatically assigns IP addresses and network configuration to devices. 4-step DORA process: Discover → Offer → Request → Acknowledge. Addresses leased for a configurable duration.',
    definitionZh:
      '動態主機配置協定：自動為設備分配IP地址和網絡配置。4步DORA過程：Discover → Offer → Request → Acknowledge。地址在可配置的期限內租用。',
    category: 'network',
    relatedTerms: ['ip', 'subnet', 'nat'],
  },
  {
    id: 'icmp',
    term: 'ICMP',
    termZh: 'ICMP 控制報文協定',
    definition:
      'Internet Control Message Protocol: used for error reporting and network diagnostics. Encapsulated in IP datagrams. Key tools: ping (Echo Request/Reply, type 8/0), traceroute (TTL exceeded messages). Router Advertisement for IPv6.',
    definitionZh:
      '控制報文協定：用於錯誤報告和網絡診斷。封裝在IP數據報中。關鍵工具：ping（回顯請求/應答，類型8/0）、traceroute（TTL逾時報文）。IPv6的路由器通告。',
    category: 'network',
    relatedTerms: ['ip', 'ipv6'],
  },
  {
    id: 'routing',
    term: 'Routing',
    termZh: '路由',
    definition:
      'Process of determining the best path for packets to traverse from source to destination. Algorithms: Link-State (Dijkstra, OSPF) — global knowledge; Distance-Vector (Bellman-Ford, RIP) — iterative, local knowledge. Routers use forwarding tables.',
    definitionZh:
      '確定數據包從源到目的地的最佳路徑的過程。算法：鏈路狀態（Dijkstra，OSPF）——全局知識；距離向量（Bellman-Ford，RIP）——迭代、本地知識。路由器使用轉發表。',
    category: 'network',
    relatedTerms: ['ip', 'ipv4', 'ipv6'],
  },

  // ─── Application Layer (8 terms) ─────────────────────────────────────────
  {
    id: 'http',
    term: 'HTTP',
    termZh: 'HTTP 超文本傳輸協定',
    definition:
      'HyperText Transfer Protocol: request-response application-layer protocol for the Web. Methods: GET, POST, PUT, DELETE. HTTP/1.1: persistent connections, pipelining. HTTP/2: binary framing, multiplexing, header compression. HTTP/3: QUIC over UDP, 0-RTT setup.',
    definitionZh:
      '超文本傳輸協定：Web 的請求-響應應用層協定。方法：GET、POST、PUT、DELETE。HTTP/1.1：持久連接、管道化。HTTP/2：二進制分幀、多路複用、頭部壓縮。HTTP/3：基於UDP的QUIC、0-RTT建立。',
    category: 'application',
    relatedTerms: ['dns', 'tls', 'rest-api', 'cookie', 'cdn'],
  },
  {
    id: 'dns',
    term: 'DNS',
    termZh: 'DNS 域名系統',
    definition:
      'Domain Name System: hierarchical distributed database that translates human-readable domain names (e.g., www.hkust.edu.hk) to IP addresses. Uses UDP port 53 for queries. Record types: A (IPv4), AAAA (IPv6), CNAME, MX, NS. Caching reduces lookup latency.',
    definitionZh:
      '域名系統：分層分佈式數據庫，將人類可讀的域名（如 www.hkust.edu.hk）轉換為IP地址。查詢使用UDP端口53。紀錄類型：A（IPv4）、AAAA（IPv6）、CNAME、MX、NS。緩存減少查詢延遲。',
    category: 'application',
    relatedTerms: ['http'],
  },
  {
    id: 'tls',
    term: 'TLS',
    termZh: 'TLS 傳輸層安全',
    definition:
      'Transport Layer Security: cryptographic protocol for securing communications over a network. Uses asymmetric encryption (RSA/ECDHE) for key exchange, symmetric encryption (AES-256) for data. Handshake negotiates cipher suite and establishes shared secret.',
    definitionZh:
      '傳輸層安全：用於保護網絡通信安全的加密協定。使用非對稱加密（RSA/ECDHE）進行密鑰交換，對稱加密（AES-256）加密數據。握手協商密碼套件並建立共享密鑰。',
    category: 'application',
    relatedTerms: ['http', 'encryption', 'ca', 'digital-signature'],
  },
  {
    id: 'cdn',
    term: 'CDN',
    termZh: 'CDN 內容分發網絡',
    definition:
      'Content Delivery Network: geographically distributed servers that cache and serve content to users based on proximity. Reduces latency, reduces origin server load, improves availability. Key metrics: cache hit ratio, origin offload, edge server count.',
    definitionZh:
      '內容分發網絡：地理上分佈的服務器，根據距離緩存並向用户提供內容。降低延遲、減少源服務器負載、提高可用性。關鍵指標：緩存命中率、源站卸載、邊緣服務器數量。',
    category: 'application',
    relatedTerms: ['http', 'dns'],
  },
  {
    id: 'email',
    term: 'SMTP / IMAP',
    termZh: 'SMTP / IMAP 郵件協定',
    definition:
      'SMTP (Simple Mail Transfer Protocol, port 25/587): for sending email between mail servers and from client to server. IMAP (Internet Message Access Protocol, port 993): for accessing and managing mailbox on server. POP3 is an alternative for downloading mail.',
    definitionZh:
      'SMTP（簡單郵件傳輸協定，端口25/587）：用於郵件服務器之間和客户端到服務器之間發送郵件。IMAP（網際網路訊息存取協定，端口993）：用於存取和管理服務器上的郵箱。POP3是下載郵件的替代方案。',
    category: 'application',
  },
  {
    id: 'web-socket',
    term: 'WebSocket',
    termZh: 'WebSocket',
    definition:
      'Full-duplex communication protocol over a single TCP connection (port 443 or 80). Upgraded from HTTP via handshake (Upgrade: websocket). Enables real-time bidirectional data exchange. Used in chat apps, live feeds, online gaming.',
    definitionZh:
      '通過單個TCP連接（端口443或80）的全雙工通信協定。通過握手（Upgrade: websocket）從HTTP升級。支援實時雙向數據交換。用於聊日應用、實時推送、在線遊戲。',
    category: 'application',
    relatedTerms: ['http', 'rest-api'],
  },
  {
    id: 'rest-api',
    term: 'REST API',
    termZh: 'REST API',
    definition:
      'Representational State Transfer: architectural style for web services using standard HTTP methods. Resources identified by URLs, representations in JSON/XML. Stateless, cacheable, uniform interface. CRUD maps to POST/GET/PUT/DELETE.',
    definitionZh:
      '表述性狀態轉移：使用標準HTTP方法的Web服務架構風格。資源通過URL標識，以JSON/XML格式表示。無狀態、可緩存、統一接口。CRUD映射到POST/GET/PUT/DELETE。',
    category: 'application',
    relatedTerms: ['http'],
  },
  {
    id: 'cookie',
    term: 'Cookie',
    termZh: 'Cookie',
    definition:
      'Small data (≤4KB) stored by the browser and sent with every HTTP request to the same domain. Used for session management, personalization, and tracking. Types: Session cookies (in-memory) vs. Persistent cookies (with expiry). Attributes: Secure, HttpOnly, SameSite.',
    definitionZh:
      '瀏覽器存儲的小數據（≤4KB），隨每次對同一域名的HTTP請求一起發送。用於會話管理、個性化和跟蹤。類型：會話Cookie（內存中）vs. 持久Cookie（有有效期）。屬性：Secure、HttpOnly、SameSite。',
    category: 'application',
    relatedTerms: ['http'],
  },

  // ─── Security (8 terms) ──────────────────────────────────────────────────
  {
    id: 'encryption',
    term: 'Encryption',
    termZh: '加密',
    definition:
      'Converting plaintext to ciphertext using cryptographic algorithms. Symmetric encryption (AES-128/256): same key for encryption/decryption, fast. Asymmetric encryption (RSA, ECC): public/private key pair, used for key exchange and digital signatures.',
    definitionZh:
      '使用密碼算法將明文轉換為密文。對稱加密（AES-128/256）：加密和解密使用相同密鑰，速度快。非對稱加密（RSA、ECC）：公鑰/私鑰對，用於密鑰交換和數字簽名。',
    category: 'security',
    relatedTerms: ['tls', 'digital-signature', 'hash', 'vpn'],
  },
  {
    id: 'firewall',
    term: 'Firewall',
    termZh: '防火牆',
    definition:
      'Network security system that monitors and controls incoming and outgoing traffic based on predetermined security rules. Types: packet-filtering (L3/L4), stateful inspection, application-level (proxy), next-gen (NGFW with IDS/IPS, DPI).',
    definitionZh:
      '基於預定義安全規則監控和控制入站和出站流量的網絡安全系統。類型：包過濾（L3/L4）、狀態檢測、應用級（代理）、下一代（NGFW，含IDS/IPS、深度包檢測）。',
    category: 'security',
    relatedTerms: ['vpn', 'dos'],
  },
  {
    id: 'digital-signature',
    term: 'Digital Signature',
    termZh: '數字簽名',
    definition:
      'Cryptographic scheme for verifying authenticity and integrity. Sender signs hash of message with private key; receiver verifies with public key. Properties: authentication (who sent it), integrity (not tampered), non-repudiation (cannot deny sending).',
    definitionZh:
      '用於驗證真實性和完整性的加密方案。發送方用私鑰對訊息哈希簽名；接收方用公鑰驗證。特性：認證（誰發送的）、完整性（未被篡改）、不可否認（不能否認發送）。',
    category: 'security',
    relatedTerms: ['encryption', 'hash', 'ca'],
  },
  {
    id: 'ca',
    term: 'Certificate Authority',
    termZh: '證書頒發機構',
    definition:
      'Trusted entity that issues digital certificates binding a public key to an identity (domain, organization). Certificate contains: subject, issuer, public key, validity period, signature. X.509 is the standard format. Root CAs are pre-trusted by browsers.',
    definitionZh:
      '將公鑰與身份（域名、組織）綁定的數字證書頒發可信實體。證書包含：主體、頒發者、公鑰、有效期、簽名。X.509是標準格式。根CA被瀏覽器預先信任。',
    category: 'security',
    relatedTerms: ['tls', 'digital-signature', 'encryption'],
  },
  {
    id: 'vpn',
    term: 'VPN',
    termZh: 'VPN 虛擬專用網絡',
    definition:
      'Virtual Private Network: creates an encrypted tunnel between a device and a remote server over a public network. Protocols: IPsec, OpenVPN, WireGuard. Provides confidentiality, integrity, and authentication for network traffic.',
    definitionZh:
      '虛擬專用網絡：在公共網絡上在設備和遠程服務器之間創建加密隧道。協定：IPsec、OpenVPN、WireGuard。為網絡流量提供機密性、完整性和認證。',
    category: 'security',
    relatedTerms: ['encryption', 'firewall'],
  },
  {
    id: 'dos',
    term: 'DoS / DDoS',
    termZh: '拒絕服務攻擊',
    definition:
      'Denial of Service: overwhelming a target with traffic to make it unavailable. DoS: single source. DDoS: distributed from multiple sources (botnets). Types: volumetric (bandwidth flood), protocol (SYN flood), application-layer (HTTP flood).',
    definitionZh:
      '拒絕服務：通過大量流量淹沒目標使其無法使用。DoS：單一來源。DDoS：來自多個來源（殭屍網絡）的分佈式攻擊。類型：容量型（帶寬洪泛）、協定型（SYN洪泛）、應用層（HTTP洪泛）。',
    category: 'security',
    relatedTerms: ['firewall'],
  },
  {
    id: 'phishing',
    term: 'Phishing',
    termZh: '釣魚攻擊',
    definition:
      'Social engineering attack using fraudulent communications (email, website) disguised as trustworthy entities to steal sensitive data (passwords, credit card numbers). Variants: spear phishing (targeted), whaling (executives), pharming (DNS manipulation).',
    definitionZh:
      '使用欺詐通信（郵件、網站）偽裝成可信實體來竊取敏感數據（密碼、信用卡號）的社會工程攻擊。變體：魚叉釣魚（定向）、鯨釣（高管）、DNS欺騙（DNS操縱）。',
    category: 'security',
  },
  {
    id: 'hash',
    term: 'Hash Function',
    termZh: '哈希函數',
    definition:
      'One-way mathematical function mapping arbitrary-length input to fixed-size digest. Properties: deterministic, pre-image resistant, collision resistant, avalanche effect. Used in digital signatures (SHA-256), password storage (bcrypt), message integrity (HMAC).',
    definitionZh:
      '將任意長度輸入映射到固定大小摘要的單向數學函數。特性：確定性、抗原像、抗碰撞、雪崩效應。用於數字簽名（SHA-256）、密碼存儲（bcrypt）、訊息完整性（HMAC）。',
    category: 'security',
    relatedTerms: ['encryption', 'digital-signature'],
  },

  // ─── Queue Management (10 terms) ──────────────────────────────────
  {
    id: 'fair-queueing',
    term: 'Fair Queueing (FQ)',
    termZh: '公平隊列（FQ）',
    definition:
      'A packet scheduling algorithm where each flow gets its own queue. The scheduler serves packets based on virtual finish times (F_q,i), approximating bit-by-bit round-robin. Enforces max-min fairness between competing flows. Work-conserving and non-preemptive.',
    definitionZh:
      '一種數據包調度算法，每個流有自己的隊列。調度器基於虛擬完成時間（F_q,i）服務數據包，近似逐位輪詢。在競爭流之間實施最大最小公平性。工作保持且非搶佔式。',
    category: 'network',
    relatedTerms: ['wfq', 'max-min-fairness', 'token-bucket'],
  },
  {
    id: 'wfq',
    term: 'Weighted Fair Queueing (WFQ)',
    termZh: '加權公平隊列（WFQ）',
    definition:
      'Extension of Fair Queueing where each queue has a weight w_q. Fq,i = Sq,i + pq,i × (Σwi/wq). Flows with higher weights get proportionally more bandwidth. Used by ISPs to implement service tiers (e.g., 400Mbps plan gets w=4, 200Mbps gets w=2).',
    definitionZh:
      '公平隊列的擴展，每個隊列有一個權重w_q。Fq,i = Sq,i + pq,i × (Σwi/wq)。高權重流按比例獲得更多帶寬。ISP用它實現服務等級（如400Mbps計劃w=4，200Mbps w=2）。',
    category: 'network',
    relatedTerms: ['fair-queueing', 'max-min-fairness', 'token-bucket'],
  },
  {
    id: 'token-bucket',
    term: 'Token Bucket',
    termZh: '令牌桶',
    definition:
      'A traffic shaping mechanism where tokens arrive at rate r into a bucket of depth b. Each transmitted bit consumes one token. Ensures average rate ≤ r while allowing bursty traffic up to b bits. Used by ISPs to enforce bandwidth plans.',
    definitionZh:
      '一種流量整形機制，令牌以速率r到達深度為b的桶中。每傳輸一個比特消耗一個令牌。確保平均速率 ≤ r，同時允許最大b比特的突發流量。ISP用它來強制執行帶寬計劃。',
    category: 'network',
    relatedTerms: ['fair-queueing', 'traffic-shaping', 'network-calculus'],
  },
  {
    id: 'traffic-shaping',
    term: 'Traffic Shaping',
    termZh: '流量整形',
    definition:
      'Delaying some or all packets to bring traffic into compliance with a desired traffic profile. Techniques include basic pacing (constant rate) and token bucket shaping (rate r with burst b). Optimizes performance and manages latency.',
    definitionZh:
      '延遲部分或所有數據包使流量符合期望的流量配置檔案。技術包括基本步速（恆定速率）和令牌桶整形（速率r，突發b）。優化性能並管理延遲。',
    category: 'network',
    relatedTerms: ['token-bucket'],
  },
  {
    id: 'network-calculus',
    term: 'Network Calculus',
    termZh: '網絡微積分',
    definition:
      'A mathematical framework for reasoning about performance bounds in networks. Uses arrival curves A(t) and service curves S(t) to bound worst-case queue size (vertical gap), worst-case delay (horizontal gap), and queue drain time (intersection).',
    definitionZh:
      '用於推理網絡性能邊界的數學框架。使用到達曲線A(t)和服務曲線S(t)來限制最壞情況隊列大小（垂直間距）、最壞情況延遲（水平間距）和隊列排空時間（交叉點）。',
    category: 'network',
    relatedTerms: ['token-bucket', 'fair-queueing'],
  },
  {
    id: 'arrival-curve',
    term: 'Arrival Curve',
    termZh: '到達曲線',
    definition:
      'An upper bound on the cumulative data that can arrive by time t. For a token bucket with rate r and burst b: A(t) = r·t + b (worst case, bucket starts full). Used in network calculus to bound queue behavior.',
    definitionZh:
      '到時間t為止可以到達的累計數據的上限。對於速率為r突發為b的令牌桶：A(t) = r·t + b（最壞情況，桶滿）。用於網絡微積分來限制隊列行為。',
    category: 'network',
    relatedTerms: ['network-calculus', 'service-curve'],
  },
  {
    id: 'service-curve',
    term: 'Service Curve',
    termZh: '服務曲線',
    definition:
      'The exact function describing how much data a router/switch can serve by time t. For a link of capacity C: S(t) = C·t. Used in network calculus to compute queue bounds by comparing with arrival curves.',
 definitionZh:
      '描述路由器/交換機到時間t為止可以服務多少數據的精確函數。對於容量為C的鏈路：S(t) = C·t。用於網絡微積分中通過比較到達曲線來計算隊列邊界。',
    category: 'network',
    relatedTerms: ['arrival-curve', 'network-calculus'],
  },
  {
    id: 'max-min-fairness',
    term: 'Max-Min Fairness',
 termZh: '最大最小公平性',
    definition:
      'A fairness criterion where bandwidth is allocated to maximize the minimum share. Each flow gets ai = min(f, ri) where f is chosen so Σ(ai) = C. Achieved by the Water Filling Algorithm. Work-conserving.',
    definitionZh:
      '一種公平性準則，帶寬分配旨在最大化最小份額。每個流得到ai = min(f, ri)，其中f的選擇使Σ(ai) = C。由注水算法實現。工作保持。',
    category: 'network',
    relatedTerms: ['fair-queueing', 'jain-fairness', 'water-filling'],
  },
  {
    id: 'water-filling',
    term: 'Water Filling Algorithm',
 termZh: '注水算法',
 definition:
      'Algorithm to achieve Max-Min Fairness: pour bandwidth equally into all buckets (flows). When a bucket fills (demand met), stop filling it. Continue with remaining buckets until all full or capacity C exhausted.',
 definitionZh:
      '實現最大最小公平性的算法：等量地將帶寬注入所有桶（流）。當一個桶滿了（需求滿足）時，停止注入。繼續填充剩餘桶，直到全部滿或容量C耗盡。',
    category: 'network',
    relatedTerms: ['max-min-fairness', 'fair-queueing'],
  },
  {
    id: 'work-conserving',
    term: 'Work Conserving',
 termZh: '工作保持',
 definition:
      'A scheduling policy is work-conserving if it never leaves the link idle when there are packets to transmit. The link is always busy if the queue is non-empty. Non-work-conserving schedulers may leave the link idle despite pending work.',
    definitionZh:
      '如果隊列中有數據包傳輸，調度策略從不讓鏈路空閒，則稱為工作保持。如果隊列非空則鏈路始終繁忙。非工作保持的調度器可能在有未完成工作時讓鏈路空閒。',
    category: 'network',
    relatedTerms: ['fair-queueing', 'max-min-fairness'],
  },

  // ─── Advanced Congestion Control (8 terms) ────────────────────
  {
    id: 'tcp-cubic',
    term: 'TCP CUBIC',
    termZh: 'TCP CUBIC',
    definition:
      'Default TCP congestion control in Linux and macOS. Uses a cubic function for window growth instead of Reno\'s linear increase. Scaling factor C=0.4, decrease factor β=0.2. Reduces by 40% if estimated W_max decreases. Better suited for high-bandwidth, long-fat networks.',
    definitionZh:
      'Linux和macOS中默認的TCP擁塞控制。使用三次函數進行窗口增長，而非Reno的線性增加。縮放因子C=0.4，減少因子β=0.2。如果估計的W_max減小則減少40%。更適合高帶寬、長肥網絡。',
    category: 'transport',
    relatedTerms: ['congestion-control', 'tcp-reno'],
  },
  {
    id: 'tcp-reno',
    term: 'TCP Reno',
    termZh: 'TCP Reno',
    definition:
      'Classic TCP congestion control using AIMD. Three phases: slow start (exponential growth), congestion avoidance (linear growth), fast recovery (on 3 dup ACKs). On timeout: cwnd resets to 1 MSS. Fair among flows with same RTT.',
    definitionZh:
      '使用AIMD的經典TCP擁塞控制。三個階段：慢啓動（指數增長）、擁塞避免（線性增長）、快速恢復（3個重複ACK時觸發）。逾時時：cwnd重置為1 MSS。對具有相同RTT的流是公平的。',
    category: 'transport',
    relatedTerms: ['congestion-control', 'tcp-cubic'],
  },
  {
    id: 'jain-fairness',
    term: "Jain's Fairness Index",
    termZh: 'Jain 公平性指數',
    definition:
      'Metric to quantify fairness: F(x) = (Σxi)² / (n × Σxi²). Ranges from 0 (maximally unfair) to 1 (perfectly fair/equal shares). Widely used to evaluate congestion control algorithms.',
    definitionZh:
      '量化公平性的指標：F(x) = (Σxi)² / (n × Σxi²)。範圍從0（最大不公平）到1（完全公平/等分）。廣泛用於評估擁塞控制算法。',
    category: 'transport',
    relatedTerms: ['max-min-fairness', 'rtt-unfairness'],
  },
 {
    id: 'rtt-unfairness',
    term: 'RTT Unfairness',
 termZh: 'RTT 不公平性',
    definition:
      'Inherent bias in loss-based CC: flows with shorter RTT capture more bandwidth. Per Mathis equation, a flow with 10ms RTT gets only ~1/6 (not 1/5) of bandwidth vs a 50ms RTT flow sharing the same link.',
    definitionZh:
      '基於丟包的擁塞控制的固有偏差：較短RTT的流獲得更多帶寬。根據Mathis公式，10ms RTT的流相對於50ms RTT的流共享同一鏈路時僅獲得約1/6（不是1/5）的帶寬。',
    category: 'transport',
    relatedTerms: ['tcp-reno', 'jain-fairness', 'mathis-equation'],
  },
  {
    id: 'mathis-equation',
    term: 'Mathis Equation',
 termZh: 'Mathis 方程',
    definition:
      'TCP throughput upper bound: BW < 1.22 × MSS / (RTT × √p). Shows why Reno fails in high-speed networks: to achieve 10 Gbps with 1500B MSS and 100ms RTT, p must be impractically small.',
    definitionZh:
      'TCP吞吐量上界：BW < 1.22 × MSS / (RTT × √p)。説明瞭為什麼Reno在高帶寬網絡中失敗：用1500B MSS和100ms RTT達到10 Gbps需要不切實際的極小p值。',
    category: 'transport',
 relatedTerms: ['tcp-reno', 'rtt-unfairness'],
  },
 {
    id: 'chiu-jain',
    term: 'Chiu & Jain Convergence Proof',
    termZh: 'Chiu & Jain 收斂性證明',
 definition:
      'In a 1989 paper, proved AIMD converges to fair and efficient allocation while AIAD and MIMD do not. Defined 4 CCA properties: efficiency, fairness, convergence, and distributedness.',
    definitionZh:
      '在1989年的論文中，證明了AIMD收斂到公平和有效的分配，而AIAD和MIMD不會。定義了CCA的4個屬性：效率、公平性、收斂性和分佈式。',
    category: 'transport',
    relatedTerms: ['tcp-reno', 'jain-fairness', 'max-min-fairness'],
  },
 {
    id: 'dup-ack',
    term: 'Duplicate ACK',
 termZh: '重複確認',
 definition:
      'When a receiver sees the same ACK number multiple times, it means a packet was lost in transit. TCP uses 3 duplicate ACKs to trigger fast retransmit without waiting for a timeout. More efficient than timeout-based recovery.',
    definitionZh:
      '當接收方多次看到相同的ACK號時，表示傳輸中丟失了一個數據包。TCP使用3個重複ACK觸發快速重傳，無需等待逾時。比基於逾時的恢復更高效。',
    category: 'transport',
    relatedTerms: ['tcp-reno', 'fast-retransmit'],
  },
  {
    id: 'drop-tail',
    term: 'Drop-Tail',
    termZh: '尾部丟棄',
    definition:
      'Default queue management: when queue is full, arriving packets are simply dropped (the "tail" of the queue). Simple but causes global synchronization and bursty losses. Alternative: Active Queue Management (AQM) like RED.',
    definitionZh:
      '默認隊列管理：隊列滿時，到達的數據包直接被丟棄（隊列的尾部）。簡單但會導致全局同步和突發丟失。替代方案：如RED等主動隊列管理（AQM）。',
    category: 'network',
    relatedTerms: ['red', 'active-queue-management'],
  },
];

export const glossaryCategories = [
  { id: 'fundamentals', label: 'Fundamentals', labelZh: '基礎概念', icon: 'BookOpen', color: 'emerald' },
  { id: 'transport', label: 'Transport Layer', labelZh: '傳輸層', icon: 'ArrowLeftRight', color: 'teal' },
  { id: 'network', label: 'Network Layer', labelZh: '網絡層', icon: 'Network', color: 'amber' },
  { id: 'application', label: 'Application Layer', labelZh: '應用層', icon: 'Globe', color: 'rose' },
  { id: 'security', label: 'Security', labelZh: '網絡安全', icon: 'Shield', color: 'purple' },
];
