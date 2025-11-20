import { NextResponse } from "next/server";
import crypto from "crypto";
import { articles } from "@/lib/store";

export async function POST(request: Request) {
  try {
    const { title, content } = await request.json();
    const id = crypto.randomUUID();
    const newArticle = { id, title, content };
    articles[id] = newArticle;
    return NextResponse.json(newArticle, { status: 201 });
  } catch (error) {
    console.error("Error creating article:", error);
    return NextResponse.json(
      { error: "Failed to create article" },
      { status: 500 },
    );
  }
}
