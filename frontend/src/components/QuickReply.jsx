// Quick reply button
import React from 'react';

/**
 * @param {Object} props
 * @param {string} props.label
 * @param {() => void} props.onClick
 */
export default function QuickReply({ label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-xs md:text-sm px-3 py-1.5 rounded-full bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
    >
      {label}
    </button>
  );
}


