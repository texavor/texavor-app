import { NextResponse } from "next/server";
import { articles } from "@/lib/store";

export async function PUT(request: Request) {
  try {
    const { id, title, content } = await request.json();
    if (!id || !articles[id]) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }
    articles[id] = { ...articles[id], title, content };
    return NextResponse.json(articles[id], { status: 200 });
  } catch (error) {
    console.error("Error updating article:", error);
    return NextResponse.json({ error: "Failed to update article" }, { status: 500 });
  }
}
