// lib/chat-history-data.ts
export type ChatHistoryItem = {
  id: string;
  title: string;
  lastMessage: string;
  updatedAt: Date;
  messageCount: number;
};

export const mockChatHistory: ChatHistoryItem[] = [
  {
    id: "1",
    title: "Study in Finland – Budget & Visa",
    lastMessage: "Yes, tuition is free for EU citizens but for Bangladesh...",
    updatedAt: new Date("2025-11-20T10:30:00"),
    messageCount: 24,
  },
  {
    id: "2",
    title: "Germany DAAD Scholarship 2026",
    lastMessage: "Here are the latest deadlines...",
    updatedAt: new Date("2025-11-19T15:45:00"),
    messageCount: 18,
  },
  {
    id: "3",
    title: "Sweden vs Denmark comparison",
    lastMessage: "Both are excellent, but living cost in Denmark is higher...",
    updatedAt: new Date("2025-11-18T09:20:00"),
    messageCount: 32,
  },
  {
    id: "4",
    title: "Quick question about IELTS",
    lastMessage: "You need minimum 6.5 overall...",
    updatedAt: new Date("2025-11-15T14:10:00"),
    messageCount: 5,
  },
];