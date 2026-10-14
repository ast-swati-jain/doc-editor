import { Suspense } from 'react';
import DocumentEditorClient from './DocumentEditorClient';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function DocumentEditorPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-100 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-semibold text-slate-600">Loading document...</p>
          </div>
        </div>
      }
    >
      <DocumentEditorClient id={id} />
    </Suspense>
  );
}
