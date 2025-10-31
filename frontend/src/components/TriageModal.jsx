// Presents a clarification modal to choose routing
import React from 'react';

/**
 * @param {Object} props
 * @param {()=>'knowledge'|'technical'} [props.onChoice]
 * @param {() => void} props.onClose
 */
export default function TriageModal({ onChoice, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
        <h4 className="text-lg font-semibold">Quick question</h4>
        <p className="text-gray-600 mt-1">Are you researching or looking to get a quote/demo?</p>
        <div className="mt-4 flex gap-3">
          <button
            className="px-4 py-2 rounded-lg bg-indigo-600 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            onClick={() => onChoice && onChoice('knowledge')}
          >
            Researching
          </button>
          <button
            className="px-4 py-2 rounded-lg bg-teal-600 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            onClick={() => onChoice && onChoice('technical')}
          >
            Technical help
          </button>
          <button
            className="ml-auto px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-gray-300"
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}


