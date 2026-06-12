'use client';

import React, { useEffect, useState } from 'react';
import Navbar from '@/components/navbar/Navbar';
import AnimatedBackground from '@/components/AnimatedBackground';
import { useAuthStore } from '@/store/useAuthStore';
import { motion } from 'framer-motion';
import { Truck, MapPin, Navigation, User, Phone, CheckCircle, Plus, Layers, Navigation2 } from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

interface BookingItem {
  id: string;
  driverName: string;
  driverPhone: string;
  vehicleNumber: string;
  status: string;
  origin: string;
  destination: string;
  latitude?: number;
  longitude?: number;
}

export default function LogisticsPage() {
  const { user, accessToken } = useAuthStore();
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Booking form states
  const [shipmentId, setShipmentId] = useState('');
  const [driverName, setDriverName] = useState('');
  const [driverPhone, setDriverPhone] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [bookingError, setBookingError] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const fetchBookings = async () => {
    try {
      const headers: any = {};
      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      }
      const res = await fetch(`${API_BASE_URL}/logistics`, { headers });
      const result = await res.json();
      if (res.ok && result.success) {
        setBookings(result.data);
      } else {
        setBookings(fallbackBookings);
      }
    } catch (err) {
      setBookings(fallbackBookings);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [accessToken]);

  const handleBookTruck = async (e: React.FormEvent) => {
    e.preventDefault();
    setBookingError('');
    setBookingSuccess(false);

    if (!shipmentId || !driverName || !driverPhone || !vehicleNumber || !origin || !destination) {
      setBookingError('Please fill in all vehicle logistics details.');
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/logistics`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ shipmentId, driverName, driverPhone, vehicleNumber, origin, destination }),
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.message || 'Failed to dispatch logistics.');
      }

      setBookingSuccess(true);
      setShipmentId('');
      setDriverName('');
      setDriverPhone('');
      setVehicleNumber('');
      setOrigin('');
      setDestination('');
      fetchBookings();
    } catch (err: any) {
      setBookingError(err.message || 'Server error dispatching truck.');
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
            <Truck className="h-3.5 w-3.5 text-teal-400" />
            Land Fleet Dispatch Node
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
            Logistics &{' '}
            <span className="bg-gradient-to-r from-teal-400 to-lime-400 bg-clip-text text-transparent">
              Driver Dispatch
            </span>
          </h1>
          <p className="text-slate-400 text-sm sm:text-base">
            Book heavy carriers, register container license numbers, and manage driver routing states.
          </p>
        </div>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Dispatch Truck Form (Exporter & Admin only) */}
          {(user?.role === 'ADMIN' || user?.role === 'EXPORTER') && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="rounded-3xl border border-white/5 bg-slate-900/40 p-6 shadow-2xl backdrop-blur-md space-y-6"
            >
              <div className="flex items-center gap-2 pb-4 border-b border-white/5">
                <Plus className="h-5 w-5 text-teal-400" />
                <h3 className="font-bold text-white text-lg">Dispatch Heavy Carrier</h3>
              </div>

              <form onSubmit={handleBookTruck} className="space-y-4 text-xs font-mono">
                <div className="space-y-1">
                  <label className="text-slate-400 block">SHIPMENT / CONTAINER ID</label>
                  <input
                    type="text"
                    placeholder="Enter shipment ID"
                    value={shipmentId}
                    onChange={(e) => setShipmentId(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-slate-950/50 py-3 px-4 text-white focus:border-teal-500/50 focus:outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-slate-400 block">DRIVER FULL NAME</label>
                    <input
                      type="text"
                      placeholder="e.g. Ramesh Kumar"
                      value={driverName}
                      onChange={(e) => setDriverName(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-slate-950/50 py-3 px-4 text-white focus:border-teal-500/50 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-400 block">DRIVER CONTACT</label>
                    <input
                      type="text"
                      placeholder="e.g. +91 98989 98989"
                      value={driverPhone}
                      onChange={(e) => setDriverPhone(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-slate-950/50 py-3 px-4 text-white focus:border-teal-500/50 focus:outline-none"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 block">VEHICLE PLATE NUMBER</label>
                  <input
                    type="text"
                    placeholder="e.g. HR-55-A-9876"
                    value={vehicleNumber}
                    onChange={(e) => setVehicleNumber(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-slate-950/50 py-3 px-4 text-white focus:border-teal-500/50 focus:outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-slate-400 block">DISPATCH SOURCE</label>
                    <input
                      type="text"
                      placeholder="e.g. Punjab Warehouse"
                      value={origin}
                      onChange={(e) => setOrigin(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-slate-950/50 py-3 px-4 text-white focus:border-teal-500/50 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-400 block">DISPATCH TERMINAL</label>
                    <input
                      type="text"
                      placeholder="e.g. Kandla Port Terminal"
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-slate-950/50 py-3 px-4 text-white focus:border-teal-500/50 focus:outline-none"
                    />
                  </div>
                </div>

                {bookingError && <p className="text-red-400 text-[11px]">{bookingError}</p>}
                {bookingSuccess && <p className="text-lime-400 text-[11px]">Truck dispatched, GPS logging active!</p>}

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-teal-500 to-lime-500 font-bold text-slate-950 hover:opacity-90 transition-opacity active:scale-95"
                >
                  Dispatch Truck
                </button>
              </form>
            </motion.div>
          )}

          {/* Bookings & Active Tracking Map Grid */}
          <div className={`${(user?.role === 'ADMIN' || user?.role === 'EXPORTER') ? 'lg:col-span-2' : 'lg:col-span-3'} space-y-6`}>
            
            <h3 className="font-bold text-white text-xl flex items-center gap-2">
              <Layers className="h-5 w-5 text-lime-400" />
              Active Dispatch Board
            </h3>

            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-teal-500 border-t-transparent" />
              </div>
            ) : (
              <div className="space-y-4">
                {bookings.map((booking) => (
                  <motion.div
                    key={booking.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-3xl border border-white/5 bg-slate-900/40 p-6 shadow-2xl backdrop-blur-md hover:border-white/10 transition-all duration-300 space-y-4"
                  >
                    {/* Header */}
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-400">
                          <Truck className="h-5 w-5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-white text-base leading-none">{booking.vehicleNumber}</h4>
                          <span className="text-[10px] text-slate-500 font-mono mt-1 block">DRIVER: {booking.driverName} ({booking.driverPhone})</span>
                        </div>
                      </div>
                      <span className="text-[10px] bg-teal-500/10 text-teal-400 font-bold font-mono uppercase px-2.5 py-1 rounded">
                        {booking.status}
                      </span>
                    </div>

                    {/* Routing Map visual */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Left: Path details */}
                      <div className="bg-white/[0.01] border border-white/5 p-4 rounded-2xl text-xs font-mono space-y-2 text-slate-300">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-3.5 w-3.5 text-teal-400" />
                          <span>Origin: {booking.origin}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-3.5 w-3.5 text-lime-400" />
                          <span>Destination: {booking.destination}</span>
                        </div>
                      </div>

                      {/* Right: GPS Telemetry mock map */}
                      <div className="bg-slate-950/60 border border-white/5 p-4 rounded-2xl flex flex-col justify-center items-center text-xs font-mono relative overflow-hidden h-28">
                        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:14px_14px] pointer-events-none" />
                        <Navigation2 className="h-5 w-5 text-teal-400 animate-bounce mb-2 relative z-10" />
                        <div className="text-center relative z-10">
                          <span className="text-[10px] text-slate-500 block">LIVE TELEMETRY COORDINATES</span>
                          <span className="text-white font-bold">{booking.latitude || 28.6139}, {booking.longitude || 77.2090}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
                {bookings.length === 0 && (
                  <div className="text-center py-12 text-slate-500 text-sm">No trucks dispatched on active channels.</div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}

const fallbackBookings: BookingItem[] = [
  {
    id: 'log-1',
    driverName: 'Ranjeet Singh',
    driverPhone: '+91 87654 32109',
    vehicleNumber: 'PB-10-CG-4491',
    status: 'IN_TRANSIT',
    origin: 'Ludhiana Storage Terminal',
    destination: 'Mumbai Port (JNPT)',
    latitude: 29.0588,
    longitude: 76.0856,
  },
];
