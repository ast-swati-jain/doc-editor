# Assignment Submission: AI-Native Full Stack Product Engineer

> **Company:** Ajaia LLC  
> **Candidate:** Swati Jain  
> **Email:** [swati2003jain@gmail.com](mailto:swati2003jain@gmail.com)  
> **Application:** Collaborative Document Editor  
> **Live Product URL:** [https://doc-editor-coral-xi.vercel.app](https://doc-editor-coral-xi.vercel.app) *(or local `http://localhost:3000`)*  
> **Walkthrough Video URL:** [https://www.loom.com/share/6b5c511881a545c79e7799effc6f0ed0](https://www.loom.com/share/6b5c511881a545c79e7799effc6f0ed0)  

---

## 📦 What Is Included in This Submission

1. **Source Code**: Complete Next.js 16 (App Router), React 19, TypeScript codebase.
2. **[README.md](file:///c:/Projects/doc-editor/README.md)**: Local setup instructions, command cheat sheet, feature matrix, and seeded accounts.
3. **[ARCHITECTURE.md](file:///c:/Projects/doc-editor/ARCHITECTURE.md)**: System design, prioritization, key tradeoffs, and security model.
4. **[AI_WORKFLOW.md](file:///c:/Projects/doc-editor/AI_WORKFLOW.md)**: Practical AI usage, where AI sped up development, rejected suggestions, and verification procedures.
5. **[SUBMISSION.md](file:///c:/Projects/doc-editor/SUBMISSION.md)**: This summary file detailing completion status, credentials, and future scope.
6. **[WALKTHROUGH.md](file:///c:/Projects/doc-editor/WALKTHROUGH.md)** & **[WALKTHROUGH_URL.txt](file:///c:/Projects/doc-editor/WALKTHROUGH_URL.txt)**: Walkthrough recording link and script.
7. **Automated Integration Tests**: Run with `npm test` (5/5 tests passing).

---

## 🔑 Test Accounts & Sharing Review Instructions

No registration or passwords required. Use the **Simulated User Switcher** in the top-right header:

| Test Persona | Email | How to Test Permissions |
| :--- | :--- | :--- |
| **Swati Jain** *(Candidate)* | `swati2003jain@gmail.com` | **Owner**: Full edit, rename, share, delete, attachment upload, and version rollback on *"✨ Welcome to Ajaia Doc Editor"*. |
| **Alex Rivera** | `alex@ajaia.internal` | **Editor**: Can edit content on Swati's doc; owner of *"🎯 Q4 Engineering Sprint & Milestones"*. Cannot delete Swati's doc. |
| **Taylor Kim** | `taylor@ajaia.internal` | **Viewer**: Read-only access to Swati's doc. When switched, the editor canvas is locked, toolbar is hidden, and an amber *"Read Only"* banner is displayed. |
| **Jordan Lee** | `jordan@ajaia.internal` | **Editor / Owner**: Editor on Welcome doc; Owner of *"🔒 Security, Compliance & Audit Review"*. Available for testing collaborative permissions. |

---

## ⚡ What Is Working (End-to-End)

1. **Document Creation & Editing**:
   - Create blank documents or start from one of 3 pre-built templates (PRD, Meeting Notes, Sprint Roadmap).
   - Rich-text formatting: Bold, Italic, Underline, Headings (H1/H2/H3), Lists (bulleted & numbered), Code blocks, Blockquotes, Text alignment, and Formatting clears.
   - Debounced autosave (1200ms) with visual status indicators (`Saved`, `Saving...`, `Unsaved`).
   - Word count, character count, and reading time metrics.
   - Inline title renaming with auto-commit.
2. **File Ingestion**:
   - **File Import**: Drag & drop or browse `.txt`, `.md`, `.html`, or `.json` to convert directly into an editable document draft with headers, bolding, and lists preserved.
   - **Document Attachments**: Upload auxiliary files (images, PDFs, documents up to 10MB) via the slide-out attachment drawer with download capabilities.
3. **Sharing & Access Control**:
   - Modal to invite collaborators by email with granular roles (**Editor** vs. **Viewer**).
   - Document Owner badge vs. Collaborator pills.
   - Immediate read-only enforcement for Viewers (Quill editing disabled, toolbar hidden, warning banner).
   - "Copy document link" button with feedback toast.
4. **Persistence**:
   - Zero-config JSON persistence in `data/documents.json` that survives server restarts.
   - In-memory caching for sub-millisecond API response times.
   - Optional MongoDB / Mongoose connection if `MONGODB_URI` is provided in environment.
5. **Quality & Stretches**:
   - **Version History & Rollback**: Automatic and manual snapshot recording with one-click restore.
   - **Export**: Export document directly to Markdown (`.md`), HTML (`.html`), or Print/PDF.
   - 5 automated integration tests (`npm test`).
   - Clean production build (`npm run build`).

---

## 🛑 What Was Intentionally Scoped Out / Incomplete

- **Real-Time Operational Transformation (CRDT / WebSockets)**: Simultaneous multi-cursor typing was intentionally deprioritized to guarantee rock-solid state management, version snapshots, and error-free execution within the 2-hour window.
- **In-Line Threaded Comments**: Deprioritized in favor of document-level attachments and version snapshots.

---

## 🔮 What I Would Build with Another 2-4 Hours

1. **Live Multi-User Cursors**: Integrate `y-quill` and a WebSocket provider (e.g., Liveblocks or Hocuspocus) to display active collaborators' cursor positions and color-coded selections in real time.
2. **Threaded Inline Comments**: Add selection-based comment pins where teammates can leave feedback, reply, and mark threads as resolved.
3. **Enterprise Role Permissions**: Add granular permissions such as "Can Comment Only" and "Expiring Share Links".
4. **Rich PDF Export**: Generate styled multi-page PDF documents with headers and footers using Puppeteer.
