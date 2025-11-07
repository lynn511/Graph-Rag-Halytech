// Landing page with hero and AgentCard grid
import React, { useState } from 'react';
import AgentCard from '../components/AgentCard.jsx';
import ChatWindow from '../components/ChatWindow.jsx';
import TicketForm from '../components/TicketForm.jsx';
import { submitTicket } from '../lib/api/tickets';
import { useChat } from '../contexts/ChatContext.jsx';
import botIcon from '../assets/svg-ai-agent-bot-icon.svg';
import featureIcon from '../assets/vector.svg';
import image1 from '../assets/image1.png';
import image2 from '../assets/image2.png';
import image3 from '../assets/image3.png';

export default function Home() {
  const { switchAgent } = useChat();
  const [openAgent, setOpenAgent] = useState(null); // 'technical' | 'knowledge' | null

  const handleOpen = (agentType) => {
    switchAgent(agentType);
    setOpenAgent(agentType);
  };

  const handleClose = () => setOpenAgent(null);

  return (
    <div className="w-full">
      <section className="relative overflow-hidden rounded-none md:rounded-2xl bg-gradient-to-br from-indigo-600 to-teal-500 text-white px-10 py-24 mb-24">
        <div className="relative z-10 max-w-8xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-2 items-center">
          {/* Left: text */}
          <div className="ml-20">
            <h2 className="text-5xl md:text-8xl font-bold mb-4">Customer Support</h2>
            <p className="text-indigo-50 text-xl max-w-3xl">Get instant answers about our company or receive hands-on tech support, available 24/7 with file attachments, real-time updates, and full ticket tracking.</p>
            <div className="mt-6 flex items-center gap-4">
              <button className="px-6 py-3 rounded-lg bg-white text-indigo-700 text-md md:text-base">Ask a question</button>
              <button className="px-6 py-3 rounded-lg bg-black/10 text-white text-md md:text-base">Get technical help</button>
            </div>
          </div>
          {/* Right: local SVG icon */}
          <div className="flex md:justify-center">
            <img
              src={botIcon}
              alt="AI Agent Bot Icon"
              className="w-60 h-60 md:w-80 md:h-80 rounded-xl bg-white/10 p-5 shadow-lg"
            />
          </div>
        </div>
        <div className="absolute -right-10 -top-10 w-64 h-64 rounded-full bg-white/10 blur-3xl"></div>
        <div className="absolute -left-10 -bottom-10 w-72 h-72 rounded-full bg-black/10 blur-3xl"></div>
      </section>

      

      {/* Feature bar moved below cards */}

      <section className="px-10 mt-24 mb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl">
          <AgentCard
            title="Technical Support"
            description="Troubleshooting, attachments, and ticket creation."
            badge="Ticket support"
            theme="technical"
            ctaLabel="Create ticket"
            details={[
              'Attach images, logs, and files',
              'Guided troubleshooting steps',
              'Auto-generated ticket ID and tracking',
            ]}
            onStart={() => handleOpen('technical')}
          />
          <AgentCard
            title="Company Info (Virtual Guide)"
            description="Ask about pricing, hours, features with cited answers."
            badge="Knowledge RAG"
            theme="knowledge"
            ctaLabel="Start knowledge"
            details={[
              'Cited responses with source links',
              'Quick reply suggestions',
              'Lead capture when interested',
            ]}
            onStart={() => handleOpen('knowledge')}
          />
        </div>
      </section>

      

      {/* Feature bar (distinct palette) */}
      <section className="px-0 mt-24 mb-24">
        <div className="w-full bg-gradient-to-r from-sky-600 to-purple-600">
          <div className="max-w-7xl mx-auto px-6 md:px-10 py-9">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 md:gap-12">
              {[
                'Answers product question',
                'Personalized brand tone & Knowledge',
                'Goes live within minutes',
                'Responds instantly and naturally',
              ].map((label, i) => (
                <div key={i} className="flex items-center gap-6 text-white py-3">
                  <img src={featureIcon} alt="feature" className="w-7 h-7" />
                  <span className="text-xl md:text-2xl font-semibold drop-shadow leading-snug">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>



      {/* FAQ removed as requested */}

      {/* 24/7 Customer Support Section */}
      <section className="px-4 md:px-10 mt-24 mb-24">
        <div className="max-w-[1400px] mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-3xl md:text-4xl font-bold text-gray-900">24/7 Customer Support - with our AI agents</h3>
            <p className="text-gray-600 mt-3 text-base">Deliver instant help, qualify leads, and scale support without scaling costs.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* Card 1 */}
            <div className="rounded-2xl border bg-white/90 glass p-8 shadow-sm hover:shadow-md transition min-h-[520px] flex flex-col">
              <h4 className="text-2xl md:text-3xl font-semibold text-gray-900">Reduce Operational Costs</h4>
              <p className="text-gray-700 text-base md:text-lg mt-3">Automate routine customer questions and cut help-desk workload by up to 40%.</p>
              <div className="mt-6 rounded-xl overflow-hidden border">
                <img
                  src={image1}
                  alt="Reduce Operational Costs"
                  className="w-full h-64 object-cover"
                />
              </div>
            </div>

            {/* Card 2 */}
            <div className="rounded-2xl border bg-white/90 glass p-8 shadow-sm hover:shadow-md transition min-h-[520px] flex flex-col">
              <h4 className="text-2xl md:text-3xl font-semibold text-gray-900">Boost Conversion Rates</h4>
              <p className="text-gray-700 text-base md:text-lg mt-3">Qualify visitors in real time and guide hot leads straight to checkout or a meeting.</p>
              <div className="mt-6 rounded-xl overflow-hidden border">
                <img
                  src={image2}
                  alt="Boost Conversion Rates"
                  className="w-full h-64 object-cover"
                />
              </div>
            </div>

            {/* Card 3 */}
            <div className="rounded-2xl border bg-white/90 glass p-8 shadow-sm hover:shadow-md transition min-h-[520px] flex flex-col">
              <h4 className="text-2xl md:text-3xl font-semibold text-gray-900">Save Hours Daily</h4>
              <p className="text-gray-700 text-base md:text-lg mt-3">Auto-answer FAQs, capture leads, live support.</p>
              <div className="mt-6 rounded-xl overflow-hidden border">
                <img
                  src={image3}
                  alt="Save Hours Daily"
                  className="w-full h-64 object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Display either ChatWindow or TicketForm based on agent type */}
      {openAgent && (
        <div className="fixed bottom-5 right-5 z-50 w-full max-w-[380px] md:max-w-[420px] animate-[fadeIn_.2s_ease-out]">
          {openAgent === 'technical' ? (
            <TicketForm 
              onClose={handleClose}
              onSubmit={async (data) => {
                try {
                  const response = await submitTicket(data);
                  return response; // Return the response to show the ticket ID
                } catch (error) {
                  console.error('Failed to submit ticket:', error);
                  throw error; // Re-throw to show error in the form
                }
              }}
            />
          ) : (
            <ChatWindow agentType={openAgent} onClose={handleClose} />
          )}
        </div>
      )}
    </div>
  );
}


