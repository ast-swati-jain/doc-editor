import { NextRequest, NextResponse } from 'next/server';
import { Storage } from '@/lib/storage';

function markdownToHtml(md: string): string {
  let html = md
    // Escape basic html characters
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Code blocks ```code```
  html = html.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');

  // Inline code `code`
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

  // Headings # -> <h1>, ## -> <h2>, ### -> <h3>
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

  // Bold **text**
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

  // Italic *text*
  html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');

  // Blockquotes > text
  html = html.replace(/^\> (.*$)/gim, '<blockquote>$1</blockquote>');

  // Lists: unordered - item or * item
  html = html.replace(/^\s*[-*]\s+(.*$)/gim, '<li>$1</li>');
  html = html.replace(/(<li>[\s\S]*?<\/li>)/gm, '<ul>$1</ul>');

  // Split into paragraphs for lines not already HTML elements
  const lines = html.split('\n');
  const processedLines = lines.map(line => {
    const trimmed = line.trim();
    if (!trimmed) return '';
    if (trimmed.startsWith('<h') || trimmed.startsWith('<ul') || trimmed.startsWith('<ol') || 
        trimmed.startsWith('<pre') || trimmed.startsWith('<blockquote') || trimmed.startsWith('<li>')) {
      return trimmed;
    }
    return `<p>${trimmed}</p>`;
  });

  return processedLines.join('');
}

function textToHtml(text: string): string {
  const lines = text.split('\n');
  return lines
    .map(line => `<p>${line.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') || '&nbsp;'}</p>`)
    .join('');
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { filename, fileContent, ownerEmail, fileType } = body;

    if (!fileContent || !ownerEmail) {
      return NextResponse.json(
        { error: "fileContent and ownerEmail are required" },
        { status: 400 }
      );
    }

    const title = filename 
      ? filename.replace(/\.(txt|md|markdown|html|htm|json)$/i, '')
      : "Imported Document";

    let richContent = "<p></p>";
    const ext = (filename?.split('.').pop() || fileType || '').toLowerCase();

    if (ext === 'md' || ext === 'markdown') {
      richContent = markdownToHtml(fileContent);
    } else if (ext === 'html' || ext === 'htm') {
      richContent = fileContent;
    } else if (ext === 'json') {
      try {
        const parsed = JSON.parse(fileContent);
        richContent = parsed.content || `<pre>${JSON.stringify(parsed, null, 2)}</pre>`;
      } catch {
        richContent = textToHtml(fileContent);
      }
    } else {
      // Default to plain text
      richContent = textToHtml(fileContent);
    }

    const doc = await Storage.createDocument({
      title: `📄 ${title}`,
      content: richContent,
      ownerEmail
    });

    return NextResponse.json({ doc }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/documents/import error:", error);
    return NextResponse.json({ error: error.message || "Failed to import file" }, { status: 500 });
  }
}
