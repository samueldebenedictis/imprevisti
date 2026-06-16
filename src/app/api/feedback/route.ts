import { NextResponse } from "next/server";
import { getFeedback, pushFeedback } from "@/lib/session-store";

export async function POST(req: Request) {
  const body = await req.json();

  const entry = {
    ...body,
    submittedAt: new Date().toISOString(),
    id: Date.now().toString(),
  };

  await pushFeedback(JSON.stringify(entry));
  return NextResponse.json({ ok: true });
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  if (searchParams.get("secret") !== process.env.FEEDBACK_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const items = await getFeedback(100);
  return NextResponse.json(items.map((i) => JSON.parse(i)));
}
