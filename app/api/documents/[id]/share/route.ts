import { NextRequest, NextResponse } from 'next/server';
import { Storage } from '@/lib/storage';
import { UserRole } from '@/lib/types';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { targetEmail, role, userEmail } = body;

    if (!targetEmail || !role || !userEmail) {
      return NextResponse.json(
        { error: "targetEmail, role ('viewer' | 'editor'), and userEmail are required" },
        { status: 400 }
      );
    }

    const result = await Storage.shareDocument(
      id,
      targetEmail,
      role as UserRole,
      userEmail
    );

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ doc: result.doc });
  } catch (error: any) {
    console.error("POST /api/documents/[id]/share error:", error);
    return NextResponse.json({ error: error.message || "Failed to update sharing" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { targetEmail, userEmail } = body;

    if (!targetEmail || !userEmail) {
      return NextResponse.json(
        { error: "targetEmail and userEmail are required" },
        { status: 400 }
      );
    }

    const result = await Storage.removeCollaborator(id, targetEmail, userEmail);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ doc: result.doc });
  } catch (error: any) {
    console.error("DELETE /api/documents/[id]/share error:", error);
    return NextResponse.json({ error: error.message || "Failed to remove collaborator" }, { status: 500 });
  }
}
