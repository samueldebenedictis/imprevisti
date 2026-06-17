export function getCardDisplay(card: unknown): {
  text: string;
  body: string;
  imageUrl?: string;
} {
  if (!card || typeof card !== "object")
    return { text: String(card ?? ""), body: "" };
  const c = card as Record<string, unknown>;
  if ("topic" in c && c.topic && typeof c.topic === "object") {
    const topic = c.topic as Record<string, unknown>;
    return {
      text: String(topic.cardTitle ?? ""),
      body: String(topic.cardText ?? ""),
      imageUrl: typeof c.imageUrl === "string" ? c.imageUrl : undefined,
    };
  }
  return {
    text: String(c.cardTitle ?? ""),
    body: String(c.cardText ?? ""),
  };
}
