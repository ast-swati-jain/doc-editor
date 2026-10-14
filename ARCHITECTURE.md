# Architecture & Product Engineering Note

> **Candidate:** Swati Jain ([swati2003jain@gmail.com](mailto:swati2003jain@gmail.com))  
> **Role:** AI-Native Full Stack Product Engineer — Ajaia LLC

---

## 1. Executive Summary & Design Philosophy

When given an ambiguous 4-hour challenge to build a lightweight collaborative document editor inspired by Google Docs, product engineers face a critical tension: **breadth versus depth**. Attempting to build full operational transformation (CRDT/Yjs) or enterprise-grade OAuth in 4 hours invariably leads to half-baked, brittle prototypes that fail reviewer testing.

Instead, I prioritized **shipping a coherent, delightful, end-to-end product slice** that works without friction:
1. **Core Editing Flow**: A responsive, paper-like rich text editor with debounced auto-saving, visual save status indicator, and formatting versatility.
2. **Flexible File Ingestion**: Both importing file content into editable documents (`.txt`, `.md`, `.html`, `.json`) and attaching auxiliary files directly to documents.
3. **Realistic Access Control & Reviewer UX**: Granular permissions (Owner, Editor, Viewer) paired with an instant **Simulated User Switcher** so reviewers can verify permission boundaries in seconds rather than juggling multiple sessions.
4. **Resilient Zero-Config Persistence**: A unified storage abstraction that requires zero external setup or database credentials to run locally or in automated testing, while supporting MongoDB/Mongoose connection when an environment variable is present.

---

## 2. System Architecture & Component Diagram

```
┌────────────────────────────────────────────────────────────────────────┐
│                          Client Application                            │
│                                                                        │
│   ┌─────────────────────┐   ┌──────────────────────────────────────┐   │
│   │   Dashboard View    │   │         Document Editor View         │   │
│   │ • Template Gallery  │   │ • Quill Rich Text Canvas             │   │
│   │ • Filter Tabs       │   │ • Inline Title Renaming              │   │
│   │ • Document Cards    │   │ • Debounced Autosave (1200ms)        │   │
│   │ • Search & Filter   │   │ • Word / Reading Time Stats          │   │
│   └──────────┬──────────┘   └──────────────────┬───────────────────┘   │
│              │                                 │                       │
│   ┌──────────┴─────────────────────────────────┴───────────────────┐   │
│   │             Simulated User Context (UserContext.tsx)           │   │
│   │  Swati Jain (Candidate) | Alex Rivera | Taylor Kim | Jordan    │   │
│   └────────────────────────────────┬───────────────────────────────┘   │
└────────────────────────────────────┼───────────────────────────────────┘
                                     │ JSON HTTP Requests
                                     ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        Next.js 16 App Router API                       │
│                                                                        │
│   • GET/POST    /api/documents             (List & Create)             │
│   • GET/PATCH   /api/documents/[id]        (Fetch & Update with Auth)  │
│   • DELETE      /api/documents/[id]        (Owner Delete)              │
│   • POST/DELETE /api/documents/[id]/share  (Collaborator Management)   │
│   • POST        /api/documents/[id]/attach (File Attachments)          │
│   • POST        /api/documents/import      (Multi-Format File Parser)  │
│   • POST        /api/documents/[id]/restore(Version Snapshot Rollback) │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │
                                     ▼
┌────────────────────────────────────────────────────────────────────────┐
│                      Persistence & Access Engine                       │
│                               (lib/storage.ts)                         │
│                                                                        │
│   • Role Resolution: Owner vs. Editor vs. Viewer                       │
│   • In-Memory Fast Cache + Atomic File Sync (`data/documents.json`)    │
│   • Optional Mongoose Adapter (when `MONGODB_URI` is provided)         │
│   • Automatic Version History Snapshots & Attachment Storage           │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Key Prioritization & Tradeoff Decisions

### 1. Simulated User Switcher vs. Real Authentication
- **Decision**: Implemented an in-app User Switcher with 4 seeded personas (Swati, Alex, Taylor, Jordan).
- **Rationale**: Real authentication (OAuth / JWT / NextAuth) adds setup friction for reviewers (signups, email verification, managing multiple browser sessions). The simulated switcher demonstrates authentic authorization logic—differentiating owners, editors, and read-only viewers—while allowing reviewers to test sharing in a single click.

### 2. File Ingestion: Dual Capability (Import vs. Attachments)
- **Decision**: Supported both importing files as new documents (`.md`, `.txt`, `.html`, `.json`) and attaching supplementary files (images, PDFs, documents up to 10MB) directly to existing drafts.
- **Rationale**: In real work environments, teams both start drafts from existing notes and attach reference documents to specifications. Supporting both patterns demonstrates complete file handling capability.

### 3. Storage Layer: Zero-Config Resilient Store
- **Decision**: Structured `lib/storage.ts` to write to a local JSON database with in-memory caching, seeded on first boot, with fallback to memory and optional MongoDB connection.
- **Rationale**: Reviewers should never fail to evaluate an application due to missing local database daemons or expiring cloud database tokens. Zero-config guarantees 100% test reproducibility.

### 4. Debounced Autosave vs. Manual Save
- **Decision**: Implemented a 1200ms debounced autosave combined with manual `Ctrl+S` / `Cmd+S` shortcuts and version snapshot recording.
- **Rationale**: Continuous autosave on every keystroke exhausts network I/O and creates thrashing. Debouncing provides the modern Google Docs "Saved to cloud" feel while conserving resources.

---

## 4. What Was Intentionally Deprioritized & Future Scope

### Deprioritized for the 2-Hour Timebox:
1. **Real-Time Operational Transformation (OT / CRDT)**: True character-by-character real-time multi-cursor collaboration requires WebSocket infrastructure (e.g., Yjs / Liveblocks). In a tight timebox, fake or buggy real-time sync is worse than rock-solid state management and version rollback.
2. **Comment Threads & In-Line Annotations**: Rich-text highlighting for inline commenting was scoped out in favor of document-level attachments and version snapshots.
3. **Complex Nested Folder Hierarchies**: Replaced with clean tab filtering (**Owned by me**, **Shared with me**, **All Documents**) and live search.

### What I Would Build with Another 2-4 Hours:
1. **WebSocket Collaboration**: Integrate a Yjs server with Quill binding for multi-user cursor presences.
2. **In-Line Comments**: Threaded commenting on selected text ranges with resolved/unresolved status.
3. **PDF Generation Service**: Server-side rendering to high-fidelity PDF using Puppeteer or `@react-pdf/renderer`.
4. **Activity Audit Feed**: Real-time event stream showing when teammates opened, edited, or commented on documents.
