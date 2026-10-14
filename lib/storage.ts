import fs from 'fs/promises';
import path from 'path';
import { MongoClient, Db } from 'mongodb';
import { DocumentItem, UserRole, SEEDED_USERS } from './types';

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'documents.json');

const INITIAL_DOCS: DocumentItem[] = [
  {
    id: "doc-welcome-01",
    title: "✨ Welcome to Ajaia Doc Editor",
    content: `
      <h1>Ajaia Collaborative Document Editor</h1>
      <p>Welcome! This application was crafted by <strong>Swati Jain</strong> for the <em>AI-Native Full Stack Product Engineer</em> assessment at Ajaia.</p>
      <br/>
      <h2>🔥 What you can test right now:</h2>
      <ul>
        <li><strong>Rich-Text Editing:</strong> Format headings, lists, bold, italics, underline, code blocks, and alignments.</li>
        <li><strong>Autosave & Status:</strong> Type anywhere and watch the top status badge indicate real-time debounced saving.</li>
        <li><strong>Simulated User Switching:</strong> Use the top-right profile dropdown to switch between <em>Swati Jain</em>, <em>Alex Rivera</em>, <em>Taylor Kim</em>, and <em>Jordan Lee</em>.</li>
        <li><strong>Document Sharing & Permissions:</strong> Click <strong>Share</strong> to grant access with <em>Editor</em> or <em>Viewer</em> privileges. Notice read-only mode for viewers!</li>
        <li><strong>File Upload & Import:</strong> Import <code>.txt</code> or <code>.md</code> documents into editable drafts or attach files to this document.</li>
        <li><strong>Exporting:</strong> Export documents directly to Markdown or HTML.</li>
      </ul>
      <br/>
      <blockquote>Built with Next.js 16, React 19, Tailwind CSS, and a resilient persistence engine.</blockquote>
    `.trim(),
    plainText: "Ajaia Collaborative Document Editor. Welcome! This application was crafted by Swati Jain...",
    ownerId: "usr_swati",
    ownerEmail: "swati2003jain@gmail.com",
    ownerName: "Swati Jain",
    collaborators: [
      {
        userId: "usr_alex",
        email: "alex@ajaia.internal",
        name: "Alex Rivera",
        role: "editor",
        addedAt: new Date(Date.now() - 3600000 * 24).toISOString()
      },
      {
        userId: "usr_taylor",
        email: "taylor@ajaia.internal",
        name: "Taylor Kim",
        role: "viewer",
        addedAt: new Date(Date.now() - 3600000 * 12).toISOString()
      },
      {
        userId: "usr_jordan",
        email: "jordan@ajaia.internal",
        name: "Jordan Lee",
        role: "editor",
        addedAt: new Date(Date.now() - 3600000 * 6).toISOString()
      }
    ],
    attachments: [
      {
        id: "att-spec-01",
        name: "product-spec-v1.txt",
        size: 2048,
        type: "text/plain",
        dataUrl: "data:text/plain;base64,QWphaWEgRG9jIEVkaXRvciBQcm9kdWN0IFNwZWNpZmljYXRpb24gdjE=",
        uploadedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
        uploadedBy: "Swati Jain"
      }
    ],
    versions: [
      {
        id: "ver-01",
        title: "✨ Welcome to Ajaia Doc Editor",
        content: "<h1>Ajaia Collaborative Document Editor (Initial Draft)</h1>",
        createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
        createdBy: "Swati Jain",
        summary: "Initial document creation"
      }
    ],
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    updatedAt: new Date().toISOString(),
    lastModifiedBy: "Swati Jain"
  },
  {
    id: "doc-sprint-02",
    title: "🎯 Q4 Engineering Sprint & Milestones",
    content: `
      <h2>Q4 Engineering Roadmap</h2>
      <p>This document is owned by <strong>Alex Rivera</strong> and shared with <strong>Swati Jain</strong> as an <em>Editor</em>.</p>
      <h3>Key Deliverables:</h3>
      <ol>
        <li>Document persistence layer with zero-config fallback.</li>
        <li>Instant simulated auth for smooth reviewer evaluations.</li>
        <li>Granular access controls: Owner, Editor, Viewer.</li>
        <li>Multi-format file upload and text import.</li>
      </ol>
      <p><em>Status: Active sprint in progress.</em></p>
    `.trim(),
    plainText: "Q4 Engineering Roadmap. This document is owned by Alex Rivera...",
    ownerId: "usr_alex",
    ownerEmail: "alex@ajaia.internal",
    ownerName: "Alex Rivera",
    collaborators: [
      {
        userId: "usr_swati",
        email: "swati2003jain@gmail.com",
        name: "Swati Jain",
        role: "editor",
        addedAt: new Date(Date.now() - 3600000 * 20).toISOString()
      }
    ],
    attachments: [],
    versions: [],
    createdAt: new Date(Date.now() - 3600000 * 30).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    lastModifiedBy: "Alex Rivera"
  },
  {
    id: "doc-design-03",
    title: "🎨 Design System & UI Specifications",
    content: `
      <h2>Design Guidelines & System Tokens</h2>
      <p>Owned by <strong>Taylor Kim</strong>. Shared with <strong>Swati Jain</strong> as <em>Viewer</em> (read-only mode).</p>
      <p>When Swati opens this document, notice how the toolbar is automatically disabled and marked with a <strong>Read Only</strong> pill badge!</p>
      <br/>
      <h3>Color Tokens:</h3>
      <ul>
        <li><strong>Primary Brand:</strong> Indigo 600 (<code>#4f46e5</code>)</li>
        <li><strong>Neutral Background:</strong> Slate 50/100 (<code>#f8fafc</code>)</li>
        <li><strong>Text Primary:</strong> Slate 900 (<code>#0f172a</code>)</li>
      </ul>
    `.trim(),
    plainText: "Design Guidelines & System Tokens. Owned by Taylor Kim...",
    ownerId: "usr_taylor",
    ownerEmail: "taylor@ajaia.internal",
    ownerName: "Taylor Kim",
    collaborators: [
      {
        userId: "usr_swati",
        email: "swati2003jain@gmail.com",
        name: "Swati Jain",
        role: "viewer",
        addedAt: new Date(Date.now() - 3600000 * 10).toISOString()
      }
    ],
    attachments: [],
    versions: [],
    createdAt: new Date(Date.now() - 3600000 * 15).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    lastModifiedBy: "Taylor Kim"
  },
  {
    id: "doc-security-04",
    title: "🔒 Security, Compliance & Audit Review",
    content: `
      <h2>Security & Compliance Audit</h2>
      <p>Owned by <strong>Jordan Lee</strong>. Shared with <strong>Swati Jain</strong> as an <em>Editor</em>.</p>
      <h3>Verified Policies:</h3>
      <ul>
        <li><strong>Role-Based Access Control:</strong> Strict separation of Owner, Editor, and Viewer privileges.</li>
        <li><strong>Audit Trail:</strong> Version snapshots recorded with author timestamps.</li>
        <li><strong>Multi-Format Import:</strong> Safe parsing of Markdown, HTML, and Plaintext payloads.</li>
      </ul>
      <blockquote>Status: Verified for assessment evaluation.</blockquote>
    `.trim(),
    plainText: "Security & Compliance Audit. Owned by Jordan Lee. Shared with Swati Jain...",
    ownerId: "usr_jordan",
    ownerEmail: "jordan@ajaia.internal",
    ownerName: "Jordan Lee",
    collaborators: [
      {
        userId: "usr_swati",
        email: "swati2003jain@gmail.com",
        name: "Swati Jain",
        role: "editor",
        addedAt: new Date(Date.now() - 3600000 * 8).toISOString()
      }
    ],
    attachments: [],
    versions: [],
    createdAt: new Date(Date.now() - 3600000 * 10).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 1).toISOString(),
    lastModifiedBy: "Jordan Lee"
  }
];

// In-memory cache for ultra-fast operations and fallback
let memoryDocs: DocumentItem[] | null = null;
let mongoClient: MongoClient | null = null;
let mongoDb: Db | null = null;

async function getMongoDb(): Promise<Db | null> {
  const uri = process.env.MONGODB_URI;
  if (!uri) return null;
  try {
    try {
      const dns = await import('dns');
      dns.setServers(['8.8.8.8', '1.1.1.1']);
    } catch {}

    if (!mongoClient) {
      mongoClient = new MongoClient(uri, { serverSelectionTimeoutMS: 8000 });
      await mongoClient.connect();
    }
    if (!mongoDb) {
      mongoDb = mongoClient.db(process.env.MONGODB_DB || 'doc_editor');
    }
    return mongoDb;
  } catch (err) {
    console.error("MongoDB connection error, falling back to local storage:", err);
    return null;
  }
}

async function ensureDataFile(): Promise<void> {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    try {
      await fs.access(DATA_FILE);
    } catch {
      await fs.writeFile(DATA_FILE, JSON.stringify(INITIAL_DOCS, null, 2), 'utf-8');
    }
  } catch (err) {
    console.error("Warning: File storage initialization fallback to memory store:", err);
  }
}

async function readAllDocs(): Promise<DocumentItem[]> {
  const db = await getMongoDb();
  if (db) {
    try {
      const col = db.collection<DocumentItem>('documents');
      const docs = await col.find({}, { projection: { _id: 0 } }).toArray();
      if (docs.length > 0) {
        memoryDocs = docs;
        return docs;
      }
      // Seed if empty in MongoDB
      await col.insertMany(INITIAL_DOCS.map(d => ({ ...d })));
      memoryDocs = [...INITIAL_DOCS];
      return memoryDocs;
    } catch (err) {
      console.error("MongoDB read failed, using fallback:", err);
    }
  }

  await ensureDataFile();
  try {
    const raw = await fs.readFile(DATA_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    memoryDocs = Array.isArray(parsed) ? parsed : INITIAL_DOCS;
    return memoryDocs;
  } catch {
    if (!memoryDocs) {
      memoryDocs = [...INITIAL_DOCS];
    }
    return memoryDocs;
  }
}

async function writeAllDocs(docs: DocumentItem[]): Promise<void> {
  memoryDocs = docs;

  const db = await getMongoDb();
  if (db) {
    try {
      const col = db.collection<DocumentItem>('documents');
      await col.deleteMany({});
      if (docs.length > 0) {
        await col.insertMany(docs.map(d => ({ ...d })));
      }
      return;
    } catch (err) {
      console.error("MongoDB write failed, writing locally:", err);
    }
  }

  try {
    await ensureDataFile();
    await fs.writeFile(DATA_FILE, JSON.stringify(docs, null, 2), 'utf-8');
  } catch (err) {
    console.warn("Could not write to disk, using in-memory state:", err);
  }
}

export const Storage = {
  async getDocumentsForUser(userEmail: string): Promise<{
    owned: DocumentItem[];
    shared: DocumentItem[];
  }> {
    const docs = await readAllDocs();
    const owned = docs.filter(
      d => d.ownerEmail.toLowerCase() === userEmail.toLowerCase()
    );
    const shared = docs.filter(
      d => d.collaborators.some(c => c.email.toLowerCase() === userEmail.toLowerCase())
    );
    return { owned, shared };
  },

  async getDocumentById(
    id: string,
    userEmail?: string
  ): Promise<{
    doc: DocumentItem | null;
    userRole: 'owner' | 'editor' | 'viewer' | 'none';
  }> {
    const docs = await readAllDocs();
    const doc = docs.find(d => d.id === id);
    if (!doc) return { doc: null, userRole: 'none' };

    if (!userEmail) return { doc, userRole: 'owner' };

    const emailLower = userEmail.toLowerCase();
    if (doc.ownerEmail.toLowerCase() === emailLower) {
      return { doc, userRole: 'owner' };
    }

    const collab = doc.collaborators.find(c => c.email.toLowerCase() === emailLower);
    if (collab) {
      return { doc, userRole: collab.role };
    }

    return { doc, userRole: 'none' };
  },

  async createDocument(params: {
    title?: string;
    content?: string;
    ownerEmail: string;
    ownerName?: string;
    ownerId?: string;
  }): Promise<DocumentItem> {
    const docs = await readAllDocs();
    const user = SEEDED_USERS.find(u => u.email.toLowerCase() === params.ownerEmail.toLowerCase());
    const ownerName = params.ownerName || user?.name || params.ownerEmail.split('@')[0];
    const ownerId = params.ownerId || user?.id || `usr_${Date.now()}`;

    const newDoc: DocumentItem = {
      id: `doc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      title: params.title?.trim() || "Untitled Document",
      content: params.content || "<p></p>",
      plainText: (params.content || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 160),
      ownerId,
      ownerEmail: params.ownerEmail,
      ownerName,
      collaborators: [],
      attachments: [],
      versions: [
        {
          id: `ver-${Date.now()}`,
          title: params.title?.trim() || "Untitled Document",
          content: params.content || "<p></p>",
          createdAt: new Date().toISOString(),
          createdBy: ownerName,
          summary: "Initial creation"
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastModifiedBy: ownerName
    };

    docs.unshift(newDoc);
    await writeAllDocs(docs);
    return newDoc;
  },

  async updateDocument(
    id: string,
    updates: {
      title?: string;
      content?: string;
      recordVersion?: boolean;
      versionSummary?: string;
    },
    userEmail: string
  ): Promise<{ success: boolean; doc?: DocumentItem; error?: string }> {
    const docs = await readAllDocs();
    const index = docs.findIndex(d => d.id === id);
    if (index === -1) return { success: false, error: "Document not found" };

    const currentDoc = docs[index];
    const emailLower = userEmail.toLowerCase();
    const isOwner = currentDoc.ownerEmail.toLowerCase() === emailLower;
    const collab = currentDoc.collaborators.find(c => c.email.toLowerCase() === emailLower);

    if (!isOwner && (!collab || collab.role !== 'editor')) {
      return { success: false, error: "Unauthorized: Viewers cannot edit this document." };
    }

    const updater = SEEDED_USERS.find(u => u.email.toLowerCase() === emailLower);
    const updaterName = updater?.name || userEmail.split('@')[0];

    const updatedDoc: DocumentItem = {
      ...currentDoc,
      title: updates.title !== undefined ? updates.title : currentDoc.title,
      content: updates.content !== undefined ? updates.content : currentDoc.content,
      plainText: updates.content !== undefined
        ? updates.content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 160)
        : currentDoc.plainText,
      updatedAt: new Date().toISOString(),
      lastModifiedBy: updaterName
    };

    if (updates.recordVersion) {
      updatedDoc.versions = [
        {
          id: `ver-${Date.now()}`,
          title: updatedDoc.title,
          content: updatedDoc.content,
          createdAt: new Date().toISOString(),
          createdBy: updaterName,
          summary: updates.versionSummary || "Saved changes"
        },
        ...updatedDoc.versions.slice(0, 19) // keep last 20 versions
      ];
    }

    docs[index] = updatedDoc;
    await writeAllDocs(docs);
    return { success: true, doc: updatedDoc };
  },

  async deleteDocument(id: string, userEmail: string): Promise<{ success: boolean; error?: string }> {
    const docs = await readAllDocs();
    const index = docs.findIndex(d => d.id === id);
    if (index === -1) return { success: false, error: "Document not found" };

    if (docs[index].ownerEmail.toLowerCase() !== userEmail.toLowerCase()) {
      return { success: false, error: "Only the document owner can delete this document." };
    }

    docs.splice(index, 1);
    await writeAllDocs(docs);
    return { success: true };
  },

  async shareDocument(
    id: string,
    targetEmail: string,
    role: UserRole,
    ownerOrEditorEmail: string
  ): Promise<{ success: boolean; doc?: DocumentItem; error?: string }> {
    const docs = await readAllDocs();
    const index = docs.findIndex(d => d.id === id);
    if (index === -1) return { success: false, error: "Document not found" };

    const currentDoc = docs[index];
    const callerEmail = ownerOrEditorEmail.toLowerCase();
    const isOwner = currentDoc.ownerEmail.toLowerCase() === callerEmail;

    if (!isOwner) {
      return { success: false, error: "Only the document owner can modify sharing permissions." };
    }

    const targetLower = targetEmail.trim().toLowerCase();
    if (targetLower === currentDoc.ownerEmail.toLowerCase()) {
      return { success: false, error: "User is already the document owner." };
    }

    const targetUser = SEEDED_USERS.find(u => u.email.toLowerCase() === targetLower);
    const targetName = targetUser?.name || targetLower.split('@')[0];
    const targetId = targetUser?.id || `usr_${Date.now()}`;

    const existingCollabIdx = currentDoc.collaborators.findIndex(
      c => c.email.toLowerCase() === targetLower
    );

    const updatedCollabs = [...currentDoc.collaborators];
    if (existingCollabIdx >= 0) {
      updatedCollabs[existingCollabIdx] = {
        ...updatedCollabs[existingCollabIdx],
        role,
        name: targetName
      };
    } else {
      updatedCollabs.push({
        userId: targetId,
        email: targetLower,
        name: targetName,
        role,
        addedAt: new Date().toISOString()
      });
    }

    docs[index] = {
      ...currentDoc,
      collaborators: updatedCollabs,
      updatedAt: new Date().toISOString()
    };

    await writeAllDocs(docs);
    return { success: true, doc: docs[index] };
  },

  async removeCollaborator(
    id: string,
    targetEmail: string,
    callerEmail: string
  ): Promise<{ success: boolean; doc?: DocumentItem; error?: string }> {
    const docs = await readAllDocs();
    const index = docs.findIndex(d => d.id === id);
    if (index === -1) return { success: false, error: "Document not found" };

    const currentDoc = docs[index];
    const isOwner = currentDoc.ownerEmail.toLowerCase() === callerEmail.toLowerCase();
    const isSelfRemoval = callerEmail.toLowerCase() === targetEmail.toLowerCase();

    if (!isOwner && !isSelfRemoval) {
      return { success: false, error: "Unauthorized to remove collaborator." };
    }

    docs[index] = {
      ...currentDoc,
      collaborators: currentDoc.collaborators.filter(
        c => c.email.toLowerCase() !== targetEmail.toLowerCase()
      ),
      updatedAt: new Date().toISOString()
    };

    await writeAllDocs(docs);
    return { success: true, doc: docs[index] };
  },

  async addAttachment(
    id: string,
    file: { name: string; size: number; type: string; dataUrl: string },
    userEmail: string
  ): Promise<{ success: boolean; doc?: DocumentItem; error?: string }> {
    const docs = await readAllDocs();
    const index = docs.findIndex(d => d.id === id);
    if (index === -1) return { success: false, error: "Document not found" };

    const currentDoc = docs[index];
    const emailLower = userEmail.toLowerCase();
    const isOwner = currentDoc.ownerEmail.toLowerCase() === emailLower;
    const collab = currentDoc.collaborators.find(c => c.email.toLowerCase() === emailLower);

    if (!isOwner && (!collab || collab.role !== 'editor')) {
      return { success: false, error: "You need editor privileges to attach files." };
    }

    const uploader = SEEDED_USERS.find(u => u.email.toLowerCase() === emailLower);
    const uploaderName = uploader?.name || userEmail.split('@')[0];

    const newAttachment = {
      id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: file.name,
      size: file.size,
      type: file.type,
      dataUrl: file.dataUrl,
      uploadedAt: new Date().toISOString(),
      uploadedBy: uploaderName
    };

    docs[index] = {
      ...currentDoc,
      attachments: [newAttachment, ...currentDoc.attachments],
      updatedAt: new Date().toISOString()
    };

    await writeAllDocs(docs);
    return { success: true, doc: docs[index] };
  },

  async removeAttachment(
    id: string,
    attachmentId: string,
    userEmail: string
  ): Promise<{ success: boolean; doc?: DocumentItem; error?: string }> {
    const docs = await readAllDocs();
    const index = docs.findIndex(d => d.id === id);
    if (index === -1) return { success: false, error: "Document not found" };

    const currentDoc = docs[index];
    const emailLower = userEmail.toLowerCase();
    const isOwner = currentDoc.ownerEmail.toLowerCase() === emailLower;
    const collab = currentDoc.collaborators.find(c => c.email.toLowerCase() === emailLower);

    if (!isOwner && (!collab || collab.role !== 'editor')) {
      return { success: false, error: "You need editor privileges to remove attachments." };
    }

    docs[index] = {
      ...currentDoc,
      attachments: currentDoc.attachments.filter(a => a.id !== attachmentId),
      updatedAt: new Date().toISOString()
    };

    await writeAllDocs(docs);
    return { success: true, doc: docs[index] };
  },

  async restoreVersion(
    id: string,
    versionId: string,
    userEmail: string
  ): Promise<{ success: boolean; doc?: DocumentItem; error?: string }> {
    const docs = await readAllDocs();
    const index = docs.findIndex(d => d.id === id);
    if (index === -1) return { success: false, error: "Document not found" };

    const currentDoc = docs[index];
    const emailLower = userEmail.toLowerCase();
    const isOwner = currentDoc.ownerEmail.toLowerCase() === emailLower;
    const collab = currentDoc.collaborators.find(c => c.email.toLowerCase() === emailLower);

    if (!isOwner && (!collab || collab.role !== 'editor')) {
      return { success: false, error: "Only editors can restore previous versions." };
    }

    const targetVer = currentDoc.versions.find(v => v.id === versionId);
    if (!targetVer) return { success: false, error: "Version not found" };

    const restorer = SEEDED_USERS.find(u => u.email.toLowerCase() === emailLower);
    const restorerName = restorer?.name || userEmail.split('@')[0];

    docs[index] = {
      ...currentDoc,
      title: targetVer.title,
      content: targetVer.content,
      updatedAt: new Date().toISOString(),
      lastModifiedBy: restorerName,
      versions: [
        {
          id: `ver-${Date.now()}`,
          title: targetVer.title,
          content: targetVer.content,
          createdAt: new Date().toISOString(),
          createdBy: restorerName,
          summary: `Restored version from ${new Date(targetVer.createdAt).toLocaleTimeString()}`
        },
        ...currentDoc.versions
      ]
    };

    await writeAllDocs(docs);
    return { success: true, doc: docs[index] };
  }
};
