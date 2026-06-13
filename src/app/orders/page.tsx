'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/navbar/Navbar';
import Footer from '@/components/footer/Footer';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/store/useAuthStore';
import { useMarketStore } from '@/store/useMarketStore';
import {
  Package,
  Calendar,
  FileText,
  CheckCircle,
  Truck,
  ShieldAlert,
  Download,
  Printer,
  ChevronRight,
  Info,
  Clock,
  ArrowRight,
  User,
  ExternalLink,
  Activity,
  AlertCircle
} from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export default function OrdersPage() {
  const { user, accessToken } = useAuthStore();
  const { currencySymbol } = useMarketStore();

  const [orders, setOrders] = useState<any[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  // Digital Contract Modal
  const [contract, setContract] = useState<any | null>(null);
  const [contractModalOpen, setContractModalOpen] = useState(false);
  const [contractLoading, setContractLoading] = useState(false);

  useEffect(() => {
    if (user && accessToken) {
      fetchOrders();
    }
  }, [accessToken]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/orders`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const result = await response.json();
      if (response.ok) {
        setOrders(result.data || []);
        if (result.data.length > 0) {
          setSelectedOrder(result.data[0]);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId: string, nextStatus: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ status: nextStatus }),
      });
      const result = await response.json();
      if (response.ok) {
        // Refresh local orders list
        fetchOrders();
        // Update selected order in view
        if (selectedOrder?.id === orderId) {
          setSelectedOrder({ ...selectedOrder, status: nextStatus });
        }
        alert(`Order status updated to ${nextStatus}.`);
      } else {
        alert(result.message || 'Failed to update order status.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleFetchContract = async (orderId: string) => {
    setContractLoading(true);
    setContractModalOpen(true);
    try {
      // First try to GET existing contract
      let response = await fetch(`${API_BASE_URL}/agri/contracts/${orderId}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      let result = await response.json();
      
      // If not found, POST to generate it
      if (!response.ok || !result.data) {
        response = await fetch(`${API_BASE_URL}/agri/contracts/${orderId}`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        result = await response.json();
      }

      if (response.ok && result.data) {
        setContract(result.data);
      } else {
        setContract(null);
      }
    } catch (err) {
      console.error(err);
      setContract(null);
    } finally {
      setContractLoading(false);
    }
  };

  const printContract = () => {
    window.print();
  };

  // Helper to map order status progress
  const getStatusSteps = (status: string) => {
    const steps = [
      { key: 'PENDING', label: 'Order Lock', desc: 'Escrow deposit verified and locked.' },
      { key: 'ACCEPTED', label: 'Accepted', desc: 'Seller accepted bargain terms.' },
      { key: 'PACKED', label: 'Packed & Inspected', desc: 'Quality certificates verified.' },
      { key: 'IN_TRANSIT', label: 'In Transit', desc: 'Assigned to logistics container.' },
      { key: 'DELIVERED', label: 'Delivered', desc: 'Commodity delivered at terminal.' },
      { key: 'COMPLETED', label: 'Completed', desc: 'Escrow released to Seller.' },
    ];

    const activeIndex = steps.findIndex((step) => step.key === status);
    return steps.map((step, index) => ({
      ...step,
      completed: index <= activeIndex && status !== 'CANCELLED',
      active: index === activeIndex && status !== 'CANCELLED',
    }));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      <Navbar />

      {/* Main Track layout */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-8 flex flex-col lg:flex-row gap-6 h-[calc(100vh-140px)]">
        
        {/* Left: Orders List */}
        <div className="w-full lg:w-80 flex flex-col rounded-2xl border border-white/5 bg-slate-900/30 overflow-hidden h-full">
          <div className="p-4 border-b border-white/5 bg-slate-950/40">
            <h3 className="font-bold text-sm uppercase tracking-wider text-slate-300">My Orders & Sales</h3>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-white/5">
            {loading ? (
              <div className="text-center py-10 text-slate-500 text-xs">
                <RefreshCw className="h-4 w-4 animate-spin mx-auto mb-2 text-teal-400" />
                Loading contracts...
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-10 text-slate-500 text-xs px-4">
                No contracts or orders placed. Initiate purchase or list crops to start.
              </div>
            ) : (
              orders.map((ord) => {
                const isSelected = selectedOrder?.id === ord.id;
                const isSeller = user?.id === ord.product.sellerId;
                return (
                  <div
                    key={ord.id}
                    onClick={() => setSelectedOrder(ord)}
                    className={`p-4 cursor-pointer hover:bg-white/[0.02] transition-colors ${
                      isSelected ? 'bg-teal-500/10 border-l-4 border-teal-500' : ''
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-xs text-teal-400 font-bold font-mono">
                        {ord.product.cropType}
                      </span>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                        ord.status === 'COMPLETED' ? 'bg-lime-500/20 text-lime-400' :
                        ord.status === 'CANCELLED' ? 'bg-red-500/20 text-red-400' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {ord.status}
                      </span>
                    </div>
                    <strong className="text-xs text-white block truncate">{ord.product.title}</strong>
                    <div className="flex justify-between items-center text-[10px] text-slate-500 mt-2 font-mono">
                      <span>QTY: {ord.quantity} {ord.product.unit}s</span>
                      <span className="text-white font-bold">
                        {currencySymbol}{ord.totalPrice}
                      </span>
                    </div>
                    <span className="inline-block text-[8px] font-bold uppercase tracking-wider bg-white/5 text-slate-400 px-1 rounded mt-1 font-mono">
                      ROLE: {isSeller ? 'SELLER (PRODUCER)' : 'BUYER (TRADER)'}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Selected Order Detail Tracker */}
        <div className="flex-1 flex flex-col rounded-2xl border border-white/5 bg-slate-900/30 overflow-hidden h-full">
          {selectedOrder ? (
            <div className="flex-1 flex flex-col h-full overflow-y-auto">
              
              {/* Detail Header */}
              <div className="p-6 border-b border-white/5 bg-slate-950/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <span className="text-xs text-slate-500 font-mono">ORDER ID: {selectedOrder.id}</span>
                  <h3 className="font-bold text-lg text-white">{selectedOrder.product.title}</h3>
                  <div className="flex items-center gap-4 text-xs text-slate-400 font-mono">
                    <span>Agreed Price: {currencySymbol}{selectedOrder.totalPrice}</span>
                    <span>Quantity: {selectedOrder.quantity} {selectedOrder.product.unit}s</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {/* Digital Contract Action */}
                  <button
                    onClick={() => handleFetchContract(selectedOrder.id)}
                    className="flex items-center gap-1 px-4 py-2 bg-teal-500 text-slate-950 font-bold text-xs rounded-xl hover:opacity-90 transition-opacity"
                  >
                    <FileText className="h-4 w-4" />
                    Digital Contract
                  </button>
                </div>
              </div>

              {/* Grid content */}
              <div className="p-6 flex-1 grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
                
                {/* Left col: Real-time status list */}
                <div className="md:col-span-2 space-y-6">
                  <h4 className="font-bold text-white text-sm uppercase tracking-wider flex items-center gap-1">
                    <Activity className="h-4 w-4 text-teal-400" />
                    Real-Time Logistics Status
                  </h4>

                  {/* Vertical Progress Tracker */}
                  <div className="space-y-6 relative pl-6 border-l border-white/10 ml-3">
                    {getStatusSteps(selectedOrder.status).map((step, idx) => (
                      <div key={idx} className="relative">
                        {/* Dot indicator */}
                        <div className={`absolute -left-[30px] top-0 h-4 w-4 rounded-full border-2 bg-slate-950 transition-all ${
                          step.completed ? 'border-teal-500 bg-teal-500' : 'border-white/10'
                        } ${step.active ? 'ring-4 ring-teal-500/20' : ''}`} />
                        
                        <div className="space-y-1">
                          <strong className={`text-xs font-bold transition-colors block ${
                            step.completed ? 'text-white' : 'text-slate-500'
                          }`}>
                            {step.label}
                          </strong>
                          <p className="text-[11px] text-slate-400 leading-relaxed">{step.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right col: Escrow Status & Update Controller Panel (for Seller/Admin to progress order) */}
                <div className="space-y-6">
                  <div className="rounded-xl border border-white/5 bg-slate-950/50 p-5 space-y-4">
                    <h5 className="font-bold text-white text-xs uppercase tracking-wider">Escrow Wallet Ledger</h5>
                    <div className="text-xs font-mono space-y-2">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Deposit Locked:</span>
                        <span className="text-teal-400 font-bold">{currencySymbol}{selectedOrder.totalPrice}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Payment Status:</span>
                        <span className="text-lime-400 font-bold bg-lime-500/10 px-1.5 py-0.5 rounded uppercase text-[10px]">
                          {selectedOrder.paymentStatus || 'LOCKED'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Release Code:</span>
                        <span className="text-slate-300">SYSTEM_AUTO</span>
                      </div>
                    </div>
                  </div>

                  {/* State transition utility (Allows testing order statuses in demo) */}
                  {selectedOrder.status !== 'COMPLETED' && selectedOrder.status !== 'CANCELLED' && (
                    <div className="rounded-xl border border-teal-500/10 bg-teal-500/5 p-5 space-y-3">
                      <h5 className="font-bold text-teal-400 text-xs uppercase tracking-wider">Logistics Controller</h5>
                      <p className="text-[10px] text-slate-400">
                        Update the shipping & quality milestones to progress logistics.
                      </p>
                      
                      <div className="space-y-2">
                        {selectedOrder.status === 'PENDING' && (
                          <button
                            onClick={() => handleUpdateStatus(selectedOrder.id, 'ACCEPTED')}
                            className="w-full py-2 bg-teal-500 text-slate-950 font-bold text-xs rounded-xl active:scale-95 transition-all"
                          >
                            Accept Order Bid
                          </button>
                        )}
                        {selectedOrder.status === 'ACCEPTED' && (
                          <button
                            onClick={() => handleUpdateStatus(selectedOrder.id, 'PACKED')}
                            className="w-full py-2 bg-teal-500 text-slate-950 font-bold text-xs rounded-xl active:scale-95 transition-all"
                          >
                            Mark as Packed & Inspected
                          </button>
                        )}
                        {selectedOrder.status === 'PACKED' && (
                          <button
                            onClick={() => handleUpdateStatus(selectedOrder.id, 'IN_TRANSIT')}
                            className="w-full py-2 bg-teal-500 text-slate-950 font-bold text-xs rounded-xl active:scale-95 transition-all"
                          >
                            Dispatch to Logistics Carrier
                          </button>
                        )}
                        {selectedOrder.status === 'IN_TRANSIT' && (
                          <button
                            onClick={() => handleUpdateStatus(selectedOrder.id, 'DELIVERED')}
                            className="w-full py-2 bg-teal-500 text-slate-950 font-bold text-xs rounded-xl active:scale-95 transition-all"
                          >
                            Mark as Delivered
                          </button>
                        )}
                        {selectedOrder.status === 'DELIVERED' && (
                          <button
                            onClick={() => handleUpdateStatus(selectedOrder.id, 'COMPLETED')}
                            className="w-full py-2 bg-lime-500 text-slate-950 font-bold text-xs rounded-xl active:scale-95 transition-all"
                          >
                            Complete Contract (Release Funds)
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                </div>

              </div>

            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center py-20 text-slate-500">
              <Package className="h-10 w-10 text-slate-600 mb-2 animate-bounce" />
              <p className="text-xs">Select a contract ledger card from the sidebar to track shipping milestones.</p>
            </div>
          )}
        </div>

      </main>

      {/* --- DIGITAL CONTRACT PREVIEW MODAL --- */}
      {contractModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md overflow-y-auto">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-2xl bg-white text-slate-900 rounded-3xl p-8 shadow-2xl relative my-8 print:my-0 print:p-0 print:shadow-none"
          >
            {/* Header toolbar */}
            <div className="flex justify-between items-center pb-4 border-b border-slate-200 mb-6 print:hidden">
              <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="h-5 w-5 text-teal-600" />
                AgriTech Digital Procurement Contract
              </h3>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={printContract}
                  className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-colors"
                  title="Print Contract"
                >
                  <Printer className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setContractModalOpen(false)}
                  className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {contractLoading ? (
              <div className="text-center py-20 text-slate-400">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2 text-teal-500" />
                <span>Generating and signing digital smart contract terms...</span>
              </div>
            ) : !contract ? (
              <div className="text-center py-10 text-red-500">
                <AlertCircle className="h-10 w-10 mx-auto mb-2" />
                <p className="text-sm">Failed to generate contract sheet.</p>
              </div>
            ) : (
              <div className="space-y-6 print:space-y-4 font-serif text-xs">
                
                {/* Title */}
                <div className="text-center space-y-1">
                  <h2 className="text-lg font-bold tracking-tight text-slate-900 uppercase">LEGAL COMMODITY PROCUREMENT AGREEMENT</h2>
                  <span className="text-[10px] text-slate-500 block font-mono">Contract Hash ID: {contract.id}</span>
                </div>

                {/* Section 1 */}
                <div className="space-y-2">
                  <h4 className="font-bold text-[11px] text-slate-800 border-b border-slate-200 pb-1">1. PARTIES TO CONTRACT</h4>
                  <p className="leading-relaxed">
                    This document establishes a legally binding arrangement between the following registered parties on the MandiPrime trading floor:
                  </p>
                  <div className="grid grid-cols-2 gap-4 font-sans text-[10px] bg-slate-50 p-3 rounded-xl">
                    <div>
                      <span className="block text-slate-500 uppercase tracking-wider font-bold">BUYER (TRADER)</span>
                      <strong>{contract.order?.buyer?.email || 'N/A'}</strong>
                      <span className="block text-[9px] text-slate-400">Escrow Address: MP_ESC_BUY_{contract.order?.buyerId?.slice(0, 8)}</span>
                    </div>
                    <div>
                      <span className="block text-slate-500 uppercase tracking-wider font-bold">SELLER (PRODUCER)</span>
                      <strong>{contract.order?.product?.seller?.email || 'N/A'}</strong>
                      <span className="block text-[9px] text-slate-400">Settlement Address: MP_SET_SEL_{contract.order?.product?.sellerId?.slice(0, 8)}</span>
                    </div>
                  </div>
                </div>

                {/* Section 2 */}
                <div className="space-y-2">
                  <h4 className="font-bold text-[11px] text-slate-800 border-b border-slate-200 pb-1">2. COMMODITY & TERMS</h4>
                  <table className="w-full text-left font-sans text-[10px] border border-slate-200 rounded-lg">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-500">
                        <th className="p-2">Commodity / Grade</th>
                        <th className="p-2">Quantity</th>
                        <th className="p-2">Agreed Rate</th>
                        <th className="p-2 text-right">Total Lockup</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="p-2 font-bold">{contract.order?.product?.title} ({contract.order?.product?.grade})</td>
                        <td className="p-2">{contract.order?.quantity} {contract.order?.product?.unit}s</td>
                        <td className="p-2">{currencySymbol}{contract.order?.product?.price} / {contract.order?.product?.unit}</td>
                        <td className="p-2 text-right font-bold text-teal-600">{currencySymbol}{contract.order?.totalPrice}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Section 3 */}
                <div className="space-y-2">
                  <h4 className="font-bold text-[11px] text-slate-800 border-b border-slate-200 pb-1">3. ESCROW CONDITIONS & RESOLUTION</h4>
                  <p className="leading-relaxed">
                    By digital signature, the Buyer warrants that the procurement funds have been fully locked in the MandiPrime Escrow Account. The escrow manager will release funds to the Seller's settlement ledger upon cargo delivery confirmation at the designated freight terminal and quality inspector verification. Any dispute will follow standard arbitration protocols.
                  </p>
                </div>

                {/* Signatures */}
                <div className="pt-8 grid grid-cols-2 gap-8 font-sans text-[10px] text-center border-t border-slate-200">
                  <div className="space-y-1">
                    <div className="h-10 flex items-center justify-center font-mono italic text-slate-500 bg-slate-50 border border-slate-200/50 rounded-xl">
                      ⚡ Signed Digitally by Buyer
                    </div>
                    <span className="block font-bold text-slate-700">Buyer Authorized Signature</span>
                    <span className="text-[8px] text-slate-400">Timestamp: {new Date(contract.createdAt).toLocaleString()}</span>
                  </div>

                  <div className="space-y-1">
                    <div className="h-10 flex items-center justify-center font-mono italic text-slate-500 bg-slate-50 border border-slate-200/50 rounded-xl">
                      ⚡ Signed Digitally by Seller
                    </div>
                    <span className="block font-bold text-slate-700">Seller Authorized Signature</span>
                    <span className="text-[8px] text-slate-400">MandiPrime Verifier: MP_AUTH_SIG_OK</span>
                  </div>
                </div>

              </div>
            )}
          </motion.div>
        </div>
      )}

      <Footer />
    </div>
  );
}
