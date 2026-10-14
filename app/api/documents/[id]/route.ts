import { NextRequest, NextResponse } from 'next/server';
import { Storage } from '@/lib/storage';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const userEmail = searchParams.get('userEmail') || undefined;

    const result = await Storage.getDocumentById(id, userEmail);
    if (!result.doc) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("GET /api/documents/[id] error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch document" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { title, content, userEmail, recordVersion, versionSummary } = body;

    if (!userEmail) {
      return NextResponse.json({ error: "User email is required" }, { status: 400 });
    }

    const result = await Storage.updateDocument(
      id,
      { title, content, recordVersion, versionSummary },
      userEmail
    );

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 403 });
    }

    return NextResponse.json({ doc: result.doc });
  } catch (error: any) {
    console.error("PATCH /api/documents/[id] error:", error);
    return NextResponse.json({ error: error.message || "Failed to update document" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const userEmail = searchParams.get('userEmail');

    if (!userEmail) {
      return NextResponse.json({ error: "User email is required" }, { status: 400 });
    }

    const result = await Storage.deleteDocument(id, userEmail);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 403 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("DELETE /api/documents/[id] error:", error);
    return NextResponse.json({ error: error.message || "Failed to delete document" }, { status: 500 });
  }
}
