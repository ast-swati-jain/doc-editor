# Walkthrough Video Guide & Script

> **Assignment:** Ajaia Full Stack Product Engineer  
> **Candidate:** Swati Jain ([swati2003jain@gmail.com](mailto:swati2003jain@gmail.com))  
> **Target Video Duration:** 3 to 5 Minutes  
> **Recommended Tool:** Loom (https://www.loom.com) or unlisted YouTube video

---

## 🎬 Video Recording Link

```
https://youtu.be/placeholder-swati-jain-ajaia-doc-editor
```
*(Replace the URL above and in `WALKTHROUGH_URL.txt` with your public Loom or YouTube link before submitting to hiring teams).*

---

## 📋 3-5 Minute Walkthrough Script & Timing Outline

### 1. Introduction (0:00 - 0:45)
- Introduce yourself: *"Hi team, I'm Swati Jain, and this is my submission for the AI-Native Full Stack Product Engineer assessment at Ajaia."*
- State the goal: *"I built a lightweight collaborative document editor in Next.js 16, React 19, and TypeScript with an emphasis on product judgment, resilient persistence, sharing access control, and file handling."*
- Quick tour of the Dashboard: Show the candidate banner, template gallery (PRD, Meeting Notes, Sprint Roadmap), and the tab switcher between *All Documents*, *Owned by me*, and *Shared with me*.

### 2. Main Editing Flow & Autosave (0:45 - 1:45)
- Click into the *"✨ Welcome to Ajaia Doc Editor"* document.
- Demonstrate rich-text editing: type new text, format a heading, add bold/italic text, and create a bulleted list.
- Highlight the **Autosave status badge** in the header: show how it transitions from *Unsaved* -> *Saving...* -> *Saved* using a 1200ms debounce.
- Demonstrate inline title renaming.
- Show document metrics: word count, character count, and estimated reading time.

### 3. File Upload & Ingestion (1:45 - 2:30)
- **File Import**: Click the *Import File* button. Show drag-and-drop support for `.md` and `.txt`. Import a sample markdown file and show how headers, bolding, and lists are automatically converted into an editable draft.
- **Attachments**: Click the *Files* button in the top bar to open the slide-out attachment drawer. Show an attached file and upload an image/document attachment.

### 4. Sharing Model & User Switcher (2:30 - 3:30)
- Click the **Share** button.
- Point out Swati Jain as the Owner, and Alex Rivera (Editor) and Taylor Kim (Viewer) as collaborators.
- Demonstrate the **Simulated User Switcher** in the top-right:
  - Switch context to **Taylor Kim** (Viewer).
  - Show how the editor immediately switches to **Read-Only mode**: the toolbar is hidden, an amber *View-Only* banner appears, and typing is prevented.
  - Return to the dashboard and show how the *Owned by me* and *Shared with me* tabs dynamically update for Taylor.

### 5. Architecture, Stretches & AI Workflow (3:30 - 4:45)
- **Version History**: Open the *History* modal and demonstrate snapshot rollback.
- **Exporting**: Show 1-click export to Markdown (`.md`) and HTML (`.html`).
- **Engineering Decisions & Tradeoffs**: Explain why you chose Next.js App Router, zero-config resilient persistence, and a simulated user switcher over heavyweight OAuth.
- **AI-Native Workflow**: Briefly mention using AI for boilerplate acceleration and Markdown parser generation, while rejecting overly complex OAuth and fixing Next.js 16 SSR/Suspense edge cases with engineering judgment.
- Wrap up and thank the team!
