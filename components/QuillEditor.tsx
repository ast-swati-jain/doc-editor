'use client';

import React, { useMemo } from 'react';
import dynamic from 'next/dynamic';

interface QuillEditorProps {
  value: string;
  onChange: (content: string) => void;
  readOnly?: boolean;
  placeholder?: string;
}

// Dynamically import ReactQuill to prevent SSR window/document is not defined errors
const ReactQuill = dynamic(
  async () => {
    const { default: RQ } = await import('react-quill-new');
    return function QuillComponent({ forwardedRef, ...props }: any) {
      return <RQ ref={forwardedRef} {...props} />;
    };
  },
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center min-h-[600px] text-slate-400">
        <div className="animate-pulse flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm">Loading rich-text canvas...</p>
        </div>
      </div>
    )
  }
);

export default function QuillEditor({
  value,
  onChange,
  readOnly = false,
  placeholder = "Start typing your document..."
}: QuillEditorProps) {
  const modules = useMemo(
    () => ({
      toolbar: readOnly
        ? false
        : [
            [{ header: [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ color: [] }, { background: [] }],
            [{ list: 'ordered' }, { list: 'bullet' }],
            [{ align: [] }],
            ['blockquote', 'code-block'],
            ['clean']
          ]
    }),
    [readOnly]
  );

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'color', 'background',
    'list',
    'align',
    'blockquote', 'code-block'
  ];

  return (
    <div className={`doc-editor-container ${readOnly ? 'read-only-mode' : ''}`}>
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        readOnly={readOnly}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
      />
    </div>
  );
}
