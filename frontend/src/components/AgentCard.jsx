// Reusable card with icon, desc, CTA, themed per agent
import React from 'react';

/**
 * @param {Object} props
 * @param {string} props.title
 * @param {string} props.description
 * @param {string} props.badge
 * @param {'technical'|'knowledge'} props.theme
 * @param {() => void} props.onStart
 * @param {string} [props.ctaLabel]
 * @param {string[]} [props.details]
 */
export default function AgentCard({ title, description, badge, theme = 'knowledge', onStart, ctaLabel, details = [] }) {
  const themeClasses = theme === 'technical'
    ? 'border-teal-200 hover:border-teal-300 bg-white'
    : 'border-indigo-200 hover:border-indigo-300 bg-white';
  const badgeClasses = theme === 'technical'
    ? 'bg-teal-50 text-teal-700 border border-teal-200'
    : 'bg-indigo-50 text-indigo-700 border border-indigo-200';
  const btnClasses = theme === 'technical'
    ? 'bg-teal-600 hover:bg-teal-700 focus:ring-teal-500'
    : 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500';
  const iconBg = theme === 'technical' ? 'bg-teal-600/10 text-teal-700' : 'bg-indigo-600/10 text-indigo-700';
  const icon = theme === 'technical' ? '🛠️' : '💡';

  return (
    <div className={`w-full max-w-xl min-h-[550px] rounded-2xl border p-7 shadow-sm transition-all hover:shadow-md ${themeClasses} flex flex-col`}>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${iconBg} text-lg`}>{icon}</div>
          <div>
            <h3 className="text-4xl font-semibold mb-1">{title}</h3>
            <span className={`inline-block text-[15px] px-2 py-0.5 rounded-full ${badgeClasses}`}>{badge}</span>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="mt-4 text-2xl text-gray-700 flex-1 flex flex-col">
        <p className="text-gray-600 mb-4 leading-relaxed">{description}</p>
        {details.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {details.map((d, i) => (
              <span
                key={i}
                className="text-md px-2.5 py-1 rounded-full bg-gray-100 text-gray-700 border"
              >
                {d}
              </span>
            ))}
          </div>
        )}
        <div className="mt-auto h-px bg-gray-100" />
      </div>

      {/* Footer */}
      <div className="pt-4">
        <button
          onClick={onStart}
          className={`w-full text-white px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 ${btnClasses}`}
        >
          {ctaLabel || 'Start chat'}
        </button>
      </div>
    </div>
  );
}


