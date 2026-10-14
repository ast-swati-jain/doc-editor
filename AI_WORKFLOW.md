# AI-Native Workflow Note

> **Candidate:** Swati Jain ([swati2003jain@gmail.com](mailto:swati2003jain@gmail.com))  
> **Role:** AI-Native Full Stack Product Engineer — Ajaia LLC  
> **Assignment:** Collaborative Document Editor

---

## 1. AI Tools Utilized

- **Antigravity AI Assistant & LLM (Gemini 3.8 Flash High)**: Used for architecture scaffolding, rapid boilerplate drafting, TypeScript data typing, Next.js route construction, and test case ideation.
- **Node.js Automated Test Runner (`node:test`)**: Automated verification engine to validate business logic and permission constraints.

---

## 2. Where AI Materially Sped Up My Work

1. **Boilerplate & TypeScript Schema Drafting**: Writing repetitive TypeScript interfaces (`DocumentItem`, `Collaborator`, `User`, `DocumentAttachment`, `DocumentVersion`) and Next.js route handlers was accelerated by ~4x, allowing me to focus on business rules rather than syntax typing.
2. **File Conversion Logic**: Generating the regex parser for Markdown-to-HTML conversion (`#` to `<h1>`, `**` to `<strong>`, `-` to `<li>`, code block wrapping) was implemented rapidly and verified against edge cases.
3. **Comprehensive Seed Data Generation**: Generating authentic product management and engineering documents (welcome guide, sprint backlog, design system tokens) that feel like real enterprise assets rather than "Lorem Ipsum" placeholders.
4. **Integration Test Suite Scaffolding**: Generating the five end-to-end integration tests in `tests/document-service.test.mjs` verifying CRUD, role permissions, and version rollbacks.

---

## 3. What AI-Generated Output I Changed or Rejected

As an AI-native engineer, **human judgment and domain verification are non-negotiable**. Key instances where I rejected or modified AI-generated suggestions:

1. **Rejected Over-Engineered OAuth for a 2-Hour Timebox**:
   - *AI Suggestion*: Integrate NextAuth with GitHub/Google OAuth providers.
   - *Reason for Rejection*: Requiring reviewers to configure client IDs or create multiple OAuth test accounts would create massive friction for evaluating the assignment. I replaced it with an in-app **Simulated User Switcher** with 4 distinct personas that test genuine authorization logic instantly.
2. **Fixed Next.js 16 Partial Prefetching / Static Generation Conflict**:
   - *AI Initial Output*: Used `use(params)` directly inside the root page component with `export const dynamic = 'force-dynamic'`.
   - *Build Error*: Next.js 16 compiler rejected `dynamic = 'force-dynamic'` when experimental `cacheComponents` was present.
   - *Fix Applied*: Restructured `app/document/[id]/page.tsx` into a clean Server Component with a `<Suspense>` boundary wrapping a dedicated `DocumentEditorClient.tsx` client component, ensuring flawless production compilation (`npm run build`).
3. **Corrected React 19 SSR Issues with Quill**:
   - *AI Initial Output*: Directly imported `ReactQuill` in a client component.
   - *Issue*: Quill attempts to access `document` during module evaluation, which triggers hydration crashes during SSR.
   - *Fix Applied*: Wrapped `react-quill-new` in `next/dynamic` with `{ ssr: false }` and an elegant loading skeleton, guaranteeing zero hydration mismatches.
4. **Enhanced Authorization Guardrails**:
   - AI code initially omitted role checks on file attachments and version rollbacks. I added explicit server-side checks in `lib/storage.ts` ensuring that **Viewers are forbidden from attaching files or rolling back versions**, returning HTTP 403.

---

## 4. Verification Methodology & Reliability

To ensure production-grade reliability within the timebox:
- **Zero-Error TypeScript Compilation**: Ran `npx tsc --noEmit` across all components and API handlers.
- **Automated Integration Testing**: Built and executed `npm test` covering:
  1. Document creation and retrieval.
  2. Owner full access vs. Editor privileges vs. Viewer 403 Forbidden enforcement.
  3. Non-owner deletion rejection.
  4. File upload and markdown parsing into structured HTML.
  5. File attachment association.
  6. Version snapshot capture and rollback.
- **Production Build Validation**: Ran full `npm run build` to verify Next.js Turbopack compilation and page optimization.
- **Live User Flow Testing**: Tested all interactions (user switching, sharing modals, file uploads, exports to Markdown/HTML) across the simulated user personas.
