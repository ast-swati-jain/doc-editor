import { NextRequest, NextResponse } from 'next/server';
import { Storage } from '@/lib/storage';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, size, type, dataUrl, userEmail } = body;

    if (!name || !dataUrl || !userEmail) {
      return NextResponse.json(
        { error: "name, dataUrl, and userEmail are required" },
        { status: 400 }
      );
    }

    const result = await Storage.addAttachment(
      id,
      { name, size: size || 0, type: type || 'application/octet-stream', dataUrl },
      userEmail
    );

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ doc: result.doc });
  } catch (error: any) {
    console.error("POST /api/documents/[id]/attachments error:", error);
    return NextResponse.json({ error: error.message || "Failed to attach file" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { attachmentId, userEmail } = body;

    if (!attachmentId || !userEmail) {
      return NextResponse.json(
        { error: "attachmentId and userEmail are required" },
        { status: 400 }
      );
    }

    const result = await Storage.removeAttachment(id, attachmentId, userEmail);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ doc: result.doc });
  } catch (error: any) {
    console.error("DELETE /api/documents/[id]/attachments error:", error);
    return NextResponse.json({ error: error.message || "Failed to remove attachment" }, { status: 500 });
  }
}
