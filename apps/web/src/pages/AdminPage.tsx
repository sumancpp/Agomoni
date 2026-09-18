import React, { useEffect, useState } from 'react';
import {
  ShieldCheck,
  Users,
  CreditCard,
  Search,
  Trash2,
  Ban,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Eye,
  Calendar,
  DollarSign,
  Package,
  Activity,
  UserX,
  Lock,
  ArrowUpRight,
  Filter,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import FestiveButton from '../components/common/FestiveButton';
import { apiFetch, resolveImageUrl } from '../lib/api';

export const AdminPage: React.FC = () => {
  const { token, user } = useAuth();

  const [analytics, setAnalytics] = useState<any>(null);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [paymentsList, setPaymentsList] = useState<any[]>([]);
  const [lostFoundList, setLostFoundList] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);

  const [activeTab, setActiveTab] = useState<'analytics' | 'users' | 'payments' | 'lostfound' | 'reports'>('analytics');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchAdminData = async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const [anRes, uRes, payRes, lfRes, repRes] = await Promise.all([
        apiFetch('/api/v1/admin/analytics', { headers: { Authorization: `Bearer ${token}` } }),
        apiFetch('/api/v1/admin/users', { headers: { Authorization: `Bearer ${token}` } }),
        apiFetch('/api/v1/admin/payments', { headers: { Authorization: `Bearer ${token}` } }),
        apiFetch('/api/v1/admin/lost-found', { headers: { Authorization: `Bearer ${token}` } }),
        apiFetch('/api/v1/admin/reports', { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      const [anData, uData, payData, lfData, repData] = await Promise.all([
        anRes.json(),
        uRes.json(),
        payRes.json(),
        lfRes.json(),
        repRes.json(),
      ]);

      if (anData.success) setAnalytics(anData.analytics);
      if (uData.success) setUsersList(uData.users);
      if (payData.success) setPaymentsList(payData.payments);
      if (lfData.success) setLostFoundList(lfData.posts);
      if (repData.success) setReports(repData.reports);
    } catch (err) {
      console.error('Admin fetch error', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, [token]);

  // User Actions: Delete User
  const handleDeleteUser = async (userId: string, email: string) => {
    if (!window.confirm(`⚠️ PERMANENT ACTION:\nAre you sure you want to completely remove user "${email}" and all their associated data from the database?`)) {
      return;
    }

    setActionLoading(userId);
    try {
      const res = await apiFetch(`/api/v1/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message);
        fetchAdminData();
      } else {
        alert(data.message || 'Error deleting user');
      }
    } catch (err) {
      alert('Network error deleting user');
    } finally {
      setActionLoading(null);
    }
  };

  // User Actions: Toggle Ban / Deactivate
  const handleToggleBanUser = async (userId: string) => {
    setActionLoading(userId);
    try {
      const res = await apiFetch(`/api/v1/admin/users/${userId}/ban`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        fetchAdminData();
      } else {
        alert(data.message || 'Error updating ban status');
      }
    } catch (err) {
      alert('Network error updating ban status');
    } finally {
      setActionLoading(null);
    }
  };

  // Lost & Found Actions: Remove Post
  const handleDeleteLostFound = async (postId: string, title: string) => {
    if (!window.confirm(`⚠️ Remove Lost & Found Report:\nAre you sure you want to permanently remove "${title}" from the database?`)) {
      return;
    }

    setActionLoading(postId);
    try {
      const res = await apiFetch(`/api/v1/admin/lost-found/${postId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message);
        fetchAdminData();
      } else {
        alert(data.message || 'Error removing item');
      }
    } catch (err) {
      alert('Network error removing Lost & Found item');
    } finally {
      setActionLoading(null);
    }
  };

  // Moderation Queue Actions
  const handleResolveReport = async (id: string, banUser: boolean) => {
    try {
      const res = await apiFetch(`/api/v1/admin/reports/${id}/resolve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action: 'RESOLVED', banUser }),
      });
      const data = await res.json();
      if (data.success) {
        alert(banUser ? 'Report resolved and offending user banned.' : 'Report marked as resolved.');
        fetchAdminData();
      }
    } catch (err) {
      alert('Error updating report');
    }
  };

  if (user?.role !== 'ADMIN' && user?.role !== 'SUPER_ADMIN') {
    return (
      <div className="text-center py-24 space-y-4 max-w-md mx-auto px-4">
        <div className="w-16 h-16 rounded-full bg-red-950/60 border border-red-500/40 mx-auto flex items-center justify-center text-2xl shadow-xl">
          <Lock className="text-red-400" size={28} />
        </div>
        <h2 className="text-2xl font-bold text-cream-100 font-cinzel">Access Restricted</h2>
        <p className="text-xs text-cream-400">
          Super Administrator or Moderator credentials are required to view and manage Agomoni database infrastructure.
        </p>
      </div>
    );
  }

  // Filtered lists based on search bar
  const filteredUsers = usersList.filter(
    (u) =>
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.displayName && u.displayName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (u.locationCity && u.locationCity.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredPayments = paymentsList.filter(
    (p) =>
      p.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.userEmail && p.userEmail.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (p.userName && p.userName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      p.productId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredLostFound = lostFoundList.filter(
    (lf) =>
      lf.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lf.nameOrItem.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lf.lastSeenArea.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (lf.user?.email && lf.user.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Top Admin Navigation & Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-gold-500/20 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md bg-gold-500/20 text-gold-400 text-[10px] font-bold tracking-widest uppercase border border-gold-500/30">
              Database Master Control
            </span>
            <span className="text-xs text-cream-400 font-mono">Agomoni Core v1.0</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-cinzel text-cream-100 flex items-center gap-2.5 mt-1.5">
            <span className="text-gold-400">👑</span>
            <span>Agomoni Operations & Database Console</span>
          </h1>
          <p className="text-xs text-gold-400/90 font-bengali mt-0.5">
            সরাসরি ডাটাবেজ পর্যবেক্ষণ, ব্যবহারকারী মুছে ফেলা, পেমেন্ট ট্র্যাকিং এবং নিখোঁজ ব্যক্তি ও সামগ্রী নিয়ন্ত্রণ কেন্দ্র
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchAdminData}
            disabled={isLoading}
            className="px-3.5 py-2 rounded-xl bg-night-900 hover:bg-night-800 border border-gold-500/30 text-gold-300 text-xs font-semibold flex items-center gap-2 transition-all hover:border-gold-400 active:scale-95"
            title="Refresh All Database Tables"
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
            <span>{isLoading ? 'Syncing...' : 'Sync Database'}</span>
          </button>
        </div>
      </div>

      {/* Main Tab Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 p-1.5 bg-night-900/90 border border-gold-500/30 rounded-2xl overflow-x-auto max-w-full backdrop-blur-md">
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'analytics'
                ? 'bg-gold-500 text-night-950 font-bold shadow-md'
                : 'text-cream-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Activity size={14} />
            <span>Overview</span>
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'users'
                ? 'bg-gold-500 text-night-950 font-bold shadow-md'
                : 'text-cream-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Users size={14} />
            <span>Users & Logins ({usersList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('payments')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'payments'
                ? 'bg-gold-500 text-night-950 font-bold shadow-md'
                : 'text-cream-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <CreditCard size={14} />
            <span>Payments & Revenue ({paymentsList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('lostfound')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'lostfound'
                ? 'bg-gold-500 text-night-950 font-bold shadow-md'
                : 'text-cream-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Search size={14} />
            <span>Find Loved Ones & Items ({lostFoundList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('reports')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'reports'
                ? 'bg-gold-500 text-night-950 font-bold shadow-md'
                : 'text-cream-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <ShieldCheck size={14} />
            <span>Moderation ({reports.length})</span>
          </button>
        </div>

        {/* Global Instant Search Bar for Tables */}
        {activeTab !== 'analytics' && (
          <div className="relative w-full sm:w-72">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-cream-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={`Search ${activeTab}...`}
              className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-night-900 border border-gold-500/30 text-xs text-cream-100 placeholder-cream-400/60 focus:outline-none focus:border-gold-400 transition-all"
            />
          </div>
        )}
      </div>

      {/* TAB 1: Analytics Overview */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            <div className="puja-card p-5 rounded-2xl space-y-1.5 border border-gold-500/30 bg-night-900/60">
              <div className="flex items-center justify-between text-cream-400 text-xs">
                <span className="font-semibold uppercase tracking-wider">Registered Users</span>
                <Users size={16} className="text-gold-400" />
              </div>
              <p className="text-3xl font-extrabold text-cream-100 font-cinzel">
                {analytics?.totalUsers ?? usersList.length}
              </p>
              <p className="text-[11px] text-cream-400">Total accounts registered in system</p>
            </div>

            <div className="puja-card p-5 rounded-2xl space-y-1.5 border border-emerald-500/30 bg-night-900/60">
              <div className="flex items-center justify-between text-cream-400 text-xs">
                <span className="font-semibold uppercase tracking-wider">Total Revenue</span>
                <DollarSign size={16} className="text-emerald-400" />
              </div>
              <p className="text-3xl font-extrabold text-emerald-400 font-cinzel">
                ₹{analytics?.totalRevenueRupees ?? 0}
              </p>
              <p className="text-[11px] text-emerald-300/80">Completed Razorpay payments</p>
            </div>

            <div className="puja-card p-5 rounded-2xl space-y-1.5 border border-gold-500/30 bg-night-900/60">
              <div className="flex items-center justify-between text-cream-400 text-xs">
                <span className="font-semibold uppercase tracking-wider">Paid Transactions</span>
                <CreditCard size={16} className="text-gold-400" />
              </div>
              <p className="text-3xl font-extrabold text-gold-400 font-cinzel">
                {analytics?.totalPaidOrders ?? paymentsList.filter((p) => p.status === 'PAID').length}
              </p>
              <p className="text-[11px] text-cream-400">Successful customer checkouts</p>
            </div>

            <div className="puja-card p-5 rounded-2xl space-y-1.5 border border-sindoor-500/30 bg-night-900/60">
              <div className="flex items-center justify-between text-cream-400 text-xs">
                <span className="font-semibold uppercase tracking-wider">Loved Ones & Items</span>
                <Search size={16} className="text-sindoor-400" />
              </div>
              <p className="text-3xl font-extrabold text-cream-100 font-cinzel">
                {lostFoundList.length}
              </p>
              <p className="text-[11px] text-cream-400">Active reports broadcasted</p>
            </div>

            <div className="puja-card p-5 rounded-2xl space-y-1.5 border border-gold-500/20 bg-night-900/60">
              <div className="flex items-center justify-between text-cream-400 text-xs">
                <span className="font-semibold uppercase tracking-wider">Conversations</span>
                <Activity size={16} className="text-gold-400" />
              </div>
              <p className="text-3xl font-extrabold text-cream-100 font-cinzel">
                {analytics?.totalConversations ?? 0}
              </p>
              <p className="text-[11px] text-cream-400">Active dating chat threads</p>
            </div>

            <div className="puja-card p-5 rounded-2xl space-y-1.5 border border-gold-500/20 bg-night-900/60">
              <div className="flex items-center justify-between text-cream-400 text-xs">
                <span className="font-semibold uppercase tracking-wider">AI Outfit Generations</span>
                <Package size={16} className="text-gold-400" />
              </div>
              <p className="text-3xl font-extrabold text-cream-100 font-cinzel">
                {analytics?.totalOutfitGenerations ?? 0}
              </p>
              <p className="text-[11px] text-cream-400">Neural styling photos rendered</p>
            </div>

            <div className="puja-card p-5 rounded-2xl space-y-1.5 border border-red-500/30 bg-night-900/60">
              <div className="flex items-center justify-between text-cream-400 text-xs">
                <span className="font-semibold uppercase tracking-wider">Moderation Queue</span>
                <AlertTriangle size={16} className="text-red-400" />
              </div>
              <p className="text-3xl font-extrabold text-red-400 font-cinzel">
                {analytics?.pendingReports ?? reports.filter((r) => r.status === 'PENDING').length}
              </p>
              <p className="text-[11px] text-cream-400">User flags awaiting review</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Users & Logins Management */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-cream-100 font-cinzel">
                User Database & Login Sessions
              </h3>
              <p className="text-xs text-cream-400">
                View real-time registered users, their login activity, total paid volume, and permanently remove accounts.
              </p>
            </div>
            <span className="text-xs font-mono text-gold-400 bg-night-900 px-3 py-1 rounded-xl border border-gold-500/20">
              Showing {filteredUsers.length} of {usersList.length} accounts
            </span>
          </div>

          <div className="puja-card rounded-3xl overflow-hidden border border-gold-500/20 shadow-2xl bg-night-950/70">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-cream-300">
                <thead className="bg-night-950 text-gold-400 uppercase tracking-wider text-[10px] border-b border-gold-500/20">
                  <tr>
                    <th className="p-3.5 pl-5">User / Display Name</th>
                    <th className="p-3.5">Email & Role</th>
                    <th className="p-3.5">Location & Gender</th>
                    <th className="p-3.5">Last Active / Login</th>
                    <th className="p-3.5">Payments & Plans</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 pr-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-cream-400">
                        No users matching "{searchTerm}".
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => {
                      const isCurrentAdmin = u.id === user?.id;
                      return (
                        <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="p-3.5 pl-5">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full overflow-hidden bg-night-800 border border-gold-500/30 flex items-center justify-center shrink-0">
                                {u.avatarUrl ? (
                                  <img src={resolveImageUrl(u.avatarUrl)} alt="" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                                ) : (
                                  <span className="text-xs font-bold text-gold-400">
                                    {(u.displayName || u.email)[0].toUpperCase()}
                                  </span>
                                )}
                              </div>
                              <div>
                                <p className="font-bold text-cream-100 text-sm">{u.displayName || 'Unnamed'}</p>
                                <p className="text-[10px] text-cream-500 font-mono">{u.id.substring(0, 8)}...</p>
                              </div>
                            </div>
                          </td>

                          <td className="p-3.5">
                            <p className="font-medium text-cream-200">{u.email}</p>
                            <span
                              className={`inline-block px-2 py-0.5 mt-0.5 rounded text-[10px] font-bold ${
                                u.role === 'ADMIN' || u.role === 'SUPER_ADMIN'
                                  ? 'bg-gold-500/20 text-gold-300 border border-gold-500/40'
                                  : 'bg-white/10 text-cream-300'
                              }`}
                            >
                              {u.role}
                            </span>
                          </td>

                          <td className="p-3.5">
                            <p className="text-cream-200">{u.locationCity || 'N/A'}</p>
                            <p className="text-[10px] text-cream-400">{u.gender || 'Not specified'}</p>
                          </td>

                          <td className="p-3.5">
                            <p className="text-cream-200 font-medium">
                              {u.updatedAt ? new Date(u.updatedAt).toLocaleDateString() : 'N/A'}
                            </p>
                            <p className="text-[10px] text-cream-400">
                              {u.updatedAt ? new Date(u.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                            </p>
                          </td>

                          <td className="p-3.5">
                            <p className="font-bold text-emerald-400">
                              ₹{u.totalSpentRupees || 0} ({u.paidOrdersCount || 0} orders)
                            </p>
                            <p className="text-[10px] text-gold-400/80">
                              {u.entitlements && u.entitlements.length > 0 ? u.entitlements.join(', ') : 'Free Plan'}
                            </p>
                          </td>

                          <td className="p-3.5">
                            {u.isDeactivated ? (
                              <span className="px-2 py-0.5 rounded-md bg-red-950/80 text-red-300 font-bold border border-red-500/40 text-[10px]">
                                Banned / Inactive
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-md bg-emerald-950/80 text-emerald-300 font-bold border border-emerald-500/40 text-[10px]">
                                Active
                              </span>
                            )}
                          </td>

                          <td className="p-3.5 pr-5 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {!isCurrentAdmin && (
                                <>
                                  <button
                                    onClick={() => handleToggleBanUser(u.id)}
                                    disabled={actionLoading === u.id}
                                    title={u.isDeactivated ? 'Unban user' : 'Ban / Deactivate user'}
                                    className={`p-1.5 rounded-lg border transition-all ${
                                      u.isDeactivated
                                        ? 'bg-emerald-900/40 border-emerald-500/40 text-emerald-300 hover:bg-emerald-800/60'
                                        : 'bg-night-800 border-gold-500/20 text-cream-400 hover:text-amber-400'
                                    }`}
                                  >
                                    <Ban size={14} />
                                  </button>

                                  <button
                                    onClick={() => handleDeleteUser(u.id, u.email)}
                                    disabled={actionLoading === u.id}
                                    title="Permanently remove user from database"
                                    className="p-1.5 rounded-lg bg-red-950/50 hover:bg-red-900/80 border border-red-500/40 text-red-300 hover:text-white transition-all active:scale-95"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </>
                              )}
                              {isCurrentAdmin && (
                                <span className="text-[10px] text-gold-400 italic">Current Session</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Payments & Revenue Ledger */}
      {activeTab === 'payments' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-cream-100 font-cinzel">
                Live Transactions & Payment Records
              </h3>
              <p className="text-xs text-cream-400">
                Detailed record of all Razorpay payments for Puja Date chat, Lost & Found listings, and AI Outfits.
              </p>
            </div>
            <span className="text-xs font-mono text-emerald-400 bg-night-900 px-3 py-1 rounded-xl border border-emerald-500/20">
              Total Recorded: {paymentsList.length} transactions
            </span>
          </div>

          <div className="puja-card rounded-3xl overflow-hidden border border-gold-500/20 shadow-2xl bg-night-950/70">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-cream-300">
                <thead className="bg-night-950 text-gold-400 uppercase tracking-wider text-[10px] border-b border-gold-500/20">
                  <tr>
                    <th className="p-3.5 pl-5">Date & Time</th>
                    <th className="p-3.5">Customer Name & Email</th>
                    <th className="p-3.5">Product Purchased</th>
                    <th className="p-3.5">Amount (INR)</th>
                    <th className="p-3.5">Order & Payment IDs</th>
                    <th className="p-3.5 pr-5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredPayments.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-cream-400">
                        No transactions found.
                      </td>
                    </tr>
                  ) : (
                    filteredPayments.map((pay) => (
                      <tr key={pay.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="p-3.5 pl-5 font-mono text-[11px] text-cream-300">
                          {new Date(pay.createdAt).toLocaleDateString()}{' '}
                          <span className="text-cream-500">
                            {new Date(pay.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </td>

                        <td className="p-3.5">
                          <p className="font-bold text-cream-100">{pay.userName || 'Agomoni Customer'}</p>
                          <p className="text-[11px] text-cream-400 font-mono">{pay.userEmail || 'N/A'}</p>
                        </td>

                        <td className="p-3.5">
                          <span className="px-2 py-0.5 rounded-md bg-gold-500/15 text-gold-300 font-bold border border-gold-500/30 text-[10px]">
                            {pay.productId}
                          </span>
                        </td>

                        <td className="p-3.5 font-bold text-emerald-400 text-sm">
                          ₹{pay.amountRupees}
                        </td>

                        <td className="p-3.5 font-mono text-[10px] text-cream-400">
                          <p>Order: {pay.orderId}</p>
                          {pay.paymentId && <p className="text-cream-500">PayID: {pay.paymentId}</p>}
                        </td>

                        <td className="p-3.5 pr-5">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                              pay.status === 'PAID'
                                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
                                : pay.status === 'FAILED'
                                ? 'bg-red-950/80 text-red-300 border-red-500/40'
                                : 'bg-amber-950/80 text-amber-300 border-amber-500/40'
                            }`}
                          >
                            {pay.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Find Loved Ones & Items Moderation & Deletion */}
      {activeTab === 'lostfound' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-cream-100 font-cinzel">
                Find Loved Ones & Items Database Management
              </h3>
              <p className="text-xs text-cream-400">
                Directly oversee missing person and lost property notices. You have authority to remove any fake, resolved, or duplicate report permanently.
              </p>
            </div>
            <span className="text-xs font-mono text-sindoor-400 bg-night-900 px-3 py-1 rounded-xl border border-sindoor-500/20">
              Active Listings: {lostFoundList.length}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredLostFound.length === 0 ? (
              <div className="col-span-2 puja-card p-12 text-center rounded-3xl text-xs text-cream-400">
                No Lost & Found reports match your search query.
              </div>
            ) : (
              filteredLostFound.map((post) => (
                <div
                  key={post.id}
                  className="puja-card p-5 rounded-3xl border border-gold-500/25 bg-night-900/80 flex flex-col justify-between gap-4 shadow-xl hover:border-gold-500/50 transition-all"
                >
                  <div className="flex items-start gap-4">
                    {post.photoUrl ? (
                      <div className="w-20 h-20 rounded-2xl overflow-hidden bg-night-950 border border-gold-500/30 shrink-0">
                        <img src={resolveImageUrl(post.photoUrl)} alt="" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                      </div>
                    ) : (
                      <div className="w-20 h-20 rounded-2xl bg-night-950 border border-gold-500/20 flex items-center justify-center text-3xl shrink-0">
                        {post.category === 'LOST_PERSON' ? '🧒' : '🎒'}
                      </div>
                    )}

                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            post.category === 'LOST_PERSON'
                              ? 'bg-red-950 text-red-300 border border-red-500/40'
                              : 'bg-amber-950 text-amber-300 border border-amber-500/40'
                          }`}
                        >
                          {post.category === 'LOST_PERSON' ? 'Lost Person' : 'Lost Item'}
                        </span>
                        <span className="text-[10px] text-gold-400/80 font-mono">
                          Status: {post.status}
                        </span>
                      </div>

                      <h4 className="font-bold text-sm text-cream-100 truncate">{post.title}</h4>
                      <p className="text-xs text-gold-300 font-semibold">{post.nameOrItem}</p>
                      <p className="text-xs text-cream-300 line-clamp-2">{post.description}</p>
                      <p className="text-[11px] text-cream-400">
                        📍 <strong>Last seen:</strong> {post.lastSeenArea} (
                        {new Date(post.lastSeenDate).toLocaleDateString()})
                      </p>
                      <p className="text-[10px] text-cream-500">
                        Posted by: {post.user?.profile?.displayName || post.user?.email || 'Anonymous'}
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-gold-500/20 flex items-center justify-between">
                    <span className="text-[10px] text-cream-500 font-mono">
                      ID: {post.id.substring(0, 10)}...
                    </span>

                    <button
                      onClick={() => handleDeleteLostFound(post.id, post.title)}
                      disabled={actionLoading === post.id}
                      className="px-3 py-1.5 rounded-xl bg-red-950/80 hover:bg-red-900 border border-red-500/50 text-red-200 text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 shadow-lg shadow-red-950/40"
                    >
                      <Trash2 size={13} />
                      <span>{actionLoading === post.id ? 'Deleting...' : 'Delete from Database'}</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 5: Moderation Queue */}
      {activeTab === 'reports' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-cream-100 font-cinzel">
                Flagged Content & Reports Queue
              </h3>
              <p className="text-xs text-cream-400">
                User-submitted flags regarding inappropriate behaviour or dating abuse.
              </p>
            </div>
            <span className="text-xs font-mono text-red-400 bg-night-900 px-3 py-1 rounded-xl border border-red-500/20">
              Pending: {reports.filter((r) => r.status === 'PENDING').length}
            </span>
          </div>

          {reports.length === 0 ? (
            <div className="puja-card p-12 text-center rounded-3xl text-xs text-cream-400 border border-gold-500/20">
              No reports pending! The festival community is safe and clean. 🌸
            </div>
          ) : (
            <div className="space-y-3">
              {reports.map((rep) => (
                <div
                  key={rep.id}
                  className="puja-card p-5 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs border border-red-500/30 bg-night-900/80"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-md bg-red-950 text-red-300 font-bold border border-red-500/40">
                        {rep.reason}
                      </span>
                      <span className="text-cream-400 font-mono text-[11px]">
                        Status: <strong className="text-gold-400">{rep.status}</strong>
                      </span>
                    </div>
                    <p className="text-cream-200">
                      Reported User:{' '}
                      <strong className="text-cream-100">
                        {rep.reportedUser?.profile?.displayName || rep.reportedUser?.email}
                      </strong>
                    </p>
                    <p className="text-cream-400 text-[11px]">
                      Reporter: {rep.reporter?.profile?.displayName || rep.reporter?.email}
                    </p>
                    {rep.details && <p className="text-cream-300 italic bg-black/40 p-2 rounded-xl">"{rep.details}"</p>}
                  </div>

                  {rep.status === 'PENDING' && (
                    <div className="flex items-center gap-2 shrink-0">
                      <FestiveButton
                        variant="secondary"
                        size="sm"
                        onClick={() => handleResolveReport(rep.id, false)}
                      >
                        Dismiss
                      </FestiveButton>
                      <FestiveButton
                        variant="danger"
                        size="sm"
                        onClick={() => handleResolveReport(rep.id, true)}
                      >
                        Ban Offender
                      </FestiveButton>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminPage;
