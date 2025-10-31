// Displays a list of citations/links for RAG responses
import React from 'react';

/**
 * @param {Object} props
 * @param {Array<{title:string,url:string}>} props.citations
 */
export default function CitationList({ citations = [] }) {
  if (!citations.length) return null;
  return (
    <div className="mt-2 text-xs">
      <div className="font-medium text-gray-700">Sources</div>
      <ul className="list-disc pl-5 mt-1 space-y-1">
        {citations.map((c, idx) => (
          <li key={idx}>
            <a
              href={c.url}
              target="_blank"
              rel="noreferrer"
              className="text-indigo-600 hover:underline"
            >
              {c.title}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}


