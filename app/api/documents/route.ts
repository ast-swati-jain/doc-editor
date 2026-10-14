import { NextRequest, NextResponse } from 'next/server';
import { Storage } from '@/lib/storage';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userEmail = searchParams.get('userEmail') || 'swati2003jain@gmail.com';
    const result = await Storage.getDocumentsForUser(userEmail);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("GET /api/documents error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch documents" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, content, ownerEmail, ownerName } = body;

    if (!ownerEmail) {
      return NextResponse.json({ error: "Owner email is required" }, { status: 400 });
    }

    const doc = await Storage.createDocument({
      title: title || "Untitled Document",
      content: content || "<p></p>",
      ownerEmail,
      ownerName
    });

    return NextResponse.json({ doc }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/documents error:", error);
    return NextResponse.json({ error: error.message || "Failed to create document" }, { status: 500 });
  }
}
