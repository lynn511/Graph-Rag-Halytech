// Simple image/file uploader with preview for technical agent
import React, { useRef, useState } from 'react';

/**
 * @param {Object} props
 * @param {(files: Array<{name:string, url:string, type:string}>) => void} props.onAttach
 */
export default function AttachmentUploader({ onAttach }) {
  const inputRef = useRef(null);
  const [previews, setPreviews] = useState([]);

  const handleFiles = (files) => {
    const arr = Array.from(files).map((f) => ({
      name: f.name,
      type: f.type || 'application/octet-stream',
      url: URL.createObjectURL(f),
      _file: f,
    }));
    setPreviews(arr);
  };

  const handleAttach = () => {
    onAttach(previews.map(({ name, url, type }) => ({ name, url, type })));
    setPreviews([]);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="border rounded-lg p-3 bg-gray-50">
      <div className="flex items-center gap-2">
        <input
          ref={inputRef}
          type="file"
          accept="image/*,.log,.txt,.json"
          multiple
          aria-label="Upload attachments"
          onChange={(e) => handleFiles(e.target.files)}
          className="text-sm"
        />
        <button
          type="button"
          onClick={handleAttach}
          disabled={!previews.length}
          className="ml-auto px-3 py-1.5 rounded bg-teal-600 text-white text-sm disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-teal-500"
        >
          Attach & send
        </button>
      </div>
      {!!previews.length && (
        <div className="mt-3 grid grid-cols-3 gap-2">
          {previews.map((p, i) => (
            <div key={i} className="border rounded overflow-hidden bg-white">
              {p.type.startsWith('image/') ? (
                <img src={p.url} alt={p.name} className="w-full h-20 object-cover" />
              ) : (
                <div className="p-2 text-xs truncate">{p.name}</div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


