import { getAuthenticatedUserId } from "@/lib/auth"
import { NextRequest, NextResponse } from "next/server"
import { createIdea, findIdeas, findPinnedIdeas } from "@/db/ideas"

// GET - Fetch all ideas (for web dashboard)
export async function GET(request: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId(request)
    
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }
    
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status") || "inbox"
    const search = searchParams.get("search")
    const pinned = searchParams.get("pinned") === "true"

    let ideas
    if (pinned) {
      ideas = await findPinnedIdeas({ userId })
    } else {
      ideas = await findIdeas({
        userId,
        status: status as "inbox" | "archived" | "deleted",
        search,
      })
    }
    
    return NextResponse.json({ ideas })
  } catch (error) {
    console.error("Failed to fetch ideas:", error)
    return NextResponse.json(
      { error: "Failed to fetch ideas" },
      { status: 500 }
    )
  }
}

// POST - Create new idea
export async function POST(request: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId(request)
    
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }
    
    const source = request.headers.get("authorization")?.startsWith("Bearer ") ? "api" : "web"
    
    const body = await request.json()
    const { content } = body
    
    if (!content || typeof content !== "string" || content.trim().length === 0) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      )
    }
    
    const idea = await createIdea({
      user_id: userId,
      content: content.trim(),
      source,
      status: "inbox",
      pinned: false,
      background_color: null,
    })
    
    return NextResponse.json({ idea }, { status: 201 })
  } catch (error) {
    console.error("Failed to create idea:", error)
    return NextResponse.json(
      { error: "Failed to create idea" },
      { status: 500 }
    )
  }
}
