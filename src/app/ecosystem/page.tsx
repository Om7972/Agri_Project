'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Navbar from '@/components/navbar/Navbar';
import AnimatedBackground from '@/components/AnimatedBackground';
import Footer from '@/components/footer/Footer';
import { useAuthStore } from '@/store/useAuthStore';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Warehouse,
  Truck,
  TrendingUp,
  Info,
  Layers,
  ArrowUpRight,
  Flame,
  Award,
  Users,
  Calendar,
  Ticket,
  MessageSquare,
  ThumbsUp,
  Bookmark,
  Share2,
  Bell,
  Check,
  Send,
  Download,
  AlertCircle,
  FileCheck,
  Percent,
  Plus
} from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api/v1';

export default function EcosystemPage() {
  const { user, accessToken } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'reverse_auctions' | 'community' | 'events' | 'rfq' | 'receipts' | 'coops' | 'referrals' | 'notifications'>('reverse_auctions');

  // Success / Error alerts
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // 1. Reverse Auctions states
  const [reverseAuctions, setReverseAuctions] = useState<any[]>([]);
  const [newAuctionCrop, setNewAuctionCrop] = useState('');
  const [newAuctionQty, setNewAuctionQty] = useState<number>(10);
  const [newAuctionMaxPrice, setNewAuctionMaxPrice] = useState<number>(25000);
  const [newAuctionLoc, setNewAuctionLoc] = useState('');
  const [newAuctionDeadline, setNewAuctionDeadline] = useState('');
  const [selectedAuctionId, setSelectedAuctionId] = useState('');
  const [auctionBids, setAuctionBids] = useState<any[]>([]);
  const [newBidPrice, setNewBidPrice] = useState<number>(20000);
  const [newBidDelivery, setNewBidDelivery] = useState<number>(5);

  // 2. Crop Community states
  const [selectedCommunity, setSelectedCommunity] = useState('Onion');
  const [posts, setPosts] = useState<any[]>([]);
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostImage, setNewPostImage] = useState('');
  const [newPostLang, setNewPostLang] = useState('EN');
  const [commentInputs, setCommentInputs] = useState<{ [postId: string]: string }>({});

  // 3. Events states
  const [events, setEvents] = useState<any[]>([]);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventDesc, setNewEventDesc] = useState('');
  const [newEventType, setNewEventType] = useState('WEBINAR');
  const [newEventDate, setNewEventDate] = useState('');
  const [newEventLoc, setNewEventLoc] = useState('');
  const [registeredEvents, setRegisteredEvents] = useState<string[]>([]);

  // 4. Warehouse Receipts states
  const [receipts, setReceipts] = useState<any[]>([]);
  const [newReceiptWh, setNewReceiptWh] = useState('');
  const [newReceiptCrop, setNewReceiptCrop] = useState('');
  const [newReceiptQty, setNewReceiptQty] = useState<number>(20);
  const [newReceiptGrade, setNewReceiptGrade] = useState('Grade A');
  const [newReceiptDuration, setNewReceiptDuration] = useState<number>(30);

  // 5. Cooperative Groups states
  const [coops, setCoops] = useState<any[]>([]);
  const [newCoopName, setNewCoopName] = useState('');
  const [newCoopDesc, setNewCoopDesc] = useState('');
  const [joinGroupName, setJoinGroupName] = useState('');
  const [selectedCoopId, setSelectedCoopId] = useState('');
  const [sharedCrop, setSharedCrop] = useState('');
  const [sharedQty, setSharedQty] = useState<number>(5);
  const [sharedGrade, setSharedGrade] = useState('Grade B');
  const [sharedPrice, setSharedPrice] = useState<number>(18000);

  // 6. Smart RFQ / Bulk Quotations states
  const [bulkReqs, setBulkReqs] = useState<any[]>([]);
  const [selectedReqId, setSelectedReqId] = useState('');
  const [rfqPrice, setRfqPrice] = useState<number>(15000);
  const [rfqQty, setRfqQty] = useState<number>(10);
  const [rfqNotes, setRfqNotes] = useState('');
  const [generatedRFQ, setGeneratedRFQ] = useState<any>(null);

  // 7. Referral states
  const [referralCode, setReferralCode] = useState('');
  const [referralPoints, setReferralPoints] = useState(0);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [redeemCode, setRedeemCode] = useState('');

  // 8. Notification preferences states
  const [prefEmail, setPrefEmail] = useState(true);
  const [prefSms, setPrefSms] = useState(false);
  const [prefWhatsapp, setPrefWhatsapp] = useState(false);
  const [prefPush, setPrefPush] = useState(true);

  // Clear messages
  const flashSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 5000);
  };
  const flashError = (msg: string) => {
    setErrorMsg(msg);
    setTimeout(() => setErrorMsg(''), 5000);
  };

  // ------------------- API Fetchers -------------------

  // Fetch Reverse Auctions
  const fetchReverseAuctions = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/new-features/reverse-auctions`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const data = await res.json();
      if (res.ok) setReverseAuctions(data.data || []);
    } catch (err) {
      console.error(err);
    }
  }, [accessToken]);

  // Fetch Bids for selected auction
  const fetchBidsForAuction = useCallback(async (auctionId: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/new-features/reverse-auctions/${auctionId}/bids`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const data = await res.json();
      if (res.ok) setAuctionBids(data.data || []);
    } catch (err) {
      console.error(err);
    }
  }, [accessToken]);

  // Fetch Community Posts
  const fetchCommunityPosts = useCallback(async (community: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/new-features/community/posts?communityName=${community}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const data = await res.json();
      if (res.ok) setPosts(data.data || []);
    } catch (err) {
      console.error(err);
    }
  }, [accessToken]);

  // Fetch Agricultural Events
  const fetchEvents = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/new-features/events`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const data = await res.json();
      if (res.ok) setEvents(data.data || []);
    } catch (err) {
      console.error(err);
    }
  }, [accessToken]);

  // Fetch Warehouse Receipts
  const fetchReceipts = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/new-features/warehouse/receipts`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const data = await res.json();
      if (res.ok) setReceipts(data.data || []);
    } catch (err) {
      console.error(err);
    }
  }, [accessToken]);

  // Fetch Cooperative Groups
  const fetchCooperatives = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/new-features/cooperatives`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const data = await res.json();
      if (res.ok) setCoops(data.data || []);
    } catch (err) {
      console.error(err);
    }
  }, [accessToken]);

  // Fetch Bulk Procurement Requirements (RFQ System)
  const fetchBulkRequirements = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/innovative/bulk-procurement`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const data = await res.json();
      if (res.ok) setBulkReqs(data.data || []);
    } catch (err) {
      console.error(err);
    }
  }, [accessToken]);

  // Fetch Referral Info
  const fetchReferralInfo = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/new-features/referral/code`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (res.ok) {
        setReferralCode(data.data.referralCode);
        setReferralPoints(data.data.rewardPoints);
      }

      // Leaderboard
      const lRes = await fetch(`${API_BASE_URL}/new-features/referral/leaderboard`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const lData = await lRes.json();
      if (lRes.ok) setLeaderboard(lData.data || []);
    } catch (err) {
      console.error(err);
    }
  }, [accessToken]);

  // Fetch Notification Preferences
  const fetchNotificationPreferences = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/new-features/notifications/preferences`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const data = await res.json();
      if (res.ok && data.data) {
        setPrefEmail(data.data.email);
        setPrefSms(data.data.sms);
        setPrefWhatsapp(data.data.whatsapp);
        setPrefPush(data.data.push);
      }
    } catch (err) {
      console.error(err);
    }
  }, [accessToken]);

  // Initial Seed / Fetch
  useEffect(() => {
    if (!accessToken) return;
    if (activeTab === 'reverse_auctions') {
      fetchReverseAuctions();
    } else if (activeTab === 'community') {
      fetchCommunityPosts(selectedCommunity);
    } else if (activeTab === 'events') {
      fetchEvents();
    } else if (activeTab === 'rfq') {
      fetchBulkRequirements();
    } else if (activeTab === 'receipts') {
      fetchReceipts();
    } else if (activeTab === 'coops') {
      fetchCooperatives();
    } else if (activeTab === 'referrals') {
      fetchReferralInfo();
    } else if (activeTab === 'notifications') {
      fetchNotificationPreferences();
    }
  }, [activeTab, selectedCommunity, fetchReverseAuctions, fetchCommunityPosts, fetchEvents, fetchBulkRequirements, fetchReceipts, fetchCooperatives, fetchReferralInfo, fetchNotificationPreferences, accessToken]);

  // ------------------- Button Action Handlers -------------------

  // 1. Create Reverse Auction
  const handleCreateReverseAuction = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/new-features/reverse-auctions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          cropType: newAuctionCrop,
          quantityTons: Number(newAuctionQty),
          maxPricePerTon: Number(newAuctionMaxPrice),
          deliveryLocation: newAuctionLoc,
          deadline: newAuctionDeadline,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        flashSuccess('Reverse auction request created successfully!');
        fetchReverseAuctions();
        setNewAuctionCrop('');
        setNewAuctionLoc('');
        setNewAuctionDeadline('');
      } else {
        flashError(data.message || 'Failed to create reverse auction.');
      }
    } catch (err) {
      flashError('Network error starting auction.');
    }
  };

  // Place Reverse Bid
  const handlePlaceReverseBid = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/new-features/reverse-auctions/bid`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          auctionId: selectedAuctionId,
          pricePerTon: Number(newBidPrice),
          deliveryDays: Number(newBidDelivery),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        flashSuccess('Reverse bid placed successfully! Good luck.');
        fetchBidsForAuction(selectedAuctionId);
      } else {
        flashError(data.message || 'Failed to place bid.');
      }
    } catch (err) {
      flashError('Network error placing bid.');
    }
  };

  // Select Bid Winner
  const handleSelectWinner = async (bidId: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/new-features/reverse-auctions/${selectedAuctionId}/winner`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ bidId }),
      });
      const data = await res.json();
      if (res.ok) {
        flashSuccess('Winner selected! Auction successfully completed.');
        fetchReverseAuctions();
        fetchBidsForAuction(selectedAuctionId);
      } else {
        flashError(data.message || 'Failed to select winner.');
      }
    } catch (err) {
      flashError('Network error selecting winner.');
    }
  };

  // 2. Community: Create Post
  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/new-features/community/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          communityName: selectedCommunity,
          content: newPostContent,
          imageUrl: newPostImage || undefined,
          language: newPostLang,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        flashSuccess('Post shared with the community!');
        fetchCommunityPosts(selectedCommunity);
        setNewPostContent('');
        setNewPostImage('');
      } else {
        flashError(data.message || 'Failed to share post.');
      }
    } catch (err) {
      flashError('Network error sharing post.');
    }
  };

  // Like Community Post
  const handleLikePost = async (postId: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/new-features/community/posts/${postId}/like`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (res.ok) {
        fetchCommunityPosts(selectedCommunity);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Comment on Post
  const handleAddComment = async (postId: string) => {
    const content = commentInputs[postId];
    if (!content) return;
    try {
      const res = await fetch(`${API_BASE_URL}/new-features/community/posts/${postId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ content }),
      });
      if (res.ok) {
        setCommentInputs(prev => ({ ...prev, [postId]: '' }));
        fetchCommunityPosts(selectedCommunity);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // 3. Register for Event
  const handleRegisterEvent = async (eventId: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/new-features/events/${eventId}/register`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const data = await res.json();
      if (res.ok) {
        flashSuccess(`Registered! Your Ticket Code: ${data.data.ticketCode}`);
        setRegisteredEvents(prev => [...prev, eventId]);
        fetchEvents();
      } else {
        flashError(data.message || 'Failed to register.');
      }
    } catch (err) {
      flashError('Network error during registration.');
    }
  };

  // 4. Warehouse Receipts: Create
  const handleCreateReceipt = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/new-features/warehouse/receipts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          warehouseId: newReceiptWh || 'WH-MOCK-MAIN',
          cropType: newReceiptCrop,
          quantityTons: Number(newReceiptQty),
          grade: newReceiptGrade,
          storageDurationDays: Number(newReceiptDuration),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        flashSuccess(`Digital Receipt generated: ${data.data.receiptNumber}`);
        fetchReceipts();
        setNewReceiptCrop('');
      } else {
        flashError(data.message || 'Failed to generate receipt.');
      }
    } catch (err) {
      flashError('Network error creating receipt.');
    }
  };

  // Release warehouse receipt
  const handleRequestRelease = async (id: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/new-features/warehouse/receipts/${id}/release-request`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (res.ok) {
        flashSuccess('Release request submitted successfully.');
        fetchReceipts();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Approve release (Admin tool)
  const handleApproveRelease = async (id: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/new-features/warehouse/receipts/${id}/approve-release`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (res.ok) {
        flashSuccess('Release approved. Cargo is cleared for pickup.');
        fetchReceipts();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // 5. Create Cooperative
  const handleCreateCoop = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/new-features/cooperatives`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ name: newCoopName, description: newCoopDesc }),
      });
      const data = await res.json();
      if (res.ok) {
        flashSuccess('Cooperative Group created successfully!');
        fetchCooperatives();
        setNewCoopName('');
        setNewCoopDesc('');
      } else {
        flashError(data.message || 'Failed to create group.');
      }
    } catch (err) {
      flashError('Network error creating co-op.');
    }
  };

  // Join Cooperative
  const handleJoinCoop = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/new-features/cooperatives/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ groupName: joinGroupName }),
      });
      const data = await res.json();
      if (res.ok) {
        flashSuccess(`Successfully joined ${joinGroupName}!`);
        fetchCooperatives();
        setJoinGroupName('');
      } else {
        flashError(data.message || 'Group not found or already joined.');
      }
    } catch (err) {
      flashError('Network error joining group.');
    }
  };

  // Add Shared Inventory to Cooperative
  const handleAddSharedInventory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/new-features/cooperatives/${selectedCoopId}/shared-inventory`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          cropType: sharedCrop,
          quantityTons: Number(sharedQty),
          grade: sharedGrade,
          pricePerTon: Number(sharedPrice),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        flashSuccess('Shared inventory added to cooperative!');
        fetchCooperatives();
        setSharedCrop('');
      } else {
        flashError(data.message || 'Failed to add shared inventory.');
      }
    } catch (err) {
      flashError('Network error uploading inventory.');
    }
  };

  // 6. Smart RFQ: Generate Professional PDF Quote
  const handleGenerateRFQ = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/new-features/rfq/quotation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          buyerRequirementId: selectedReqId,
          offeredPrice: Number(rfqPrice),
          quantityTons: Number(rfqQty),
          notes: rfqNotes,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        flashSuccess('Professional Quotation RFQ generated successfully!');
        setGeneratedRFQ(data.data);
      } else {
        flashError(data.message || 'Failed to generate RFQ.');
      }
    } catch (err) {
      flashError('Network error generating RFQ quotation.');
    }
  };

  // 7. Referral: Redeem code
  const handleRedeemReferral = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/new-features/referral/redeem`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ referralCode: redeemCode }),
      });
      const data = await res.json();
      if (res.ok) {
        flashSuccess('Referral code successfully redeemed! Cashback credited.');
        fetchReferralInfo();
        setRedeemCode('');
      } else {
        flashError(data.message || 'Invalid or already used referral code.');
      }
    } catch (err) {
      flashError('Network error redeeming referral.');
    }
  };

  // 8. Notification: Update preferences
  const handleSaveNotificationPrefs = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/new-features/notifications/preferences`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          email: prefEmail,
          sms: prefSms,
          whatsapp: prefWhatsapp,
          push: prefPush,
        }),
      });
      if (res.ok) {
        flashSuccess('Preferences updated. Real-time notifications active.');
      }
    } catch (err) {
      flashError('Network error saving preferences.');
    }
  };

  return (
    <div className="relative min-h-screen bg-[#070b19] text-white overflow-x-hidden flex flex-col font-sans">
      <AnimatedBackground />
      <Navbar />

      <main className="flex-grow max-w-7xl mx-auto w-full px-6 py-10 relative z-10 space-y-8">
        
        {/* Header Hero Section */}
        <div className="text-center md:text-left space-y-3 max-w-3xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-teal-500/20 bg-teal-500/5 text-xs text-teal-400 font-mono">
            <Flame className="h-3.5 w-3.5" /> MandiPrime AgriTech Ecosystem
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
            Next-Gen <span className="bg-gradient-to-r from-teal-400 to-lime-400 bg-clip-text text-transparent">Agri-SaaS Hub</span>
          </h1>
          <p className="text-sm md:text-base text-slate-400 leading-relaxed">
            Empowering modern agriculture with Reverse Auctions, Cooperative Shared Pools, Digital Warehouse Receipts, 
            multilingual Crop Communities, and real-time Notification orchestration.
          </p>
        </div>

        {/* Global Toast Alert banner */}
        <AnimatePresence>
          {successMsg && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 flex items-center gap-3"
            >
              <Check className="h-5 w-5 flex-shrink-0" />
              <span className="text-sm font-medium">{successMsg}</span>
            </motion.div>
          )}
          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="p-4 rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 flex items-center gap-3"
            >
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <span className="text-sm font-medium">{errorMsg}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dynamic Navigation Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-white/5 pb-4">
          {[
            { id: 'reverse_auctions', label: 'Reverse Auctions', icon: Flame },
            { id: 'community', label: 'Crop Communities', icon: MessageSquare },
            { id: 'events', label: 'Agri Events', icon: Calendar },
            { id: 'rfq', label: 'Smart RFQ System', icon: FileCheck },
            { id: 'receipts', label: 'Warehouse Receipts', icon: Warehouse },
            { id: 'coops', label: 'Cooperative Pools', icon: Users },
            { id: 'referrals', label: 'Referrals & Leaderboard', icon: Award },
            { id: 'notifications', label: 'Notification Center', icon: Bell },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-semibold transition-all duration-300 ${
                  isActive
                    ? 'border-teal-500/30 bg-teal-500/10 text-teal-300'
                    : 'border-white/5 bg-slate-900/35 text-slate-400 hover:text-white hover:bg-slate-900/50'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Contents */}
        <div className="grid grid-cols-1 gap-8">
          <AnimatePresence mode="wait">
            {/* 1. REVERSE AUCTION TAB */}
            {activeTab === 'reverse_auctions' && (
              <motion.div
                key="reverse_auctions"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Left Column: Create Reverse Auction Request */}
                  <div className="lg:col-span-1 rounded-2xl border border-white/5 bg-slate-900/30 p-6 space-y-4">
                    <h3 className="text-lg font-bold text-white">Post Reverse Procurement Request</h3>
                    <p className="text-xs text-slate-400">Buyers post requirements so farmers can compete to offer the lowest, most efficient rates.</p>
                    <form onSubmit={handleCreateReverseAuction} className="space-y-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 mb-1.5">Crop Type</label>
                        <input
                          type="text"
                          required
                          value={newAuctionCrop}
                          onChange={(e) => setNewAuctionCrop(e.target.value)}
                          placeholder="e.g. Wheat, Onion"
                          className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-teal-500"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-400 mb-1.5">Quantity (Tons)</label>
                          <input
                            type="number"
                            required
                            min="1"
                            value={newAuctionQty}
                            onChange={(e) => setNewAuctionQty(Number(e.target.value))}
                            className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-teal-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-400 mb-1.5">Max Budget / Ton (INR)</label>
                          <input
                            type="number"
                            required
                            min="100"
                            value={newAuctionMaxPrice}
                            onChange={(e) => setNewAuctionMaxPrice(Number(e.target.value))}
                            className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-teal-500"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 mb-1.5">Delivery Location</label>
                        <input
                          type="text"
                          required
                          value={newAuctionLoc}
                          onChange={(e) => setNewAuctionLoc(e.target.value)}
                          placeholder="e.g. Pune Market yard"
                          className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-teal-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 mb-1.5">Deadline Date</label>
                        <input
                          type="date"
                          required
                          value={newAuctionDeadline}
                          onChange={(e) => setNewAuctionDeadline(e.target.value)}
                          className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-teal-500 text-slate-300"
                        />
                      </div>
                      <button
                        type="submit"
                        className="w-full py-3 rounded-xl bg-gradient-to-r from-teal-500 to-lime-500 text-black font-semibold text-xs hover:opacity-95 transition-opacity"
                      >
                        Publish Procurement Request
                      </button>
                    </form>
                  </div>

                  {/* Center Column: List of Active Auctions */}
                  <div className="lg:col-span-2 space-y-4">
                    <h3 className="text-lg font-bold text-white">Active Procurement Auctions ({reverseAuctions.length})</h3>
                    {reverseAuctions.length === 0 ? (
                      <div className="p-12 text-center rounded-2xl border border-white/5 bg-slate-900/10 text-slate-500 text-xs">
                        No active reverse auctions available. Try posting a procurement request!
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {reverseAuctions.map((auc) => (
                          <div
                            key={auc.id}
                            className={`p-5 rounded-2xl border transition-all duration-300 ${
                              selectedAuctionId === auc.id
                                ? 'border-teal-500/40 bg-teal-500/[0.03]'
                                : 'border-white/5 bg-slate-900/20 hover:border-white/10'
                            }`}
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-base text-white">{auc.cropType} Request</span>
                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                    auc.status === 'ACTIVE'
                                      ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20'
                                      : 'bg-slate-800 text-slate-400'
                                  }`}>
                                    {auc.status}
                                  </span>
                                </div>
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
                                  <span>Quantity: <strong>{auc.quantityTons} Tons</strong></span>
                                  <span>Ceiling Price: <strong>₹{auc.maxPricePerTon}/Ton</strong></span>
                                  <span>Destination: <strong>{auc.deliveryLocation}</strong></span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => {
                                    setSelectedAuctionId(auc.id);
                                    fetchBidsForAuction(auc.id);
                                  }}
                                  className="px-4 py-2 rounded-xl border border-white/10 hover:border-teal-500/30 bg-slate-950 text-xs text-slate-300 hover:text-teal-300"
                                >
                                  View Bids ({auc.bids?.length || 0})
                                </button>
                              </div>
                            </div>

                            {/* Place Bid Form inside selected Auction */}
                            {selectedAuctionId === auc.id && auc.status === 'ACTIVE' && (
                              <div className="mt-5 pt-5 border-t border-white/5 grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-950/40 p-4 rounded-xl">
                                <div className="md:col-span-3 text-xs font-bold text-slate-300 flex items-center gap-1.5">
                                  <Flame className="h-3.5 w-3.5 text-teal-400" /> Farmers: Compete with your lowest offer
                                </div>
                                <div>
                                  <label className="block text-[10px] text-slate-500 mb-1">Your Price / Ton (INR)</label>
                                  <input
                                    type="number"
                                    value={newBidPrice}
                                    onChange={(e) => setNewBidPrice(Number(e.target.value))}
                                    className="w-full bg-slate-950 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[10px] text-slate-500 mb-1">Delivery Time (Days)</label>
                                  <input
                                    type="number"
                                    value={newBidDelivery}
                                    onChange={(e) => setNewBidDelivery(Number(e.target.value))}
                                    className="w-full bg-slate-950 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white"
                                  />
                                </div>
                                <div className="flex items-end">
                                  <button
                                    onClick={handlePlaceReverseBid}
                                    className="w-full py-2 rounded-lg bg-teal-500 text-black text-[11px] font-bold hover:bg-teal-400"
                                  >
                                    Submit Offer
                                  </button>
                                </div>
                              </div>
                            )}

                            {/* Bids List under selected Auction */}
                            {selectedAuctionId === auc.id && (
                              <div className="mt-5 space-y-2">
                                <div className="text-xs font-bold text-slate-300 mb-2">Offers and Bid Ranking:</div>
                                {auctionBids.length === 0 ? (
                                  <div className="p-3 text-center text-xs text-slate-500 bg-slate-950/20 rounded-xl">No offers submitted yet.</div>
                                ) : (
                                  <div className="space-y-2">
                                    {auctionBids.map((bid, index) => (
                                      <div
                                        key={bid.id}
                                        className="p-3 bg-slate-950/50 rounded-xl border border-white/5 flex items-center justify-between text-xs"
                                      >
                                        <div className="flex items-center gap-4">
                                          <span className="font-mono text-slate-500">#{index + 1}</span>
                                          <div className="space-y-0.5">
                                            <div className="text-white font-semibold">₹{bid.pricePerTon}/Ton</div>
                                            <div className="flex gap-3 text-[10px] text-slate-400">
                                              <span>Delivery: {bid.deliveryDays} Days</span>
                                              <span>Trust Score: {bid.trustScore}%</span>
                                            </div>
                                          </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          {bid.status === 'WINNER' ? (
                                            <span className="bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded-lg border border-emerald-500/20 font-bold text-[10px]">
                                              WINNER SELECTED
                                            </span>
                                          ) : bid.status === 'REJECTED' ? (
                                            <span className="text-slate-500 font-mono text-[10px]">REJECTED</span>
                                          ) : (
                                            auc.buyerId === user?.id && (
                                              <button
                                                onClick={() => handleSelectWinner(bid.id)}
                                                className="px-2.5 py-1 rounded-lg bg-lime-500 text-black text-[10px] font-bold hover:bg-lime-400"
                                              >
                                                Accept Offer
                                              </button>
                                            )
                                          )}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* 2. CROP COMMUNITY TAB */}
            {activeTab === 'community' && (
              <motion.div
                key="community"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-3 overflow-x-auto pb-2 border-b border-white/5">
                  {['Onion', 'Cotton', 'Wheat', 'Rice'].map((comm) => (
                    <button
                      key={comm}
                      onClick={() => setSelectedCommunity(comm)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                        selectedCommunity === comm
                          ? 'bg-teal-500 text-black'
                          : 'bg-slate-900/40 text-slate-400 hover:text-white'
                      }`}
                    >
                      {comm} Community
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Post creation panel */}
                  <div className="lg:col-span-1 rounded-2xl border border-white/5 bg-slate-900/30 p-6 space-y-4">
                    <h3 className="text-lg font-bold text-white">Start a Discussion</h3>
                    <form onSubmit={handleCreatePost} className="space-y-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 mb-1.5">Select Language</label>
                        <select
                          value={newPostLang}
                          onChange={(e) => setNewPostLang(e.target.value)}
                          className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white"
                        >
                          <option value="EN">English</option>
                          <option value="HI">Hindi (हिंदी)</option>
                          <option value="MR">Marathi (मराठी)</option>
                          <option value="AR">Arabic (العربية)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 mb-1.5">What is on your mind?</label>
                        <textarea
                          required
                          rows={4}
                          value={newPostContent}
                          onChange={(e) => setNewPostContent(e.target.value)}
                          placeholder="Ask questions about crop diseases, market prices, or supply advice..."
                          className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-teal-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 mb-1.5">Optional Image URL</label>
                        <input
                          type="text"
                          value={newPostImage}
                          onChange={(e) => setNewPostImage(e.target.value)}
                          placeholder="Paste image link here"
                          className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-slate-300"
                        />
                      </div>
                      <button
                        type="submit"
                        className="w-full py-3 rounded-xl bg-teal-500 text-black font-semibold text-xs hover:bg-teal-400"
                      >
                        Publish Post
                      </button>
                    </form>
                  </div>

                  {/* Discussion Feed */}
                  <div className="lg:col-span-2 space-y-6">
                    <h3 className="text-lg font-bold text-white">{selectedCommunity} Discussion Feed</h3>
                    {posts.length === 0 ? (
                      <div className="p-12 text-center rounded-2xl border border-white/5 bg-slate-900/10 text-slate-500 text-xs">
                        No community discussions started yet. Be the first to post!
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {posts.map((post) => (
                          <div key={post.id} className="p-6 rounded-2xl border border-white/5 bg-slate-900/20 space-y-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="h-9 w-9 rounded-full bg-slate-950 flex items-center justify-center font-bold text-teal-400">
                                  {post.userEmail.slice(0, 2).toUpperCase()}
                                </div>
                                <div>
                                  <div className="text-xs font-bold text-white">{post.userEmail}</div>
                                  <div className="text-[10px] text-slate-500">{new Date(post.createdAt).toLocaleDateString()}</div>
                                </div>
                              </div>
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-slate-400">
                                LANG: {post.language}
                              </span>
                            </div>

                            <p className="text-sm text-slate-300 leading-relaxed">{post.content}</p>
                            {post.imageUrl && (
                              <img
                                src={post.imageUrl}
                                alt="Post media"
                                className="w-full max-h-72 object-cover rounded-xl border border-white/5"
                              />
                            )}

                            {/* Likes, Comments counter */}
                            <div className="flex items-center gap-6 border-t border-white/5 pt-4 text-xs text-slate-400">
                              <button
                                onClick={() => handleLikePost(post.id)}
                                className="flex items-center gap-1.5 hover:text-white"
                              >
                                <ThumbsUp className="h-4 w-4 text-teal-400" />
                                <span>{post.likesCount} Likes</span>
                              </button>
                              <div className="flex items-center gap-1.5">
                                <MessageSquare className="h-4 w-4 text-lime-400" />
                                <span>{post.comments?.length || 0} Comments</span>
                              </div>
                            </div>

                            {/* Comments List */}
                            {post.comments && post.comments.length > 0 && (
                              <div className="space-y-3 bg-slate-950/40 p-4 rounded-xl mt-3 text-xs">
                                {post.comments.map((comment: any) => (
                                  <div key={comment.id} className="space-y-1">
                                    <div className="flex items-center gap-2 text-[10px]">
                                      <span className="font-semibold text-teal-400">{comment.userEmail}</span>
                                      <span className="text-slate-500">{new Date(comment.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <p className="text-slate-300">{comment.content}</p>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Comment Input */}
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={commentInputs[post.id] || ''}
                                onChange={(e) =>
                                  setCommentInputs(prev => ({ ...prev, [post.id]: e.target.value }))
                                }
                                placeholder="Add a comment..."
                                className="flex-1 bg-slate-950 border border-white/10 rounded-xl px-4 py-2 text-xs text-white"
                              />
                              <button
                                onClick={() => handleAddComment(post.id)}
                                className="p-2.5 rounded-xl bg-teal-500 text-black hover:bg-teal-400"
                              >
                                <Send className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* 3. AGRICULTURAL EVENTS TAB */}
            {activeTab === 'events' && (
              <motion.div
                key="events"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Create Event (Admin tool / Exporter Tool) */}
                  <div className="lg:col-span-1 rounded-2xl border border-white/5 bg-slate-900/30 p-6 space-y-4">
                    <h3 className="text-lg font-bold text-white">Host Agricultural Event</h3>
                    <p className="text-xs text-slate-400">Post webinars, trade fairs, and farm expos for cooperative networks.</p>
                    <form
                      onSubmit={async (e) => {
                        e.preventDefault();
                        const res = await fetch(`${API_BASE_URL}/new-features/events`, {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${accessToken}`,
                          },
                          body: JSON.stringify({
                            title: newEventTitle,
                            description: newEventDesc,
                            type: newEventType,
                            date: newEventDate,
                            location: newEventLoc,
                          }),
                        });
                        if (res.ok) {
                          flashSuccess('Agri Event posted successfully!');
                          fetchEvents();
                          setNewEventTitle('');
                          setNewEventDesc('');
                          setNewEventLoc('');
                        }
                      }}
                      className="space-y-4"
                    >
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Event Title</label>
                        <input
                          type="text"
                          required
                          value={newEventTitle}
                          onChange={(e) => setNewEventTitle(e.target.value)}
                          placeholder="e.g. Organic Farming Summit"
                          className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Description</label>
                        <textarea
                          required
                          value={newEventDesc}
                          onChange={(e) => setNewEventDesc(e.target.value)}
                          placeholder="Join other farmers for insights..."
                          className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs text-slate-400 mb-1">Event Type</label>
                          <select
                            value={newEventType}
                            onChange={(e) => setNewEventType(e.target.value)}
                            className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white"
                          >
                            <option value="WEBINAR">Webinar</option>
                            <option value="EXPO">Farm Expo</option>
                            <option value="FAIR">Trade Fair</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs text-slate-400 mb-1">Event Date</label>
                          <input
                            type="datetime-local"
                            required
                            value={newEventDate}
                            onChange={(e) => setNewEventDate(e.target.value)}
                            className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Location or Link</label>
                        <input
                          type="text"
                          required
                          value={newEventLoc}
                          onChange={(e) => setNewEventLoc(e.target.value)}
                          placeholder="Zoom link or Physical venue address"
                          className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white"
                        />
                      </div>
                      <button
                        type="submit"
                        className="w-full py-3 rounded-xl bg-teal-500 text-black font-semibold text-xs hover:bg-teal-400"
                      >
                        Publish Event
                      </button>
                    </form>
                  </div>

                  {/* Events Catalog */}
                  <div className="lg:col-span-2 space-y-4">
                    <h3 className="text-lg font-bold text-white">Upcoming Events Catalog ({events.length})</h3>
                    {events.length === 0 ? (
                      <div className="p-12 text-center rounded-2xl border border-white/5 bg-slate-900/10 text-slate-500 text-xs">
                        No scheduled agricultural events right now.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {events.map((evt) => (
                          <div key={evt.id} className="p-5 rounded-2xl border border-white/5 bg-slate-900/20 space-y-4 flex flex-col justify-between">
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-500/10 text-teal-400 border border-teal-500/20">
                                  {evt.type}
                                </span>
                                <span className="text-xs text-slate-500">{new Date(evt.date).toLocaleDateString()}</span>
                              </div>
                              <h4 className="font-bold text-sm text-white">{evt.title}</h4>
                              <p className="text-xs text-slate-400 line-clamp-2">{evt.description}</p>
                              <div className="text-xs text-slate-500">
                                Location: <span className="text-slate-300 font-semibold">{evt.location}</span>
                              </div>
                            </div>
                            
                            <button
                              onClick={() => handleRegisterEvent(evt.id)}
                              disabled={registeredEvents.includes(evt.id)}
                              className={`w-full py-2 rounded-xl text-xs font-semibold border transition-all ${
                                registeredEvents.includes(evt.id)
                                  ? 'border-emerald-500/20 bg-emerald-500/5 text-emerald-400 cursor-default'
                                  : 'border-white/10 hover:border-teal-500 bg-slate-950 text-slate-300 hover:text-teal-300'
                              }`}
                            >
                              {registeredEvents.includes(evt.id) ? '✓ Registered' : 'Get Free Ticket'}
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* 4. SMART RFQ SYSTEM TAB */}
            {activeTab === 'rfq' && (
              <motion.div
                key="rfq"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Select procurement request and quote */}
                  <div className="lg:col-span-1 rounded-2xl border border-white/5 bg-slate-900/30 p-6 space-y-4">
                    <h3 className="text-lg font-bold text-white">Generate RFQ Quotation</h3>
                    <p className="text-xs text-slate-400">Farmers can create verified, professional quotes for bulk buyer requirements.</p>
                    <form onSubmit={handleGenerateRFQ} className="space-y-4">
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Select Procurement Request</label>
                        <select
                          required
                          value={selectedReqId}
                          onChange={(e) => setSelectedReqId(e.target.value)}
                          className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white"
                        >
                          <option value="">-- Choose Buyer Request --</option>
                          {bulkReqs.map((req) => (
                            <option key={req.id} value={req.id}>
                              {req.cropType} - {req.quantityTons} Tons (Budget: ₹{req.budgetPrice}/Ton)
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs text-slate-400 mb-1">Offered Price / Ton</label>
                          <input
                            type="number"
                            required
                            value={rfqPrice}
                            onChange={(e) => setRfqPrice(Number(e.target.value))}
                            className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2 text-xs text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-slate-400 mb-1">Available Quantity</label>
                          <input
                            type="number"
                            required
                            value={rfqQty}
                            onChange={(e) => setRfqQty(Number(e.target.value))}
                            className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2 text-xs text-white"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Quotation Notes</label>
                        <textarea
                          value={rfqNotes}
                          onChange={(e) => setRfqNotes(e.target.value)}
                          placeholder="Mention delivery logistics availability, grade certificates, etc."
                          className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2 text-xs text-white"
                        />
                      </div>
                      <button
                        type="submit"
                        className="w-full py-3 rounded-xl bg-teal-500 text-black font-semibold text-xs hover:bg-teal-400"
                      >
                        Generate RFQ & PDF
                      </button>
                    </form>
                  </div>

                  {/* PDF output representation */}
                  <div className="lg:col-span-2 space-y-4">
                    <h3 className="text-lg font-bold text-white">Smart RFQ Document Center</h3>
                    {generatedRFQ ? (
                      <div className="p-6 rounded-2xl border border-teal-500/20 bg-teal-500/[0.02] space-y-6">
                        <div className="flex items-center justify-between border-b border-white/5 pb-4">
                          <div className="space-y-1">
                            <span className="text-[10px] text-teal-400 font-mono">STATUS: GENERATED & TRACKED</span>
                            <h4 className="font-bold text-white">{generatedRFQ.documentName}</h4>
                          </div>
                          <a
                            href={generatedRFQ.pdfUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 rounded-xl bg-teal-500 text-black text-xs font-bold hover:bg-teal-400 flex items-center gap-1.5"
                          >
                            <Download className="h-4 w-4" /> Download PDF
                          </a>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
                          <div className="p-3 bg-slate-950/40 rounded-xl">
                            <span className="text-slate-500 block mb-1">QUOTE ID</span>
                            <span className="text-white font-bold">{generatedRFQ.quotation.id.slice(0, 8).toUpperCase()}</span>
                          </div>
                          <div className="p-3 bg-slate-950/40 rounded-xl">
                            <span className="text-slate-500 block mb-1">OFFERED PRICE</span>
                            <span className="text-white font-bold">₹{generatedRFQ.quotation.offeredPrice}/Ton</span>
                          </div>
                          <div className="p-3 bg-slate-950/40 rounded-xl">
                            <span className="text-slate-500 block mb-1">QUANTITY</span>
                            <span className="text-white font-bold">{generatedRFQ.quotation.quantityTons} Tons</span>
                          </div>
                          <div className="p-3 bg-slate-950/40 rounded-xl">
                            <span className="text-slate-500 block mb-1">CREATED AT</span>
                            <span className="text-white font-bold">{new Date(generatedRFQ.quotation.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>

                        <div className="p-4 bg-slate-950/30 rounded-xl text-xs space-y-2">
                          <strong className="text-slate-300">Quotation Terms & Conditions:</strong>
                          <p className="text-slate-400 leading-relaxed">
                            This document is generated by MandiPrime RFQ engine. The quoted price is valid for 7 business days. 
                            Release is conditional on escrow clearance from the buyer.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="p-12 text-center rounded-2xl border border-white/5 bg-slate-900/10 text-slate-500 text-xs">
                        Fill out the quote builder to generate a professional PDF.
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* 5. WAREHOUSE RECEIPTS TAB */}
            {activeTab === 'receipts' && (
              <motion.div
                key="receipts"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Create Warehouse Receipt */}
                  <div className="lg:col-span-1 rounded-2xl border border-white/5 bg-slate-900/30 p-6 space-y-4">
                    <h3 className="text-lg font-bold text-white">Generate Warehouse Receipt</h3>
                    <p className="text-xs text-slate-400">Generate a digital tokenized receipt for deposit audit trails.</p>
                    <form onSubmit={handleCreateReceipt} className="space-y-4">
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Warehouse Facility</label>
                        <input
                          type="text"
                          required
                          value={newReceiptWh}
                          onChange={(e) => setNewReceiptWh(e.target.value)}
                          placeholder="e.g. MandiPrime Central Storage WH-1"
                          className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Crop Type</label>
                        <input
                          type="text"
                          required
                          value={newReceiptCrop}
                          onChange={(e) => setNewReceiptCrop(e.target.value)}
                          placeholder="e.g. Cotton"
                          className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white"
                        />
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="col-span-1">
                          <label className="block text-xs text-slate-400 mb-1">Tons</label>
                          <input
                            type="number"
                            required
                            value={newReceiptQty}
                            onChange={(e) => setNewReceiptQty(Number(e.target.value))}
                            className="w-full bg-slate-950 border border-white/10 rounded-xl px-2.5 py-2 text-xs text-white"
                          />
                        </div>
                        <div className="col-span-1">
                          <label className="block text-xs text-slate-400 mb-1">Grade</label>
                          <input
                            type="text"
                            required
                            value={newReceiptGrade}
                            onChange={(e) => setNewReceiptGrade(e.target.value)}
                            className="w-full bg-slate-950 border border-white/10 rounded-xl px-2.5 py-2 text-xs text-white"
                          />
                        </div>
                        <div className="col-span-1">
                          <label className="block text-xs text-slate-400 mb-1">Days</label>
                          <input
                            type="number"
                            required
                            value={newReceiptDuration}
                            onChange={(e) => setNewReceiptDuration(Number(e.target.value))}
                            className="w-full bg-slate-950 border border-white/10 rounded-xl px-2.5 py-2 text-xs text-white"
                          />
                        </div>
                      </div>
                      <button
                        type="submit"
                        className="w-full py-3 rounded-xl bg-teal-500 text-black font-semibold text-xs hover:bg-teal-400"
                      >
                        Create Digital Receipt
                      </button>
                    </form>
                  </div>

                  {/* List of Receipts */}
                  <div className="lg:col-span-2 space-y-4">
                    <h3 className="text-lg font-bold text-white">Digital Warehouse Receipts ({receipts.length})</h3>
                    {receipts.length === 0 ? (
                      <div className="p-12 text-center rounded-2xl border border-white/5 bg-slate-900/10 text-slate-500 text-xs">
                        No warehouse storage receipts issued yet.
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {receipts.map((rec) => (
                          <div key={rec.id} className="p-5 rounded-2xl border border-white/5 bg-slate-900/20 space-y-3">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                              <div className="space-y-1">
                                <span className="text-[10px] text-teal-400 font-mono">RECEIPT NO: {rec.receiptNumber}</span>
                                <h4 className="font-bold text-white">{rec.cropType} ({rec.quantityTons} Tons) - {rec.grade}</h4>
                                <div className="text-xs text-slate-400">
                                  Deposited: {new Date(rec.depositDate).toLocaleDateString()} • Storage: {rec.storageDurationDays} days
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                  rec.status === 'STORED'
                                    ? 'bg-blue-500/10 text-blue-400'
                                    : rec.status === 'RELEASE_REQUESTED'
                                    ? 'bg-amber-500/10 text-amber-400'
                                    : 'bg-emerald-500/10 text-emerald-400'
                                }`}>
                                  {rec.status}
                                </span>

                                {rec.status === 'STORED' && (
                                  <button
                                    onClick={() => handleRequestRelease(rec.id)}
                                    className="px-3 py-1.5 rounded-lg bg-teal-500 text-black text-[10px] font-bold hover:bg-teal-400"
                                  >
                                    Request Release
                                  </button>
                                )}

                                {rec.status === 'RELEASE_REQUESTED' && user?.role === 'ADMIN' && (
                                  <button
                                    onClick={() => handleApproveRelease(rec.id)}
                                    className="px-3 py-1.5 rounded-lg bg-emerald-500 text-black text-[10px] font-bold hover:bg-emerald-400"
                                  >
                                    Approve Release
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* 6. COOPERATIVE GROUPS TAB */}
            {activeTab === 'coops' && (
              <motion.div
                key="coops"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Join / Create Co-op */}
                  <div className="lg:col-span-1 space-y-6">
                    {/* Create */}
                    <div className="rounded-2xl border border-white/5 bg-slate-900/30 p-6 space-y-4">
                      <h3 className="text-lg font-bold text-white">Form a Cooperative</h3>
                      <form onSubmit={handleCreateCoop} className="space-y-4">
                        <div>
                          <label className="block text-xs text-slate-400 mb-1">Cooperative Name</label>
                          <input
                            type="text"
                            required
                            value={newCoopName}
                            onChange={(e) => setNewCoopName(e.target.value)}
                            placeholder="e.g. Sahyadri Grape Growers"
                            className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2 text-xs text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-slate-400 mb-1">Description</label>
                          <textarea
                            value={newCoopDesc}
                            onChange={(e) => setNewCoopDesc(e.target.value)}
                            placeholder="Shared storage & logistics..."
                            className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2 text-xs text-white"
                          />
                        </div>
                        <button
                          type="submit"
                          className="w-full py-2.5 rounded-xl bg-teal-500 text-black font-semibold text-xs hover:bg-teal-400"
                        >
                          Create Group
                        </button>
                      </form>
                    </div>

                    {/* Join */}
                    <div className="rounded-2xl border border-white/5 bg-slate-900/30 p-6 space-y-4">
                      <h3 className="text-lg font-bold text-white">Join Cooperative</h3>
                      <form onSubmit={handleJoinCoop} className="space-y-4">
                        <div>
                          <label className="block text-xs text-slate-400 mb-1">Enter Group Name</label>
                          <input
                            type="text"
                            required
                            value={joinGroupName}
                            onChange={(e) => setJoinGroupName(e.target.value)}
                            placeholder="e.g. Sahyadri Grape Growers"
                            className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2 text-xs text-white"
                          />
                        </div>
                        <button
                          type="submit"
                          className="w-full py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white font-semibold text-xs hover:bg-white/5"
                        >
                          Join Group
                        </button>
                      </form>
                    </div>
                  </div>

                  {/* Cooperatives List */}
                  <div className="lg:col-span-2 space-y-4">
                    <h3 className="text-lg font-bold text-white">Active Farmer Cooperatives ({coops.length})</h3>
                    {coops.length === 0 ? (
                      <div className="p-12 text-center rounded-2xl border border-white/5 bg-slate-900/10 text-slate-500 text-xs">
                        No cooperative groups formed yet.
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {coops.map((group) => (
                          <div key={group.id} className="p-6 rounded-2xl border border-white/5 bg-slate-900/20 space-y-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-bold text-base text-white">{group.name}</h4>
                                <p className="text-xs text-slate-400">{group.description}</p>
                              </div>
                              <span className="text-xs text-slate-500 font-mono">Members: {group.members?.length || 0}</span>
                            </div>

                            {/* Shared Inventory section */}
                            <div className="space-y-2 border-t border-white/5 pt-4">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-300">Shared Group Inventory</span>
                                <button
                                  onClick={() => setSelectedCoopId(group.id)}
                                  className="text-[10px] text-teal-400 font-semibold hover:underline flex items-center gap-1"
                                >
                                  <Plus className="h-3.5 w-3.5" /> Add Stock
                                </button>
                              </div>

                              {group.sharedInventory?.length === 0 ? (
                                <div className="text-xs text-slate-500 italic p-2 bg-slate-950/20 rounded">No shared stocks yet.</div>
                              ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                                  {group.sharedInventory?.map((item: any) => (
                                    <div key={item.id} className="p-3 bg-slate-950/40 rounded-xl border border-white/5 flex justify-between">
                                      <span>{item.cropType} ({item.quantityTons} Tons) - {item.grade}</span>
                                      <span className="text-teal-400 font-bold">₹{item.pricePerTon}/Ton</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Add Shared Inventory Form */}
                            {selectedCoopId === group.id && (
                              <form onSubmit={handleAddSharedInventory} className="p-4 bg-slate-950/40 rounded-xl grid grid-cols-2 gap-3 text-xs">
                                <div className="col-span-2 font-bold text-slate-300">Add Shared Stock:</div>
                                <div>
                                  <label className="block mb-1 text-slate-500">Crop Type</label>
                                  <input
                                    type="text"
                                    required
                                    value={sharedCrop}
                                    onChange={(e) => setSharedCrop(e.target.value)}
                                    className="w-full bg-slate-950 border border-white/10 rounded px-2.5 py-1"
                                  />
                                </div>
                                <div>
                                  <label className="block mb-1 text-slate-500">Tons</label>
                                  <input
                                    type="number"
                                    required
                                    value={sharedQty}
                                    onChange={(e) => setSharedQty(Number(e.target.value))}
                                    className="w-full bg-slate-950 border border-white/10 rounded px-2.5 py-1"
                                  />
                                </div>
                                <div>
                                  <label className="block mb-1 text-slate-500">Grade</label>
                                  <input
                                    type="text"
                                    required
                                    value={sharedGrade}
                                    onChange={(e) => setSharedGrade(e.target.value)}
                                    className="w-full bg-slate-950 border border-white/10 rounded px-2.5 py-1"
                                  />
                                </div>
                                <div>
                                  <label className="block mb-1 text-slate-500">Price / Ton (₹)</label>
                                  <input
                                    type="number"
                                    required
                                    value={sharedPrice}
                                    onChange={(e) => setSharedPrice(Number(e.target.value))}
                                    className="w-full bg-slate-950 border border-white/10 rounded px-2.5 py-1"
                                  />
                                </div>
                                <div className="col-span-2 flex justify-end gap-2 mt-2">
                                  <button
                                    type="button"
                                    onClick={() => setSelectedCoopId('')}
                                    className="px-3 py-1 bg-slate-900 border border-white/10 rounded text-slate-400"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    type="submit"
                                    className="px-3 py-1 bg-teal-500 text-black font-bold rounded"
                                  >
                                    Upload Stock
                                  </button>
                                </div>
                              </form>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* 7. REFERRALS TAB */}
            {activeTab === 'referrals' && (
              <motion.div
                key="referrals"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Your referrals info */}
                  <div className="lg:col-span-1 rounded-2xl border border-white/5 bg-slate-900/30 p-6 space-y-6">
                    <div className="space-y-2 text-center">
                      <Award className="h-10 w-10 text-teal-400 mx-auto" />
                      <h3 className="text-lg font-bold text-white">Refer & Earn Cashback</h3>
                      <p className="text-xs text-slate-400">Share your invite code with other exporters and farmers. Earn ₹50 cashback per registration!</p>
                    </div>

                    <div className="p-4 bg-slate-950 rounded-xl text-center space-y-1.5">
                      <span className="text-[10px] text-slate-500 font-mono">YOUR INVITE CODE</span>
                      <div className="text-xl font-black text-white tracking-widest select-all cursor-pointer bg-white/5 p-2 rounded-lg border border-white/5 hover:border-teal-500/20">
                        {referralCode || 'GENERATING...'}
                      </div>
                      <span className="text-[10px] text-teal-400">Total Points Earned: {referralPoints} pts</span>
                    </div>

                    {/* Redeem referral code */}
                    <form onSubmit={handleRedeemReferral} className="space-y-3 pt-4 border-t border-white/5">
                      <label className="block text-xs text-slate-400">Redeem Referral Code</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          required
                          value={redeemCode}
                          onChange={(e) => setRedeemCode(e.target.value)}
                          placeholder="e.g. MANDI-ADMIN-123"
                          className="flex-1 bg-slate-950 border border-white/10 rounded-xl px-4 py-2 text-xs text-white"
                        />
                        <button
                          type="submit"
                          className="px-4 py-2 rounded-xl bg-teal-500 text-black text-xs font-bold hover:bg-teal-400"
                        >
                          Redeem
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Leaderboard */}
                  <div className="lg:col-span-2 space-y-4">
                    <h3 className="text-lg font-bold text-white">Referral Rewards Leaderboard</h3>
                    <div className="rounded-2xl border border-white/5 bg-slate-900/20 overflow-hidden">
                      <div className="p-4 bg-slate-950 border-b border-white/5 grid grid-cols-4 text-xs font-bold text-slate-400">
                        <span>Rank</span>
                        <span className="col-span-2">Referrer</span>
                        <span className="text-right">Points</span>
                      </div>
                      
                      {leaderboard.length === 0 ? (
                        <div className="p-8 text-center text-xs text-slate-500">No referrals logged on the leaderboard yet.</div>
                      ) : (
                        <div className="divide-y divide-white/5">
                          {leaderboard.map((item, index) => (
                            <div key={item.id} className="p-4 grid grid-cols-4 text-xs items-center">
                              <span className="font-mono text-slate-500">#{index + 1}</span>
                              <span className="col-span-2 text-slate-200">{item.referrerEmail}</span>
                              <span className="text-right text-teal-400 font-bold">{item.rewardPoints} pts</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* 8. NOTIFICATION PREFERENCES TAB */}
            {activeTab === 'notifications' && (
              <motion.div
                key="notifications"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="max-w-2xl mx-auto rounded-2xl border border-white/5 bg-slate-900/30 p-8 space-y-6"
              >
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Bell className="h-5 w-5 text-teal-400" /> Notifications & Alert Preferences
                  </h3>
                  <p className="text-xs text-slate-400">Manage how and when you receive order updates, logistics triggers, and price alerts.</p>
                </div>

                <div className="space-y-4 divide-y divide-white/5">
                  <div className="flex items-center justify-between py-3">
                    <div className="space-y-0.5">
                      <div className="text-sm font-semibold text-white">Email Dispatch</div>
                      <p className="text-xs text-slate-500">Receive trade reports and digital invoice copies.</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={prefEmail}
                      onChange={(e) => setPrefEmail(e.target.checked)}
                      className="w-4 h-4 rounded text-teal-500 bg-slate-950 border-white/10"
                    />
                  </div>

                  <div className="flex items-center justify-between py-3">
                    <div className="space-y-0.5">
                      <div className="text-sm font-semibold text-white">SMS Updates</div>
                      <p className="text-xs text-slate-500">Receive dispatch and gate pass codes on mobile.</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={prefSms}
                      onChange={(e) => setPrefSms(e.target.checked)}
                      className="w-4 h-4 rounded text-teal-500 bg-slate-950 border-white/10"
                    />
                  </div>

                  <div className="flex items-center justify-between py-3">
                    <div className="space-y-0.5">
                      <div className="text-sm font-semibold text-white">WhatsApp Integration</div>
                      <p className="text-xs text-slate-500">Get quick negotiation offers on your WhatsApp number.</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={prefWhatsapp}
                      onChange={(e) => setPrefWhatsapp(e.target.checked)}
                      className="w-4 h-4 rounded text-teal-500 bg-slate-950 border-white/10"
                    />
                  </div>

                  <div className="flex items-center justify-between py-3">
                    <div className="space-y-0.5">
                      <div className="text-sm font-semibold text-white">In-App Push Alerts</div>
                      <p className="text-xs text-slate-500">Real-time alerts for outbids and contract signatures.</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={prefPush}
                      onChange={(e) => setPrefPush(e.target.checked)}
                      className="w-4 h-4 rounded text-teal-500 bg-slate-950 border-white/10"
                    />
                  </div>
                </div>

                <button
                  onClick={handleSaveNotificationPrefs}
                  className="w-full py-3 rounded-xl bg-teal-500 text-black font-semibold text-xs hover:bg-teal-400"
                >
                  Save Notification Channels
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </main>

      <Footer />
    </div>
  );
}
