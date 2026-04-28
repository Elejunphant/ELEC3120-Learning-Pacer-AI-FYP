export interface QuizOption {
  id: "a" | "b" | "c" | "d";
  textEn: string;
  textZh: string;
}

export interface QuizQuestion {
  id: string;
  questionEn: string;
  questionZh: string;
  options: QuizOption[];
  correctAnswer: "a" | "b" | "c" | "d";
  explanationEn: string;
  explanationZh: string;
  difficulty: "easy" | "medium" | "hard";
  topicId: string;
  topicNameEn: string;
  topicNameZh: string;
}

export const quizQuestions: QuizQuestion[] = [
  // ==========================================
  // Topic 1: Network Fundamentals & Layering
  // ==========================================
  {
    id: "nf-1",
    questionEn: "How many layers are there in the OSI reference model?",
    questionZh: "OSI參考模型有多少層？",
    options: [
      { id: "a", textEn: "4 layers", textZh: "4層" },
      { id: "b", textEn: "5 layers", textZh: "5層" },
      { id: "c", textEn: "6 layers", textZh: "6層" },
      { id: "d", textEn: "7 layers", textZh: "7層" },
    ],
    correctAnswer: "d",
    explanationEn:
      "The OSI model has 7 layers: Physical, Data Link, Network, Transport, Session, Presentation, and Application. Each layer serves a specific function and provides services to the layer above it. The Internet's TCP/IP model is a practical 5-layer simplification.",
    explanationZh:
      "OSI模型有7層：物理層、資料鏈結層、網絡層、傳輸層、會話層、表示層和應用層。每一層都有特定功能併為上層提供服務。互聯網使用的TCP/IP模型是5層的簡化版本。",
    difficulty: "easy",
    topicId: "network-fundamentals",
    topicNameEn: "Network Fundamentals",
    topicNameZh: "網絡基礎",
  },
  {
    id: "nf-2",
    questionEn:
      "Which of the following is NOT one of the four types of delay in a packet-switched network?",
    questionZh: "以下哪項不是分組交換網絡中的四種延遲之一？",
    options: [
      { id: "a", textEn: "Nodal processing delay", textZh: "節點處理延遲" },
      { id: "b", textEn: "Queuing delay", textZh: "排隊延遲" },
      { id: "c", textEn: "Encryption delay", textZh: "加密延遲" },
      { id: "d", textEn: "Propagation delay", textZh: "傳播延遲" },
    ],
    correctAnswer: "c",
    explanationEn:
      "The four types of delay are: nodal processing delay, queuing delay, transmission delay, and propagation delay. Encryption delay is not a standard networking delay type. Total end-to-end delay is the sum of all four types across all nodes.",
    explanationZh:
      "四種延遲類型是：節點處理延遲、排隊延遲、傳輸延遲和傳播延遲。加密延遲不是標準的網絡延遲類型。端到端總延遲是所有節點上四種延遲的總和。",
    difficulty: "easy",
    topicId: "network-fundamentals",
    topicNameEn: "Network Fundamentals",
    topicNameZh: "網絡基礎",
  },
  {
    id: "nf-3",
    questionEn:
      "What is a key advantage of packet switching over circuit switching?",
    questionZh: "分組交換相比電路交換的一個關鍵優勢是什麼？",
    options: [
      {
        id: "a",
        textEn: "Packet switching guarantees no delay for any packet",
        textZh: "分組交換保證任何數據包都冇延遲",
      },
      {
        id: "b",
        textEn: "Packet switching allows more efficient sharing of link bandwidth",
        textZh: "分組交換允許更高效地共享鏈路帶寬",
      },
      {
        id: "c",
        textEn: "Packet switching always delivers packets in order",
        textZh: "分組交換總是按順序交付數據包",
      },
      {
        id: "d",
        textEn: "Packet switching requires no addressing",
        textZh: "分組交換不需要尋址",
      },
    ],
    correctAnswer: "b",
    explanationEn:
      "Packet switching allows multiple users to share the same link bandwidth more efficiently because packets from different sources can be interleaved. Circuit switching reserves a fixed bandwidth for the entire duration, which can lead to wasted capacity when the source is idle.",
    explanationZh:
      "分組交換允許多個用户更高效地共享同一鏈路帶寬，因為來自不同源的數據包可以交錯傳輸。電路交換在整個通信期間保留固定帶寬，當源空閒時會導致容量浪費。",
    difficulty: "medium",
    topicId: "network-fundamentals",
    topicNameEn: "Network Fundamentals",
    topicNameZh: "網絡基礎",
  },
  {
    id: "nf-4",
    questionEn:
      "A student sends a 1,500-byte packet over a 100 Mbps link with a propagation delay of 20 ms. What is the transmission delay?",
    questionZh:
      "一個學生在100 Mbps的鏈路上發送一個1500字節的數據包，傳播延遲為20 ms。傳輸延遲是多少？",
    options: [
      { id: "a", textEn: "0.012 ms", textZh: "0.012 ms" },
      { id: "b", textEn: "0.12 ms", textZh: "0.12 ms" },
      { id: "c", textEn: "1.2 ms", textZh: "1.2 ms" },
      { id: "d", textEn: "12 ms", textZh: "12 ms" },
    ],
    correctAnswer: "b",
    explanationEn:
      "Transmission delay = L / R = 1,500 bytes × 8 bits/byte / (100 × 10^6 bits/sec) = 12,000 / 100,000,000 = 0.00012 sec = 0.12 ms. This is the time to push all bits of the packet onto the link. Propagation delay is separate and depends on the physical distance.",
    explanationZh:
      "傳輸延遲 = L / R = 1500字節 × 8位/字節 / (100 × 10^6 位/秒) = 12000 / 100000000 = 0.00012秒 = 0.12 ms。呢是將數據包的所有位推送到鏈路上的時間。傳播延遲是獨立的，取決於物理距離。",
    difficulty: "medium",
    topicId: "network-fundamentals",
    topicNameEn: "Network Fundamentals",
    topicNameZh: "網絡基礎",
  },
  {
    id: "nf-5",
    questionEn:
      "In the TCP/IP 5-layer model, which layer is NOT present compared to the OSI 7-layer model?",
    questionZh: "在TCP/IP五層模型中，與OSI七層模型相比缺少了哪一層？",
    options: [
      { id: "a", textEn: "Physical layer", textZh: "物理層" },
      { id: "b", textEn: "Session layer", textZh: "會話層" },
      { id: "c", textEn: "Transport layer", textZh: "傳輸層" },
      { id: "d", textEn: "Network layer", textZh: "網絡層" },
    ],
    correctAnswer: "b",
    explanationEn:
      "The TCP/IP 5-layer model merges the OSI Session and Presentation layers into the Application layer. The five layers are: Physical, Data Link, Network, Transport, and Application. The Internet's practical architecture uses this simpler model.",
    explanationZh:
      "TCP/IP五層模型將OSI的會話層和表示層合併到應用層中。五層分別是：物理層、資料鏈結層、網絡層、傳輸層和應用層。互聯網的實際架構使用呢個更簡單的模型。",
    difficulty: "hard",
    topicId: "network-fundamentals",
    topicNameEn: "Network Fundamentals",
    topicNameZh: "網絡基礎",
  },

  // ==========================================
  // Topic 2: Transport Layer: UDP & TCP
  // ==========================================
  {
    id: "tu-1",
    questionEn: "Which protocol is connectionless?",
    questionZh: "哪個協定是無連接的？",
    options: [
      { id: "a", textEn: "TCP", textZh: "TCP" },
      { id: "b", textEn: "UDP", textZh: "UDP" },
      { id: "c", textEn: "HTTP", textZh: "HTTP" },
      { id: "d", textEn: "FTP", textZh: "FTP" },
    ],
    correctAnswer: "b",
    explanationEn:
      "UDP is connectionless — it does not establish a connection before sending data. There is no handshake, no flow control, and no congestion control. This makes UDP lightweight and suitable for real-time applications like DNS queries and video streaming.",
    explanationZh:
      "UDP是無連接的——它在發送數據之前不建立連接。冇握手、冇流量控制、冇擁塞控制。呢使得UDP輕量級，適合DNS查詢和視頻流等實時應用。",
    difficulty: "easy",
    topicId: "transport-layer",
    topicNameEn: "Transport Layer",
    topicNameZh: "傳輸層",
  },
  {
    id: "tu-2",
    questionEn: "What is the size of a UDP header (in bytes)?",
    questionZh: "UDP頭部的長度是多少字節？",
    options: [
      { id: "a", textEn: "4 bytes", textZh: "4字節" },
      { id: "b", textEn: "8 bytes", textZh: "8字節" },
      { id: "c", textEn: "20 bytes", textZh: "20字節" },
      { id: "d", textEn: "24 bytes", textZh: "24字節" },
    ],
    correctAnswer: "b",
    explanationEn:
      "The UDP header is 8 bytes, consisting of: Source Port (2 bytes), Destination Port (2 bytes), Length (2 bytes), and Checksum (2 bytes). This minimal overhead makes UDP efficient for applications where speed matters more than reliability.",
    explanationZh:
      "UDP頭部為8字節，包含：源端口（2字節）、目的端口（2字節）、長度（2字節）和校驗和（2字節）。呢種最小的開銷使UDP在速度比可靠性更重要的應用中非常高效。",
    difficulty: "easy",
    topicId: "transport-layer",
    topicNameEn: "Transport Layer",
    topicNameZh: "傳輸層",
  },
  {
    id: "tu-3",
    questionEn: "What is the size of a TCP header (minimum, without options)?",
    questionZh: "TCP頭部的最小長度是多少字節（不含選項）？",
    options: [
      { id: "a", textEn: "8 bytes", textZh: "8字節" },
      { id: "b", textEn: "16 bytes", textZh: "16字節" },
      { id: "c", textEn: "20 bytes", textZh: "20字節" },
      { id: "d", textEn: "24 bytes", textZh: "24字節" },
    ],
    correctAnswer: "c",
    explanationEn:
      "The minimum TCP header is 20 bytes, containing: Source Port (2), Destination Port (2), Sequence Number (4), Acknowledgment Number (4), Header Length + Flags (2), Receive Window (2), Checksum (2), and Urgent Pointer (2). Options can add up to 40 additional bytes.",
    explanationZh:
      "最小TCP頭部為20字節，包含：源端口（2）、目的端口（2）、序號（4）、確認號（4）、頭部長度+標誌位（2）、接收窗口（2）、校驗和（2）和緊急指針（2）。選項最多可增加40字節。",
    difficulty: "medium",
    topicId: "transport-layer",
    topicNameEn: "Transport Layer",
    topicNameZh: "傳輸層",
  },
  {
    id: "tu-4",
    questionEn:
      "How does TCP demultiplex incoming segments to the correct socket?",
    questionZh: "TCP如何將傳入的數據段多路分解到正確的套接字？",
    options: [
      {
        id: "a",
        textEn: "By destination IP address only",
        textZh: "僅通過目的IP地址",
      },
      {
        id: "b",
        textEn: "By source and destination port numbers",
        textZh: "通過源和目的端口號",
      },
      {
        id: "c",
        textEn: "By MAC address",
        textZh: "通過MAC地址",
      },
      {
        id: "d",
        textEn: "By packet size",
        textZh: "通過數據包大小",
      },
    ],
    correctAnswer: "b",
    explanationEn:
      "TCP uses a 4-tuple for demultiplexing: source IP, source port, destination IP, and destination port. Port numbers are 16-bit values (0-65535). Well-known ports are 0-1023, registered ports are 1024-49151, and dynamic ports are 49152-65535.",
    explanationZh:
      "TCP使用四元組進行多路分解：源IP、源端口、目的IP和目的端口。端口號是16位值（0-65535）。熟知端口是0-1023，註冊端口是1024-49151，動態端口是49152-65535。",
    difficulty: "medium",
    topicId: "transport-layer",
    topicNameEn: "Transport Layer",
    topicNameZh: "傳輸層",
  },
  {
    id: "tu-5",
    questionEn:
      "In UDP, what does the checksum cover?",
    questionZh: "在UDP中，校驗和覆蓋邊啲內容？",
    options: [
      {
        id: "a",
        textEn: "Only the UDP header",
        textZh: "僅UDP頭部",
      },
      {
        id: "b",
        textEn: "Only the UDP data payload",
        textZh: "僅UDP數據載荷",
      },
      {
        id: "c",
        textEn: "UDP header, data, and a pseudo-header with IP addresses",
        textZh: "UDP頭部、數據和包含IP地址的偽頭部",
      },
      {
        id: "d",
        textEn: "The entire IP packet",
        textZh: "整個IP數據包",
      },
    ],
    correctAnswer: "c",
    explanationEn:
      "The UDP checksum covers the UDP header, data payload, and a pseudo-header that includes source IP address, destination IP address, protocol field, and UDP length. This allows the receiver to verify that the segment was delivered to the correct destination. If the checksum is zero, it means the sender did not compute it (optional in IPv4).",
    explanationZh:
      "UDP校驗和覆蓋UDP頭部、數據載荷和一個偽頭部（包含源IP地址、目的IP地址、協定字段和UDP長度）。呢允許接收方驗證數據段是否交付到了正確的目的地。如果校驗和為零，表示發送方未計算它（在IPv4中是可選的）。",
    difficulty: "hard",
    topicId: "transport-layer",
    topicNameEn: "Transport Layer",
    topicNameZh: "傳輸層",
  },

  // ==========================================
  // Topic 3: Reliable Transmission Protocols
  // ==========================================
  {
    id: "rt-1",
    questionEn:
      "In RDT 1.0 (reliable data transfer over a perfectly reliable channel), what assumption is made about the underlying channel?",
    questionZh: "在RDT 1.0（完美可靠信道上的可靠數據傳輸）中，對底層信道做了什麼假設？",
    options: [
      {
        id: "a",
        textEn: "No bit errors and no packet loss",
        textZh: "冇比特錯誤且冇丟包",
      },
      {
        id: "b",
        textEn: "Bit errors may occur but no packet loss",
        textZh: "可能發生比特錯誤但冇丟包",
      },
      {
        id: "c",
        textEn: "No bit errors but packets may be lost",
        textZh: "冇比特錯誤但可能丟包",
      },
      {
        id: "d",
        textEn: "Bit errors and packet loss both may occur",
        textZh: "比特錯誤和丟包都可能發生",
      },
    ],
    correctAnswer: "a",
    explanationEn:
      "RDT 1.0 assumes a perfectly reliable channel with no bit errors and no packet loss. The finite state machine (FSM) for both sender and receiver has only one state. The sender simply sends data and the receiver simply reads it — no error detection, no ACKs, no retransmission needed.",
    explanationZh:
      "RDT 1.0假設完美可靠的信道，冇比特錯誤也冇丟包。發送方和接收方的有限狀態機（FSM）都只有一個狀態。發送方直接發送數據，接收方直接讀取——不需要錯誤檢測、ACK或重傳。",
    difficulty: "easy",
    topicId: "reliable-transmission",
    topicNameEn: "Reliable Transmission",
    topicNameZh: "可靠傳輸",
  },
  {
    id: "rt-2",
    questionEn:
      "In a stop-and-wait protocol, what is the sender utilization formula?",
    questionZh: "在停等協定中，發送方利用率公式是什麼？",
    options: [
      {
        id: "a",
        textEn: "U = L / (L + R × RTT)",
        textZh: "U = L / (L + R × RTT)",
      },
      {
        id: "b",
        textEn: "U = (L / R) / RTT",
        textZh: "U = (L / R) / RTT",
      },
      {
        id: "c",
        textEn: "U = (L / R) / (L / R + RTT)",
        textZh: "U = (L / R) / (L / R + RTT)",
      },
      {
        id: "d",
        textEn: "U = RTT / (L / R)",
        textZh: "U = RTT / (L / R)",
      },
    ],
    correctAnswer: "c",
    explanationEn:
      "The utilization formula is U = (L/R) / (L/R + RTT), where L is packet size, R is link rate (bandwidth), and RTT is round-trip time. The numerator is the transmission time and the denominator is the total time per packet including the wait for ACK. When RTT >> L/R, utilization becomes very low.",
    explanationZh:
      "利用率公式為 U = (L/R) / (L/R + RTT)，其中L是數據包大小，R是鏈路速率（帶寬），RTT是往返時間。分子是傳輸時間，分母是每個數據包的總時間（包括等待ACK）。當RTT >> L/R時，利用率變得非常低。",
    difficulty: "medium",
    topicId: "reliable-transmission",
    topicNameEn: "Reliable Transmission",
    topicNameZh: "可靠傳輸",
  },
  {
    id: "rt-3",
    questionEn:
      "In Go-Back-N (GBN) protocol, when a timeout occurs for a packet, what does the sender do?",
    questionZh: "在回退N步（GBN）協定中，當某個數據包逾時時，發送方會做什麼？",
    options: [
      {
        id: "a",
        textEn: "Only retransmit the timed-out packet",
        textZh: "只重傳逾時的數據包",
      },
      {
        id: "b",
        textEn: "Retransmit all sent but unacknowledged packets from the timed-out one onward",
        textZh: "從逾時的數據包開始重傳所有已發送但未確認的數據包",
      },
      {
        id: "c",
        textEn: "Reset the connection and start over",
        textZh: "重置連接並重新開始",
      },
      {
        id: "d",
        textEn: "Skip the timed-out packet and continue",
        textZh: "跳過逾時的數據包繼續",
      },
    ],
    correctAnswer: "b",
    explanationEn:
      "In GBN, on timeout the sender retransmits ALL packets that have been sent but not yet acknowledged, starting from the oldest unACKed packet. The receiver in GBN only accepts packets in order and discards out-of-order packets, so all subsequent packets must be resent.",
    explanationZh:
      "在GBN中，逾時時發送方重傳所有已發送但尚未確認的數據包，從最舊的未確認數據包開始。GBN中的接收方只接受按序到達的數據包，丟棄亂序數據包，因呢個後續所有數據包都必須重傳。",
    difficulty: "medium",
    topicId: "reliable-transmission",
    topicNameEn: "Reliable Transmission",
    topicNameZh: "可靠傳輸",
  },
  {
    id: "rt-4",
    questionEn:
      "In Selective Repeat (SR), what must be true about the window size N to avoid ambiguity at the receiver?",
    questionZh: "在選擇重傳（SR）中，窗口大小N必須滿足什麼條件才能避免接收方的歧義？",
    options: [
      {
        id: "a",
        textEn: "N can be any positive integer",
        textZh: "N可以是任何正整數",
      },
      {
        id: "b",
        textEn: "N ≤ 2^(K-1), where K is the number of bits for sequence numbers",
        textZh: "N ≤ 2^(K-1)，其中K是序號的位數",
      },
      {
        id: "c",
        textEn: "N must be exactly 1",
        textZh: "N必須恰好為1",
      },
      {
        id: "d",
        textEn: "N ≥ 2^K, where K is the number of bits for sequence numbers",
        textZh: "N ≥ 2^K，其中K是序號的位數",
      },
    ],
    correctAnswer: "b",
    explanationEn:
      "In SR, the window size must satisfy N ≤ 2^(K-1) where K is the number of sequence number bits. This prevents ambiguity where the receiver cannot distinguish between a new packet and a retransmission of an old one. For example, with 2-bit sequence numbers (0-3), the max window is 2.",
    explanationZh:
      "在SR中，窗口大小必須滿足 N ≤ 2^(K-1)，其中K是序號的位數。呢防止了接收方無法區分新數據包和舊數據包重傳的歧義。例如，使用2位序號（0-3）時，最大窗口為2。",
    difficulty: "hard",
    topicId: "reliable-transmission",
    topicNameEn: "Reliable Transmission",
    topicNameZh: "可靠傳輸",
  },
  {
    id: "rt-5",
    questionEn:
      "In RDT 3.0, why does the protocol use alternating sequence numbers (0 and 1)?",
    questionZh: "在RDT 3.0中，為什麼協定使用交替的序號（0和1）？",
    options: [
      {
        id: "a",
        textEn: "To encrypt the data being sent",
        textZh: "為了加密發送的數據",
      },
      {
        id: "b",
        textEn: "To distinguish between retransmissions of the current packet and the next new packet",
        textZh: "為了區分當前數據包的重傳和下一個新數據包",
      },
      {
        id: "c",
        textEn: "To reduce the packet size",
        textZh: "為了減小數據包大小",
      },
      {
        id: "d",
        textEn: "To support multiple simultaneous connections",
        textZh: "為了支援多個同時連接",
      },
    ],
    correctAnswer: "b",
    explanationEn:
      "RDT 3.0 uses alternating sequence numbers (0, 1, 0, 1, ...) so the receiver can tell whether a received packet is a retransmission of the old packet or a new packet. Without sequence numbers, if an ACK is lost and the sender retransmits, the receiver would accept a duplicate packet.",
    explanationZh:
      "RDT 3.0使用交替序號（0, 1, 0, 1, ...），使接收方能夠判斷收到的數據包是舊數據包的重傳還是新數據包。如果冇序號，ACK丟失後發送方重傳時，接收方會接受重複的數據包。",
    difficulty: "hard",
    topicId: "reliable-transmission",
    topicNameEn: "Reliable Transmission",
    topicNameZh: "可靠傳輸",
  },

  // ==========================================
  // Topic 4: TCP Connection Management
  // ==========================================
  {
    id: "tc-1",
    questionEn: "What do TCP sequence numbers count?",
    questionZh: "TCP序號計算的是什麼？",
    options: [
      {
        id: "a",
        textEn: "Individual packets",
        textZh: "單個數據包",
      },
      {
        id: "b",
        textEn: "Bytes of data",
        textZh: "數據的字節",
      },
      {
        id: "c",
        textEn: "Number of connections",
        textZh: "連接數量",
      },
      {
        id: "d",
        textEn: "Number of ACKs received",
        textZh: "收到的ACK數量",
      },
    ],
    correctAnswer: "b",
    explanationEn:
      "TCP sequence numbers count bytes, not packets. The sequence number of a segment is the byte-stream number of the first data byte in that segment. The ACK number is the next expected byte number, providing cumulative acknowledgment.",
    explanationZh:
      "TCP序號計算的是字節，不是數據包。數據段的序號是該數據段中第一個數據字節的字節流編號。確認號是期望接收的下一個字節編號，提供累計確認。",
    difficulty: "easy",
    topicId: "tcp-connection",
    topicNameEn: "TCP Connection",
    topicNameZh: "TCP連接",
  },
  {
    id: "tc-2",
    questionEn:
      "In the TCP three-way handshake, what does the server send back to the client?",
    questionZh: "在TCP三次握手中，服務器發回什麼畀客户端？",
    options: [
      { id: "a", textEn: "ACK only", textZh: "僅ACK" },
      { id: "b", textEn: "SYN only", textZh: "僅SYN" },
      { id: "c", textEn: "SYN-ACK", textZh: "SYN-ACK" },
      { id: "d", textEn: "FIN-ACK", textZh: "FIN-ACK" },
    ],
    correctAnswer: "c",
    explanationEn:
      "The server responds with SYN-ACK: SYN to synchronize its own sequence number, and ACK to acknowledge the client's SYN. The three steps are: (1) Client → SYN (seq=x), (2) Server → SYN-ACK (seq=y, ack=x+1), (3) Client → ACK (ack=y+1).",
    explanationZh:
      "服務器回覆SYN-ACK：SYN用於同步自己的序號，ACK用於確認客户端的SYN。三步是：(1) 客户端 → SYN (seq=x)，(2) 服務器 → SYN-ACK (seq=y, ack=x+1)，(3) 客户端 → ACK (ack=y+1)。",
    difficulty: "medium",
    topicId: "tcp-connection",
    topicNameEn: "TCP Connection",
    topicNameZh: "TCP連接",
  },
  {
    id: "tc-3",
    questionEn:
      "In TCP four-way termination, which side enters the TIME_WAIT state?",
    questionZh: "在TCP四次揮手中，哪一方進入TIME_WAIT狀態？",
    options: [
      {
        id: "a",
        textEn: "The side that sends the first FIN",
        textZh: "發送第一個FIN的一方",
      },
      {
        id: "b",
        textEn: "The side that sends the last ACK",
        textZh: "發送最後一個ACK的一方",
      },
      {
        id: "c",
        textEn: "The server always enters TIME_WAIT",
        textZh: "服務器總是進入TIME_WAIT",
      },
      {
        id: "d",
        textEn: "Both sides enter TIME_WAIT simultaneously",
        textZh: "雙方同時進入TIME_WAIT",
      },
    ],
    correctAnswer: "b",
    explanationEn:
      "The side that sends the last ACK (the active closer) enters TIME_WAIT. This is typically the client that initiated the close. TIME_WAIT lasts for 2×MSL to ensure the final ACK reaches the server and any delayed segments from the old connection expire.",
    explanationZh:
      "發送最後一個ACK的一方（主動關閉方）進入TIME_WAIT。通常是發起關閉的客户端。TIME_WAIT持續2×MSL，以確保最終ACK到達服務器，並且舊連接的延遲數據段過期。",
    difficulty: "medium",
    topicId: "tcp-connection",
    topicNameEn: "TCP Connection",
    topicNameZh: "TCP連接",
  },
  {
    id: "tc-4",
    questionEn:
      "What is the purpose of the TIME_WAIT state lasting for 2×MSL?",
    questionZh: "TIME_WAIT狀態持續2×MSL的目的是什麼？",
    options: [
      {
        id: "a",
        textEn: "To wait for the server to start a new connection",
        textZh: "等待服務器啓動新連接",
      },
      {
        id: "b",
        textEn: "To allow the sender to retransmit the FIN packet",
        textZh: "允許發送方重傳FIN數據包",
      },
      {
        id: "c",
        textEn: "To ensure the last ACK is received and delayed segments are discarded",
        textZh: "確保最後的ACK被接收並丟棄延遲的數據段",
      },
      {
        id: "d",
        textEn: "To give the application time to close the socket",
        textZh: "畀應用程序時間關閉套接字",
      },
    ],
    correctAnswer: "c",
    explanationEn:
      "TIME_WAIT lasts for 2×MSL (Maximum Segment Lifetime). Its two purposes are: (1) ensuring the last ACK reaches the server — if lost, the server retransmits FIN and the client can re-ACK; (2) allowing any delayed/duplicate segments from the old connection to expire so they don't interfere with a new connection.",
    explanationZh:
      "TIME_WAIT持續2×MSL（最大數據段生命週期）。其兩個目的是：(1) 確保最後的ACK到達服務器——如果丟失，服務器重傳FIN，客户端可以重新確認；(2) 允許舊連接中延遲/重複的數據段過期，以免干擾新連接。",
    difficulty: "hard",
    topicId: "tcp-connection",
    topicNameEn: "TCP Connection",
    topicNameZh: "TCP連接",
  },
  {
    id: "tc-5",
    questionEn:
      "In TCP RTT estimation, which formula is used to update the EstimatedRTT?",
    questionZh: "在TCP RTT估計中，使用哪個公式更新EstimatedRTT？",
    options: [
      {
        id: "a",
        textEn: "EstimatedRTT = 0.5 × EstimatedRTT + 0.5 × SampleRTT",
        textZh: "EstimatedRTT = 0.5 × EstimatedRTT + 0.5 × SampleRTT",
      },
      {
        id: "b",
        textEn: "EstimatedRTT = (1 - α) × EstimatedRTT + α × SampleRTT, where α ≈ 0.125",
        textZh: "EstimatedRTT = (1 - α) × EstimatedRTT + α × SampleRTT，其中α ≈ 0.125",
      },
      {
        id: "c",
        textEn: "EstimatedRTT = SampleRTT",
        textZh: "EstimatedRTT = SampleRTT",
      },
      {
        id: "d",
        textEn: "EstimatedRTT = max(SampleRTT) over last 10 samples",
        textZh: "EstimatedRTT = 最近10個樣本中max(SampleRTT)",
      },
    ],
    correctAnswer: "b",
    explanationEn:
      "TCP uses an Exponential Weighted Moving Average (EWMA): EstimatedRTT = (1-α) × EstimatedRTT + α × SampleRTT, with a recommended α = 1/8 = 0.125. This gives more weight to recent samples while smoothing out fluctuations. The DevRTT is similarly computed with β = 0.25.",
    explanationZh:
      "TCP使用指數加權移動平均（EWMA）：EstimatedRTT = (1-α) × EstimatedRTT + α × SampleRTT，推薦α = 1/8 = 0.125。呢畀最近的樣本更多權重，同時平滑波動。DevRTT類似地使用β = 0.25計算。",
    difficulty: "hard",
    topicId: "tcp-connection",
    topicNameEn: "TCP Connection",
    topicNameZh: "TCP連接",
  },

  // ==========================================
  // Topic 5: Flow Control & Congestion Control
  // ==========================================
  {
    id: "fc-1",
    questionEn:
      "What does AIMD stand for in TCP congestion control?",
    questionZh: "TCP擁塞控制中的AIMD代表什麼？",
    options: [
      {
        id: "a",
        textEn: "Additive Increase, Multiplicative Decrease",
        textZh: "加性增，乘性減",
      },
      {
        id: "b",
        textEn: "Always Increase, Maximum Decrease",
        textZh: "總是增，最大減",
      },
      {
        id: "c",
        textEn: "Aggressive Increase, Mild Decrease",
        textZh: "激進增，温和減",
      },
      {
        id: "d",
        textEn: "Automatic Increase, Manual Decrease",
        textZh: "自動增，手動減",
      },
    ],
    correctAnswer: "a",
    explanationEn:
      "AIMD (Additive Increase, Multiplicative Decrease) is the core principle of TCP congestion control. The window increases linearly (add 1 MSS per RTT) and decreases multiplicatively (halve on congestion). This provides both efficiency (utilizing available bandwidth) and fairness (converging to equal share).",
    explanationZh:
      "AIMD（加性增、乘性減）是TCP擁塞控制的核心原則。窗口線性增長（每個RTT增加1個MSS），乘性減少（擁塞時減半）。呢同時提供了效率（利用可用帶寬）和公平性（收斂到均等份額）。",
    difficulty: "easy",
    topicId: "flow-congestion-control",
    topicNameEn: "Flow & Congestion Control",
    topicNameZh: "流量與擁塞控制",
  },
  {
    id: "fc-2",
    questionEn:
      "In TCP slow start, how does the congestion window (cwnd) grow?",
    questionZh: "在TCP慢啓動中，擁塞窗口（cwnd）如何增長？",
    options: [
      {
        id: "a",
        textEn: "Increases by 1 MSS per RTT",
        textZh: "每個RTT增加1個MSS",
      },
      {
        id: "b",
        textEn: "Doubles every RTT (exponential growth)",
        textZh: "每個RTT翻倍（指數增長）",
      },
      {
        id: "c",
        textEn: "Stays constant until loss is detected",
        textZh: "保持不變直到檢測到丟包",
      },
      {
        id: "d",
        textEn: "Increases randomly",
        textZh: "隨機增加",
      },
    ],
    correctAnswer: "b",
    explanationEn:
      "In slow start, cwnd starts at 1 MSS and doubles every RTT (increases by 1 MSS for each ACK received). This exponential growth continues until cwnd reaches ssthresh (slow start threshold) or a loss event occurs. After ssthresh, it enters congestion avoidance (linear growth).",
    explanationZh:
      "在慢啓動中，cwnd從1個MSS開始，每個RTT翻倍（每收到一個ACK增加1個MSS）。呢種指數增長持續到cwnd達到ssthresh（慢啓動閾值）或發生丟包事件。到達ssthresh後進入擁塞避免（線性增長）。",
    difficulty: "medium",
    topicId: "flow-congestion-control",
    topicNameEn: "Flow & Congestion Control",
    topicNameZh: "流量與擁塞控制",
  },
  {
    id: "fc-3",
    questionEn:
      "When a TCP receiver advertises rwnd = 0, what does the sender do?",
    questionZh: "當TCP接收方通告rwnd = 0時，發送方會怎麼做？",
    options: [
      {
        id: "a",
        textEn: "Immediately closes the connection",
        textZh: "立即關閉連接",
      },
      {
        id: "b",
        textEn: "Enters persist mode and periodically sends probe segments",
        textZh: "進入堅持模式並定期發送探測數據段",
      },
      {
        id: "c",
        textEn: "Ignores the rwnd and continues sending at full rate",
        textZh: "忽略rwnd繼續以全速發送",
      },
      {
        id: "d",
        textEn: "Waits indefinitely for a non-zero rwnd update",
        textZh: "無限期等待非零的rwnd更新",
      },
    ],
    correctAnswer: "b",
    explanationEn:
      "When rwnd = 0, the sender enters persist mode and sends small probe segments (1 byte) periodically to check if the receiver's buffer has space again. This prevents a deadlock where the receiver's window update ACK is lost and both sides wait forever.",
    explanationZh:
      "當rwnd = 0時，發送方進入堅持模式，定期發送小的探測數據段（1字節）來檢查接收方緩衝區是否有空間了。呢防止了死鎖——接收方的窗口更新ACK丟失，雙方永遠等待。",
    difficulty: "medium",
    topicId: "flow-congestion-control",
    topicNameEn: "Flow & Congestion Control",
    topicNameZh: "流量與擁塞控制",
  },
  {
    id: "fc-4",
    questionEn:
      "What does TCP Reno do when it receives 3 duplicate ACKs?",
    questionZh: "TCP Reno在收到3個重複ACK時會怎麼做？",
    options: [
      {
        id: "a",
        textEn: "Resets the connection completely",
        textZh: "完全重置連接",
      },
      {
        id: "b",
        textEn: "Performs fast retransmit and fast recovery",
        textZh: "執行快速重傳和快速恢復",
      },
      {
        id: "c",
        textEn: "Enters slow start with cwnd = 1 MSS",
        textZh: "以cwnd = 1 MSS進入慢啓動",
      },
      {
        id: "d",
        textEn: "Sends a FIN to close the connection",
        textZh: "發送FIN關閉連接",
      },
    ],
    correctAnswer: "b",
    explanationEn:
      "TCP Reno performs Fast Retransmit (immediately resend the missing segment without waiting for timeout) and Fast Recovery: sets ssthresh = cwnd/2, sets cwnd = ssthresh + 3, then increases cwnd linearly. This avoids going back to slow start, which would be wasteful since duplicate ACKs indicate the network is still delivering some packets.",
    explanationZh:
      "TCP Reno執行快速重傳（立即重發丟失的數據段而不等待逾時）和快速恢復：設定ssthresh = cwnd/2，設定cwnd = ssthresh + 3，然後線性增加cwnd。呢避免了回到慢啓動，因為重複ACK表明網絡仍在交付某些數據包，回到慢啓動會浪費帶寬。",
    difficulty: "hard",
    topicId: "flow-congestion-control",
    topicNameEn: "Flow & Congestion Control",
    topicNameZh: "流量與擁塞控制",
  },
  {
    id: "fc-5",
    questionEn:
      "A link has a bandwidth of 1 Gbps and an RTT of 40 ms. What is the Bandwidth-Delay Product (BDP)?",
    questionZh: "一個鏈路的帶寬為1 Gbps，RTT為40 ms。帶寬延遲積（BDP）是多少？",
    options: [
      { id: "a", textEn: "4 MB", textZh: "4 MB" },
      { id: "b", textEn: "5 MB", textZh: "5 MB" },
      { id: "c", textEn: "8 MB", textZh: "8 MB" },
      { id: "d", textEn: "10 MB", textZh: "10 MB" },
    ],
    correctAnswer: "b",
    explanationEn:
      "BDP = bandwidth × RTT = 1 Gbps × 40 ms = 10^9 bps × 0.04 s = 4 × 10^7 bits = 5 × 10^6 bytes = 5 MB. BDP represents the amount of data that can be 'in flight' (sent but not yet acknowledged) to fully utilize the link.",
    explanationZh:
      "BDP = 帶寬 × RTT = 1 Gbps × 40 ms = 10^9 bps × 0.04 s = 4 × 10^7 bits = 5 × 10^6 bytes = 5 MB。BDP表示可以「在途中」（已發送但尚未確認）的數據量，以充分利用鏈路。",
    difficulty: "hard",
    topicId: "flow-congestion-control",
    topicNameEn: "Flow & Congestion Control",
    topicNameZh: "流量與擁塞控制",
  },

  // ==========================================
  // Topic 6: Web & HTTP Protocol Evolution
  // ==========================================
  {
    id: "wh-1",
    questionEn:
      "What is the main advantage of HTTP/1.1 over HTTP/1.0?",
    questionZh: "HTTP/1.1相比HTTP/1.0的主要優勢是什麼？",
    options: [
      {
        id: "a",
        textEn: "Supports encryption by default",
        textZh: "默認支援加密",
      },
      {
        id: "b",
        textEn: "Persistent connections by default",
        textZh: "默認持久連接",
      },
      {
        id: "c",
        textEn: "Uses UDP instead of TCP",
        textZh: "使用UDP代替TCP",
      },
      {
        id: "d",
        textEn: "Smaller header size",
        textZh: "更小的頭部",
      },
    ],
    correctAnswer: "b",
    explanationEn:
      "HTTP/1.1 uses persistent connections by default (Connection: keep-alive), allowing multiple objects to be sent over a single TCP connection. HTTP/1.0 required a new TCP connection for each object, causing significant overhead from repeated three-way handshakes.",
    explanationZh:
      "HTTP/1.1默認使用持久連接（Connection: keep-alive），允許通過單個TCP連接發送多個對象。HTTP/1.0需要為每個對象建立新的TCP連接，導致重複三次握手的顯著開銷。",
    difficulty: "medium",
    topicId: "web-http",
    topicNameEn: "Web & HTTP",
    topicNameZh: "Web與HTTP",
  },
  {
    id: "wh-2",
    questionEn:
      "Which of the following is an improvement in HTTP/2 over HTTP/1.1?",
    questionZh: "以下哪項是HTTP/2相比HTTP/1.1的改進？",
    options: [
      {
        id: "a",
        textEn: "Uses a different transport protocol (UDP instead of TCP)",
        textZh: "使用不同的傳輸協定（UDP代替TCP）",
      },
      {
        id: "b",
        textEn: "Supports multiplexing of multiple streams over a single TCP connection",
        textZh: "支援在單個TCP連接上多路複用多個流",
      },
      {
        id: "c",
        textEn: "Eliminates all headers from requests",
        textZh: "消除了請求中的所有頭部",
      },
      {
        id: "d",
        textEn: "Removes the need for TLS encryption",
        textZh: "不再需要TLS加密",
      },
    ],
    correctAnswer: "b",
    explanationEn:
      "HTTP/2 supports multiplexing — multiple requests and responses can be interleaved on a single TCP connection. Other improvements include binary framing (instead of text), header compression (HPACK), and server push. However, it still runs over TCP, which means TCP-level HOL blocking remains.",
    explanationZh:
      "HTTP/2支援多路複用——多個請求和響應可以在單個TCP連接上交錯傳輸。其他改進包括二進制分幀（代替文本）、頭部壓縮（HPACK）和服務器推送。但它仍然運行在TCP上，呢意味着TCP級的隊頭阻塞仍然存在。",
    difficulty: "medium",
    topicId: "web-http",
    topicNameEn: "Web & HTTP",
    topicNameZh: "Web與HTTP",
  },
  {
    id: "wh-3",
    questionEn:
      "In web caching, which HTTP header does a conditional GET request use to check if a cached object is still valid?",
    questionZh: "在Web緩存中，條件GET請求使用哪個HTTP頭來檢查緩存對象是否仍然有效？",
    options: [
      { id: "a", textEn: "If-None-Match", textZh: "If-None-Match" },
      { id: "b", textEn: "If-Modified-Since", textZh: "If-Modified-Since" },
      { id: "c", textEn: "Cache-Control: no-cache", textZh: "Cache-Control: no-cache" },
      {
        id: "d",
        textEn: "Authorization",
        textZh: "Authorization",
      },
    ],
    correctAnswer: "b",
    explanationEn:
      "A conditional GET uses the If-Modified-Since header with the Last-Modified timestamp from the original response. If the object has not been modified, the server returns 304 Not Modified without sending the object body, saving bandwidth.",
    explanationZh:
      "條件GET使用If-Modified-Since頭部，附帶原始響應中的Last-Modified時間戳。如果對象未被修改，服務器返回304 Not Modified而不發送對象主體，節省帶寬。",
    difficulty: "medium",
    topicId: "web-http",
    topicNameEn: "Web & HTTP",
    topicNameZh: "Web與HTTP",
  },
  {
    id: "wh-4",
    questionEn:
      "What problem does HTTP/2 still suffer from despite its improvements over HTTP/1.1?",
    questionZh: "HTTP/2儘管相比HTTP/1.1有了改進，但仍然存在什麼問題？",
    options: [
      {
        id: "a",
        textEn: "No header compression support",
        textZh: "不支援頭部壓縮",
      },
      {
        id: "b",
        textEn: "TCP-level head-of-line blocking",
        textZh: "TCP級隊頭阻塞",
      },
      {
        id: "c",
        textEn: "Cannot use persistent connections",
        textZh: "不能使用持久連接",
      },
      {
        id: "d",
        textEn: "Only supports plain text encoding",
        textZh: "僅支援純文字編碼",
      },
    ],
    correctAnswer: "b",
    explanationEn:
      "HTTP/2 solves application-layer HOL blocking via multiplexing, but since it still uses TCP, a single lost packet causes all HTTP/2 streams to stall while TCP retransmits. This TCP-level HOL blocking is the main motivation for HTTP/3, which uses QUIC over UDP.",
    explanationZh:
      "HTTP/2通過多路複用解決了應用層隊頭阻塞，但由於仍使用TCP，一個丟失的數據包會導致所有HTTP/2流在TCP重傳期間停滯。呢種TCP級隊頭阻塞是HTTP/3使用基於UDP的QUIC的主要原因。",
    difficulty: "hard",
    topicId: "web-http",
    topicNameEn: "Web & HTTP",
    topicNameZh: "Web與HTTP",
  },
  {
    id: "wh-5",
    questionEn: "HTTP/3 is built on which transport protocol?",
    questionZh: "HTTP/3基於哪個傳輸協定？",
    options: [
      { id: "a", textEn: "TCP", textZh: "TCP" },
      { id: "b", textEn: "UDP (via QUIC)", textZh: "UDP（通過QUIC）" },
      { id: "c", textEn: "SCTP", textZh: "SCTP" },
      { id: "d", textEn: "DCCP", textZh: "DCCP" },
    ],
    correctAnswer: "b",
    explanationEn:
      "HTTP/3 uses QUIC, which is built on UDP. This eliminates TCP-level head-of-line blocking since lost QUIC packets only affect their own stream. QUIC also integrates TLS 1.3 for security and supports connection migration when network interfaces change.",
    explanationZh:
      "HTTP/3使用QUIC，它基於UDP。呢消除了TCP級隊頭阻塞，因為丟失的QUIC數據包隻影響自己的流。QUIC還集成了TLS 1.3提供安全性，並支援網絡接口切換時的連接遷移。",
    difficulty: "hard",
    topicId: "web-http",
    topicNameEn: "Web & HTTP",
    topicNameZh: "Web與HTTP",
  },

  // ==========================================
  // Topic 7: Video Streaming Fundamentals
  // ==========================================
  {
    id: "vs-1",
    questionEn:
      "In DASH (Dynamic Adaptive Streaming over HTTP), what does the client use to select video quality?",
    questionZh:
      "在DASH（HTTP動態自適應流）中，客户端用什麼來選擇視頻質量？",
    options: [
      {
        id: "a",
        textEn: "Server's recommendation in the manifest",
        textZh: "清單檔案中服務器的推薦",
      },
      {
        id: "b",
        textEn: "User's manual quality selection",
        textZh: "用户手動選擇質量",
      },
      {
        id: "c",
        textEn: "Estimated available bandwidth",
        textZh: "估計的可用帶寬",
      },
      {
        id: "d",
        textEn: "Random selection from available encodings",
        textZh: "從可用編碼中隨機選擇",
      },
    ],
    correctAnswer: "c",
    explanationEn:
      "In DASH, the client dynamically estimates available bandwidth (based on recent download times) and selects the highest video encoding that can be sustained without rebuffering. The manifest file (MPD) describes all available quality levels and chunk URLs.",
    explanationZh:
      "在DASH中，客户端動態估計可用帶寬（基於最近的下載時間），並選擇能夠維持而不會重新緩衝的最高視頻編碼。清單檔案（MPD）描述了所有可用的質量級別和分塊URL。",
    difficulty: "medium",
    topicId: "video-streaming",
    topicNameEn: "Video Streaming",
    topicNameZh: "視頻流",
  },
  {
    id: "vs-2",
    questionEn:
      "In video compression, which type of frame is encoded independently without reference to other frames?",
    questionZh: "在視頻壓縮中，哪種幀是獨立編碼的，不參考其他幀？",
    options: [
      { id: "a", textEn: "I-frame (Intra-coded)", textZh: "I幀（幀內編碼）" },
      { id: "b", textEn: "P-frame (Predictive)", textZh: "P幀（預測編碼）" },
      {
        id: "c",
        textEn: "B-frame (Bi-directional)",
        textZh: "B幀（雙向編碼）",
      },
      { id: "d", textEn: "D-frame (Delta)", textZh: "D幀（差分編碼）" },
    ],
    correctAnswer: "a",
    explanationEn:
      "I-frames (Intra-coded frames) are encoded independently using only spatial compression (similar to JPEG). They serve as reference points for P-frames and B-frames. P-frames reference previous frames, and B-frames reference both previous and future frames, achieving higher compression.",
    explanationZh:
      "I幀（幀內編碼幀）使用僅空間壓縮獨立編碼（類似JPEG）。它們作為P幀和B幀的參考點。P幀參考前幀，B幀參考前後幀，實現更高的壓縮率。",
    difficulty: "medium",
    topicId: "video-streaming",
    topicNameEn: "Video Streaming",
    topicNameZh: "視頻流",
  },
  {
    id: "vs-3",
    questionEn:
      "What is the key difference between progressive download and adaptive streaming (DASH)?",
    questionZh: "漸進式下載和自適應流（DASH）之間的關鍵區別是什麼？",
    options: [
      {
        id: "a",
        textEn: "Progressive download uses UDP while DASH uses TCP",
        textZh: "漸進式下載使用UDP而DASH使用TCP",
      },
      {
        id: "b",
        textEn: "Progressive download downloads the entire file; DASH dynamically selects quality chunks",
        textZh: "漸進式下載下載整個檔案；DASH動態選擇質量分塊",
      },
      {
        id: "c",
        textEn: "DASH requires a special protocol while progressive download uses HTTP",
        textZh: "DASH需要特殊協定而漸進式下載使用HTTP",
      },
      {
        id: "d",
        textEn: "There is no difference; they are the same technology",
        textZh: "冇區別；它們是相同的技術",
      },
    ],
    correctAnswer: "b",
    explanationEn:
      "Progressive download fetches the entire video file sequentially, and the user can only watch as far as the downloaded portion. DASH divides video into small chunks at multiple quality levels, allowing the client to adapt quality based on current network conditions.",
    explanationZh:
      "漸進式下載按順序攞整個視頻檔案，用户只能觀看到已下載的部分。DASH將視頻分成多個質量級別的小分塊，允許客户端根據當前網絡條件自適應調整質量。",
    difficulty: "easy",
    topicId: "video-streaming",
    topicNameEn: "Video Streaming",
    topicNameZh: "視頻流",
  },
  {
    id: "vs-4",
    questionEn:
      "How do CDNs typically select which edge server to serve a video request from?",
    questionZh: "CDN通常如何選擇從哪個邊緣服務器提供視頻請求？",
    options: [
      {
        id: "a",
        textEn: "Always select the server with the most available storage",
        textZh: "總是選擇有最多可用存儲的服務器",
      },
      {
        id: "b",
        textEn: "Select based on network proximity (distance/latency) to the client",
        textZh: "基於到客户端的網絡鄰近度（距離/延遲）選擇",
      },
      {
        id: "c",
        textEn: "Select the server that was least recently used",
        textZh: "選擇最近最少使用的服務器",
      },
      {
        id: "d",
        textEn: "Randomly select any server in the CDN",
        textZh: "隨機選擇CDN中的任何服務器",
      },
    ],
    correctAnswer: "b",
    explanationEn:
      "CDNs use network proximity to select the nearest edge server, minimizing latency and improving user experience. Common selection methods include DNS-based redirection, HTTP-level redirects, and anycast routing. Netflix Open Connect is a notable private CDN.",
    explanationZh:
      "CDN使用網絡鄰近度選擇最近的邊緣服務器，最小化延遲並改善用户體驗。常見的選擇方法包括基於DNS的重新導向、HTTP級重新導向和任播路由。Netflix Open Connect是著名的私有CDN。",
    difficulty: "medium",
    topicId: "video-streaming",
    topicNameEn: "Video Streaming",
    topicNameZh: "視頻流",
  },
  {
    id: "vs-5",
    questionEn:
      "In a buffer-based rate adaptation algorithm, when should the client increase video quality?",
    questionZh: "在基於緩衝區的速率自適應算法中，客户端何時應該提高視頻質量？",
    options: [
      {
        id: "a",
        textEn: "When the buffer occupancy exceeds a target threshold",
        textZh: "當緩衝區佔用超過目標閾值時",
      },
      {
        id: "b",
        textEn: "When the buffer is nearly empty",
        textZh: "當緩衝區幾乎為空時",
      },
      {
        id: "c",
        textEn: "Only when the user manually requests higher quality",
        textZh: "僅當用户手動請求更高質量時",
      },
      {
        id: "d",
        textEn: "When the video playback is paused",
        textZh: "當視頻播放暫停時",
      },
    ],
    correctAnswer: "a",
    explanationEn:
      "Buffer-based algorithms increase quality when buffer occupancy is above a target threshold (indicating comfortable buffer level) and decrease quality when buffer is low (risk of rebuffering). BBA-0 is a well-known buffer-based algorithm that uses a reservoir and cushion mechanism.",
    explanationZh:
      "基於緩衝區的算法在緩衝區佔用超過目標閾值（表示緩衝充足）時提高質量，在緩衝區低（有重新緩衝風險）時降低質量。BBA-0是一種著名的基於緩衝區的算法，使用水庫和緩衝墊機制。",
    difficulty: "hard",
    topicId: "video-streaming",
    topicNameEn: "Video Streaming",
    topicNameZh: "視頻流",
  },

  // ==========================================
  // Topic 8: Practical Development Tips
  // ==========================================
  {
    id: "pt-1",
    questionEn:
      "In socket programming, what type is used to create a TCP socket?",
    questionZh: "在套接字編程中，創建TCP套接字使用什麼類型？",
    options: [
      {
        id: "a",
        textEn: "SOCK_DGRAM",
        textZh: "SOCK_DGRAM",
      },
      {
        id: "b",
        textEn: "SOCK_STREAM",
        textZh: "SOCK_STREAM",
      },
      {
        id: "c",
        textEn: "SOCK_RAW",
        textZh: "SOCK_RAW",
      },
      {
        id: "d",
        textEn: "SOCK_SEQPACKET",
        textZh: "SOCK_SEQPACKET",
      },
    ],
    correctAnswer: "b",
    explanationEn:
      "SOCK_STREAM is used for TCP sockets, providing reliable, ordered, byte-stream communication. SOCK_DGRAM is used for UDP sockets, providing unreliable datagram communication. The socket() call also needs AF_INET for IPv4 and the protocol parameter (usually 0 for default).",
    explanationZh:
      "SOCK_STREAM用於TCP套接字，提供可靠的、有序的字節流通信。SOCK_DGRAM用於UDP套接字，提供不可靠的數據報通信。socket()調用還需要AF_INET表示IPv4，以及協定參數（通常為0表示默認）。",
    difficulty: "easy",
    topicId: "practical-tips",
    topicNameEn: "Practical Tips",
    topicNameZh: "實用技巧",
  },
  {
    id: "pt-2",
    questionEn:
      "In Wireshark, which display filter shows all HTTP GET requests?",
    questionZh: "在Wireshark中，哪個顯示過濾器可以顯示所有HTTP GET請求？",
    options: [
      { id: "a", textEn: "tcp.port == 80", textZh: "tcp.port == 80" },
      { id: "b", textEn: "http.request.method == GET", textZh: "http.request.method == GET" },
      { id: "c", textEn: "http.get", textZh: "http.get" },
      { id: "d", textEn: "filter http GET", textZh: "filter http GET" },
    ],
    correctAnswer: "b",
    explanationEn:
      "The correct Wireshark display filter for HTTP GET requests is 'http.request.method == GET'. Alternatively, 'http.request' shows all HTTP requests (GET, POST, etc.). tcp.port == 80 shows all TCP traffic on port 80, not just HTTP GET requests.",
    explanationZh:
      "Wireshark中HTTP GET請求的正確顯示過濾器是 'http.request.method == GET'。或者，'http.request' 顯示所有HTTP請求（GET、POST等）。tcp.port == 80 顯示端口80上的所有TCP流量，不僅僅是HTTP GET請求。",
    difficulty: "easy",
    topicId: "practical-tips",
    topicNameEn: "Practical Tips",
    topicNameZh: "實用技巧",
  },
  {
    id: "pt-3",
    questionEn:
      "What is the correct order of API calls for a TCP server to start accepting connections?",
    questionZh:
      "TCP服務器開始接受連接的正確API調用順序是什麼？",
    options: [
      {
        id: "a",
        textEn: "socket() → connect() → send()",
        textZh: "socket() → connect() → send()",
      },
      {
        id: "b",
        textEn: "socket() → bind() → listen() → accept()",
        textZh: "socket() → bind() → listen() → accept()",
      },
      {
        id: "c",
        textEn: "socket() → accept() → bind() → listen()",
        textZh: "socket() → accept() → bind() → listen()",
      },
      {
        id: "d",
        textEn: "socket() → listen() → bind() → accept()",
        textZh: "socket() → listen() → bind() → accept()",
      },
    ],
    correctAnswer: "b",
    explanationEn:
      "A TCP server must: (1) socket() to create a socket, (2) bind() to assign a port number, (3) listen() to mark it as passive and specify the backlog queue, and (4) accept() to wait for incoming connections. The accept() call blocks until a client connects and returns a new socket for that connection.",
    explanationZh:
      "TCP服務器必須：(1) socket() 創建套接字，(2) bind() 分配端口號，(3) listen() 標記為被動套接字並指定積壓隊列，(4) accept() 等待傳入連接。accept()調用會阻塞直到客户端連接，並返回該連接的新套接字。",
    difficulty: "medium",
    topicId: "practical-tips",
    topicNameEn: "Practical Tips",
    topicNameZh: "實用技巧",
  },
  {
    id: "pt-4",
    questionEn:
      "Which CLI tool is used to discover the network path (route) that packets take to a destination?",
    questionZh: "哪個CLI工具用於發現數據包到達目的地的網絡路徑（路由）？",
    options: [
      { id: "a", textEn: "ping", textZh: "ping" },
      { id: "b", textEn: "traceroute (or tracert on Windows)", textZh: "traceroute（Windows上是tracert）" },
      { id: "c", textEn: "nslookup", textZh: "nslookup" },
      { id: "d", textEn: "netstat", textZh: "netstat" },
    ],
    correctAnswer: "b",
    explanationEn:
      "traceroute (Linux/Mac) or tracert (Windows) sends packets with incrementing TTL values to discover each hop along the path. ping tests basic connectivity using ICMP echo requests. nslookup queries DNS, and netstat shows socket/connection statistics.",
    explanationZh:
      "traceroute（Linux/Mac）或tracert（Windows）發送遞增TTL值的數據包來發現路徑上的每一跳。ping使用ICMP回聲請求測試基本連通性。nslookup查詢DNS，netstat顯示套接字/連接統計。",
    difficulty: "medium",
    topicId: "practical-tips",
    topicNameEn: "Practical Tips",
    topicNameZh: "實用技巧",
  },
  {
    id: "pt-5",
    questionEn:
      "When debugging a networking application, you find that a client cannot connect to a server on the same machine. Which command is most useful to check if the server is listening on the expected port?",
    questionZh:
      "調試網絡應用時，發現客户端無法連接到同一台機器上的服務器。哪個命令最有用來檢查服務器是否在預期端口上監聽？",
    options: [
      { id: "a", textEn: "ping localhost", textZh: "ping localhost" },
      { id: "b", textEn: "netstat -an | grep LISTEN (or ss -tlnp)", textZh: "netstat -an | grep LISTEN（或 ss -tlnp）" },
      { id: "c", textEn: "ifconfig", textZh: "ifconfig" },
      { id: "d", textEn: "curl http://localhost", textZh: "curl http://localhost" },
    ],
    correctAnswer: "b",
    explanationEn:
      "netstat -an | grep LISTEN (or ss -tlnp on modern Linux) shows all ports that are in LISTEN state, confirming whether the server has bound to the expected port. This is the most direct way to verify the server is ready to accept connections before troubleshooting further.",
    explanationZh:
      "netstat -an | grep LISTEN（或現代Linux上的 ss -tlnp）顯示所有處於LISTEN狀態的端口，確認服務器是否綁定到了預期的端口。呢是在進一步排查之前驗證服務器已準備好接受連接的最直接方式。",
    difficulty: "hard",
    topicId: "practical-tips",
    topicNameEn: "Practical Tips",
    topicNameZh: "實用技巧",
  },

  // ==========================================
  // Topic 7: Network Layer & IP
  // ==========================================
  {
    id: "nl-1",
    questionEn:
      "What is the subnet mask for a /26 network prefix?",
    questionZh:
      "/26網絡前綴對應的子網遮罩是什麼？",
    options: [
      { id: "a", textEn: "255.255.255.128", textZh: "255.255.255.128" },
      { id: "b", textEn: "255.255.255.192", textZh: "255.255.255.192" },
      { id: "c", textEn: "255.255.255.224", textZh: "255.255.255.224" },
      { id: "d", textEn: "255.255.255.240", textZh: "255.255.255.240" },
    ],
    correctAnswer: "b",
    explanationEn:
      "A /26 prefix means 26 bits for the network portion, leaving 6 bits for hosts. The last octet has 2 network bits (11000000 = 192), giving subnet mask 255.255.255.192. This creates 2^6 = 64 IP addresses per subnet, with 62 usable host addresses.",
    explanationZh:
      "/26前綴表示26位用於網絡部分，剩餘6位用於主機。最後一個八位組有2個網絡位（11000000 = 192），子網遮罩為255.255.255.192。每個子網有2^6 = 64個IP地址，其中62個可用主機地址。",
    difficulty: "easy",
    topicId: "network-layer",
    topicNameEn: "Network Layer",
    topicNameZh: "網絡層",
  },
  {
    id: "nl-2",
    questionEn:
      "In IPv4, what is the maximum number of hosts in a Class B subnet with a subnet mask of 255.255.252.0?",
    questionZh:
      "在IPv4中，子網遮罩為255.255.252.0的B類子網最多可以有多少台主機？",
    options: [
      { id: "a", textEn: "1,022 hosts", textZh: "1,022台主機" },
      { id: "b", textEn: "2,046 hosts", textZh: "2,046台主機" },
      { id: "c", textEn: "4,094 hosts", textZh: "4,094台主機" },
      { id: "d", textEn: "8,190 hosts", textZh: "8,190台主機" },
    ],
    correctAnswer: "a",
    explanationEn:
      "The subnet mask 255.255.252.0 corresponds to /22, meaning 32 − 22 = 10 host bits. The number of usable host addresses is 2^10 − 2 = 1,024 − 2 = 1,022. The −2 accounts for the network address and the broadcast address, which cannot be assigned to hosts.",
    explanationZh:
      "子網遮罩255.255.252.0對應/22，意味着32 − 22 = 10位主機位。可用主機地址數為2^10 − 2 = 1,024 − 2 = 1,022。減去的2個地址是網絡地址和廣播地址，不能分配畀主機。",
    difficulty: "medium",
    topicId: "network-layer",
    topicNameEn: "Network Layer",
    topicNameZh: "網絡層",
  },
  {
    id: "nl-3",
    questionEn:
      "How does NAT (Network Address Translation) help with IPv4 address depletion?",
    questionZh:
      "NAT（網絡地址轉換）如何幫助緩解IPv4地址耗盡問題？",
    options: [
      {
        id: "a",
        textEn: "NAT encrypts packets so fewer bits are needed for addresses",
        textZh: "NAT加密數據包，使地址需要更少的位",
      },
      {
        id: "b",
        textEn: "NAT allows multiple internal hosts to share a single public IP address",
        textZh: "NAT允許多個內部主機共享一個公共IP地址",
      },
      {
        id: "c",
        textEn: "NAT converts IPv4 addresses to IPv6 addresses automatically",
        textZh: "NAT自動將IPv4地址轉換為IPv6地址",
      },
      {
        id: "d",
        textEn: "NAT compresses the IP header to use fewer bits",
        textZh: "NAT壓縮IP頭部以使用更少的位",
      },
    ],
    correctAnswer: "b",
    explanationEn:
      "NAT allows a local network with many private IP addresses (e.g., 192.168.x.x) to share a single public IP address for Internet communication. The NAT router maintains a translation table mapping (internal IP, port) pairs to the public IP and unique ports. This dramatically reduces the number of public IPv4 addresses needed.",
    explanationZh:
      "NAT允許擁有多個私有IP地址（如192.168.x.x）的本地網絡共享一個公共IP地址進行互聯網通信。NAT路由器維護一個轉換表，將（內部IP，端口）對映射到公共IP和唯一端口。呢極大地減少了所需的公共IPv4地址數量。",
    difficulty: "easy",
    topicId: "network-layer",
    topicNameEn: "Network Layer",
    topicNameZh: "網絡層",
  },
  {
    id: "nl-4",
    questionEn:
      "Which protocol does a router use to send an ICMP \"Destination Unreachable\" message?",
    questionZh:
      "路由器使用哪個協定發送ICMP「目的不可達」訊息？",
    options: [
      { id: "a", textEn: "UDP", textZh: "UDP" },
      { id: "b", textEn: "TCP", textZh: "TCP" },
      { id: "c", textEn: "ICMP", textZh: "ICMP" },
      { id: "d", textEn: "ARP", textZh: "ARP" },
    ],
    correctAnswer: "c",
    explanationEn:
      "ICMP (Internet Control Message Protocol) is used by routers and hosts to send error messages and operational information. A \"Destination Unreachable\" message (Type 3) is sent by a router when it cannot forward a packet — for example, when the destination host is down, the network is unreachable, or the port is closed (in which case the host sends it).",
    explanationZh:
      "ICMP（互聯網控制訊息協定）由路由器和主機用於發送錯誤訊息和操作信息。當路由器無法轉發數據包時，會發送「目的不可達」訊息（類型3）——例如，目的主機關機、網絡不可達，或端口關閉時（由主機發送）。",
    difficulty: "medium",
    topicId: "network-layer",
    topicNameEn: "Network Layer",
    topicNameZh: "網絡層",
  },
  {
    id: "nl-5",
    questionEn:
      "What is a key difference between IPv6 and IPv4 regarding fragmentation?",
    questionZh:
      "IPv6和IPv4在分片方面有什麼關鍵區別？",
    options: [
      {
        id: "a",
        textEn: "IPv6 does not support fragmentation at all",
        textZh: "IPv6完全不支援分片",
      },
      {
        id: "b",
        textEn: "IPv6 routers can fragment packets, but IPv4 routers cannot",
        textZh: "IPv6路由器可以對數據包分片，但IPv4路由器不能",
      },
      {
        id: "c",
        textEn: "In IPv6, only the source host can fragment; routers never fragment",
        textZh: "在IPv6中，只有源主機可以進行分片；路由器從不分片",
      },
      {
        id: "d",
        textEn: "IPv4 packets are never fragmented",
        textZh: "IPv4數據包從不被分片",
      },
    ],
    correctAnswer: "c",
    explanationEn:
      "In IPv6, fragmentation is handled exclusively by the source host, not by routers. The source uses Path MTU Discovery to determine the smallest MTU along the path and fragments accordingly. Routers that receive an IPv6 packet too large for the next link send an ICMPv6 \"Packet Too Big\" message back to the source instead of fragmenting it.",
    explanationZh:
      "在IPv6中，分片完全由源主機處理，不由路由器處理。源主機使用路徑MTU發現來確定路徑上最小的MTU，並據呢個進行分片。收到過大數據包的路由器不會分片，而是向源發送ICMPv6「數據包過大」訊息。",
    difficulty: "hard",
    topicId: "network-layer",
    topicNameEn: "Network Layer",
    topicNameZh: "網絡層",
  },

  // ==========================================
  // Topic 8: Network Security
  // ==========================================
  {
    id: "ns-1",
    questionEn:
      "What is the primary difference between symmetric and asymmetric encryption?",
    questionZh:
      "對稱加密和非對稱加密的主要區別是什麼？",
    options: [
      {
        id: "a",
        textEn: "Symmetric encryption uses one key; asymmetric uses two keys (public/private pair)",
        textZh: "對稱加密使用一個密鑰；非對稱加密使用兩個密鑰（公鑰/私鑰對）",
      },
      {
        id: "b",
        textEn: "Symmetric encryption is slower than asymmetric encryption",
        textZh: "對稱加密比非對稱加密更慢",
      },
      {
        id: "c",
        textEn: "Asymmetric encryption does not provide confidentiality",
        textZh: "非對稱加密不提供機密性",
      },
      {
        id: "d",
        textEn: "Symmetric encryption requires a key exchange protocol",
        textZh: "對稱加密需要密鑰交換協定",
      },
    ],
    correctAnswer: "a",
    explanationEn:
      "Symmetric encryption (e.g., AES) uses the same shared secret key for both encryption and decryption. Asymmetric encryption (e.g., RSA) uses a mathematically related key pair — a public key for encryption and a private key for decryption. Symmetric encryption is actually much faster, and both provide confidentiality.",
    explanationZh:
      "對稱加密（如AES）使用相同的共享密鑰進行加密和解密。非對稱加密（如RSA）使用數學相關的密鑰對——公鑰用於加密，私鑰用於解密。對稱加密實際上要快得多，兩者都提供機密性。",
    difficulty: "easy",
    topicId: "network-security",
    topicNameEn: "Network Security",
    topicNameZh: "網絡安全",
  },
  {
    id: "ns-2",
    questionEn:
      "What property does a digital signature provide that a simple hash (e.g., MD5 of a message) does not?",
    questionZh:
      "數字簽名提供了簡單哈希（如訊息的MD5）所不具備的什麼屬性？",
    options: [
      {
        id: "a",
        textEn: "Integrity verification",
        textZh: "完整性驗證",
      },
      {
        id: "b",
        textEn: "Non-repudiation and authentication of the sender",
        textZh: "不可否認性和發送方身份認證",
      },
      {
        id: "c",
        textEn: "Faster computation speed",
        textZh: "更快的計算速度",
      },
      {
        id: "d",
        textEn: "Smaller output size",
        textZh: "更小的輸出大小",
      },
    ],
    correctAnswer: "b",
    explanationEn:
      "A simple hash provides integrity (any change to the message changes the hash), but anyone can compute a hash. A digital signature uses the sender's private key to sign the hash, providing both integrity AND non-repudiation — the sender cannot deny having sent the message, since only they possess the private key. Verification uses the sender's public key.",
    explanationZh:
      "簡單哈希提供完整性（訊息的任何更改都會改變哈希值），但任何人都可以計算哈希。數字簽名使用發送方的私鑰對哈希進行簽名，同時提供完整性和不可否認性——發送方不能否認發送了訊息，因為只有他們擁有私鑰。驗證使用發送方的公鑰。",
    difficulty: "medium",
    topicId: "network-security",
    topicNameEn: "Network Security",
    topicNameZh: "網絡安全",
  },
  {
    id: "ns-3",
    questionEn:
      "In the TLS handshake, what is the purpose of the server's digital certificate?",
    questionZh:
      "在TLS握手過程中，服務器數字證書的目的是什麼？",
    options: [
      {
        id: "a",
        textEn: "To encrypt all application data exchanged after the handshake",
        textZh: "加密握手後交換的所有應用數據",
      },
      {
        id: "b",
        textEn: "To prove the server's identity and deliver the server's public key to the client",
        textZh: "證明服務器身份並向客户端提供服務器的公鑰",
      },
      {
        id: "c",
        textEn: "To establish a shared symmetric key directly",
        textZh: "直接建立共享的對稱密鑰",
      },
      {
        id: "d",
        textEn: "To verify the client's identity",
        textZh: "驗證客户端的身份",
      },
    ],
    correctAnswer: "b",
    explanationEn:
      "The server's digital certificate (issued by a Certificate Authority) allows the client to verify that it is communicating with the legitimate server (not an impostor). The certificate contains the server's public key, which the client uses to encrypt the pre-master secret. After the handshake, a symmetric session key is derived for efficient data encryption.",
    explanationZh:
      "服務器的數字證書（由證書頒發機構籤發）允許客户端驗證與合法服務器（而非冒充者）通信。證書包含服務器的公鑰，客户端使用該公鑰加密預主密鑰。握手完成後，派生出對稱會話密鑰用於高效的數據加密。",
    difficulty: "medium",
    topicId: "network-security",
    topicNameEn: "Network Security",
    topicNameZh: "網絡安全",
  },
  {
    id: "ns-4",
    questionEn:
      "A stateful firewall maintains information about active connections. Which of the following can it detect that a stateless packet filter cannot?",
    questionZh:
      "有狀態防火牆維護活動連接的信息。以下哪項是有狀態防火牆能檢測而無狀態包過濾器不能檢測的？",
    options: [
      {
        id: "a",
        textEn: "The destination IP address of incoming packets",
        textZh: "傳入數據包的目的IP地址",
      },
      {
        id: "b",
        textEn: "Incoming packets that are responses to requests initiated from inside the network",
        textZh: "從網絡內部發起請求的響應傳入數據包",
      },
      {
        id: "c",
        textEn: "The port number used in the TCP header",
        textZh: "TCP頭部中使用的端口號",
      },
      {
        id: "d",
        textEn: "The total size of the data payload",
        textZh: "數據載荷的總大小",
      },
    ],
    correctAnswer: "b",
    explanationEn:
      "A stateful firewall tracks the state of connections. When an internal host initiates a connection, the firewall records it. When the external response arrives, the firewall checks its state table to verify the packet is a legitimate response to an approved outbound request. A stateless filter can only check individual packets based on static rules (IP, port, protocol) without connection context.",
    explanationZh:
      "有狀態防火牆跟蹤連接狀態。當內部主機發起連接時，防火牆會紀錄。當外部響應到達時，防火牆檢查其狀態表，驗證數據包是否是對已批准出站請求的合法響應。無狀態過濾器只能根據靜態規則（IP、端口、協定）檢查單個數據包，冇連接上下文。",
    difficulty: "hard",
    topicId: "network-security",
    topicNameEn: "Network Security",
    topicNameZh: "網絡安全",
  },
  {
    id: "ns-5",
    questionEn:
      "In a Diffie-Hellman key exchange, what security property does it provide?",
    questionZh:
      "在Diffie-Hellman密鑰交換中，它提供了什麼安全屬性？",
    options: [
      {
        id: "a",
        textEn: "It provides authentication of both parties",
        textZh: "它提供雙方的認證",
      },
      {
        id: "b",
        textEn: "It allows two parties to establish a shared secret over an insecure channel",
        textZh: "它允許雙方在不安全的信道上建立共享密鑰",
      },
      {
        id: "c",
        textEn: "It encrypts all data transmitted between the two parties",
        textZh: "它加密雙方之間傳輸的所有數據",
      },
      {
        id: "d",
        textEn: "It prevents man-in-the-middle attacks by default",
        textZh: "它默認防止中間人攻擊",
      },
    ],
    correctAnswer: "b",
    explanationEn:
      "Diffie-Hellman (DH) allows two parties to establish a shared secret key over an insecure channel without transmitting the key itself. It relies on the discrete logarithm problem for security. However, basic DH does NOT provide authentication — it is vulnerable to man-in-the-middle attacks unless combined with digital signatures or certificates (as in authenticated DH).",
    explanationZh:
      "Diffie-Hellman（DH）允許雙方在不安全的信道上建立共享密鑰，而無需傳輸密鑰本身。它的安全性依賴於離散對數問題。然而，基本DH不提供認證——除非結合數字簽名或證書（如認證DH），否則容易受到中間人攻擊。",
    difficulty: "hard",
    topicId: "network-security",
    topicNameEn: "Network Security",
    topicNameZh: "網絡安全",
  },

  // ==========================================
  // Topic 6 (continued): Web & HTTP — Additional Questions
  // ==========================================
  {
    id: "wh-6",
    questionEn:
      "What is the role of a DNS recursive resolver in the DNS resolution process?",
    questionZh:
      "在DNS解析過程中，DNS遞歸解析器的作用是什麼？",
    options: [
      {
        id: "a",
        textEn: "It stores the authoritative records for a domain",
        textZh: "它存儲域的權威紀錄",
      },
      {
        id: "b",
        textEn: "It iteratively queries root, TLD, and authoritative servers on behalf of the client",
        textZh: "它代表客户端迭代查詢根服務器、TLD服務器和權威服務器",
      },
      {
        id: "c",
        textEn: "It translates domain names to MAC addresses",
        textZh: "它將域名轉換為MAC地址",
      },
      {
        id: "d",
        textEn: "It only caches DNS responses and never performs queries",
        textZh: "它只緩存DNS響應，從不執行查詢",
      },
    ],
    correctAnswer: "b",
    explanationEn:
      "A DNS recursive resolver (usually operated by the ISP or a public resolver like 8.8.8.8) handles the full resolution process for the client. It first checks its cache, then if needed, queries the root DNS server → TLD DNS server → authoritative DNS server iteratively until it gets the final IP address, which it returns to the client.",
    explanationZh:
      "DNS遞歸解析器（通常由ISP或公共解析器如8.8.8.8運營）代表客户端處理完整的解析過程。它首先檢查緩存，如果需要，則迭代查詢根DNS服務器→TLD DNS服務器→權威DNS服務器，直到獲得最終IP地址，然後返回畀客户端。",
    difficulty: "medium",
    topicId: "web-http",
    topicNameEn: "Web & HTTP",
    topicNameZh: "Web與HTTP",
  },
  {
    id: "wh-7",
    questionEn:
      "In HTTP/3, which transport protocol is used instead of TCP?",
    questionZh:
      "在HTTP/3中，使用哪個傳輸協定代替TCP？",
    options: [
      { id: "a", textEn: "UDP with QUIC", textZh: "基於UDP的QUIC" },
      { id: "b", textEn: "SCTP", textZh: "SCTP" },
      { id: "c", textEn: "DCCP", textZh: "DCCP" },
      { id: "d", textEn: "Raw IP", textZh: "原始IP" },
    ],
    correctAnswer: "a",
    explanationEn:
      "HTTP/3 uses QUIC, a transport protocol built on UDP. QUIC eliminates TCP-level head-of-line blocking by implementing reliability and congestion control at the stream level — a lost packet only affects the stream it belongs to, not all streams. QUIC also integrates TLS 1.3 encryption by default and supports connection migration.",
    explanationZh:
      "HTTP/3使用QUIC，一個基於UDP的傳輸協定。QUIC通過在流級別實現可靠性和擁塞控制，消除了TCP級隊頭阻塞——丟失的數據包隻影響它所屬的流，不影響所有流。QUIC還默認集成TLS 1.3加密，並支援連接遷移。",
    difficulty: "easy",
    topicId: "web-http",
    topicNameEn: "Web & HTTP",
    topicNameZh: "Web與HTTP",
  },

  // ==========================================
  // Topic 10: IP - Internet Protocol
  // ==========================================
  {
    id: "ip-1",
    questionEn: "What is the minimum size of an IPv4 header (without options)?",
    questionZh: "IPv4頭部的最小長度是多少（不含選項）？",
    options: [
      { id: "a", textEn: "10 bytes", textZh: "10字節" },
      { id: "b", textEn: "20 bytes", textZh: "20字節" },
      { id: "c", textEn: "30 bytes", textZh: "30字節" },
      { id: "d", textEn: "40 bytes", textZh: "40字節" },
    ],
    correctAnswer: "b",
    explanationEn:
      "The minimum IPv4 header is 20 bytes, containing: Version (4 bits), IHL (4 bits), DSCP/ECN (8 bits), Total Length (16 bits), Identification (16 bits), Flags (3 bits), Fragment Offset (13 bits), TTL (8 bits), Protocol (8 bits), Header Checksum (16 bits), Source IP (32 bits), and Destination IP (32 bits). Options can add up to 40 additional bytes.",
    explanationZh:
      "最小IPv4頭部為20字節，包含：版本（4位）、頭部長度（4位）、DSCP/ECN（8位）、總長度（16位）、標識（16位）、標誌（3位）、片偏移（13位）、TTL（8位）、協定（8位）、頭部校驗和（16位）、源IP（32位）和目的IP（32位）。選項最多可增加40字節。",
    difficulty: "easy",
    topicId: "ip-protocol",
    topicNameEn: "IP - Internet Protocol",
    topicNameZh: "IP協定",
  },
  {
    id: "ip-2",
    questionEn:
      "Given the IP address 192.168.5.130/25, what is the network address and broadcast address?",
    questionZh: "畀定IP地址192.168.5.130/25，網絡地址和廣播地址分別是什麼？",
    options: [
      { id: "a", textEn: "Network: 192.168.5.0, Broadcast: 192.168.5.255", textZh: "網絡：192.168.5.0，廣播：192.168.5.255" },
      { id: "b", textEn: "Network: 192.168.5.128, Broadcast: 192.168.5.255", textZh: "網絡：192.168.5.128，廣播：192.168.5.255" },
      { id: "c", textEn: "Network: 192.168.5.0, Broadcast: 192.168.5.127", textZh: "網絡：192.168.5.0，廣播：192.168.5.127" },
      { id: "d", textEn: "Network: 192.168.5.128, Broadcast: 192.168.5.129", textZh: "網絡：192.168.5.128，廣播：192.168.5.129" },
    ],
    correctAnswer: "b",
    explanationEn:
      "/25 means 25 bits for network, 7 bits for host. The subnet mask is 255.255.255.128. The third octet in binary: 5 = 00000101. With /25, the 25th bit is the first bit of the last octet. For 192.168.5.130, the last octet 130 = 10000010. Since the MSB is 1, the network address has last octet 10000000 = 128, so the network is 192.168.5.128/25. The broadcast has all host bits as 1: 11111111 = 255, so broadcast is 192.168.5.255.",
    explanationZh:
      "/25表示25位用於網絡，7位用於主機。子網遮罩為255.255.255.128。對於192.168.5.130，最後一個八位組130 = 10000010。由於最高位為1，網絡地址的最後一個八位組為10000000 = 128，所以網絡為192.168.5.128/25。廣播地址將所有主機位置1：11111111 = 255，所以廣播地址為192.168.5.255。",
    difficulty: "medium",
    topicId: "ip-protocol",
    topicNameEn: "IP - Internet Protocol",
    topicNameZh: "IP協定",
  },
  {
    id: "ip-3",
    questionEn:
      "What is the purpose of the DHCP protocol, and which transport layer protocol does it use?",
    questionZh: "DHCP協定的目的是什麼，它使用哪個傳輸層協定？",
    options: [
      {
        id: "a",
        textEn: "DHCP assigns static IP addresses to routers; it uses TCP",
        textZh: "DHCP為路由器分配靜態IP地址；使用TCP",
      },
      {
        id: "b",
        textEn: "DHCP dynamically assigns IP addresses and network configuration to hosts; it uses UDP",
        textZh: "DHCP為主機動態分配IP地址和網絡配置；使用UDP",
      },
      {
        id: "c",
        textEn: "DHCP translates domain names to IP addresses; it uses UDP",
        textZh: "DHCP將域名轉換為IP地址；使用UDP",
      },
      {
        id: "d",
        textEn: "DHCP encrypts communication between hosts; it uses TCP",
        textZh: "DHCP加密主機間通信；使用TCP",
      },
    ],
    correctAnswer: "b",
    explanationEn:
      "DHCP (Dynamic Host Configuration Protocol) dynamically assigns IP addresses, subnet masks, default gateways, and DNS servers to hosts. It uses UDP on ports 67 (server) and 68 (client). The four-step DORA process is: Discover (broadcast), Offer (server response), Request (client selects), and Acknowledge (server confirms). Lease times control how long an address is valid.",
    explanationZh:
      "DHCP（動態主機配置協定）動態分配IP地址、子網遮罩、默認網關和DNS服務器畀主機。它在UDP端口67（服務器）和68（客户端）上工作。四步DORA過程是：Discover（廣播）、Offer（服務器響應）、Request（客户端選擇）和Acknowledge（服務器確認）。租約時間控制地址的有效期。",
    difficulty: "medium",
    topicId: "ip-protocol",
    topicNameEn: "IP - Internet Protocol",
    topicNameZh: "IP協定",
  },
  {
    id: "ip-4",
    questionEn:
      "An organization has been allocated the IP block 10.0.0.0/20. How many subnets of /24 can be created, and how many usable hosts per subnet?",
    questionZh: "一個組織被分配了IP塊10.0.0.0/20。可以創建多少個/24的子網，每個子網有多少可用主機？",
    options: [
      { id: "a", textEn: "8 subnets, 254 hosts each", textZh: "8個子網，每個254台主機" },
      { id: "b", textEn: "16 subnets, 254 hosts each", textZh: "16個子網，每個254台主機" },
      { id: "c", textEn: "14 subnets, 256 hosts each", textZh: "14個子網，每個256台主機" },
      { id: "d", textEn: "32 subnets, 128 hosts each", textZh: "32個子網，每個128台主機" },
    ],
    correctAnswer: "b",
    explanationEn:
      "A /20 block has 20 network bits. To create /24 subnets, we need 24 − 20 = 4 additional bits for subnetting. The number of subnets is 2^4 = 16. Each /24 subnet has 32 − 24 = 8 host bits, giving 2^8 = 256 total addresses and 256 − 2 = 254 usable host addresses (subtracting network and broadcast addresses). The subnets range from 10.0.0.0/24 to 10.0.15.0/24.",
    explanationZh:
      "/20塊有20個網絡位。要創建/24子網，需要24 − 20 = 4個額外的子網位。子網數為2^4 = 16。每個/24子網有32 − 24 = 8個主機位，共有2^8 = 256個地址，減去2個得到256 − 2 = 254個可用主機地址（減去網絡地址和廣播地址）。子網範圍從10.0.0.0/24到10.0.15.0/24。",
    difficulty: "hard",
    topicId: "ip-protocol",
    topicNameEn: "IP - Internet Protocol",
    topicNameZh: "IP協定",
  },
  {
    id: "ip-5",
    questionEn:
      "Which of the following is a valid IPv6 address?",
    questionZh: "以下哪一個是有效的IPv6地址？",
    options: [
      { id: "a", textEn: "2001:0db8:85a3:0000:0000:8a2e:0370:7334", textZh: "2001:0db8:85a3:0000:0000:8a2e:0370:7334" },
      { id: "b", textEn: "2001:db8:85a3::8a2e:370g:7334", textZh: "2001:db8:85a3::8a2e:370g:7334" },
      { id: "c", textEn: "2001:0db8:85a3:0:0:8a2e:0370:7334:1234", textZh: "2001:0db8:85a3:0:0:8a2e:0370:7334:1234" },
      { id: "d", textEn: "2001:0db8::85a3::8a2e:0370:7334", textZh: "2001:0db8::85a3::8a2e:0370:7334" },
    ],
    correctAnswer: "a",
    explanationEn:
      "Option (a) is valid: 8 groups of 4 hex digits. Option (b) is invalid because 'g' is not a valid hex digit (hex is 0-9, a-f). Option (c) is invalid because it has 9 groups instead of 8. Option (d) is invalid because '::' (double colon) can appear only once in an address — it represents one or more consecutive groups of zeros. The address in (a) can also be shortened to 2001:db8:85a3::8a2e:370:7334.",
    explanationZh:
      "選項(a)有效：8組4位十六進制數字。選項(b)無效，因為'g'不是有效的十六進制數字（十六進制是0-9, a-f）。選項(c)無效，因為有9組而不是8組。選項(d)無效，因為'::'（雙冒號）在地址中只能出現一次——它表示一個或多個連續的零組。選項(a)中的地址也可以縮寫為2001:db8:85a3::8a2e:370:7334。",
    difficulty: "hard",
    topicId: "ip-protocol",
    topicNameEn: "IP - Internet Protocol",
    topicNameZh: "IP協定",
  },

  // ==========================================
  // Topic 11: BGP - Border Gateway Protocol
  // ==========================================
  {
    id: "bg-1",
    questionEn:
      "What type of routing protocol is BGP?",
    questionZh: "BGP是什麼類型的路由協定？",
    options: [
      { id: "a", textEn: "An interior gateway protocol (IGP) using link-state", textZh: "使用鏈路狀態的內部網關協定（IGP）" },
      { id: "b", textEn: "An exterior gateway protocol (EGP) using path-vector", textZh: "使用路徑向量的外部網關協定（EGP）" },
      { id: "c", textEn: "A distance-vector interior gateway protocol", textZh: "距離向量內部網關協定" },
      { id: "d", textEn: "A multicast routing protocol", textZh: "多播路由協定" },
    ],
    correctAnswer: "b",
    explanationEn:
      "BGP (Border Gateway Protocol) is the de facto standard exterior gateway protocol (EGP) used to exchange routing information between autonomous systems (ASes). It is classified as a path-vector protocol because it carries the full AS path as an attribute, which helps detect and avoid routing loops. BGP is the protocol that makes the Internet's inter-domain routing work.",
    explanationZh:
      "BGP（邊界網關協定）是事實上的標準外部網關協定（EGP），用於在自治系統（AS）之間交換路由信息。它被歸類為路徑向量協定，因為它將完整的AS路徑作為屬性攜帶，呢有助於檢測和避免路由環路。BGP是使互聯網域間路由工作的協定。",
    difficulty: "easy",
    topicId: "bgp-routing",
    topicNameEn: "BGP - Border Gateway Protocol",
    topicNameZh: "BGP協定",
  },
  {
    id: "bg-2",
    questionEn:
      "What is the key difference between iBGP and eBGP?",
    questionZh: "iBGP和eBGP之間的關鍵區別是什麼？",
    options: [
      {
        id: "a",
        textEn: "iBGP runs within an AS; eBGP runs between different ASes",
        textZh: "iBGP在AS內部運行；eBGP在不同AS之間運行",
      },
      {
        id: "b",
        textEn: "iBGP uses UDP while eBGP uses TCP",
        textZh: "iBGP使用UDP而eBGP使用TCP",
      },
      {
        id: "c",
        textEn: "iBGP uses distance-vector while eBGP uses link-state",
        textZh: "iBGP使用距離向量而eBGP使用鏈路狀態",
      },
      {
        id: "d",
        textEn: "There is no difference; they are the same protocol",
        textZh: "冇區別；它們是相同的協定",
      },
    ],
    correctAnswer: "a",
    explanationEn:
      "iBGP (internal BGP) runs between routers within the same AS, while eBGP (external BGP) runs between routers in different ASes. Key differences: eBGP peers are typically directly connected (TTL=1 by default), while iBGP peers can be anywhere in the AS. In iBGP, routes learned from one iBGP peer are NOT forwarded to another iBGP peer (iBGP full mesh or route reflectors are needed).",
    explanationZh:
      "iBGP（內部BGP）在同一AS內的路由器之間運行，而eBGP（外部BGP）在不同AS的路由器之間運行。關鍵區別：eBGP對等體通常直接連接（默認TTL=1），而iBGP對等體可以在AS內的任何位置。在iBGP中，從一個iBGP對等體學到的路由不會轉發畀另一個iBGP對等體（需要iBGP全網狀連接或路由反射器）。",
    difficulty: "medium",
    topicId: "bgp-routing",
    topicNameEn: "BGP - Border Gateway Protocol",
    topicNameZh: "BGP協定",
  },
  {
    id: "bg-3",
    questionEn:
      "In BGP, which path attribute is primarily used to prevent routing loops?",
    questionZh: "在BGP中，哪個路徑屬性主要用於防止路由環路？",
    options: [
      { id: "a", textEn: "LOCAL_PREF", textZh: "LOCAL_PREF" },
      { id: "b", textEn: "MED (Multi-Exit Discriminator)", textZh: "MED（多出口鑑別器）" },
      { id: "c", textEn: "AS_PATH", textZh: "AS_PATH" },
      { id: "d", textEn: "NEXT_HOP", textZh: "NEXT_HOP" },
    ],
    correctAnswer: "c",
    explanationEn:
      "The AS_PATH attribute lists all ASes a route has traversed. When a BGP router receives a route, it checks if its own AS number is already in the AS_PATH. If it is, the route is rejected (loop prevention). Additionally, BGP uses the AS_PATH length as one criterion for best path selection — shorter AS paths are generally preferred.",
    explanationZh:
      "AS_PATH屬性列出路由經過的所有AS。當BGP路由器收到一條路由時，它會檢查自己的AS號是否已在AS_PATH中。如果是，則拒絕該路由（防止環路）。呢個外，BGP使用AS_PATH長度作為最佳路徑選擇的標準之一——通常優先選擇AS路徑較短的路由。",
    difficulty: "medium",
    topicId: "bgp-routing",
    topicNameEn: "BGP - Border Gateway Protocol",
    topicNameZh: "BGP協定",
  },
  {
    id: "bg-4",
    questionEn:
      "A BGP router receives two routes to the same prefix: Route A via AS-PATH [AS100, AS200] with LOCAL_PREF 100, and Route B via AS-PATH [AS300] with LOCAL_PREF 200. Which route does BGP select?",
    questionZh: "BGP路由器收到兩條到達同一前綴的路由：路由A經由AS-PATH [AS100, AS200]且LOCAL_PREF為100，路由B經由AS-PATH [AS300]且LOCAL_PREF為200。BGP選擇哪條路由？",
    options: [
      { id: "a", textEn: "Route A, because it has a shorter AS-PATH", textZh: "路由A，因為AS-PATH更短" },
      { id: "b", textEn: "Route B, because LOCAL_PREF is higher", textZh: "路由B，因為LOCAL_PREF更高" },
      { id: "c", textEn: "Route A, because LOCAL_PREF 100 is preferred", textZh: "路由A，因為優先選擇LOCAL_PREF 100" },
      { id: "d", textEn: "Neither; BGP load-balances between both routes", textZh: "都不是；BGP在兩條路由之間負載均衡" },
    ],
    correctAnswer: "b",
    explanationEn:
      "In BGP best path selection, LOCAL_PREF is evaluated BEFORE AS_PATH length. The order is: (1) Highest weight (Cisco proprietary), (2) Highest LOCAL_PREF, (3) Locally originated, (4) Shortest AS_PATH, (5) Lowest origin type, (6) Lowest MED, etc. Since Route B has LOCAL_PREF 200 > Route A's 100, Route B is selected despite having a longer AS_PATH (1 hop vs 2 hops).",
    explanationZh:
      "在BGP最佳路徑選擇中，LOCAL_PREF在AS_PATH長度之前評估。順序是：(1) 最高權重（Cisco專有），(2) 最高LOCAL_PREF，(3) 本地產生，(4) 最短AS_PATH，(5) 最低源類型，(6) 最低MED等。由於路由B的LOCAL_PREF 200 > 路由A的100，儘管AS_PATH更長（1跳 vs 2跳），仍選擇路由B。",
    difficulty: "hard",
    topicId: "bgp-routing",
    topicNameEn: "BGP - Border Gateway Protocol",
    topicNameZh: "BGP協定",
  },
  {
    id: "bg-5",
    questionEn:
      "What is the purpose of BGP route reflectors in a large AS?",
    questionZh: "在大型AS中，BGP路由反射器的目的是什麼？",
    options: [
      {
        id: "a",
        textEn: "To reflect routes between different ASes to reduce eBGP sessions",
        textZh: "在不同AS之間反射路由以減少eBGP會話",
      },
      {
        id: "b",
        textEn: "To reduce the number of required iBGP full-mesh sessions within an AS",
        textZh: "減少AS內所需的iBGP全網狀會話數量",
      },
      {
        id: "c",
        textEn: "To translate between BGP and OSPF routing protocols",
        textZh: "在BGP和OSPF路由協定之間轉換",
      },
      {
        id: "d",
        textEn: "To provide redundancy for failed physical links",
        textZh: "為故障物理鏈路提供冗餘",
      },
    ],
    correctAnswer: "b",
    explanationEn:
      "In iBGP, routes learned from one iBGP peer must not be advertised to another iBGP peer (split horizon rule), requiring a full mesh of iBGP sessions among all routers — O(n²) scaling. Route reflectors (RRs) relax this rule: an RR can reflect iBGP routes to its clients, reducing sessions to O(n). RRs are organized into clusters, with Originator ID and Cluster List attributes preventing reflection loops.",
    explanationZh:
      "在iBGP中，從一個iBGP對等體學到的路由不能通告畀另一個iBGP對等體（水平分割規則），需要在所有路由器之間建立iBGP全網狀會話——O(n²)的擴展性。路由反射器（RR）放寬了呢一規則：RR可以將iBGP路由反射畀其客户端，將會話減少到O(n)。RR組織成集羣，使用Originator ID和Cluster List屬性防止反射環路。",
    difficulty: "hard",
    topicId: "bgp-routing",
    topicNameEn: "BGP - Border Gateway Protocol",
    topicNameZh: "BGP協定",
  },

  // ==========================================
  // Topic 12: Internet Architecture
  // ==========================================
  {
    id: "ia-1",
    questionEn: "What is an Internet Exchange Point (IXP)?",
    questionZh: "什麼是互聯網交換點（IXP）？",
    options: [
      {
        id: "a",
        textEn: "A data center operated by a single content provider",
        textZh: "由單個內容提供商運營的數據中心",
      },
      {
        id: "b",
        textEn: "A physical facility where multiple networks meet to exchange traffic directly",
        textZh: "多個網絡匯聚以直接交換流量的物理設施",
      },
      {
        id: "c",
        textEn: "A government agency that regulates Internet traffic",
        textZh: "監管互聯網流量的政府機構",
      },
      {
        id: "d",
        textEn: "A software protocol for inter-ISP communication",
        textZh: "用於ISP間通信的軟件協定",
      },
    ],
    correctAnswer: "b",
    explanationEn:
      "An IXP is a physical infrastructure where multiple ISPs, content providers, and networks connect to exchange Internet traffic directly (peering) rather than through upstream transit providers. This reduces latency, improves bandwidth, and lowers costs. Major IXPs include AMS-IX (Amsterdam), DE-CIX (Frankfurt), and HKIX (Hong Kong). IXPs are critical to the Internet's hierarchical architecture.",
    explanationZh:
      "IXP是一個物理基礎設施，多個ISP、內容提供商和網絡在呢個連接以直接交換互聯網流量（對等），而不是通過上游轉接提供商。呢降低了延遲，提高了帶寬，並降低了成本。主要的IXP包括AMS-IX（阿姆斯特丹）、DE-CIX（法蘭克福）和HKIX（香港）。IXP對互聯網的分層架構至關重要。",
    difficulty: "easy",
    topicId: "internet-architecture",
    topicNameEn: "Internet Architecture",
    topicNameZh: "互聯網架構",
  },
  {
    id: "ia-2",
    questionEn:
      "What defines a Tier-1 ISP in the Internet hierarchy?",
    questionZh: "在互聯網層次結構中，什麼定義了Tier-1 ISP？",
    options: [
      {
        id: "a",
        textEn: "It has the most individual customers worldwide",
        textZh: "它在全球擁有最多的個人客户",
      },
      {
        id: "b",
        textEn: "It can reach every other network on the Internet without purchasing transit",
        textZh: "它無需購買轉接即可到達互聯網上的所有其他網絡",
      },
      {
        id: "c",
        textEn: "It operates the fastest fiber-optic cables",
        textZh: "它運營最快的光纖電纜",
      },
      {
        id: "d",
        textEn: "It only provides wireless services",
        textZh: "它只提供無線服務",
      },
    ],
    correctAnswer: "b",
    explanationEn:
      "A Tier-1 ISP is defined by having settlement-free peering with every other Tier-1 ISP, meaning it can reach any Internet destination without paying for transit. Examples include AT&T, NTT, Level 3 (Lumen), and Telia. Tier-2 ISPs purchase transit from Tier-1 and also peer with other networks. Tier-3 ISPs are access networks that purchase transit and primarily serve end users.",
    explanationZh:
      "Tier-1 ISP的定義是與所有其他Tier-1 ISP進行免結算對等，呢意味着它無需為轉接付費即可到達任何互聯網目的地。例如AT&T、NTT、Level 3（Lumen）和Telia。Tier-2 ISP從Tier-1購買轉接，也與其他網絡對等。Tier-3 ISP是購買轉接並主要服務最終用户的接入網絡。",
    difficulty: "medium",
    topicId: "internet-architecture",
    topicNameEn: "Internet Architecture",
    topicNameZh: "互聯網架構",
  },
  {
    id: "ia-3",
    questionEn:
      "Why do networks choose to peer at IXPs rather than purchasing transit?",
    questionZh: "為什麼網絡選擇在IXP對等而不是購買轉接？",
    options: [
      {
        id: "a",
        textEn: "Peering is always free, while transit always costs money",
        textZh: "對等總是免費的，而轉接總是收費的",
      },
      {
        id: "b",
        textEn: "Peering provides lower latency, higher bandwidth, and lower cost for direct traffic exchange",
        textZh: "對等為直接流量交換提供更低的延遲、更高的帶寬和更低的成本",
      },
      {
        id: "c",
        textEn: "Peering eliminates the need for BGP configuration",
        textZh: "對等消除了BGP配置的需要",
      },
      {
        id: "d",
        textEn: "Peering is required by government regulation",
        textZh: "對等是政府法規要求的",
      },
    ],
    correctAnswer: "b",
    explanationEn:
      "Networks peer at IXPs because: (1) Lower latency — traffic goes directly between networks instead of through intermediate transit providers; (2) Higher bandwidth — IXPs provide high-capacity switching fabric; (3) Lower cost — peering avoids paying transit fees per Mbps; (4) Better reliability — direct paths reduce single points of failure. Peering is NOT always free (settlement-based peering exists), and BGP is still required.",
    explanationZh:
      "網絡在IXP對等是因為：(1) 更低延遲——流量在網絡間直接傳輸而不是通過中間轉接提供商；(2) 更高帶寬——IXP提供高容量交換結構；(3) 更低成本——對等避免了每Mbps的轉接費用；(4) 更好的可靠性——直接路徑減少了單點故障。對等並不總是免費的（存在結算對等），BGP仍然是必需的。",
    difficulty: "medium",
    topicId: "internet-architecture",
    topicNameEn: "Internet Architecture",
    topicNameZh: "互聯網架構",
  },
  {
    id: "ia-4",
    questionEn:
      "How do large content providers like Google and Netflix deliver content efficiently to end users?",
    questionZh: "像Google和Netflix呢樣的大型內容提供商如何高效地向最終用户交付內容？",
    options: [
      {
        id: "a",
        textEn: "They only rely on Tier-1 ISPs for all content delivery",
        textZh: "它們僅依賴Tier-1 ISP進行所有內容交付",
      },
      {
        id: "b",
        textEn: "They build their own private backbone networks and place servers in IXPs and access ISP networks",
        textZh: "它們構建自己的私有骨幹網絡，並將服務器部署在IXP和接入ISP網絡中",
      },
      {
        id: "c",
        textEn: "They use satellite links to deliver content directly to users",
        textZh: "它們使用衞星鏈路直接向用户交付內容",
      },
      {
        id: "d",
        textEn: "They only store content in a single centralized data center",
        textZh: "它們只在一個集中式數據中心存儲內容",
      },
    ],
    correctAnswer: "b",
    explanationEn:
      "Large content providers like Google and Netflix build extensive private networks and deploy servers deep within the Internet (at IXPs and within access ISP networks) to be as close to users as possible. Google operates a global private network called the 'Google Global Cache'. Netflix runs 'Open Connect', placing dedicated servers inside ISP facilities. This bypasses the traditional hierarchical transit model, reducing latency and cost.",
    explanationZh:
      "像Google和Netflix呢樣的大型內容提供商構建廣泛的私有網絡，並在互聯網深處（在IXP和接入ISP網絡內）部署服務器，以儘可能靠近用户。Google運營着一個名為'Google Global Cache'的全球私有網絡。Netflix運營'Open Connect'，在ISP設施內放置專用服務器。呢繞過了傳統的分層轉接模型，降低了延遲和成本。",
    difficulty: "hard",
    topicId: "internet-architecture",
    topicNameEn: "Internet Architecture",
    topicNameZh: "互聯網架構",
  },
  {
    id: "ia-5",
    questionEn:
      "In the Internet's hierarchical structure, what is the typical relationship between a Tier-2 ISP and a Tier-1 ISP?",
    questionZh: "在互聯網的分層結構中，Tier-2 ISP和Tier-1 ISP之間的典型關系是什麼？",
    options: [
      {
        id: "a",
        textEn: "Tier-2 ISPs provide transit to Tier-1 ISPs",
        textZh: "Tier-2 ISP為Tier-1 ISP提供轉接",
      },
      {
        id: "b",
        textEn: "Tier-2 ISPs purchase transit from Tier-1 ISPs for Internet access they cannot reach via peering",
        textZh: "Tier-2 ISP從Tier-1 ISP購買轉接以攞無法通過對等到達的互聯網存取",
      },
      {
        id: "c",
        textEn: "Tier-2 and Tier-1 ISPs are always identical in capabilities",
        textZh: "Tier-2和Tier-1 ISP的能力始終相同",
      },
      {
        id: "d",
        textEn: "Tier-2 ISPs only communicate with end users, never with other ISPs",
        textZh: "Tier-2 ISP只與最終用户通信，從不與其他ISP通信",
      },
    ],
    correctAnswer: "b",
    explanationEn:
      "Tier-2 ISPs purchase transit from Tier-1 (or other Tier-2) ISPs to reach Internet destinations they cannot reach through their own peering relationships. Transit is a paid service where the provider guarantees delivery to all Internet destinations. Tier-2 ISPs also peer with other networks at IXPs to reduce costs. They serve both downstream customers (Tier-3 ISPs, enterprises) and connect to the global Internet through transit.",
    explanationZh:
      "Tier-2 ISP從Tier-1（或其他Tier-2）ISP購買轉接，以到達無法通過自身對等關繫到達的互聯網目的地。轉接是一種付費服務，提供商保證交付到所有互聯網目的地。Tier-2 ISP也在IXP與其他網絡對等以降低成本。它們既服務下游客户（Tier-3 ISP、企業），也通過轉接連接到全球互聯網。",
    difficulty: "hard",
    topicId: "internet-architecture",
    topicNameEn: "Internet Architecture",
    topicNameZh: "互聯網架構",
  },

  // ==========================================
  // Topic 13: LAN - Local Area Networks
  // ==========================================
  {
    id: "ln-1",
    questionEn: "How many bytes is a MAC address?",
    questionZh: "MAC地址是多少字節？",
    options: [
      { id: "a", textEn: "4 bytes (32 bits)", textZh: "4字節（32位）" },
      { id: "b", textEn: "6 bytes (48 bits)", textZh: "6字節（48位）" },
      { id: "c", textEn: "8 bytes (64 bits)", textZh: "8字節（64位）" },
      { id: "d", textEn: "16 bytes (128 bits)", textZh: "16字節（128位）" },
    ],
    correctAnswer: "b",
    explanationEn:
      "A MAC address is 6 bytes (48 bits), typically represented in hexadecimal as six groups of two digits separated by colons (e.g., 00:1A:2B:3C:4D:5E). The first 3 bytes are the Organizationally Unique Identifier (OUI) assigned to the manufacturer, and the last 3 bytes are assigned by the manufacturer. The broadcast MAC address is FF:FF:FF:FF:FF:FF.",
    explanationZh:
      "MAC地址為6字節（48位），通常用十六進制表示為六組兩位數字，用冒號分隔（例如00:1A:2B:3C:4D:5E）。前3字節是分配畀製造商的組織唯一標識符（OUI），後3字節由製造商分配。廣播MAC地址為FF:FF:FF:FF:FF:FF。",
    difficulty: "easy",
    topicId: "lan-networks",
    topicNameEn: "LAN - Local Area Networks",
    topicNameZh: "局域網",
  },
  {
    id: "ln-2",
    questionEn:
      "In the CSMA/CD protocol used in traditional Ethernet, what happens when a collision is detected?",
    questionZh: "在傳統以太網使用的CSMA/CD協定中，檢測到衝突時會發生什麼？",
    options: [
      {
        id: "a",
        textEn: "The station immediately stops transmitting and sends a jamming signal",
        textZh: "站點立即停止傳輸並發送干擾信號",
      },
      {
        id: "b",
        textEn: "The station continues transmitting to ensure all data is delivered",
        textZh: "站點繼續傳輸以確保所有數據都被交付",
      },
      {
        id: "c",
        textEn: "The station switches to a different frequency and retransmits",
        textZh: "站點切換到不同頻率並重傳",
      },
      {
        id: "d",
        textEn: "The station waits for a fixed time interval and then retransmits",
        textZh: "站點等待固定時間間隔然後重傳",
      },
    ],
    correctAnswer: "a",
    explanationEn:
      "When a collision is detected in CSMA/CD (Carrier Sense Multiple Access with Collision Detection), the station immediately stops transmitting and sends a jamming signal to notify all stations of the collision. Then it enters the exponential backoff algorithm: it waits a random time chosen from {0, 1} × slot time, doubling the range after each collision (binary exponential backoff). After 16 consecutive collisions, the frame is dropped.",
    explanationZh:
      "在CSMA/CD（載波監聽多路存取/衝突檢測）中檢測到衝突時，站點立即停止傳輸並發送干擾信號通知所有站點發生衝突。然後進入指數退避算法：從{0, 1} × 時隙時間中隨機選擇等待時間，每次衝突後範圍翻倍（二進制指數退避）。連續16次衝突後，幀被丟棄。",
    difficulty: "medium",
    topicId: "lan-networks",
    topicNameEn: "LAN - Local Area Networks",
    topicNameZh: "局域網",
  },
  {
    id: "ln-3",
    questionEn:
      "What is the primary purpose of the Spanning Tree Protocol (STP)?",
    questionZh: "生成樹協定（STP）的主要目的是什麼？",
    options: [
      {
        id: "a",
        textEn: "To encrypt traffic between switches",
        textZh: "加密交換機之間的流量",
      },
      {
        id: "b",
        textEn: "To prevent broadcast storms caused by loops in a switched network",
        textZh: "防止交換網絡中由環路引起的廣播風暴",
      },
      {
        id: "c",
        textEn: "To assign IP addresses to switches automatically",
        textZh: "自動為交換機分配IP地址",
      },
      {
        id: "d",
        textEn: "To compress Ethernet frames for faster transmission",
        textZh: "壓縮以太網幀以加快傳輸",
      },
    ],
    correctAnswer: "b",
    explanationEn:
      "STP (IEEE 802.1D) prevents layer-2 loops in bridged/switched networks by creating a loop-free logical topology (a spanning tree). It elects a root bridge, then blocks redundant paths by placing certain ports in 'blocking' state. Without STP, loops would cause broadcast storms (frames circulating indefinitely), MAC table instability, and multiple frame copies reaching the same destination.",
    explanationZh:
      "STP（IEEE 802.1D）通過創建無環的邏輯拓撲（生成樹）來防止橋接/交換網絡中的二層環路。它選舉根橋，然後通過將某些端口置於'阻塞'狀態來阻斷冗餘路徑。冇STP，環路會導致廣播風暴（幀無限循環）、MAC表不穩定，以及同一目的地收到多個幀副本。",
    difficulty: "medium",
    topicId: "lan-networks",
    topicNameEn: "LAN - Local Area Networks",
    topicNameZh: "局域網",
  },
  {
    id: "ln-4",
    questionEn:
      "How does a VLAN (Virtual LAN) improve network management in a switched Ethernet?",
    questionZh: "VLAN（虛擬局域網）如何改善交換式以太網中的網絡管理？",
    options: [
      {
        id: "a",
        textEn: "It increases the physical speed of Ethernet links",
        textZh: "它增加以太網鏈路的物理速度",
      },
      {
        id: "b",
        textEn: "It logically separates broadcast domains without requiring separate physical switches",
        textZh: "它在邏輯上分隔廣播域，無需使用獨立的物理交換機",
      },
      {
        id: "c",
        textEn: "It automatically repairs broken network cables",
        textZh: "它自動修復損壞的網絡電纜",
      },
      {
        id: "d",
        textEn: "It replaces the need for IP addressing",
        textZh: "它替代了IP尋址的需要",
      },
    ],
    correctAnswer: "b",
    explanationEn:
      "VLANs allow a single physical switch to be partitioned into multiple logical broadcast domains (VLANs). Each VLAN is a separate broadcast domain and subnet. Benefits include: improved security (isolation between VLANs), reduced broadcast traffic, flexibility (devices can be in the same VLAN regardless of physical location), and simplified management. Inter-VLAN communication requires a router (or Layer-3 switch). 802.1Q is the standard VLAN trunking protocol.",
    explanationZh:
      "VLAN允許將單個物理交換機劃分為多個邏輯廣播域（VLAN）。每個VLAN是一個獨立的廣播域和子網。優勢包括：提高安全性（VLAN間隔離）、減少廣播流量、靈活性（設備無論物理位置都可以在同一VLAN中），以及簡化管理。VLAN間通信需要路由器（或三層交換機）。802.1Q是標準的VLAN中繼協定。",
    difficulty: "hard",
    topicId: "lan-networks",
    topicNameEn: "LAN - Local Area Networks",
    topicNameZh: "局域網",
  },
  {
    id: "ln-5",
    questionEn:
      "What is the minimum Ethernet frame size, and why does this minimum exist?",
    questionZh: "以太網幀的最小大小是多少，為什麼存在呢個最小值？",
    options: [
      { id: "a", textEn: "46 bytes payload; to ensure the frame is long enough for collision detection", textZh: "46字節載荷；確保幀足夠長以便衝突檢測" },
      { id: "b", textEn: "64 bytes payload; to fit maximum MTU requirements", textZh: "64字節載荷；以滿足最大MTU要求" },
      { id: "c", textEn: "1500 bytes payload; to match IPv4 maximum packet size", textZh: "1500字節載荷；以匹配IPv4最大數據包大小" },
      { id: "d", textEn: "18 bytes payload; to hold the Ethernet header and trailer", textZh: "18字節載荷；以容納以太網頭部和尾部" },
    ],
    correctAnswer: "a",
    explanationEn:
      "The minimum Ethernet payload is 46 bytes, making the total frame 64 bytes (46 payload + 14 header + 4 FCS). This minimum exists so that the transmitting station can detect a collision before it finishes sending the frame. For 10 Mbps Ethernet with a maximum segment of 2500m, the round-trip propagation time is about 51.2 μs, requiring at least 512 bits (64 bytes) transmission time. The slot time of 512 bit-times ensures collision detection.",
    explanationZh:
      "最小以太網載荷為46字節，使總幀為64字節（46載荷 + 14頭部 + 4 FCS）。呢個最小值的存在是為了確保發送站在完成幀發送之前能夠檢測到衝突。對於10 Mbps以太網，最大網段2500m，往返傳播時間約為51.2 μs，需要至少512位（64字節）的傳輸時間。512位時的時隙時間確保了衝突檢測。",
    difficulty: "hard",
    topicId: "lan-networks",
    topicNameEn: "LAN - Local Area Networks",
    topicNameZh: "局域網",
  },

  // ==========================================
  // Topic 14: Distance Vector Routing
  // ==========================================
  {
    id: "dv-1",
    questionEn:
      "What is the Bellman-Ford equation used for in distance vector routing?",
    questionZh: "貝爾曼-福特方程在距離向量路由中用於什麼？",
    options: [
      {
        id: "a",
        textEn: "To calculate the shortest path from a node to all destinations",
        textZh: "計算從節點到所有目的地的最短路徑",
      },
      {
        id: "b",
        textEn: "To encrypt routing tables between adjacent routers",
        textZh: "加密相鄰路由器之間的路由表",
      },
      {
        id: "c",
        textEn: "To compress routing updates before transmission",
        textZh: "在傳輸前壓縮路由更新",
      },
      {
        id: "d",
        textEn: "To allocate bandwidth among competing flows",
        textZh: "在競爭流之間分配帶寬",
      },
    ],
    correctAnswer: "a",
    explanationEn:
      "The Bellman-Ford equation computes the shortest path: dx(y) = min{c(x,v) + dv(y)} for all neighbors v. Here, dx(y) is the minimum cost from x to y, c(x,v) is the cost of the direct link from x to neighbor v, and dv(y) is the cost from v to y. Each node independently computes this using distance vectors received from neighbors, iteratively converging to the optimal solution.",
    explanationZh:
      "貝爾曼-福特方程計算最短路徑：dx(y) = min{c(x,v) + dv(y)}，對所有鄰居v。其中dx(y)是從x到y的最小代價，c(x,v)是從x到鄰居v的直接鏈路代價，dv(y)是從v到y的代價。每個節點獨立使用從鄰居接收的距離向量進行計算，迭代收斂到最優解。",
    difficulty: "easy",
    topicId: "distance-vector-routing",
    topicNameEn: "Distance Vector Routing",
    topicNameZh: "距離向量路由",
  },
  {
    id: "dv-2",
    questionEn:
      "What is the 'count-to-infinity' problem in distance vector routing?",
    questionZh: "距離向量路由中的「無窮計數」問題是什麼？",
    options: [
      {
        id: "a",
        textEn: "Routers count the number of hops until they reach infinity and stop routing",
        textZh: "路由器計算跳數直到無窮大然後停止路由",
      },
      {
        id: "b",
        textEn: "When a link fails, routers slowly increment their distance estimates to the unreachable destination",
        textZh: "當鏈路故障時，路由器緩慢遞增到不可達目的地的距離估計值",
      },
      {
        id: "c",
        textEn: "The routing table grows infinitely large over time",
        textZh: "路由表隨時間增長到無限大",
      },
      {
        id: "d",
        textEn: "Packets are sent in infinite loops between two routers",
        textZh: "數據包在兩個路由器之間無限循環發送",
      },
    ],
    correctAnswer: "b",
    explanationEn:
      "The count-to-infinity problem occurs when a link fails: the two connected routers set the distance to the destination via that link as infinity (16 in RIP). However, the other router still has an old route through the failed link and advertises a distance of 2. The first router then updates to 3, then 4, etc., slowly counting up to infinity. With RIP's maximum hop count of 16, this can take many iterations. Solutions include split horizon and poison reverse.",
    explanationZh:
      "無窮計數問題發生在鏈路故障時：兩個相連的路由器將通過該鏈路到達目的地的距離設為無窮大（RIP中為16）。然而，另一台路由器仍有通過故障鏈路的舊路由並通告距離為2。第一台路由器然後更新為3、4等，緩慢計數到無窮大。RIP的最大跳數為16，呢可能需要很多次迭代。解決方案包括水平分割和毒性逆轉。",
    difficulty: "medium",
    topicId: "distance-vector-routing",
    topicNameEn: "Distance Vector Routing",
    topicNameZh: "距離向量路由",
  },
  {
    id: "dv-3",
    questionEn:
      "How does 'poison reverse' solve the count-to-infinity problem?",
    questionZh: "「毒性逆轉」如何解決無窮計數問題？",
    options: [
      {
        id: "a",
        textEn: "It sets all routing entries to infinity immediately",
        textZh: "它立即將所有路由條目設定為無窮大",
      },
      {
        id: "b",
        textEn: "It advertises an infinite distance to a neighbor for routes learned from that neighbor",
        textZh: "它向鄰居通告從該鄰居學到的路由為無窮大距離",
      },
      {
        id: "c",
        textEn: "It sends a special poison packet to all routers in the network",
        textZh: "它向網絡中所有路由器發送特殊的毒化數據包",
      },
      {
        id: "d",
        textEn: "It reverses the direction of routing updates",
        textZh: "它反轉路由更新的方向",
      },
    ],
    correctAnswer: "b",
    explanationEn:
      "Poison reverse is a technique where a router advertises a distance of infinity (16 in RIP) to a neighbor for routes it learned from that neighbor. This breaks loops of two nodes because the neighbor won't consider routes advertised back with infinite cost. For example, if A learned route to Z via B, A tells B the cost to Z is ∞, so B won't try to route through A. It is more aggressive than split horizon (which simply withholds the route).",
    explanationZh:
      "毒性逆轉是一種技術，路由器向鄰居通告從該鄰居學到的路由的距離為無窮大（RIP中為16）。呢打破了兩個節點的環路，因為鄰居不會考慮回傳的無限代價路由。例如，如果A通過B學到了到Z的路由，A告訴B到Z的代價為∞，所以B不會嘗試通過A路由。它比水平分割（僅抑制路由）更激進。",
    difficulty: "medium",
    topicId: "distance-vector-routing",
    topicNameEn: "Distance Vector Routing",
    topicNameZh: "距離向量路由",
  },
  {
    id: "dv-4",
    questionEn:
      "In a distance vector network, node A is directly connected to B (cost 2) and C (cost 5). B is directly connected to D (cost 1), and C is directly connected to D (cost 1). What is the shortest path cost from A to D after convergence?",
    questionZh: "在一個距離向量網絡中，節點A直接連接到B（代價2）和C（代價5）。B直接連接到D（代價1），C直接連接到D（代價1）。收斂後從A到D的最短路徑代價是多少？",
    options: [
      { id: "a", textEn: "2", textZh: "2" },
      { id: "b", textEn: "3", textZh: "3" },
      { id: "c", textEn: "5", textZh: "5" },
      { id: "d", textEn: "6", textZh: "6" },
    ],
    correctAnswer: "b",
    explanationEn:
      "Applying the Bellman-Ford equation: dA(D) = min{c(A,B) + dB(D), c(A,C) + dC(D)}. Initially, A doesn't know costs to D. After B advertises dB(D)=1, A calculates c(A,B)+dB(D) = 2+1 = 3. After C advertises dC(D)=1, A calculates c(A,C)+dC(D) = 5+1 = 6. The minimum is min{3, 6} = 3. So the shortest path from A to D is A→B→D with total cost 3.",
    explanationZh:
      "應用貝爾曼-福特方程：dA(D) = min{c(A,B) + dB(D), c(A,C) + dC(D)}。初始時，A不知道到D的代價。B通告dB(D)=1後，A計算c(A,B)+dB(D) = 2+1 = 3。C通告dC(D)=1後，A計算c(A,C)+dC(D) = 5+1 = 6。最小值為min{3, 6} = 3。所以從A到D的最短路徑是A→B→D，總代價為3。",
    difficulty: "hard",
    topicId: "distance-vector-routing",
    topicNameEn: "Distance Vector Routing",
    topicNameZh: "距離向量路由",
  },
  {
    id: "dv-5",
    questionEn:
      "What is the maximum hop count in RIP (Routing Information Protocol), and what happens when this limit is reached?",
    questionZh: "RIP（路由信息協定）的最大跳數是多少，達到呢個限制時會發生什麼？",
    options: [
      { id: "a", textEn: "15 hops; the route is marked as unreachable", textZh: "15跳；路由被標記為不可達" },
      { id: "b", textEn: "16 hops; the route is marked as unreachable (infinity)", textZh: "16跳；路由被標記為不可達（無窮大）" },
      { id: "c", textEn: "32 hops; the route is discarded", textZh: "32跳；路由被丟棄" },
      { id: "d", textEn: "255 hops; the router stops forwarding packets", textZh: "255跳；路由器停止轉發數據包" },
    ],
    correctAnswer: "b",
    explanationEn:
      "RIP uses 16 as the metric value representing 'infinity' — any destination with a hop count of 16 or more is considered unreachable. This limits RIP networks to a maximum diameter of 15 hops. The small infinity value was chosen to limit the count-to-infinity problem (max 16 iterations). RIP sends periodic updates every 30 seconds and uses hop count as its sole metric, making it unsuitable for large or complex networks.",
    explanationZh:
      "RIP使用16作為表示'無窮大'的度量值——任何跳數為16或更多的目的地都被視為不可達。呢限制了RIP網絡的最大直徑為15跳。選擇較小的無窮大值是為了限制無窮計數問題（最多16次迭代）。RIP每30秒發送週期性更新，僅使用跳數作為度量，不適合大型或複雜網絡。",
    difficulty: "hard",
    topicId: "distance-vector-routing",
    topicNameEn: "Distance Vector Routing",
    topicNameZh: "距離向量路由",
  },

  // ==========================================
  // Topic 15: Link Layer
  // ==========================================
  {
    id: "ll-1",
    questionEn:
      "What does CRC (Cyclic Redundancy Check) detect?",
    questionZh: "CRC（循環冗餘校驗）檢測什麼？",
    options: [
      { id: "a", textEn: "Only single-bit errors", textZh: "僅檢測單比特錯誤" },
      { id: "b", textEn: "Burst errors and single-bit errors", textZh: "突發錯誤和單比特錯誤" },
      { id: "c", textEn: "Only intentional data corruption", textZh: "僅檢測故意的數據損壞" },
      { id: "d", textEn: "Packets that are too large", textZh: "過大的數據包" },
    ],
    correctAnswer: "b",
    explanationEn:
      "CRC can detect both single-bit errors and burst errors (multiple consecutive bit errors). It works by treating data as a polynomial and dividing by a generator polynomial. The remainder becomes the CRC value. A properly chosen CRC polynomial can detect all single-bit errors, all double-bit errors, any odd number of errors, and any burst error up to the degree of the polynomial. Common CRCs are CRC-8, CRC-16, and CRC-32 (used in Ethernet).",
    explanationZh:
      "CRC可以檢測單比特錯誤和突發錯誤（多個連續比特錯誤）。它將數據視為多項式並用生成多項式除以數據。餘數成為CRC值。適當選擇的CRC多項式可以檢測所有單比特錯誤、所有雙比特錯誤、任何奇數個錯誤，以及不超過多項式次數的任何突發錯誤。常見的CRC有CRC-8、CRC-16和CRC-32（以太網中使用）。",
    difficulty: "easy",
    topicId: "link-layer",
    topicNameEn: "Link Layer",
    topicNameZh: "鏈路層",
  },
  {
    id: "ll-2",
    questionEn:
      "What is the maximum channel utilization (efficiency) of slotted ALOHA?",
    questionZh: "分隙ALOHA的最大信道利用率（效率）是多少？",
    options: [
      { id: "a", textEn: "1/e ≈ 36.8%", textZh: "1/e ≈ 36.8%" },
      { id: "b", textEn: "1/(2e) ≈ 18.4%", textZh: "1/(2e) ≈ 18.4%" },
      { id: "c", textEn: "50%", textZh: "50%" },
      { id: "d", textEn: "100%", textZh: "100%" },
    ],
    correctAnswer: "a",
    explanationEn:
      "Slotted ALOHA requires all stations to synchronize their transmissions to fixed time slots. The maximum efficiency is 1/e ≈ 36.8%, achieved when the probability of a transmission attempt per slot is 1/e. This doubles the efficiency of pure ALOHA (which achieves 1/(2e) ≈ 18.4%) because collisions can only occur within the same slot, halving the vulnerable period from 2T to T (where T is the frame transmission time).",
    explanationZh:
      "分隙ALOHA要求所有站點將傳輸同步到固定時隙。最大效率為1/e ≈ 36.8%，當時隙中傳輸嘗試的概率為1/e時達到。呢使純ALOHA的效率（1/(2e) ≈ 18.4%）翻倍，因為衝突只能發生在同一時隙內，將脆弱期從2T減半到T（其中T是幀傳輸時間）。",
    difficulty: "medium",
    topicId: "link-layer",
    topicNameEn: "Link Layer",
    topicNameZh: "鏈路層",
  },
  {
    id: "ll-3",
    questionEn:
      "In CSMA (Carrier Sense Multiple Access), what are the three persistence strategies?",
    questionZh: "在CSMA（載波監聽多路存取）中，三種堅持策略是什麼？",
    options: [
      {
        id: "a",
        textEn: "1-persistent, p-persistent, and nonpersistent",
        textZh: "1-堅持、p-堅持和非堅持",
      },
      {
        id: "b",
        textEn: "Always-persistent, sometimes-persistent, and never-persistent",
        textZh: "總是堅持、有時堅持和從不堅持",
      },
      {
        id: "c",
        textEn: "High-persistent, medium-persistent, and low-persistent",
        textZh: "高堅持、中堅持和低堅持",
      },
      {
        id: "d",
        textEn: "Fast-persistent, slow-persistent, and adaptive-persistent",
        textZh: "快速堅持、慢速堅持和自適應堅持",
      },
    ],
    correctAnswer: "a",
    explanationEn:
      "The three CSMA persistence strategies are: (1) 1-persistent — if the channel is idle, transmit immediately with probability 1; if busy, wait and continuously sense; (2) p-persistent — if idle, transmit with probability p; (3) nonpersistent — if the channel is busy, wait a random time before sensing again. 1-persistent has the highest collision probability but lowest delay; nonpersistent has the lowest collision probability but highest delay.",
    explanationZh:
      "三種CSMA堅持策略是：(1) 1-堅持——如果信道空閒，以概率1立即傳輸；如果忙，等待並持續監聽；(2) p-堅持——如果空閒，以概率p傳輸；(3) 非堅持——如果信道忙，等待隨機時間再重新監聽。1-堅持衝突概率最高但延遲最低；非堅持衝突概率最低但延遲最高。",
    difficulty: "medium",
    topicId: "link-layer",
    topicNameEn: "Link Layer",
    topicNameZh: "鏈路層",
  },
  {
    id: "ll-4",
    questionEn:
      "For a CRC-8 with generator polynomial G(x) = x⁸ + x² + x + 1, what is the maximum burst error length that CRC can detect?",
    questionZh: "對於生成多項式G(x) = x⁸ + x² + x + 1的CRC-8，CRC能檢測的最大突發錯誤長度是多少？",
    options: [
      { id: "a", textEn: "8 bits", textZh: "8位" },
      { id: "b", textEn: "9 bits", textZh: "9位" },
      { id: "c", textEn: "16 bits", textZh: "16位" },
      { id: "d", textEn: "7 bits", textZh: "7位" },
    ],
    correctAnswer: "b",
    explanationEn:
      "A CRC with a generator polynomial of degree r can detect all burst errors of length ≤ r+1 bits. For CRC-8, r = 8, so it can detect all burst errors up to 9 bits. In general, CRC can detect: all single-bit and double-bit errors, any burst error of length ≤ r+1, and any odd number of errors if the polynomial has (x+1) as a factor. This makes CRC a very powerful error detection mechanism for the link layer.",
    explanationZh:
      "次數為r的生成多項式的CRC可以檢測所有長度 ≤ r+1 位的突發錯誤。對於CRC-8，r = 8，所以可以檢測最多9位的所有突發錯誤。一般來説，CRC可以檢測：所有單比特和雙比特錯誤、任何長度 ≤ r+1 的突發錯誤，以及如果多項式包含(x+1)因子，可以檢測任何奇數個錯誤。呢使CRC成為鏈路層非常強大的錯誤檢測機制。",
    difficulty: "hard",
    topicId: "link-layer",
    topicNameEn: "Link Layer",
    topicNameZh: "鏈路層",
  },
  {
    id: "ll-5",
    questionEn:
      "What is the difference between a switch and a hub at the link layer?",
    questionZh: "鏈路層中交換機和集線器有什麼區別？",
    options: [
      {
        id: "a",
        textEn: "A hub filters frames based on MAC addresses; a switch broadcasts all frames",
        textZh: "集線器根據MAC地址過濾幀；交換機廣播所有幀",
      },
      {
        id: "b",
        textEn: "A switch filters and forwards frames based on MAC address table; a hub broadcasts incoming frames to all ports",
        textZh: "交換機根據MAC地址表過濾和轉發幀；集線器將傳入幀廣播到所有端口",
      },
      {
        id: "c",
        textEn: "There is no difference; they are the same device",
        textZh: "冇區別；它們是相同的設備",
      },
      {
        id: "d",
        textEn: "A switch operates at the network layer; a hub operates at the physical layer",
        textZh: "交換機在網絡層運行；集線器在物理層運行",
      },
    ],
    correctAnswer: "b",
    explanationEn:
      "A switch is a layer-2 device that maintains a MAC address table (learned from incoming frames) and selectively forwards frames only to the destination port. A hub is a layer-1 device (repeater) that takes an incoming frame and broadcasts it to ALL other ports. Switches provide full-duplex communication, independent collision domains per port, and significantly better performance. Hubs share bandwidth among all ports and have a single collision domain.",
    explanationZh:
      "交換機是二層設備，維護MAC地址表（從傳入幀中學習），選擇性地將幀僅轉發到目的端口。集線器是一層設備（中繼器），將傳入幀廣播到所有其他端口。交換機提供全雙工通信，每個端口有獨立的衝突域，性能顯著更好。集線器在所有端口之間共享帶寬，只有一個衝突域。",
    difficulty: "hard",
    topicId: "link-layer",
    topicNameEn: "Link Layer",
    topicNameZh: "鏈路層",
  },

  // ==========================================
  // Topic 16: Wireless Networks
  // ==========================================
  {
    id: "wn-1",
    questionEn:
      "What is the 'hidden terminal problem' in wireless networks?",
    questionZh: "無線網絡中的「隱藏終端問題」是什麼？",
    options: [
      {
        id: "a",
        textEn: "A terminal that is physically hidden behind a wall and cannot communicate at all",
        textZh: "物理上隱藏在牆後無法通信的終端",
      },
      {
        id: "b",
        textEn: "Two terminals that cannot hear each other's transmissions but both transmit to a common receiver, causing collisions",
        textZh: "兩個互相聽不到對方傳輸但都向同一接收方發送的終端，導致衝突",
      },
      {
        id: "c",
        textEn: "A terminal whose MAC address is not visible in the routing table",
        textZh: "MAC地址在路由表中不可見的終端",
      },
      {
        id: "d",
        textEn: "A terminal that has been turned off but still appears in the network",
        textZh: "已關閉但仍在網絡中出現的終端",
      },
    ],
    correctAnswer: "b",
    explanationEn:
      "The hidden terminal problem occurs when two wireless stations (e.g., A and C) are both within range of a common receiver (B) but not within range of each other. Both A and C sense the channel as idle and transmit simultaneously to B, causing a collision at B. This is a key challenge in wireless CSMA/CA since carrier sensing cannot detect all potential interferers. RTS/CTS is designed to mitigate this problem.",
    explanationZh:
      "隱藏終端問題發生在兩個無線站點（例如A和C）都在公共接收方（B）的範圍內，但互相不在彼呢個範圍內。A和C都檢測到信道空閒並同時向B發送，導致在B處發生衝突。呢是無線CSMA/CA中的關鍵挑戰，因為載波監聽無法檢測所有潛在的干擾源。RTS/CTS旨在緩解呢個問題。",
    difficulty: "easy",
    topicId: "wireless-networks",
    topicNameEn: "Wireless Networks",
    topicNameZh: "無線網絡",
  },
  {
    id: "wn-2",
    questionEn:
      "How does the RTS/CTS mechanism help solve the hidden terminal problem in 802.11?",
    questionZh: "RTS/CTS機制如何幫助解決802.11中的隱藏終端問題？",
    options: [
      {
        id: "a",
        textEn: "RTS/CTS encrypts the data so hidden terminals cannot read it",
        textZh: "RTS/CTS加密數據使隱藏終端無法讀取",
      },
      {
        id: "b",
        textEn: "The sender broadcasts RTS and the receiver broadcasts CTS, notifying all nearby nodes to defer transmission",
        textZh: "發送方廣播RTS，接收方廣播CTS，通知所有附近節點延遲傳輸",
      },
      {
        id: "c",
        textEn: "RTS/CTS increases the transmit power so hidden terminals can hear the signal",
        textZh: "RTS/CTS增加傳輸功率使隱藏終端能聽到信號",
      },
      {
        id: "d",
        textEn: "RTS/CTS assigns different channels to avoid collisions",
        textZh: "RTS/CTS分配不同信道以避免衝突",
      },
    ],
    correctAnswer: "b",
    explanationEn:
      "In RTS/CTS: (1) The sender broadcasts a Request To Send (RTS) frame; (2) The receiver responds with a Clear To Send (CTS) frame, which is heard by all nodes within the receiver's range — including hidden terminals; (3) All nodes hearing RTS or CTS set their Network Allocation Vector (NAV) and defer transmission for the duration indicated. The data exchange then proceeds collision-free. However, RTS/CTS does NOT solve the exposed terminal problem.",
    explanationZh:
      "在RTS/CTS中：(1) 發送方廣播RTS（請求發送）幀；(2) 接收方回覆CTS（清除發送）幀，接收方範圍內的所有節點——包括隱藏終端——都能聽到；(3) 聽到RTS或CTS的所有節點設定其網絡分配向量（NAV）並在指示的持續時間內延遲傳輸。然後數據交換無衝突地進行。然而，RTS/CTS不能解決暴露終端問題。",
    difficulty: "medium",
    topicId: "wireless-networks",
    topicNameEn: "Wireless Networks",
    topicNameZh: "無線網絡",
  },
  {
    id: "wn-3",
    questionEn:
      "Which multiple access protocol does IEEE 802.11 (WiFi) use?",
    questionZh: "IEEE 802.11（WiFi）使用哪種多路存取協定？",
    options: [
      { id: "a", textEn: "CSMA/CD (Carrier Sense Multiple Access with Collision Detection)", textZh: "CSMA/CD（載波監聽多路存取/衝突檢測）" },
      { id: "b", textEn: "CSMA/CA (Carrier Sense Multiple Access with Collision Avoidance)", textZh: "CSMA/CA（載波監聽多路存取/衝突避免）" },
      { id: "c", textEn: "TDMA (Time Division Multiple Access)", textZh: "TDMA（時分多址）" },
      { id: "d", textEn: "FDMA (Frequency Division Multiple Access)", textZh: "FDMA（頻分多址）" },
    ],
    correctAnswer: "b",
    explanationEn:
      "802.11 uses CSMA/CA because collision detection is not practical in wireless — a transmitting station's own signal overwhelms the much weaker incoming signal at the antenna, making it impossible to detect collisions while transmitting. Instead, CSMA/CA uses: (1) physical and virtual carrier sensing (NAV), (2) random backoff after sensing a busy channel, (3) optional RTS/CTS exchange, and (4) link-layer ACKs to confirm successful reception.",
    explanationZh:
      "802.11使用CSMA/CA，因為在無線環境中衝突檢測不實際——發送站自身信號在日線處壓倒了微弱的傳入信號，使得傳輸時無法檢測衝突。相反，CSMA/CA使用：(1) 物理和虛擬載波監聽（NAV），(2) 檢測到忙信道後隨機退避，(3) 可選的RTS/CTS交換，(4) 鏈路層ACK確認成功接收。",
    difficulty: "medium",
    topicId: "wireless-networks",
    topicNameEn: "Wireless Networks",
    topicNameZh: "無線網絡",
  },
  {
    id: "wn-4",
    questionEn:
      "In 4G LTE, what is the role of the Evolved Packet Core (EPC)?",
    questionZh: "在4G LTE中，演進分組核心網（EPC）的角色是什麼？",
    options: [
      {
        id: "a",
        textEn: "It handles the radio signal transmission to mobile devices",
        textZh: "它處理到移動設備的無線信號傳輸",
      },
      {
        id: "b",
        textEn: "It is the all-IP core network providing mobility management, authentication, and packet routing",
        textZh: "它是提供移動性管理、認證和分組路由的全IP核心網絡",
      },
      {
        id: "c",
        textEn: "It provides satellite connectivity for remote areas",
        textZh: "它為偏遠地區提供衞星連接",
      },
      {
        id: "d",
        textEn: "It manages the WiFi access points in a cellular network",
        textZh: "它管理蜂窩網絡中的WiFi接入點",
      },
    ],
    correctAnswer: "b",
    explanationEn:
      "The EPC is the core network of 4G LTE, designed as an all-IP architecture (no circuit-switched domain). Key components include: MME (Mobility Management Entity) for authentication and mobility, S-GW (Serving Gateway) for routing user data, P-GW (PDN Gateway) for external network connectivity and QoS, and HSS (Home Subscriber Server) for subscriber profiles. The eNodeB (base station) connects to the EPC via the S1 interface.",
    explanationZh:
      "EPC是4G LTE的核心網絡，設計為全IP架構（無電路交換域）。關鍵組件包括：MME（移動性管理實體）負責認證和移動性，S-GW（服務網關）負責路由用户數據，P-GW（PDN網關）負責外部網絡連接和QoS，HSS（歸屬用户服務器）負責用户配置檔案。eNodeB（基站）通過S1接口連接到EPC。",
    difficulty: "hard",
    topicId: "wireless-networks",
    topicNameEn: "Wireless Networks",
    topicNameZh: "無線網絡",
  },
  {
    id: "wn-5",
    questionEn:
      "What is a key architectural difference between 5G NR (New Radio) and 4G LTE?",
    questionZh: "5G NR（新空口）和4G LTE之間的關鍵架構區別是什麼？",
    options: [
      {
        id: "a",
        textEn: "5G NR uses analog voice calls while LTE is all-IP",
        textZh: "5G NR使用模擬語音通話而LTE是全IP",
      },
      {
        id: "b",
        textEn: "5G NR supports network slicing and flexible numerology (subcarrier spacing) for diverse use cases",
        textZh: "5G NR支援網絡切片和靈活的參數配置（子載波間隔）以適應多樣化的用例",
      },
      {
        id: "c",
        textEn: "5G NR only works in the 2.4 GHz band",
        textZh: "5G NR僅在2.4 GHz頻段工作",
      },
      {
        id: "d",
        textEn: "5G NR uses circuit switching for better reliability",
        textZh: "5G NR使用電路交換以獲得更好的可靠性",
      },
    ],
    correctAnswer: "b",
    explanationEn:
      "5G NR introduces key innovations: (1) Network slicing — multiple logical networks on a shared physical infrastructure, each optimized for specific use cases (eMBB, URLLC, mMTC); (2) Flexible numerology — subcarrier spacing from 15 kHz to 240 kHz (vs LTE's fixed 15 kHz), enabling support for both low-frequency and mmWave bands; (3) Ultra-lean design for energy efficiency; (4) Beamforming and massive MIMO for higher throughput. 5G separates the RAN from the core via a service-based architecture.",
    explanationZh:
      "5G NR引入了關鍵創新：(1) 網絡切片——在共享物理基礎設施上的多個邏輯網絡，每個針對特定用例優化（eMBB、URLLC、mMTC）；(2) 靈活參數配置——子載波間隔從15 kHz到240 kHz（vs LTE固定的15 kHz），支援低頻和毫米波頻段；(3) 超精簡設計提高能效；(4) 波束成形和大規模MIMO提高吞吐量。5G通過基於服務的架構將RAN與核心網分離。",
    difficulty: "hard",
    topicId: "wireless-networks",
    topicNameEn: "Wireless Networks",
    topicNameZh: "無線網絡",
  },

  // ==========================================
  // Topic 17: New Network Technologies
  // ==========================================
  {
    id: "nn-1",
    questionEn:
      "What is the core principle of Software-Defined Networking (SDN)?",
    questionZh: "軟件定義網絡（SDN）的核心原則是什麼？",
    options: [
      {
        id: "a",
        textEn: "Separating the control plane from the data plane to enable centralized programmable control",
        textZh: "將控制平面與數據平面分離，實現集中可編程控制",
      },
      {
        id: "b",
        textEn: "Replacing all hardware routers with software routers",
        textZh: "用軟件路由器替換所有硬件路由器",
      },
      {
        id: "c",
        textEn: "Using only wireless connections instead of wired",
        textZh: "只使用無線連接代替有線連接",
      },
      {
        id: "b",
        textEn: "Encrypting all network traffic at the application layer",
        textZh: "在應用層加密所有網絡流量",
      },
    ],
    correctAnswer: "a",
    explanationEn:
      "SDN's core principle is the separation of the control plane (routing decisions) from the data plane (forwarding packets). The control plane is centralized in an SDN controller, which has a global network view and programs forwarding rules on network devices (switches). The data plane simply forwards packets according to these rules. This enables flexible, programmable network management, rapid innovation, and centralized policy enforcement. OpenFlow is the most common southbound API.",
    explanationZh:
      "SDN的核心原則是將控制平面（路由決策）與數據平面（轉發數據包）分離。控制平面集中在SDN控制器中，控制器擁有全局網絡視圖並在網絡設備（交換機）上編程轉發規則。數據平面僅根據呢些規則轉發數據包。呢使得網絡管理靈活、可編程，便於快速創新和集中策略執行。OpenFlow是最常見的南向API。",
    difficulty: "easy",
    topicId: "new-networks",
    topicNameEn: "New Network Technologies",
    topicNameZh: "新型網絡技術",
  },
  {
    id: "nn-2",
    questionEn:
      "In SDN architecture, what is the role of the 'southbound' interface?",
    questionZh: "在SDN架構中，「南向」接口的角色是什麼？",
    options: [
      {
        id: "a",
        textEn: "Communication between the SDN controller and network applications",
        textZh: "SDN控制器與網絡應用之間的通信",
      },
      {
        id: "b",
        textEn: "Communication between the SDN controller and network devices (switches/routers)",
        textZh: "SDN控制器與網絡設備（交換機/路由器）之間的通信",
      },
      {
        id: "c",
        textEn: "Communication between different SDN controllers",
        textZh: "不同SDN控制器之間的通信",
      },
      {
        id: "d",
        textEn: "Communication between end users and the SDN controller",
        textZh: "最終用户與SDN控制器之間的通信",
      },
    ],
    correctAnswer: "b",
    explanationEn:
      "In SDN architecture, the southbound interface connects the SDN controller to network devices (switches, routers), allowing the controller to install, modify, and delete forwarding rules. OpenFlow is the most well-known southbound protocol. The northbound interface connects the controller to network applications (firewalls, load balancers). The east/west interfaces connect multiple SDN controllers for scalability and reliability.",
    explanationZh:
      "在SDN架構中，南向接口連接SDN控制器和網絡設備（交換機、路由器），允許控制器安裝、修改和刪除轉發規則。OpenFlow是最著名的南向協定。北向接口連接控制器和網絡應用（防火牆、負載均衡器）。東/西接口連接多個SDN控制器以實現可擴展性和可靠性。",
    difficulty: "medium",
    topicId: "new-networks",
    topicNameEn: "New Network Technologies",
    topicNameZh: "新型網絡技術",
  },
  {
    id: "nn-3",
    questionEn:
      "How does a Content Delivery Network (CDN) reduce latency for end users?",
    questionZh: "內容分發網絡（CDN）如何降低最終用户的延遲？",
    options: [
      {
        id: "a",
        textEn: "By compressing web pages before sending them to users",
        textZh: "在發送網頁畀用户之前壓縮網頁",
      },
      {
        id: "b",
        textEn: "By caching content at edge servers geographically close to users",
        textZh: "通過在地理上靠近用户的邊緣服務器緩存內容",
      },
      {
        id: "c",
        textEn: "By replacing TCP with UDP for all web traffic",
        textZh: "用UDP替換所有Web流量的TCP",
      },
      {
        id: "d",
        textEn: "By storing all content in a single data center",
        textZh: "將所有內容存儲在單個數據中心",
      },
    ],
    correctAnswer: "b",
    explanationEn:
      "CDNs distribute content across a global network of edge servers (Points of Presence) located near major population centers. When a user requests content, DNS resolution or HTTP redirects them to the nearest edge server. This dramatically reduces latency by: (1) shorter physical distances, (2) fewer network hops, (3) avoiding congested backbone links. Major CDN providers include Cloudflare, Akamai, and AWS CloudFront. CDNs also offload traffic from the origin server.",
    explanationZh:
      "CDN在位於主要人口中心附近的全球邊緣服務器（存在點）網絡中分發內容。當用户請求內容時，DNS解析或HTTP重新導向將它們指向最近的邊緣服務器。呢通過以下方式顯著降低延遲：(1) 更短的物理距離，(2) 更少的網絡跳數，(3) 避開擁塞的骨幹鏈路。主要CDN提供商包括Cloudflare、Akamai和AWS CloudFront。CDN還分擔源服務器的流量。",
    difficulty: "medium",
    topicId: "new-networks",
    topicNameEn: "New Network Technologies",
    topicNameZh: "新型網絡技術",
  },
  {
    id: "nn-4",
    questionEn:
      "What is Network Function Virtualization (NFV) and what problem does it solve?",
    questionZh: "網絡功能虛擬化（NFV）是什麼，它解決了什麼問題？",
    options: [
      {
        id: "a",
        textEn: "NFV virtualizes the physical cables to create wireless links",
        textZh: "NFV虛擬化物理電纜以創建無線鏈路",
      },
      {
        id: "b",
        textEn: "NFV replaces dedicated hardware appliances with software running on general-purpose servers",
        textZh: "NFV用運行在通用服務器上的軟件替換專用硬件設備",
      },
      {
        id: "c",
        textEn: "NFV provides faster Internet speeds by upgrading network cables",
        textZh: "NFV通過升級網絡電纜提供更快的互聯網速度",
      },
      {
        id: "d",
        textEn: "NFV is a type of VPN for enterprise networks",
        textZh: "NFV是企業網絡的一種VPN",
      },
    ],
    correctAnswer: "b",
    explanationEn:
      "NFV decouples network functions (firewalls, load balancers, NAT, WAN optimizers) from proprietary hardware appliances and runs them as software (Virtual Network Functions, VNFs) on commercial off-the-shelf (COTS) servers. Benefits include: reduced CapEx (no expensive proprietary hardware), faster deployment (minutes vs months), easier scaling (spin up/down instances), and flexible placement of network functions. NFV works synergistically with SDN.",
    explanationZh:
      "NFV將網絡功能（防火牆、負載均衡器、NAT、WAN優化器）與專有硬件設備解耦，作為軟件（虛擬網絡功能，VNF）運行在商用現成（COTS）服務器上。優勢包括：降低資本支出（無需昂貴的專有硬件）、更快的部署（分鐘級而非月級）、更容易擴展（啓動/關閉實例），以及網絡功能的靈活部署。NFV與SDN協同工作。",
    difficulty: "hard",
    topicId: "new-networks",
    topicNameEn: "New Network Technologies",
    topicNameZh: "新型網絡技術",
  },
  {
    id: "nn-5",
    questionEn:
      "In peer-to-peer (P2P) file sharing, how does BitTorrent determine which peers to upload to?",
    questionZh: "在對等（P2P）檔案共享中，BitTorrent如何確定向邊啲對等方上傳？",
    options: [
      {
        id: "a",
        textEn: "It uploads to all peers equally regardless of their contribution",
        textZh: "它平均上傳畀所有對等方，不管他們的貢獻",
      },
      {
        id: "b",
        textEn: "It preferentially uploads to peers who have provided the fastest download speeds (tit-for-tat)",
        textZh: "它優先上傳畀提供最快下載速度的對等方（以牙還牙）",
      },
      {
        id: "c",
        textEn: "It only uploads to peers that have been online the longest",
        textZh: "它只上傳畀在線時間最長的對等方",
      },
      {
        id: "d",
        textEn: "It randomly selects peers using a round-robin algorithm",
        textZh: "它使用輪詢算法隨機選擇對等方",
      },
    ],
    correctAnswer: "b",
    explanationEn:
      "BitTorrent uses a 'tit-for-tat' (choking/unchoking) mechanism: peers preferentially upload to those who upload back to them at the fastest rate. Every 10 seconds, each peer identifies the top 4 fastest uploaders and unchokes them (allows downloads). One additional peer is 'optimistically unchoked' randomly every 30 seconds to discover potentially better peers. This incentive mechanism encourages all peers to contribute upload bandwidth, making the system self-scaling.",
    explanationZh:
      "BitTorrent使用'以牙還牙'（阻塞/解阻）機制：對等方優先上傳畀那些以最快速率回傳的對等方。每10秒，每個對等方識別最快的4個上傳者並解除阻塞（允許下載）。每30秒隨機選擇一個額外的對等方進行'樂觀解阻'以發現可能更好的對等方。呢種激勵機制鼓勵所有對等方貢獻上傳帶寬，使系統自擴展。",
    difficulty: "hard",
    topicId: "new-networks",
    topicNameEn: "New Network Technologies",
    topicNameZh: "新型網絡技術",
  },

  // ==========================================
  // Topic 18: Network Security (Additional)
  // ==========================================
  {
    id: "nsec-1",
    questionEn:
      "In RSA encryption, if a user's public key is (n=77, e=7), what is the maximum size of the plaintext message that can be encrypted in one operation?",
    questionZh: "在RSA加密中，如果用户的公鑰是(n=77, e=7)，一次操作可以加密的明文訊息最大大小是多少？",
    options: [
      { id: "a", textEn: "7 bits", textZh: "7位" },
      { id: "b", textEn: "6 bits (message must be less than n=77)", textZh: "6位（訊息必須小於n=77）" },
      { id: "c", textEn: "Any size; RSA has no message size limit", textZh: "任意大小；RSA冇訊息大小限制" },
      { id: "d", textEn: "77 bytes", textZh: "77字節" },
    ],
    correctAnswer: "b",
    explanationEn:
      "In RSA, the plaintext message m must satisfy 0 ≤ m < n. With n=77, the maximum message value is 76. In practice, RSA is used to encrypt a symmetric key (e.g., AES-256 key of 32 bytes), not the actual data. The symmetric key is then used with AES to encrypt the data. This hybrid encryption approach combines RSA's key distribution advantages with AES's efficiency for bulk data encryption. The key size (e.g., 2048-bit RSA) determines n's size, not the message size.",
    explanationZh:
      "在RSA中，明文訊息m必須滿足0 ≤ m < n。當n=77時，最大訊息值為76。實際上，RSA用於加密對稱密鑰（如32字節的AES-256密鑰），而不是實際數據。然後用AES使用對稱密鑰加密數據。呢種混合加密方法結合了RSA的密鑰分發優勢和AES的大數據加密效率。密鑰大小（如2048位RSA）決定n的大小，而不是訊息大小。",
    difficulty: "medium",
    topicId: "network-security",
    topicNameEn: "Network Security",
    topicNameZh: "網絡安全",
  },
  {
    id: "nsec-2",
    questionEn:
      "What is the purpose of IPsec (IP Security) and at which layer does it operate?",
    questionZh: "IPsec（IP安全）的目的是什麼，它在哪一層運行？",
    options: [
      {
        id: "a",
        textEn: "IPsec encrypts application-layer data only; it operates at the application layer",
        textZh: "IPsec僅加密應用層數據；在應用層運行",
      },
      {
        id: "b",
        textEn: "IPsec provides security (confidentiality, integrity, authentication) for IP-layer communications",
        textZh: "IPsec為IP層通信提供安全性（機密性、完整性、認證）",
      },
      {
        id: "c",
        textEn: "IPsec secures physical network cables from tampering",
        textZh: "IPsec保護物理網絡電纜不被篡改",
      },
      {
        id: "d",
        textEn: "IPsec replaces TCP with a secure transport protocol",
        textZh: "IPsec用安全傳輸協定替換TCP",
      },
    ],
    correctAnswer: "b",
    explanationEn:
      "IPsec operates at the network layer (Layer 3) and provides security services for IP packets. It has two modes: Transport mode (only payload is encrypted, original IP header preserved) and Tunnel mode (entire original packet is encrypted and encapsulated in a new IP packet). IPsec includes two protocols: AH (Authentication Header) for integrity and authentication, and ESP (Encapsulating Security Payload) for confidentiality. IKE (Internet Key Exchange) manages key establishment.",
    explanationZh:
      "IPsec在網絡層（第三層）運行，為IP數據包提供安全服務。它有兩種模式：傳輸模式（僅載荷被加密，保留原始IP頭部）和隧道模式（整個原始數據包被加密並封裝在新IP數據包中）。IPsec包含兩個協定：AH（認證頭部）用於完整性和認證，ESP（封裝安全載荷）用於機密性。IKE（互聯網密鑰交換）管理密鑰建立。",
    difficulty: "medium",
    topicId: "network-security",
    topicNameEn: "Network Security",
    topicNameZh: "網絡安全",
  },
  {
    id: "nsec-3",
    questionEn:
      "In a certificate chain validation, what must a client verify when checking a server's digital certificate?",
    questionZh: "在證書鏈驗證中，客户端檢查服務器數字證書時必須驗證什麼？",
    options: [
      {
        id: "a",
        textEn: "Only that the certificate contains a valid public key",
        textZh: "僅驗證證書包含有效的公鑰",
      },
      {
        id: "b",
        textEn: "The certificate signature, expiration date, domain name match, and the chain up to a trusted root CA",
        textZh: "證書籤名、過期日期、域名匹配，以及到受信任根CA的鏈",
      },
      {
        id: "c",
        textEn: "That the certificate was issued by a government authority",
        textZh: "證書由政府機構籤發",
      },
      {
        id: "d",
        textEn: "Only that the certificate has not expired",
        textZh: "僅驗證證書未過期",
      },
    ],
    correctAnswer: "b",
    explanationEn:
      "Certificate chain validation requires verifying: (1) The server certificate's signature was issued by an intermediate CA whose signature was issued by a trusted Root CA in the client's trust store; (2) The certificate has not expired (validity period check); (3) The certificate has not been revoked (via CRL or OCSP); (4) The certificate's Common Name or Subject Alternative Name matches the server's domain name; (5) The certificate's intended purpose matches (e.g., server authentication).",
    explanationZh:
      "證書鏈驗證需要驗證：(1) 服務器證書的簽名由中間CA籤發，該中間CA的簽名由客户端信任存儲中的受信任根CA籤發；(2) 證書未過期（有效期檢查）；(3) 證書未被撤回（通過CRL或OCSP）；(4) 證書的通用名稱或主題備用名稱與服務器的域名匹配；(5) 證書的預期用途匹配（例如服務器認證）。",
    difficulty: "medium",
    topicId: "network-security",
    topicNameEn: "Network Security",
    topicNameZh: "網絡安全",
  },
  {
    id: "nsec-4",
    questionEn:
      "What is the difference between a packet-filtering firewall and an application-level gateway (proxy firewall)?",
    questionZh: "包過濾防火牆和應用級網關（代理防火牆）有什麼區別？",
    options: [
      {
        id: "a",
        textEn: "Packet filters inspect packet payload; proxies only check headers",
        textZh: "包過濾器檢查數據包載荷；代理只檢查頭部",
      },
      {
        id: "b",
        textEn: "Packet filters make decisions based on header fields (IP, port, protocol); proxies understand application-level protocols",
        textZh: "包過濾器基於頭部字段（IP、端口、協定）做決定；代理理解應用層協定",
      },
      {
        id: "c",
        textEn: "There is no difference; they are the same technology",
        textZh: "冇區別；它們是相同的技術",
      },
      {
        id: "d",
        textEn: "Proxies are faster than packet filters because they cache content",
        textZh: "代理比包過濾器更快因為它們緩存內容",
      },
    ],
    correctAnswer: "b",
    explanationEn:
      "Packet-filtering firewalls (Layer 3/4) examine individual packet headers and make allow/deny decisions based on rules involving source/destination IP, port numbers, protocol type, and TCP flags. They are fast but cannot inspect application data. Application-level gateways (proxy firewalls) operate at Layer 7, fully understanding application protocols (HTTP, FTP, SMTP). They can inspect and filter based on application-level content (e.g., blocking specific URLs in HTTP requests) and provide better security at the cost of higher latency.",
    explanationZh:
      "包過濾防火牆（第三/四層）檢查單個數據包頭部，並根據涉及源/目的IP、端口號、協定類型和TCP標誌的規則做出允許/拒絕決定。它們速度快但無法檢查應用數據。應用級網關（代理防火牆）在第七層運行，完全理解應用協定（HTTP、FTP、SMTP）。它們可以根據應用層內容檢查和過濾（例如阻止HTTP請求中的特定URL），以更高的延遲為代價提供更好的安全性。",
    difficulty: "hard",
    topicId: "network-security",
    topicNameEn: "Network Security",
    topicNameZh: "網絡安全",
  },
  {
    id: "nsec-5",
    questionEn:
      "In the TLS 1.3 handshake, which cipher suite component provides confidentiality?",
    questionZh: "在TLS 1.3握手過程中，密碼套件的哪個組件提供機密性？",
    options: [
      { id: "a", textEn: "The digital signature algorithm (e.g., RSA, ECDSA)", textZh: "數字簽名算法（如RSA、ECDSA）" },
      { id: "b", textEn: "The AEAD (Authenticated Encryption with Associated Data) cipher (e.g., AES-GCM, ChaCha20-Poly1305)", textZh: "AEAD（關聯數據的認證加密）密碼（如AES-GCM、ChaCha20-Poly1305）" },
      { id: "c", textEn: "The hash function (e.g., SHA-256)", textZh: "哈希函數（如SHA-256）" },
      { id: "d", textEn: "The key exchange mechanism (e.g., ECDHE)", textZh: "密鑰交換機制（如ECDHE）" },
    ],
    correctAnswer: "b",
    explanationEn:
      "TLS 1.3 simplified cipher suites to the format TLS_AEAD_HASH. The AEAD (Authenticated Encryption with Associated Data) cipher provides both confidentiality (encryption) and integrity/authentication in a single operation. Common TLS 1.3 AEAD ciphers: AES-128-GCM, AES-256-GCM, ChaCha20-Poly1305. TLS 1.3 removed support for non-AEAD ciphers, static RSA key exchange, and renegotiation, making it significantly more secure than TLS 1.2. The handshake was also reduced to 1-RTT (from 2-RTT).",
    explanationZh:
      "TLS 1.3將密碼套件簡化為格式TLS_AEAD_HASH。AEAD（關聯數據的認證加密）密碼在單個操作中同時提供機密性（加密）和完整性/認證。常見的TLS 1.3 AEAD密碼：AES-128-GCM、AES-256-GCM、ChaCha20-Poly1305。TLS 1.3移除了對非AEAD密碼、靜態RSA密鑰交換和重新協商的支援，使其比TLS 1.2安全得多。握手也減少到了1-RTT（從2-RTT）。",
    difficulty: "hard",
    topicId: "network-security",
    topicNameEn: "Network Security",
    topicNameZh: "網絡安全",
  },
];
