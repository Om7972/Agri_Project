'use client';

import React, { useEffect, useState } from 'react';
import Navbar from '@/components/navbar/Navbar';
import AnimatedBackground from '@/components/AnimatedBackground';
import { useAuthStore } from '@/store/useAuthStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Landmark, DollarSign, Clock, Users, ArrowUpRight, TrendingUp, CheckCircle } from 'lucide-react';
import { io } from 'socket.io-client';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
const SOCKET_URL = 'http://localhost:5000';

interface AuctionItem {
  id: string;
  title: string;
  description: string;
  cropType: string;
  startPrice: number;
  reservePrice: number;
  status: string;
  startTime: string;
  endTime: string;
  bids: { id: string; bidAmount: number; bidder: { email: string } }[];
}

export default function AuctionsPage() {
  const { user, accessToken } = useAuthStore();
  const [auctions, setAuctions] = useState<AuctionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState<any>(null);
  const [bidInputs, setBidInputs] = useState<{ [key: string]: string }>({});
  const [bidErrors, setBidErrors] = useState<{ [key: string]: string }>({});
  const [bidSuccess, setBidSuccess] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    // 1. Fetch live auctions from backend
    const fetchAuctions = async () => {
      try {
        const headers: any = {};
        if (accessToken) {
          headers['Authorization'] = `Bearer ${accessToken}`;
        }
        const res = await fetch(`${API_BASE_URL}/auctions`, { headers });
        const result = await res.json();
        if (res.ok && result.success) {
          setAuctions(result.data);
        } else {
          // Fallback to static seed auctions if backend not ready
          setAuctions(fallbackAuctions);
        }
      } catch (err) {
        setAuctions(fallbackAuctions);
      } finally {
        setLoading(false);
      }
    };

    fetchAuctions();

    // 2. Setup Socket.IO client
    if (accessToken) {
      const socketClient = io(SOCKET_URL, {
        auth: { token: accessToken },
      });

      socketClient.on('connect', () => {
        console.log('Socket connected for auctions');
      });

      socketClient.on('new_bid', (data: { auctionId: string; bid: any }) => {
        setAuctions((prev) =>
          prev.map((auc) => {
            if (auc.id === data.auctionId) {
              return {
                ...auc,
                bids: [data.bid, ...(auc.bids || [])],
              };
            }
            return auc;
          })
        );
      });

      setSocket(socketClient);

      return () => {
        socketClient.disconnect();
      };
    }
  }, [accessToken]);

  const handlePlaceBid = async (auctionId: string) => {
    const amountStr = bidInputs[auctionId];
    if (!amountStr || isNaN(Number(amountStr))) {
      setBidErrors({ ...bidErrors, [auctionId]: 'Please enter a valid numeric bid.' });
      return;
    }

    const amount = Number(amountStr);
    const auction = auctions.find((a) => a.id === auctionId);
    if (!auction) return;

    const currentHighest = (auction.bids && auction.bids.length > 0) ? auction.bids[0].bidAmount : auction.startPrice;
    if (amount <= currentHighest) {
      setBidErrors({ ...bidErrors, [auctionId]: `Bid must be higher than ${currentHighest}.` });
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/auctions/${auctionId}/bids`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ bidAmount: amount }),
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.message || 'Failed to submit bid.');
      }

      // Update state locally
      setAuctions((prev) =>
        prev.map((auc) => {
          if (auc.id === auctionId) {
            return {
              ...auc,
              bids: [result.data, ...(auc.bids || [])],
            };
          }
          return auc;
        })
      );

      setBidInputs({ ...bidInputs, [auctionId]: '' });
      setBidErrors({ ...bidErrors, [auctionId]: '' });
      setBidSuccess({ ...bidSuccess, [auctionId]: true });

      setTimeout(() => {
        setBidSuccess((prev) => ({ ...prev, [auctionId]: false }));
      }, 3000);
    } catch (err: any) {
      setBidErrors({ ...bidErrors, [auctionId]: err.message || 'Server error placing bid.' });
    }
  };

  return (
    <>
      <AnimatedBackground />
      <Navbar />

      <main className="min-h-screen py-12 px-6 max-w-7xl mx-auto relative z-10 space-y-12">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-teal-500/30 bg-teal-500/5 px-3 py-1 text-xs font-semibold text-teal-400">
            <Flame className="h-3.5 w-3.5 text-teal-400" />
            Live Bidding Room
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
            Institutional{' '}
            <span className="bg-gradient-to-r from-teal-400 to-lime-400 bg-clip-text text-transparent">
              Crop Auctions
            </span>
          </h1>
          <p className="text-slate-400 text-sm sm:text-base">
            Participate in real-time verified contract auctions with secure multi-sig escrow settlements.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-500 border-t-transparent" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {auctions.map((auction) => {
              const currentPrice = (auction.bids && auction.bids.length > 0) ? auction.bids[0].bidAmount : auction.startPrice;
              return (
                <motion.div
                  key={auction.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-3xl border border-white/5 bg-slate-900/40 p-8 shadow-2xl backdrop-blur-md hover:border-white/10 transition-all duration-300 flex flex-col justify-between"
                >
                  <div className="space-y-6">
                    {/* Header Info */}
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <span className="text-xs font-bold text-teal-400 font-mono tracking-wider uppercase bg-teal-500/10 px-2.5 py-0.5 rounded">
                          {auction.cropType}
                        </span>
                        <h3 className="font-bold text-white text-xl mt-2">{auction.title}</h3>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-500 font-mono block">CURRENT BID</span>
                        <span className="text-2xl font-black text-lime-400 font-mono">₹{currentPrice.toLocaleString()}</span>
                      </div>
                    </div>

                    <p className="text-slate-400 text-sm line-clamp-3">{auction.description}</p>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4 border-t border-b border-white/5 py-4 font-mono text-xs">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-slate-500" />
                        <div>
                          <span className="text-[10px] text-slate-500 block">TIME LEFT</span>
                          <span className="text-white font-semibold">2d 12h</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-slate-500" />
                        <div>
                          <span className="text-[10px] text-slate-500 block">TOTAL BIDS</span>
                          <span className="text-white font-semibold">{auction.bids ? auction.bids.length : 0}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Landmark className="h-4 w-4 text-slate-500" />
                        <div>
                          <span className="text-[10px] text-slate-500 block">RESERVE</span>
                          <span className="text-white font-semibold">₹{auction.reservePrice.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    {/* Bid History */}
                    <div className="space-y-2">
                      <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider">Bid History Feed</span>
                      <div className="space-y-1.5 max-h-36 overflow-y-auto">
                        {(auction.bids || []).map((bid, idx) => (
                          <div key={bid.id || idx} className="flex justify-between items-center p-2 rounded-lg bg-white/[0.02] border border-white/5 text-xs text-slate-300">
                            <span className="font-mono text-slate-400">{bid.bidder.email}</span>
                            <span className="font-mono text-lime-400 font-bold">₹{bid.bidAmount.toLocaleString()}</span>
                          </div>
                        ))}
                        {(!auction.bids || auction.bids.length === 0) && (
                          <div className="text-center py-4 text-slate-500 text-xs italic">No bids placed yet. Be the first!</div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Placing Bid Area */}
                  {user ? (
                    <div className="mt-8 pt-6 border-t border-white/5 space-y-4">
                      <div className="flex gap-3">
                        <div className="relative flex-1">
                          <DollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                          <input
                            type="number"
                            placeholder="Enter amount"
                            value={bidInputs[auction.id] || ''}
                            onChange={(e) => setBidInputs({ ...bidInputs, [auction.id]: e.target.value })}
                            className="w-full rounded-xl border border-white/10 bg-slate-950/50 py-3 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:border-teal-500/50 focus:outline-none"
                          />
                        </div>
                        <button
                          onClick={() => handlePlaceBid(auction.id)}
                          className="rounded-xl bg-gradient-to-r from-teal-500 to-lime-500 px-6 font-bold text-slate-950 hover:opacity-90 transition-opacity flex items-center justify-center gap-1 active:scale-95"
                        >
                          Bid Now
                          <ArrowUpRight className="h-4 w-4" />
                        </button>
                      </div>
                      
                      {bidErrors[auction.id] && (
                        <p className="text-xs text-red-400">{bidErrors[auction.id]}</p>
                      )}

                      {bidSuccess[auction.id] && (
                        <div className="flex items-center gap-1.5 text-xs text-lime-400">
                          <CheckCircle className="h-4 w-4" />
                          <span>Bid registered successfully in the escrow pool!</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="mt-8 pt-6 border-t border-white/5 text-center">
                      <p className="text-xs text-slate-500">Please log in to participate in live auctions.</p>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </main>
    </>
  );
}

const fallbackAuctions: AuctionItem[] = [
  {
    id: 'auc-1',
    title: 'Bulk Export Grade Wheat Auction (50 MT)',
    description: 'Shorter stem high-yield wheat suitable for flour mills. Cleaned and packaged in 50kg bags. Certified moisture below 10%.',
    cropType: 'Wheat',
    startPrice: 22000,
    reservePrice: 24000,
    status: 'ACTIVE',
    startTime: new Date().toISOString(),
    endTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    bids: [
      { id: 'b-1', bidAmount: 23500, bidder: { email: 'exporter@mandiprime.com' } },
    ],
  },
  {
    id: 'auc-2',
    title: 'Premium Basmati Rice Lot (20 MT)',
    description: 'Long grain, organic Basmati Rice Lot. Fully matured crop with strong natural aroma. Inspected by SGS board.',
    cropType: 'Basmati Rice',
    startPrice: 85000,
    reservePrice: 90000,
    status: 'ACTIVE',
    startTime: new Date().toISOString(),
    endTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    bids: [],
  },
];
