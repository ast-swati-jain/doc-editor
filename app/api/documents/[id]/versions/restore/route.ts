import { NextRequest, NextResponse } from 'next/server';
import { Storage } from '@/lib/storage';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { versionId, userEmail } = body;

    if (!versionId || !userEmail) {
      return NextResponse.json(
        { error: "versionId and userEmail are required" },
        { status: 400 }
      );
    }

    const result = await Storage.restoreVersion(id, versionId, userEmail);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ doc: result.doc });
  } catch (error: any) {
    console.error("POST /api/documents/[id]/versions/restore error:", error);
    return NextResponse.json({ error: error.message || "Failed to restore version" }, { status: 500 });
  }
}
