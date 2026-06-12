'use client';

import React, { useEffect, useState } from 'react';
import Navbar from '@/components/navbar/Navbar';
import AnimatedBackground from '@/components/AnimatedBackground';
import { useAuthStore } from '@/store/useAuthStore';
import { motion } from 'framer-motion';
import { Ship, UploadCloud, MapPin, Landmark, FileText, CheckCircle, Plus, Layers, ArrowRight } from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

interface ShipmentItem {
  id: string;
  trackingNumber: string;
  carrier: string;
  origin: string;
  destination: string;
  status: string;
  estimatedDelivery?: string;
  documents: { id: string; documentType: string; fileUrl: string; status: string; notes?: string }[];
}

export default function ExportHubPage() {
  const { user, accessToken } = useAuthStore();
  const [shipments, setShipments] = useState<ShipmentItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states for booking
  const [orderId, setOrderId] = useState('');
  const [carrier, setCarrier] = useState('');
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [estimatedDelivery, setEstimatedDelivery] = useState('');
  const [bookingError, setBookingError] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // Form states for document upload
  const [selectedShipmentId, setSelectedShipmentId] = useState('');
  const [docType, setDocType] = useState('PHYTOSANITARY');
  const [fileUrl, setFileUrl] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const fetchShipments = async () => {
    try {
      const headers: any = {};
      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      }
      const res = await fetch(`${API_BASE_URL}/export`, { headers });
      const result = await res.json();
      if (res.ok && result.success) {
        setShipments(result.data);
      } else {
        setShipments(fallbackShipments);
      }
    } catch (err) {
      setShipments(fallbackShipments);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShipments();
  }, [accessToken]);

  const handleBookShipment = async (e: React.FormEvent) => {
    e.preventDefault();
    setBookingError('');
    setBookingSuccess(false);

    if (!orderId || !carrier || !origin || !destination) {
      setBookingError('Please fill in all booking fields.');
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/export`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ orderId, carrier, origin, destination, estimatedDelivery }),
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.message || 'Failed to book shipment.');
      }

      setBookingSuccess(true);
      setOrderId('');
      setCarrier('');
      setOrigin('');
      setDestination('');
      setEstimatedDelivery('');
      fetchShipments();
    } catch (err: any) {
      setBookingError(err.message || 'Server error booking shipment.');
    }
  };

  const handleUploadDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploadError('');
    setUploadSuccess(false);

    if (!selectedShipmentId || !fileUrl) {
      setUploadError('Please specify shipment ID and document URL.');
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/export/document`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ shipmentId: selectedShipmentId, documentType: docType, fileUrl }),
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.message || 'Failed to upload document.');
      }

      setUploadSuccess(true);
      setFileUrl('');
      fetchShipments();
    } catch (err: any) {
      setUploadError(err.message || 'Server error uploading document.');
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
            <Ship className="h-3.5 w-3.5 text-teal-400" />
            Cross-Border Logistics Node
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
            India to Dubai{' '}
            <span className="bg-gradient-to-r from-teal-400 to-lime-400 bg-clip-text text-transparent">
              Export Hub
            </span>
          </h1>
          <p className="text-slate-400 text-sm sm:text-base">
            Track deep-sea freight, manage phytosanitary certificates, and handle customs clearance.
          </p>
        </div>

        {/* Dashboard Split Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Left: Book Shipment (For Admin/Exporter) */}
          {(user?.role === 'ADMIN' || user?.role === 'EXPORTER') && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="rounded-3xl border border-white/5 bg-slate-900/40 p-6 shadow-2xl backdrop-blur-md space-y-6"
            >
              <div className="flex items-center gap-2 pb-4 border-b border-white/5">
                <Plus className="h-5 w-5 text-teal-400" />
                <h3 className="font-bold text-white text-lg">Book Freight Shipment</h3>
              </div>

              <form onSubmit={handleBookShipment} className="space-y-4 text-xs font-mono">
                <div className="space-y-1">
                  <label className="text-slate-400 block">ORDER TRANSACTION ID</label>
                  <input
                    type="text"
                    placeholder="Enter order ID"
                    value={orderId}
                    onChange={(e) => setOrderId(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-slate-950/50 py-3 px-4 text-white focus:border-teal-500/50 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 block">FREIGHT CARRIER</label>
                  <input
                    type="text"
                    placeholder="e.g. Gulf Ocean Freight"
                    value={carrier}
                    onChange={(e) => setCarrier(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-slate-950/50 py-3 px-4 text-white focus:border-teal-500/50 focus:outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-slate-400 block">ORIGIN PORT</label>
                    <input
                      type="text"
                      placeholder="e.g. Kandla Port"
                      value={origin}
                      onChange={(e) => setOrigin(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-slate-950/50 py-3 px-4 text-white focus:border-teal-500/50 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-400 block">DESTINATION PORT</label>
                    <input
                      type="text"
                      placeholder="e.g. Jebel Ali Port"
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-slate-950/50 py-3 px-4 text-white focus:border-teal-500/50 focus:outline-none"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 block">ESTIMATED ARRIVAL DATE</label>
                  <input
                    type="date"
                    value={estimatedDelivery}
                    onChange={(e) => setEstimatedDelivery(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-slate-950/50 py-3 px-4 text-white focus:border-teal-500/50 focus:outline-none"
                  />
                </div>

                {bookingError && <p className="text-red-400 text-[11px]">{bookingError}</p>}
                {bookingSuccess && <p className="text-lime-400 text-[11px]">Shipment scheduled successfully!</p>}

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-teal-500 to-lime-500 font-bold text-slate-950 hover:opacity-90 transition-opacity active:scale-95"
                >
                  Book Freight
                </button>
              </form>
            </motion.div>
          )}

          {/* Center/Right: Shipments List & Upload Portal */}
          <div className={`${(user?.role === 'ADMIN' || user?.role === 'EXPORTER') ? 'lg:col-span-2' : 'lg:col-span-3'} space-y-8`}>
            
            {/* Active Shipments */}
            <div className="space-y-4">
              <h3 className="font-bold text-white text-xl flex items-center gap-2">
                <Layers className="h-5 w-5 text-lime-400" />
                Active Exports Pipelines
              </h3>

              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-teal-500 border-t-transparent" />
                </div>
              ) : (
                <div className="space-y-4">
                  {shipments.map((shipment) => (
                    <motion.div
                      key={shipment.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-3xl border border-white/5 bg-slate-900/40 p-6 shadow-2xl backdrop-blur-md hover:border-white/10 transition-all duration-300 space-y-4"
                    >
                      {/* Booking Header */}
                      <div className="flex justify-between items-center gap-4">
                        <div>
                          <span className="text-[10px] text-slate-500 font-mono block">TRACKING ID</span>
                          <span className="font-black font-mono text-white text-base">{shipment.trackingNumber}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-slate-500 font-mono block">CARRIER</span>
                          <span className="text-xs font-semibold text-slate-300 block">{shipment.carrier}</span>
                        </div>
                        <span className="text-[10px] bg-teal-500/10 text-teal-400 font-bold font-mono uppercase px-2.5 py-1 rounded">
                          {shipment.status}
                        </span>
                      </div>

                      {/* Path Tracker */}
                      <div className="flex items-center justify-between bg-white/[0.01] border border-white/5 p-3.5 rounded-2xl text-xs font-mono text-slate-300">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5 text-teal-400" />
                          <span>{shipment.origin}</span>
                        </div>
                        <ArrowRight className="h-4 w-4 text-slate-500" />
                        <div className="flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5 text-lime-400" />
                          <span>{shipment.destination}</span>
                        </div>
                      </div>

                      {/* Export Documents */}
                      <div className="space-y-2 pt-2">
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Compliance Documents</span>
                        <div className="grid grid-cols-2 gap-3">
                          {shipment.documents.map((doc) => (
                            <a
                              key={doc.id}
                              href={doc.fileUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/5 text-xs text-slate-300 hover:border-white/10 transition-all"
                            >
                              <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4 text-teal-400" />
                                <span className="font-mono text-[10px]">{doc.documentType}</span>
                              </div>
                              <span className={`text-[9px] font-bold font-mono uppercase px-1.5 py-0.5 rounded ${
                                doc.status === 'APPROVED' ? 'bg-lime-500/10 text-lime-400' : 'bg-yellow-500/10 text-yellow-400'
                              }`}>
                                {doc.status}
                              </span>
                            </a>
                          ))}
                          {shipment.documents.length === 0 && (
                            <div className="col-span-2 text-center text-slate-500 text-xs italic py-2">No clearance papers uploaded.</div>
                          )}
                        </div>
                      </div>

                      {/* Upload Document Trigger */}
                      {user && (
                        <div className="mt-4 pt-4 border-t border-white/5 flex gap-2 justify-end">
                          <button
                            onClick={() => setSelectedShipmentId(shipment.id)}
                            className="flex items-center gap-1 text-[11px] font-bold text-teal-400 hover:text-teal-300 transition-colors"
                          >
                            <UploadCloud className="h-3.5 w-3.5" />
                            Upload Certificate
                          </button>
                        </div>
                      )}
                    </motion.div>
                  ))}
                  {shipments.length === 0 && (
                    <div className="text-center py-12 text-slate-500 text-sm">No export pipelines mapped yet.</div>
                  )}
                </div>
              )}
            </div>

            {/* Document Upload Modal / Drawer Area (if shipment selected) */}
            {selectedShipmentId && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-3xl border border-teal-500/20 bg-teal-500/5 p-6 shadow-2xl backdrop-blur-md space-y-4"
              >
                <div className="flex justify-between items-center pb-2 border-b border-white/5">
                  <h4 className="font-bold text-white text-base flex items-center gap-2">
                    <UploadCloud className="h-5 w-5 text-teal-400" />
                    Submit Certificate for Shipment
                  </h4>
                  <button onClick={() => setSelectedShipmentId('')} className="text-xs text-slate-400 hover:text-white">Cancel</button>
                </div>

                <form onSubmit={handleUploadDoc} className="space-y-4 text-xs font-mono">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-slate-400 block">DOCUMENT TYPE</label>
                      <select
                        value={docType}
                        onChange={(e) => setDocType(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-slate-950 py-3 px-4 text-white focus:outline-none"
                      >
                        <option value="PHYTOSANITARY">Phytosanitary Cert</option>
                        <option value="BILL_OF_LADING">Bill of Lading</option>
                        <option value="CERTIFICATE_OF_ORIGIN">Certificate of Origin</option>
                        <option value="COMMERCIAL_INVOICE">Commercial Invoice</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-slate-400 block">DOCUMENT FILE URL</label>
                      <input
                        type="text"
                        placeholder="https://cloudinary.com/doc.pdf"
                        value={fileUrl}
                        onChange={(e) => setFileUrl(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-slate-950 py-3 px-4 text-white focus:outline-none"
                      />
                    </div>
                  </div>

                  {uploadError && <p className="text-red-400 text-[11px]">{uploadError}</p>}
                  {uploadSuccess && <p className="text-lime-400 text-[11px]">Certificate submitted to Admin for quality inspection!</p>}

                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-teal-500 to-lime-500 font-bold text-slate-950 hover:opacity-90 transition-opacity active:scale-95"
                  >
                    Submit Paperwork
                  </button>
                </form>
              </motion.div>
            )}

          </div>
        </div>
      </main>
    </>
  );
}

const fallbackShipments: ShipmentItem[] = [
  {
    id: 'ship-1',
    trackingNumber: 'MP-894721',
    carrier: 'Gulf Ocean Freight Corp',
    origin: 'Kandla Port, India',
    destination: 'Jebel Ali Port, Dubai',
    status: 'PORT_OF_ORIGIN',
    estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    documents: [
      { id: 'doc-1', documentType: 'PHYTOSANITARY', fileUrl: '#', status: 'APPROVED', notes: 'Inspection cleared' },
      { id: 'doc-2', documentType: 'BILL_OF_LADING', fileUrl: '#', status: 'PENDING' },
    ],
  },
];
