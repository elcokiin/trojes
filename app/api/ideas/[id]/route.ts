import { getAuthenticatedUserId } from "@/lib/auth"
import { NextRequest, NextResponse } from "next/server"
import { deleteIdea, findIdeaById, updateIdea } from "@/db/ideas"

// GET - Fetch single idea
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getAuthenticatedUserId(request)
    
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }
    
    const { id } = await params
    
    const idea = await findIdeaById({ id, userId })
    
    if (!idea) {
      return NextResponse.json(
        { error: "Idea not found" },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ idea })
  } catch (error) {
    console.error("Failed to fetch idea:", error)
    return NextResponse.json(
      { error: "Failed to fetch idea" },
      { status: 500 }
    )
  }
}

// PATCH - Update idea (content, status, tags, pinned, background_color)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getAuthenticatedUserId(request)
    
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }
    
    const { id } = await params
    const body = await request.json()
    const { content, status, tags, pinned, background_color } = body
    
    const idea = await findIdeaById({ id, userId })
    
    if (!idea) {
      return NextResponse.json(
        { error: "Idea not found" },
        { status: 404 }
      )
    }
    
    // Determine new values
    const newContent = content !== undefined ? content.trim() : idea.content
    const newStatus = status !== undefined ? status : idea.status
    const newTags = tags !== undefined ? tags : idea.tags
    const newPinned = pinned !== undefined ? pinned : idea.pinned
    const newBackgroundColor = background_color !== undefined ? background_color : idea.background_color
    
    // Handle deleted_at based on status transitions
    let newDeletedAt = idea.deleted_at
    if (status === 'deleted' && !idea.deleted_at) {
      newDeletedAt = new Date().toISOString()
    } else if ((status === 'inbox' || status === 'archived') && idea.status === 'deleted') {
      newDeletedAt = null
    }
    
    const updatedIdea = await updateIdea({
      id,
      userId,
      values: {
        content: newContent,
        status: newStatus,
        tags: newTags,
        pinned: newPinned,
        background_color: newBackgroundColor,
        deleted_at: newDeletedAt,
      },
    })
    
    return NextResponse.json({ idea: updatedIdea })
  } catch (error) {
    console.error("Failed to update idea:", error)
    return NextResponse.json(
      { error: "Failed to update idea" },
      { status: 500 }
    )
  }
}

// DELETE - Permanently delete idea from database
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getAuthenticatedUserId(request)
    
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }
    
    const { id } = await params
    
    const deletedIdea = await deleteIdea({ id, userId })
    
    if (!deletedIdea) {
      return NextResponse.json(
        { error: "Idea not found" },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ success: true, id: deletedIdea.id })
  } catch (error) {
    console.error("Failed to delete idea:", error)
    return NextResponse.json(
      { error: "Failed to delete idea" },
      { status: 500 }
    )
  }
}
