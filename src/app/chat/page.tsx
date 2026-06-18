'use client';

import React, { useState, useEffect, useRef } from 'react';
import Navbar from '@/components/navbar/Navbar';
import Footer from '@/components/footer/Footer';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/useAuthStore';
import { useMarketStore } from '@/store/useMarketStore';
import {
  MessageSquare,
  Send,
  FileText,
  CheckCircle,
  XCircle,
  Paperclip,
  TrendingDown,
  ChevronRight,
  Shield,
  Loader,
  RefreshCw,
  Clock,
  ArrowLeftRight
} from 'lucide-react';

import { API_BASE_URL } from '@/lib/config';

export default function ChatPage() {
  const { user, accessToken } = useAuthStore();
  const { currencySymbol } = useMarketStore();

  const [negotiations, setNegotiations] = useState<any[]>([]);
  const [selectedNeg, setSelectedNeg] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  // Chat message inputs
  const [typedMessage, setTypedMessage] = useState('');
  const [attachmentUrl, setAttachmentUrl] = useState('');
  const [showAttachmentInput, setShowAttachmentInput] = useState(false);

  // Counter offer state
  const [counterPrice, setCounterPrice] = useState('');
  const [showCounterInput, setShowCounterInput] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user && accessToken) {
      fetchNegotiations();
    }
  }, [accessToken]);

  useEffect(() => {
    if (selectedNeg) {
      fetchMessages(selectedNeg.id);
      // Auto-poll messages every 4 seconds for a simulated real-time experience
      const timer = setInterval(() => {
        fetchMessages(selectedNeg.id, true);
      }, 4000);
      return () => clearInterval(timer);
    }
  }, [selectedNeg]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchNegotiations = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/agri/negotiations`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const result = await response.json();
      if (response.ok) {
        setNegotiations(result.data || []);
        // Auto select from URL query param if present
        const urlParams = new URLSearchParams(window.location.search);
        const urlId = urlParams.get('id');
        if (urlId) {
          const matched = result.data.find((n: any) => n.id === urlId);
          if (matched) setSelectedNeg(matched);
        } else if (result.data.length > 0) {
          setSelectedNeg(result.data[0]);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (negId: string, isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/agri/negotiations/${negId}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const result = await response.json();
      if (response.ok) {
        setMessages(result.data.messages || []);
        // Keep status updated
        if (result.data.status !== selectedNeg?.status || result.data.targetPrice !== selectedNeg?.targetPrice) {
          setSelectedNeg(result.data);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      if (!isSilent) setLoading(false);
    }
  };

  // Send message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedNeg || (!typedMessage.trim() && !attachmentUrl.trim())) return;

    setSending(true);
    try {
      const response = await fetch(`${API_BASE_URL}/agri/negotiations/${selectedNeg.id}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          content: typedMessage,
          fileUrl: attachmentUrl || undefined,
        }),
      });
      const result = await response.json();
      if (response.ok) {
        setTypedMessage('');
        setAttachmentUrl('');
        setShowAttachmentInput(false);
        fetchMessages(selectedNeg.id, true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  // Submit counter offer
  const handleCounterOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedNeg || !counterPrice) return;

    try {
      // Counter offering sends a system-like message indicating the counter proposal
      const counterValue = parseFloat(counterPrice);
      const response = await fetch(`${API_BASE_URL}/agri/negotiations/${selectedNeg.id}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          content: `⚠️ COUNTER OFFER PROPOSED: ${currencySymbol}${counterValue} per unit.`,
        }),
      });
      if (response.ok) {
        // We will update the status check
        setCounterPrice('');
        setShowCounterInput(false);
        fetchMessages(selectedNeg.id, true);
        alert('Counter bargain offer proposed to counter-party.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Accept/Reject Status
  const handleUpdateStatus = async (status: 'ACCEPTED' | 'REJECTED') => {
    if (!selectedNeg) return;
    try {
      const response = await fetch(`${API_BASE_URL}/agri/negotiations/${selectedNeg.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ status }),
      });
      const result = await response.json();
      if (response.ok) {
        setSelectedNeg(result.data);
        fetchMessages(selectedNeg.id, true);
        if (status === 'ACCEPTED') {
          alert('Offer accepted! Digital contracts are generated and available in the Orders panel.');
        } else {
          alert('Offer rejected successfully.');
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      <Navbar />

      {/* Main Procurement bargaining layout */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-8 flex flex-col lg:flex-row gap-6 h-[calc(100vh-140px)]">
        
        {/* Sidebar: Negotiations List */}
        <div className="w-full lg:w-80 flex flex-col rounded-2xl border border-white/5 bg-slate-900/30 overflow-hidden h-full">
          <div className="p-4 border-b border-white/5 flex justify-between items-center bg-slate-950/40">
            <h3 className="font-bold text-sm uppercase tracking-wider text-slate-300">Negotiations Chat</h3>
            <button onClick={fetchNegotiations} className="text-slate-400 hover:text-white transition-colors" title="Refresh Negotiations">
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-white/5">
            {negotiations.length === 0 ? (
              <div className="text-center py-10 text-slate-500 text-xs">
                No active bargains initiated. Start negotiating crop pricing from the marketplace.
              </div>
            ) : (
              negotiations.map((neg, idx) => {
                const isSelected = selectedNeg?.id === neg.id;
                const counterParty = user?.id === neg.buyerId ? neg.product.seller : neg.buyer;
                const counterPartyEmail = counterParty?.email || 'Counterparty';
                return (
                  <motion.div
                    key={neg.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05, duration: 0.3 }}
                    onClick={() => setSelectedNeg(neg)}
                    className={`p-4 cursor-pointer hover:bg-white/[0.02] transition-colors border-b border-white/5 relative ${
                      isSelected ? 'bg-teal-500/10 border-l-4 border-teal-500' : ''
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1.5">
                      <span className="text-xs text-teal-400 font-bold font-mono">
                        {neg.product.cropType} ({neg.product.grade})
                      </span>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                        neg.status === 'ACCEPTED' ? 'bg-lime-500/10 text-lime-400 border-lime-500/25' :
                        neg.status === 'REJECTED' ? 'bg-red-500/10 text-red-400 border-red-500/25' : 
                        'bg-slate-800/50 text-slate-400 border-slate-700/50'
                      }`}>
                        {neg.status}
                      </span>
                    </div>
                    <strong className="text-xs text-white block truncate font-sans">{neg.product.title}</strong>
                    <span className="text-[10px] text-slate-500 block truncate mt-1">
                      Partner: {counterPartyEmail}
                    </span>
                    <span className="text-[10px] text-teal-400 font-mono block mt-1">
                      Bargain Price: {currencySymbol}{neg.targetPrice}
                    </span>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>

        {/* Chat window */}
        <div className="flex-1 flex flex-col rounded-2xl border border-white/5 bg-slate-900/30 overflow-hidden h-full">
          {selectedNeg ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-white/5 bg-slate-950/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h3 className="font-bold text-sm text-white">{selectedNeg.product.title}</h3>
                  <span className="text-[10px] text-slate-400 block font-mono">
                    Grade: {selectedNeg.product.grade} | Base price: {currencySymbol}{selectedNeg.product.price}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-teal-400 font-bold bg-teal-500/10 px-2.5 py-1 rounded border border-teal-500/20">
                    Target Bargain: {currencySymbol}{selectedNeg.targetPrice}
                  </span>

                  {/* Accept / Reject actions (Only when pending) */}
                  {selectedNeg.status === 'PENDING' && (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleUpdateStatus('ACCEPTED')}
                        className="flex items-center gap-1 px-2.5 py-1 bg-lime-500 text-slate-950 font-bold text-xs rounded-lg hover:opacity-90 transition-opacity"
                      >
                        <CheckCircle className="h-3.5 w-3.5" /> Accept
                      </button>
                      <button
                        onClick={() => handleUpdateStatus('REJECTED')}
                        className="flex items-center gap-1 px-2.5 py-1 bg-red-500/10 border border-red-500/25 text-red-400 font-bold text-xs rounded-lg hover:bg-red-500/20 transition-all"
                      >
                        <XCircle className="h-3.5 w-3.5" /> Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Message Feed */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-950/10">
                {messages.length === 0 ? (
                  <div className="text-center py-20 text-slate-500 text-xs">
                    Start negotiation. Send messages to check quality certificates, logistics routing or target prices.
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isSelf = msg.senderId === user?.id;
                    const isSystem = msg.content.includes('COUNTER OFFER') || msg.content.includes('ACCEPTED') || msg.content.includes('REJECTED');
                    
                    if (isSystem) {
                      return (
                        <div key={msg.id} className="flex justify-center my-2">
                          <span className="text-[10px] font-bold font-mono bg-slate-900 border border-white/5 text-slate-400 px-3 py-1 rounded-full">
                            {msg.content}
                          </span>
                        </div>
                      );
                    }

                    return (
                      <div key={msg.id} className={`flex ${isSelf ? 'justify-end' : 'justify-start'}`}>
                        <div
                          className={`max-w-md rounded-2xl px-4 py-2 text-xs space-y-1.5 ${
                            isSelf
                              ? 'bg-gradient-to-br from-teal-500 to-teal-600 text-slate-950 font-medium rounded-tr-none'
                              : 'bg-slate-900 border border-white/5 text-slate-200 rounded-tl-none'
                          }`}
                        >
                          <p>{msg.content}</p>
                          
                          {/* File Attachment Attachment */}
                          {msg.fileUrl && (
                            <a
                              href={msg.fileUrl}
                              target="_blank"
                              rel="noreferrer"
                              className={`flex items-center gap-1.5 p-2 rounded-xl text-[10px] font-bold border transition-colors ${
                                isSelf
                                  ? 'bg-slate-950/25 border-slate-950/30 text-slate-950 hover:bg-slate-950/40'
                                  : 'bg-slate-950 border-white/10 text-teal-400 hover:border-teal-500/30'
                              }`}
                            >
                              <FileText className="h-3.5 w-3.5" />
                              Quality Document Certificate.pdf
                            </a>
                          )}

                          <span className={`block text-[8px] text-right font-mono ${isSelf ? 'text-slate-800' : 'text-slate-500'}`}>
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Action input toolbar */}
              <div className="p-4 border-t border-white/5 bg-slate-950/40 space-y-3">
                {/* Counter offer toggle inputs */}
                {showCounterInput && (
                  <form onSubmit={handleCounterOffer} className="flex gap-2 bg-slate-900 p-3 rounded-xl border border-white/5">
                    <div className="flex-1">
                      <label className="text-[10px] text-slate-400 block font-semibold mb-1">Counter Price ({currencySymbol})</label>
                      <input
                        type="number"
                        placeholder={`e.g. ${selectedNeg.targetPrice}`}
                        value={counterPrice}
                        onChange={(e) => setCounterPrice(e.target.value)}
                        className="w-full px-3 py-1 bg-slate-950 border border-white/10 rounded-lg text-xs focus:outline-none text-white"
                      />
                    </div>
                    <div className="flex items-end">
                      <button
                        type="submit"
                        className="px-4 py-2 bg-teal-500 text-slate-950 font-bold text-xs rounded-lg hover:opacity-90"
                      >
                        Submit Offer
                      </button>
                    </div>
                  </form>
                )}

                {/* Attachment Inputs */}
                {showAttachmentInput && (
                  <div className="flex gap-2 bg-slate-900 p-3 rounded-xl border border-white/5">
                    <div className="flex-1">
                      <label className="text-[10px] text-slate-400 block font-semibold mb-1">Simulated Quality Document Link / Image URL</label>
                      <input
                        type="text"
                        placeholder="e.g. http://sgs.com/reports/crop102.pdf"
                        value={attachmentUrl}
                        onChange={(e) => setAttachmentUrl(e.target.value)}
                        className="w-full px-3 py-1 bg-slate-950 border border-white/10 rounded-lg text-xs focus:outline-none text-white"
                      />
                    </div>
                    <div className="flex items-end">
                      <button
                        type="button"
                        onClick={() => setShowAttachmentInput(false)}
                        className="px-3 py-2 bg-slate-800 text-white text-xs rounded-lg"
                      >
                        OK
                      </button>
                    </div>
                  </div>
                )}

                {/* Primary Message Form */}
                <form onSubmit={handleSendMessage} className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setShowAttachmentInput(!showAttachmentInput)}
                    className="p-2.5 rounded-xl bg-slate-900 border border-white/10 text-slate-400 hover:text-white transition-all active:scale-95"
                    title="Attach Certificate"
                  >
                    <Paperclip className="h-4 w-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowCounterInput(!showCounterInput)}
                    className="p-2.5 rounded-xl bg-slate-900 border border-white/10 text-slate-400 hover:text-white transition-all active:scale-95"
                    title="Bargain Counter Price"
                  >
                    <TrendingDown className="h-4 w-4" />
                  </button>

                  <input
                    type="text"
                    placeholder="Type negotiation bargain messages..."
                    value={typedMessage}
                    onChange={(e) => setTypedMessage(e.target.value)}
                    className="flex-1 px-4 py-2.5 bg-slate-900 border border-white/10 rounded-xl text-xs focus:outline-none focus:border-teal-500 text-white placeholder-slate-500"
                  />

                  <button
                    type="submit"
                    disabled={sending}
                    className="p-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-lime-500 text-slate-950 font-bold hover:opacity-90 transition-all active:scale-95 disabled:opacity-50"
                    title="Send Message"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center py-20 text-slate-500 space-y-2">
              <MessageSquare className="h-10 w-10 text-slate-600 animate-pulse" />
              <p className="text-xs">Select a negotiation channel from the side panel to begin direct bargaining.</p>
            </div>
          )}
        </div>

      </main>

      <Footer />
    </div>
  );
}
