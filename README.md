# Ajaia Collaborative Document Editor

> **Ajaia LLC — Full Stack Product Engineer Assessment**  
> **Candidate:** Swati Jain ([swati2003jain@gmail.com](mailto:swati2003jain@gmail.com))  
> **Built with:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS, React Quill New, and Node.js.

A lightweight, modern collaborative document editor inspired by Google Docs and Notion. Built from scratch with an emphasis on product judgment, full-stack execution, resilient zero-config persistence, role-based sharing, and file upload capabilities.

---

## 🚀 Key Feature Matrix

| Requirement | Implementation Details | Status |
| :--- | :--- | :---: |
| **1. Document Creation & Editing** | Create blank docs or from templates (PRD, Meeting Notes, Sprint Roadmap). Rich text editing with bold, italic, underline, headings (H1, H2, H3), ordered/unordered lists, code blocks, blockquotes, and text alignment. Debounced autosave with visual status badge (`Saved`, `Saving...`, `Unsaved`). Document renaming and live word/character/reading-time statistics. | **Complete** |
| **2. File Upload & Import** | **Dual Upload Capability**: <br/>• **Import as Document**: Upload `.txt`, `.md`, `.html`, or `.json` to parse and convert into an editable document draft.<br/>• **Document Attachments**: Associate files (PDFs, images, documents up to 10MB) directly to a document via the slide-out attachment drawer with download capabilities. | **Complete** |
| **3. Granular Sharing Model** | Distinct roles (**Owner**, **Editor**, **Viewer**). Owner can invite teammates by email, adjust permissions, remove collaborators, and copy share links. Viewers get automatic read-only enforcement (toolbar disabled, read-only banner). Visible distinction between **Owned by me** and **Shared with me** filter tabs. | **Complete** |
| **4. Resilient Persistence** | Dual-tier persistence engine: zero-configuration file-based storage (`data/documents.json`) for seamless local evaluation and CI, with optional MongoDB/Mongoose connection if `MONGODB_URI` is provided. Data survives restarts and page reloads. | **Complete** |
| **5. Product & Engineering Quality** | Strict TypeScript typing (zero errors), 5 automated integration tests (`npm test`), comprehensive error handling, toast alerts, clean responsive UI, and full production build readiness (`npm run build`). | **Complete** |
| **Stretch Features** | • **Version History & Rollback**: Automatic and manual snapshot recording with one-click restore.<br/>• **Exporting**: Export to Markdown (`.md`), HTML (`.html`), and Print / PDF.<br/>• **Simulated User Switcher**: 1-click account switching in the navigation bar to test multi-user sharing without requiring multiple browsers. | **Complete** |

---

## 👥 Seeded Test Accounts (Instant Role Switching)

To make reviewer evaluation effortless, the application includes a **Simulated User Switcher** in the top navigation bar. You do not need to register or manage multiple incognito tabs. Simply click the profile dropdown in the top-right to switch contexts:

| Name | Email | Default Persona & Role |
| :--- | :--- | :--- |
| **Swati Jain** *(Active)* | `swati2003jain@gmail.com` | Candidate & Product Engineer. Owns the Welcome Doc; Editor on Alex's roadmap. |
| **Alex Rivera** | `alex@ajaia.internal` | Engineering Lead. Owns the Q4 Sprint Doc; Editor on Swati's doc. |
| **Taylor Kim** | `taylor@ajaia.internal` | Product Designer. Owns Design System Doc; Viewer (read-only) on Swati's doc. |
| **Jordan Lee** | `jordan@ajaia.internal` | Security & Compliance Lead. Owns Security Doc; Editor on Swati's doc. |

---

## 🛠️ Local Setup & Run Instructions

### Prerequisites
- **Node.js**: v18.17+ or v20+ or v22+ (`node -v`)
- **npm**: v9+ (`npm -v`)

### 1. Installation
Clone the repository and install dependencies:
```bash
git clone <repo-url>
cd doc-editor
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser. The app starts immediately with pre-seeded documents.

### 3. Run Automated Tests
Execute the automated test suite verifying CRUD, sharing permissions, file import parsing, attachments, and version restoration:
```bash
npm test
```

### 4. Build for Production
```bash
npm run build
npm start
```

---

## 📁 Supported File Import Formats

The **Import File** modal accepts:
- `.txt` (Plain text): Converted into formatted paragraphs.
- `.md` / `.markdown` (Markdown): Headings, bold/italic formatting, lists, blockquotes, and code blocks are automatically parsed into rich text.
- `.html` (HTML): Web markup preserved and editable.
- `.json` (Structured JSON): Document content schema.
- **Attachments**: Any file type (images, PDFs, documents) up to 10MB can be attached via the document attachment drawer.

---

## 🏛️ Project Structure

```
doc-editor/
├── app/
│   ├── api/documents/               # REST API endpoints (CRUD, share, attachments, import, versions)
│   │   ├── route.ts                 # List user documents & create document
│   │   ├── [id]/route.ts            # Get, update, delete document
│   │   ├── [id]/share/route.ts      # Grant/modify/revoke collaborator access
│   │   ├── [id]/attachments/route.ts# Upload file attachments
│   │   ├── [id]/versions/restore/route.ts # Rollback to previous version
│   │   └── import/route.ts          # Parse and convert .txt/.md/.html/.json files
│   ├── document/[id]/               # Rich-text editor view
│   │   ├── page.tsx                 # Server component with Suspense boundary
│   │   └── DocumentEditorClient.tsx # Client editor controller with autosave
│   ├── layout.tsx                   # Root layout with UserProvider & typography
│   ├── page.tsx                     # Dashboard with template gallery & document grid
│   └── globals.css                  # Custom styling & Quill theme overrides
├── components/
│   ├── Navbar.tsx                   # Top bar with simulated user switcher
│   ├── QuillEditor.tsx              # Dynamic SSR-safe rich text canvas
│   ├── ShareModal.tsx               # Access management modal
│   ├── ImportModal.tsx              # Drag-and-drop file import modal
│   ├── AttachmentsDrawer.tsx        # Slide-over document attachments panel
│   └── VersionsModal.tsx            # Snapshot history & restore dialog
├── context/
│   └── UserContext.tsx              # React Context for simulated user switching
├── data/
│   └── documents.json               # Persistent document database
├── lib/
│   ├── types.ts                     # TypeScript models for Document, User, Collaborator
│   └── storage.ts                   # Resilient storage layer with access enforcement
├── tests/
│   └── document-service.test.mjs    # Automated integration test suite
├── ARCHITECTURE.md                  # System architecture, decisions & tradeoffs
├── AI_WORKFLOW.md                   # AI tool usage, rejected suggestions & verification
├── SUBMISSION.md                    # Assessment submission summary
└── WALKTHROUGH.md                   # Video walkthrough script and link
```

---

## 📄 License
Created for candidate evaluation by Swati Jain for Ajaia LLC.
