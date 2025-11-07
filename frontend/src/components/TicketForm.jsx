import React, { useState } from 'react';

const URGENCY_LEVELS = [
  { value: 'low', label: 'Low', description: 'Minor issues, non-critical features' },
  { value: 'medium', label: 'Medium', description: 'Important issues affecting workflow' },
  { value: 'high', label: 'High', description: 'Critical issues blocking operations' }
];

export default function TicketForm({ onClose, onSubmit }) {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [ticketId, setTicketId] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    company: '',
    title: '',
    description: '',
    urgency: 'medium'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await onSubmit(formData);
      setTicketId(result.ticketId);
      setSubmitted(true);
    } catch (error) {
      console.error('Error submitting ticket:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="fixed right-6 bottom-6 w-[500px] mx-auto rounded-2xl overflow-hidden shadow-2xl bg-white">
      <div className="bg-teal-600 text-white px-4 py-3 flex items-center justify-between">
        <div>
          <div className="font-semibold">Create Support Ticket</div>
          <div className="text-xs text-teal-100">We'll get back to you as soon as possible</div>
        </div>
        <button 
          onClick={onClose}
          className="px-2 py-1 rounded bg-white/10 hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white"
        >
          Close
        </button>
      </div>

      {submitted ? (
        <div className="p-6 space-y-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-teal-100 rounded-full mx-auto flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">Ticket Created Successfully!</h3>
            <p className="text-gray-600 mb-4">Your ticket has been created. You can track its progress using this ID:</p>
            <div className="bg-gray-100 rounded-lg p-3 mb-4">
              <span className="font-mono text-lg font-medium text-gray-800">{ticketId}</span>
            </div>
            <p className="text-sm text-gray-500 mb-6">Please save this ticket ID for future reference.</p>
            <div className="flex justify-center space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                Close
              </button>
              <button
                onClick={() => setSubmitted(false)}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                Create Another Ticket
              </button>
            </div>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Full Name */}
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
            Full Name *
          </label>
          <input
            type="text"
            id="fullName"
            name="fullName"
            required
            value={formData.fullName}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
          />
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email Address *
          </label>
          <input
            type="email"
            id="email"
            name="email"
            required
            value={formData.email}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
          />
        </div>

        {/* Company */}
        <div>
          <label htmlFor="company" className="block text-sm font-medium text-gray-700">
            Company
          </label>
          <input
            type="text"
            id="company"
            name="company"
            value={formData.company}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
          />
        </div>

        {/* Ticket Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            Ticket Title *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            required
            value={formData.title}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
            placeholder="Brief summary of the issue"
          />
        </div>

        {/* Issue Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Issue Description *
          </label>
          <textarea
            id="description"
            name="description"
            required
            rows={4}
            value={formData.description}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
            placeholder="Please provide detailed information about your issue"
          />
        </div>

        {/* Urgency Level */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Urgency Level *
          </label>
          <div className="space-y-2">
            {URGENCY_LEVELS.map(({ value, label, description }) => (
              <label key={value} className="flex items-center">
                <input
                  type="radio"
                  name="urgency"
                  value={value}
                  checked={formData.urgency === value}
                  onChange={handleChange}
                  className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300"
                />
                <span className="ml-3">
                  <span className="block text-sm font-medium text-gray-700">{label}</span>
                  <span className="block text-xs text-gray-500">{description}</span>
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 ${
              loading ? 'opacity-75 cursor-not-allowed' : ''
            }`}
          >
            {loading ? 'Submitting...' : 'Create Ticket'}
          </button>
        </div>
      </form>
      )}
    </div>
  );
}