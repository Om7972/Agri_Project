'use client';

import React, { useEffect, useState } from 'react';
import Navbar from '@/components/navbar/Navbar';
import AnimatedBackground from '@/components/AnimatedBackground';
import { useAuthStore } from '@/store/useAuthStore';
import { motion } from 'framer-motion';
import { ShieldAlert, Users, FileCheck, History, Check, X, RefreshCcw } from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

interface UserRow {
  id: string;
  email: string;
  role: string;
  createdAt: string;
  profile?: { fullName?: string; phone?: string };
}

interface ComplianceDoc {
  id: string;
  documentType: string;
  fileUrl: string;
  status: string;
  shipment: { trackingNumber: string };
}

interface AuditLogItem {
  id: string;
  action: string;
  ipAddress?: string;
  details?: string;
  createdAt: string;
  user?: { email: string };
}

export default function AdminPanelPage() {
  const { user, accessToken } = useAuthStore();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [docs, setDocs] = useState<ComplianceDoc[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${accessToken}` };
      
      // Fetch users
      const usersRes = await fetch(`${API_BASE_URL}/admin/users`, { headers });
      const usersData = await usersRes.json();
      if (usersRes.ok && usersData.success) {
        setUsers(usersData.data.users || []);
      }

      // Fetch audit logs
      const auditRes = await fetch(`${API_BASE_URL}/admin/audit-logs`, { headers });
      const auditData = await auditRes.json();
      if (auditRes.ok && auditData.success) {
        setAuditLogs(auditData.data.logs || []);
      }

      // Fetch pending documents (simulate via API export document listings)
      const docsRes = await fetch(`${API_BASE_URL}/export`, { headers });
      const docsData = await docsRes.json();
      if (docsRes.ok && docsData.success) {
        // Flatten documents list
        const flattenedDocs: ComplianceDoc[] = [];
        docsData.data.forEach((s: any) => {
          s.documents.forEach((d: any) => {
            if (d.status === 'PENDING') {
              flattenedDocs.push({
                id: d.id,
                documentType: d.documentType,
                fileUrl: d.fileUrl,
                status: d.status,
                shipment: { trackingNumber: s.trackingNumber },
              });
            }
          });
        });
        setDocs(flattenedDocs);
      }
    } catch (err) {
      // Fallback
      setUsers(fallbackUsers);
      setDocs(fallbackDocs);
      setAuditLogs(fallbackAuditLogs);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (accessToken) {
      fetchData();
    }
  }, [accessToken]);

  const handleUpdateRole = async (userId: string, newRole: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/users/${userId}/role`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ role: newRole }),
      });
      if (res.ok) {
        setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleVerifyDoc = async (docId: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      const res = await fetch(`${API_BASE_URL}/export/document/${docId}/verify`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ status, notes: `Verified by admin ${user?.email}` }),
      });
      if (res.ok) {
        setDocs(docs.filter(d => d.id !== docId));
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!user || user.role !== 'ADMIN') {
    return (
      <>
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] text-center px-6">
          <ShieldAlert className="h-12 w-12 text-red-500 mb-4 animate-bounce" />
          <h2 className="text-xl font-bold text-white mb-2">Access Denied</h2>
          <p className="text-slate-400 text-xs font-mono max-w-sm">This terminal is protected by multi-level RBAC protocols. Administrator credentials required.</p>
        </div>
      </>
    );
  }

  return (
    <>
      <AnimatedBackground />
      <Navbar />

      <main className="min-h-screen py-12 px-6 max-w-7xl mx-auto relative z-10 space-y-12">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-red-500/30 bg-red-500/5 px-3 py-1 text-xs font-semibold text-red-400">
            <ShieldAlert className="h-3.5 w-3.5 text-red-400" />
            Central Control Panel
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
            MandiPrime{' '}
            <span className="bg-gradient-to-r from-red-400 to-amber-400 bg-clip-text text-transparent">
              Admin Node
            </span>
          </h1>
          <p className="text-slate-400 text-sm sm:text-base">
            Oversee user permissions, authenticate international freight clearances, and check audit logs.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-red-500 border-t-transparent" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            
            {/* Left: User role management */}
            <div className="lg:col-span-1 rounded-3xl border border-white/5 bg-slate-900/40 p-6 shadow-2xl backdrop-blur-md space-y-4">
              <h3 className="font-bold text-white text-base flex items-center gap-2 pb-3 border-b border-white/5">
                <Users className="h-5 w-5 text-teal-400" />
                RBAC Role Config
              </h3>
              <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                {users.map((u, idx) => {
                  const initials = (u.profile?.fullName || u.email).substring(0, 2).toUpperCase();
                  const avatarColor = u.role === 'ADMIN' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                                      u.role === 'FARMER' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                                      u.role === 'EXPORTER' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                                      'bg-blue-500/20 text-blue-400 border-blue-500/30';
                  
                  return (
                    <motion.div
                      key={u.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="p-4 rounded-2xl bg-slate-900/60 border border-white/5 space-y-3 hover:border-white/10 hover:bg-slate-900/80 transition-all duration-300"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`h-9 w-9 rounded-xl border flex items-center justify-center text-xs font-bold font-sans shrink-0 ${avatarColor}`}>
                          {initials}
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="text-white font-bold text-xs truncate block">{u.profile?.fullName || u.email}</span>
                          <span className="text-[10px] text-slate-500 truncate block font-mono">{u.email}</span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center pt-2.5 border-t border-white/5">
                        <span className={`text-[9px] font-bold font-mono px-2 py-0.5 rounded-full border ${
                          u.role === 'ADMIN' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                          u.role === 'FARMER' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                          u.role === 'EXPORTER' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                          'bg-blue-500/10 text-blue-400 border-blue-500/20'
                        }`}>
                          {u.role}
                        </span>

                        <select
                          title="Select User Role"
                          value={u.role}
                          onChange={(e) => handleUpdateRole(u.id, e.target.value)}
                          className="bg-slate-950 border border-white/10 rounded-lg px-2.5 py-1 text-[10px] text-teal-400 focus:border-teal-500/50 focus:outline-none transition-colors cursor-pointer"
                        >
                          <option value="FARMER">FARMER</option>
                          <option value="BUYER">BUYER</option>
                          <option value="EXPORTER">EXPORTER</option>
                          <option value="ADMIN">ADMIN</option>
                        </select>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Center: Compliance checks */}
            <div className="lg:col-span-1 rounded-3xl border border-white/5 bg-slate-900/40 p-6 shadow-2xl backdrop-blur-md space-y-4">
              <h3 className="font-bold text-white text-base flex items-center gap-2 pb-3 border-b border-white/5">
                <FileCheck className="h-5 w-5 text-lime-400" />
                Compliance Clearance
              </h3>
              <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                {docs.map((doc, idx) => (
                  <motion.div
                    key={doc.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="p-4 rounded-2xl bg-slate-900/60 border border-white/5 space-y-3 hover:border-white/10 hover:bg-slate-900/80 transition-all duration-300"
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <span className="text-white font-bold text-xs block">{doc.documentType}</span>
                        <span className="text-[10px] text-slate-500 block font-mono mt-0.5">SHIPMENT: {doc.shipment.trackingNumber}</span>
                      </div>
                      <span className="text-[9px] bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                        {doc.status}
                      </span>
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t border-white/5">
                      <a
                        href={doc.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-teal-400 hover:text-teal-300 font-semibold transition-colors text-[10px] underline decoration-teal-500/30 underline-offset-4"
                      >
                        View Certificate Document
                      </a>
                      <div className="flex gap-1.5">
                        <button
                          title="Approve Document"
                          aria-label="Approve Document"
                          onClick={() => handleVerifyDoc(doc.id, 'APPROVED')}
                          className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 hover:bg-emerald-500/20 active:scale-95 transition-all cursor-pointer"
                        >
                          <Check className="h-3.5 w-3.5" />
                        </button>
                        <button
                          title="Reject Document"
                          aria-label="Reject Document"
                          onClick={() => handleVerifyDoc(doc.id, 'REJECTED')}
                          className="p-1.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/25 hover:bg-red-500/20 active:scale-95 transition-all cursor-pointer"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
                {docs.length === 0 && (
                  <div className="text-center py-12 text-slate-500 text-xs italic">Compliance queue is clear.</div>
                )}
              </div>
            </div>

            {/* Right: Security logs */}
            <div className="lg:col-span-1 rounded-3xl border border-white/5 bg-slate-900/40 p-6 shadow-2xl backdrop-blur-md space-y-4">
              <h3 className="font-bold text-white text-base flex items-center gap-2 pb-3 border-b border-white/5">
                <History className="h-5 w-5 text-amber-500" />
                Audit Logs
              </h3>
              <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                {auditLogs.map((log, idx) => (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="p-4 rounded-2xl bg-slate-900/60 border border-white/5 space-y-2.5 hover:border-white/10 hover:bg-slate-900/80 transition-all duration-300"
                  >
                    <div className="flex justify-between items-start gap-2">
                      <span className="text-white font-bold text-xs block truncate max-w-[140px] tracking-tight">{log.action}</span>
                      <span className="text-[9px] text-slate-500 block shrink-0 font-mono">
                        {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-relaxed font-sans">{log.details}</p>
                    <div className="flex justify-between items-center pt-2 border-t border-white/5 text-[9px] text-slate-500 font-mono">
                      <span>IP: {log.ipAddress || '127.0.0.1'}</span>
                      <span className="text-teal-500/80 font-semibold">{log.user?.email || 'SYSTEM'}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

          </div>
        )}
      </main>
    </>
  );
}

const fallbackUsers: UserRow[] = [
  { id: 'usr-1', email: 'odhumkekar@gmail.com', role: 'ADMIN', createdAt: new Date().toISOString(), profile: { fullName: 'Owner Administrator' } },
  { id: 'usr-2', email: 'farmer@mandiprime.com', role: 'FARMER', createdAt: new Date().toISOString(), profile: { fullName: 'Karan Singh' } },
];

const fallbackDocs: ComplianceDoc[] = [
  { id: 'doc-clear-1', documentType: 'PHYTOSANITARY', fileUrl: '#', status: 'PENDING', shipment: { trackingNumber: 'MP-894721' } },
];

const fallbackAuditLogs: AuditLogItem[] = [
  { id: 'log-1', action: 'ROLE_MODIFIED', details: 'User admin@mandiprime.com changed role of test@test.com to FARMER', createdAt: new Date().toISOString(), user: { email: 'admin@mandiprime.com' } },
  { id: 'log-2', action: 'EXPORT_COMPLIANCE_UPLOAD', details: 'Exporter uploaded Phytosanitary certificate for shipment MP-894721', createdAt: new Date().toISOString(), user: { email: 'exporter@mandiprime.com' } },
];
