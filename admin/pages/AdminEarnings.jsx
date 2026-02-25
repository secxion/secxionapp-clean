import React, { useState, useEffect } from 'react';
import { 
  FaChartLine, 
  FaCoins, 
  FaPercent, 
  FaHistory,
  FaTimes,
  FaEdit,
  FaSave,
  FaWallet,
  FaPaperPlane,
  FaUsers,
  FaExchangeAlt
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import SummaryApi, { authFetch } from '../common/index.js';

const AdminEarnings = () => {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({
    totalCommission: 0,
    totalOriginalAmount: 0,
    totalUserPaid: 0,
    transactionCount: 0,
  });
  const [bySourceType, setBySourceType] = useState([]);
  const [earnings, setEarnings] = useState([]);
  const [commissionRates, setCommissionRates] = useState({ marketplace: 5, eth_withdrawal: 10 });
  const [editingRate, setEditingRate] = useState(null);
  const [newRate, setNewRate] = useState('');
  
  // Platform balance
  const [platformBalance, setPlatformBalance] = useState({
    totalEarnings: 0,
    totalPayouts: 0,
    availableBalance: 0,
  });
  
  // Admin wallets & payouts
  const [adminWallets, setAdminWallets] = useState([]);
  const [authorizedAdmins, setAuthorizedAdmins] = useState([]);
  const [payouts, setPayouts] = useState([]);
  const [loadingPayouts, setLoadingPayouts] = useState(false);
  
  // Payout form
  const [payoutForm, setPayoutForm] = useState({
    toAdminId: '',
    amount: '',
    note: '',
  });
  const [sendingPayout, setSendingPayout] = useState(false);
  
  // Active tab
  const [activeTab, setActiveTab] = useState('overview');
  
  // Filters
  const [filters, setFilters] = useState({
    sourceType: 'all',
    startDate: '',
    endDate: '',
  });
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 0 });

  useEffect(() => {
    fetchData();
    fetchPlatformBalance();
    fetchAuthorizedAdmins();
    fetchAdminWallets();
    fetchPayouts();
    fetchCommissionRates();
  }, []);

  useEffect(() => {
    fetchData();
  }, [filters]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.sourceType !== 'all') params.append('sourceType', filters.sourceType);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      params.append('page', pagination.page);
      params.append('limit', pagination.limit);

      const summaryUrl = `${SummaryApi.adminEarningsSummary.url}?${params.toString()}`;
      const summaryRes = await authFetch(summaryUrl);
      const summaryData = await summaryRes.json();
      
      if (summaryData.success) {
        setSummary(summaryData.data.summary);
        setBySourceType(summaryData.data.bySourceType || []);
        setEarnings(summaryData.data.recentEarnings || []);
      }

      const earningsUrl = `${SummaryApi.adminEarnings.url}?${params.toString()}`;
      const earningsRes = await authFetch(earningsUrl);
      const earningsData = await earningsRes.json();
      
      if (earningsData.success) {
        setEarnings(earningsData.data);
        setPagination(prev => ({ ...prev, ...earningsData.pagination }));
      }
    } catch (error) {
      console.error('Error fetching earnings:', error);
      toast.error('Failed to fetch earnings data');
    } finally {
      setLoading(false);
    }
  };

  const fetchCommissionRates = async () => {
    try {
      const res = await authFetch(SummaryApi.commissionRates.url);
      const data = await res.json();
      if (data.success) {
        setCommissionRates(data.data);
      }
    } catch (error) {
      console.error('Error fetching commission rates:', error);
    }
  };

  const fetchPlatformBalance = async () => {
    try {
      const res = await authFetch(SummaryApi.platformBalance.url);
      const data = await res.json();
      if (data.success) {
        setPlatformBalance(data.data);
      }
    } catch (error) {
      console.error('Error fetching platform balance:', error);
    }
  };

  const fetchAuthorizedAdmins = async () => {
    try {
      const res = await authFetch(SummaryApi.authorizedAdmins.url);
      const data = await res.json();
      if (data.success) {
        setAuthorizedAdmins(data.data);
      }
    } catch (error) {
      console.error('Error fetching authorized admins:', error);
    }
  };

  const fetchAdminWallets = async () => {
    try {
      const res = await authFetch(SummaryApi.adminWallets.url);
      const data = await res.json();
      if (data.success) {
        setAdminWallets(data.data);
      }
    } catch (error) {
      console.error('Error fetching admin wallets:', error);
    }
  };

  const fetchPayouts = async () => {
    setLoadingPayouts(true);
    try {
      const res = await authFetch(SummaryApi.payoutHistory.url);
      const data = await res.json();
      if (data.success) {
        setPayouts(data.data);
      }
    } catch (error) {
      console.error('Error fetching payouts:', error);
    } finally {
      setLoadingPayouts(false);
    }
  };

  const handleUpdateRate = async (type) => {
    const rate = parseFloat(newRate);
    if (isNaN(rate) || rate < 0 || rate > 100) {
      toast.error('Rate must be between 0 and 100');
      return;
    }

    try {
      const res = await authFetch(SummaryApi.updateCommissionRate.url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, rate }),
      });
      const data = await res.json();
      
      if (data.success) {
        toast.success(`Commission rate updated to ${rate}%`);
        setCommissionRates(prev => ({ ...prev, [type]: rate }));
        setEditingRate(null);
        setNewRate('');
      } else {
        toast.error(data.message || 'Failed to update rate');
      }
    } catch (error) {
      console.error('Error updating rate:', error);
      toast.error('Failed to update rate');
    }
  };

  const handleSendPayout = async (e) => {
    e.preventDefault();
    
    if (!payoutForm.toAdminId || !payoutForm.amount) {
      toast.error('Please select an admin and enter an amount');
      return;
    }
    
    const amount = parseFloat(payoutForm.amount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    
    if (amount > platformBalance.availableBalance) {
      toast.error('Insufficient balance');
      return;
    }
    
    setSendingPayout(true);
    try {
      const res = await authFetch(SummaryApi.createPayout.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toAdminId: payoutForm.toAdminId,
          amount,
          note: payoutForm.note,
        }),
      });
      const data = await res.json();
      
      if (data.success) {
        toast.success(data.message);
        setPayoutForm({ toAdminId: '', amount: '', note: '' });
        fetchPlatformBalance();
        fetchAdminWallets();
        fetchPayouts();
      } else {
        toast.error(data.message || 'Failed to send payout');
      }
    } catch (error) {
      console.error('Error sending payout:', error);
      toast.error('Failed to send payout');
    } finally {
      setSendingPayout(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(amount || 0);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-NG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const clearFilters = () => {
    setFilters({ sourceType: 'all', startDate: '', endDate: '' });
  };

  return (
    <div className="p-3 sm:p-4 md:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-green-500/10 rounded-xl">
            <FaChartLine className="text-green-500 text-xl" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-white">Platform Earnings</h1>
            <p className="text-slate-400 text-xs sm:text-sm">Track commission & manage payouts</p>
          </div>
        </div>
      </div>

      {/* Platform Balance Card */}
      <div className="bg-gradient-to-br from-green-500/20 to-emerald-600/10 rounded-xl p-5 border border-green-500/30 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-green-400 text-xs uppercase tracking-wide mb-1">Available Balance</p>
            <p className="text-3xl sm:text-4xl font-bold text-white">
              {formatCurrency(platformBalance.availableBalance)}
            </p>
            <p className="text-slate-400 text-sm mt-1">
              Total Earned: {formatCurrency(platformBalance.totalEarnings)} | Paid Out: {formatCurrency(platformBalance.totalPayouts)}
            </p>
          </div>
          <FaWallet className="text-green-500/30 text-5xl sm:text-6xl" />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {[
          { id: 'overview', label: 'Overview', icon: <FaChartLine /> },
          { id: 'payouts', label: 'Send Payout', icon: <FaPaperPlane /> },
          { id: 'wallets', label: 'Admin Wallets', icon: <FaUsers /> },
          { id: 'history', label: 'Payout History', icon: <FaExchangeAlt /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? 'bg-yellow-500 text-slate-900'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
              <div className="flex items-center justify-between mb-2">
                <FaCoins className="text-green-500 text-lg" />
                <span className="text-[10px] sm:text-xs text-slate-400 uppercase tracking-wide">Commission</span>
              </div>
              <p className="text-lg sm:text-2xl font-bold text-white">
                {loading ? '...' : formatCurrency(summary.totalCommission)}
              </p>
            </div>

            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
              <div className="flex items-center justify-between mb-2">
                <FaHistory className="text-slate-400 text-lg" />
                <span className="text-[10px] sm:text-xs text-slate-400 uppercase tracking-wide">Sales</span>
              </div>
              <p className="text-lg sm:text-2xl font-bold text-white">
                {loading ? '...' : formatCurrency(summary.totalOriginalAmount)}
              </p>
            </div>

            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
              <div className="flex items-center justify-between mb-2">
                <FaCoins className="text-yellow-500 text-lg" />
                <span className="text-[10px] sm:text-xs text-slate-400 uppercase tracking-wide">User Paid</span>
              </div>
              <p className="text-lg sm:text-2xl font-bold text-white">
                {loading ? '...' : formatCurrency(summary.totalUserPaid)}
              </p>
            </div>

            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
              <div className="flex items-center justify-between mb-2">
                <FaHistory className="text-blue-500 text-lg" />
                <span className="text-[10px] sm:text-xs text-slate-400 uppercase tracking-wide">Transactions</span>
              </div>
              <p className="text-lg sm:text-2xl font-bold text-white">
                {loading ? '...' : summary.transactionCount}
              </p>
            </div>
          </div>

          {/* Commission Rates */}
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 mb-6">
            <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
              <FaPercent className="text-yellow-500" />
              Commission Rates
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Marketplace Rate */}
              <div className="flex items-center justify-between bg-slate-900/50 rounded-lg p-3">
                <div>
                  <p className="text-white font-medium">Marketplace</p>
                  <p className="text-slate-400 text-xs">Commission on product sales</p>
                </div>
                {editingRate === 'marketplace' ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={newRate}
                      onChange={(e) => setNewRate(e.target.value)}
                      className="w-16 px-2 py-1 bg-slate-700 border border-slate-600 rounded text-white text-sm"
                      placeholder="%"
                      min="0"
                      max="100"
                    />
                    <button
                      onClick={() => handleUpdateRate('marketplace')}
                      className="p-1.5 bg-green-500/20 text-green-400 rounded hover:bg-green-500/30"
                    >
                      <FaSave />
                    </button>
                    <button
                      onClick={() => { setEditingRate(null); setNewRate(''); }}
                      className="p-1.5 bg-slate-700 text-slate-400 rounded hover:bg-slate-600"
                    >
                      <FaTimes />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold text-yellow-500">{commissionRates.marketplace}%</span>
                    <button
                      onClick={() => { setEditingRate('marketplace'); setNewRate(commissionRates.marketplace.toString()); }}
                      className="p-1.5 bg-slate-700 text-slate-400 rounded hover:bg-slate-600"
                    >
                      <FaEdit />
                    </button>
                  </div>
                )}
              </div>

              {/* ETH Withdrawal Rate */}
              <div className="flex items-center justify-between bg-slate-900/50 rounded-lg p-3">
                <div>
                  <p className="text-white font-medium">ETH Withdrawal</p>
                  <p className="text-slate-400 text-xs">Fee on ETH withdrawals</p>
                </div>
                {editingRate === 'eth_withdrawal' ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={newRate}
                      onChange={(e) => setNewRate(e.target.value)}
                      className="w-16 px-2 py-1 bg-slate-700 border border-slate-600 rounded text-white text-sm"
                      placeholder="%"
                      min="0"
                      max="100"
                    />
                    <button
                      onClick={() => handleUpdateRate('eth_withdrawal')}
                      className="p-1.5 bg-green-500/20 text-green-400 rounded hover:bg-green-500/30"
                    >
                      <FaSave />
                    </button>
                    <button
                      onClick={() => { setEditingRate(null); setNewRate(''); }}
                      className="p-1.5 bg-slate-700 text-slate-400 rounded hover:bg-slate-600"
                    >
                      <FaTimes />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold text-purple-500">{commissionRates.eth_withdrawal}%</span>
                    <button
                      onClick={() => { setEditingRate('eth_withdrawal'); setNewRate(commissionRates.eth_withdrawal.toString()); }}
                      className="p-1.5 bg-slate-700 text-slate-400 rounded hover:bg-slate-600"
                    >
                      <FaEdit />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2 sm:gap-3 mb-4">
            <select
              value={filters.sourceType}
              onChange={(e) => setFilters(prev => ({ ...prev, sourceType: e.target.value }))}
              className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-yellow-500/50"
            >
              <option value="all">All Sources</option>
              <option value="marketplace">Marketplace</option>
              <option value="eth_withdrawal">ETH Withdrawal</option>
            </select>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
              className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-yellow-500/50"
            />
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
              className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-yellow-500/50"
            />
            {(filters.sourceType !== 'all' || filters.startDate || filters.endDate) && (
              <button
                onClick={clearFilters}
                className="px-3 py-2 bg-slate-700 text-slate-300 rounded-lg text-sm hover:bg-slate-600 flex items-center gap-1"
              >
                <FaTimes /> Clear
              </button>
            )}
          </div>

          {/* Earnings Table */}
          <div className="bg-slate-800/30 rounded-xl border border-slate-700/50 overflow-hidden">
            <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr className="border-b border-slate-700/50">
                    <th className="p-3 sm:p-4 text-left text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wide">User</th>
                    <th className="p-3 sm:p-4 text-left text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wide">Source</th>
                    <th className="p-3 sm:p-4 text-right text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wide">Original</th>
                    <th className="p-3 sm:p-4 text-right text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wide">Rate</th>
                    <th className="p-3 sm:p-4 text-right text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wide">Earned</th>
                    <th className="p-3 sm:p-4 text-left text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wide">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="6" className="p-8 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <div className="animate-spin rounded-full h-5 w-5 border-2 border-yellow-500 border-t-transparent"></div>
                          <span className="text-slate-400">Loading...</span>
                        </div>
                      </td>
                    </tr>
                  ) : earnings.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="p-8 text-center text-slate-500">
                        No earnings recorded yet.
                      </td>
                    </tr>
                  ) : (
                    earnings.map((earning) => (
                      <tr key={earning._id} className="border-b border-slate-700/30 hover:bg-slate-800/50 transition-colors">
                        <td className="p-3 sm:p-4">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-500 to-yellow-600 flex items-center justify-center text-slate-900 font-bold text-xs flex-shrink-0">
                              {(earning.userId?.name || 'U').charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="text-white text-sm font-medium truncate">{earning.userId?.name || 'Unknown'}</p>
                              <p className="text-slate-400 text-xs truncate">{earning.userId?.email || '-'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-3 sm:p-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            earning.sourceType === 'marketplace' 
                              ? 'bg-yellow-500/20 text-yellow-400' 
                              : 'bg-purple-500/20 text-purple-400'
                          }`}>
                            {earning.sourceType === 'marketplace' ? 'Market' : 'ETH'}
                          </span>
                        </td>
                        <td className="p-3 sm:p-4 text-right text-slate-300 text-sm">
                          {formatCurrency(earning.originalAmount)}
                        </td>
                        <td className="p-3 sm:p-4 text-right text-slate-400 text-sm">
                          {earning.commissionRate}%
                        </td>
                        <td className="p-3 sm:p-4 text-right text-green-400 font-semibold text-sm">
                          {formatCurrency(earning.commissionAmount)}
                        </td>
                        <td className="p-3 sm:p-4 text-slate-400 text-xs">
                          {formatDate(earning.createdAt)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex items-center justify-between p-4 border-t border-slate-700/50">
                <p className="text-slate-400 text-sm">
                  Page {pagination.page} of {pagination.pages} ({pagination.total} total)
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                    disabled={pagination.page <= 1}
                    className="px-3 py-1 bg-slate-700 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-600"
                  >
                    Prev
                  </button>
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                    disabled={pagination.page >= pagination.pages}
                    className="px-3 py-1 bg-slate-700 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-600"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {activeTab === 'payouts' && (
        <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50">
          <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
            <FaPaperPlane className="text-yellow-500" />
            Send Payout to Admin
          </h2>
          <form onSubmit={handleSendPayout} className="space-y-4">
            <div>
              <label className="block text-slate-400 text-sm mb-2">Select Admin</label>
              <select
                value={payoutForm.toAdminId}
                onChange={(e) => setPayoutForm(prev => ({ ...prev, toAdminId: e.target.value }))}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-yellow-500/50"
              >
                <option value="">-- Select an admin --</option>
                {authorizedAdmins.map((admin) => (
                  <option key={admin._id} value={admin._id}>
                    {admin.name} ({admin.email}) - {admin.department}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-slate-400 text-sm mb-2">Amount (NGN)</label>
              <input
                type="number"
                value={payoutForm.amount}
                onChange={(e) => setPayoutForm(prev => ({ ...prev, amount: e.target.value }))}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-yellow-500/50"
                placeholder="Enter amount"
                min="0"
                step="0.01"
              />
              <p className="text-slate-500 text-xs mt-1">
                Available: {formatCurrency(platformBalance.availableBalance)}
              </p>
            </div>
            
            <div>
              <label className="block text-slate-400 text-sm mb-2">Note (optional)</label>
              <textarea
                value={payoutForm.note}
                onChange={(e) => setPayoutForm(prev => ({ ...prev, note: e.target.value }))}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-yellow-500/50 resize-none"
                placeholder="Add a note for this payout..."
                rows={3}
              />
            </div>
            
            <button
              type="submit"
              disabled={sendingPayout || !payoutForm.toAdminId || !payoutForm.amount}
              className="w-full sm:w-auto px-6 py-3 bg-yellow-500 text-slate-900 rounded-lg font-semibold hover:bg-yellow-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {sendingPayout ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-slate-900 border-t-transparent"></div>
                  Sending...
                </>
              ) : (
                <>
                  <FaPaperPlane />
                  Send Payout
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {activeTab === 'wallets' && (
        <div className="bg-slate-800/30 rounded-xl border border-slate-700/50 overflow-hidden">
          <div className="p-4 border-b border-slate-700/50">
            <h2 className="text-white font-semibold flex items-center gap-2">
              <FaUsers className="text-yellow-500" />
              Admin Wallets
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[500px]">
              <thead>
                <tr className="border-b border-slate-700/50">
                  <th className="p-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">Admin</th>
                  <th className="p-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">Department</th>
                  <th className="p-4 text-right text-xs font-semibold text-slate-400 uppercase tracking-wide">Balance</th>
                  <th className="p-4 text-right text-xs font-semibold text-slate-400 uppercase tracking-wide">Total Received</th>
                </tr>
              </thead>
              <tbody>
                {adminWallets.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="p-8 text-center text-slate-500">
                      No admin wallets created yet.
                    </td>
                  </tr>
                ) : (
                  adminWallets.map((wallet) => (
                    <tr key={wallet._id} className="border-b border-slate-700/30 hover:bg-slate-800/50">
                      <td className="p-4">
                        <p className="text-white font-medium">{wallet.email}</p>
                      </td>
                      <td className="p-4">
                        <span className="px-2 py-1 bg-slate-700 rounded-full text-xs text-slate-300">
                          {wallet.department}
                        </span>
                      </td>
                      <td className="p-4 text-right text-green-400 font-semibold">
                        {formatCurrency(wallet.balance)}
                      </td>
                      <td className="p-4 text-right text-slate-400">
                        {formatCurrency(wallet.totalReceived)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="bg-slate-800/30 rounded-xl border border-slate-700/50 overflow-hidden">
          <div className="p-4 border-b border-slate-700/50">
            <h2 className="text-white font-semibold flex items-center gap-2">
              <FaExchangeAlt className="text-yellow-500" />
              Payout History
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b border-slate-700/50">
                  <th className="p-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">From</th>
                  <th className="p-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">To</th>
                  <th className="p-4 text-right text-xs font-semibold text-slate-400 uppercase tracking-wide">Amount</th>
                  <th className="p-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">Note</th>
                  <th className="p-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">Date</th>
                </tr>
              </thead>
              <tbody>
                {loadingPayouts ? (
                  <tr>
                    <td colSpan="5" className="p-8 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-yellow-500 border-t-transparent"></div>
                        <span className="text-slate-400">Loading...</span>
                      </div>
                    </td>
                  </tr>
                ) : payouts.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-8 text-center text-slate-500">
                      No payouts made yet.
                    </td>
                  </tr>
                ) : (
                  payouts.map((payout) => (
                    <tr key={payout._id} className="border-b border-slate-700/30 hover:bg-slate-800/50">
                      <td className="p-4">
                        <p className="text-white text-sm">{payout.fromEmail}</p>
                      </td>
                      <td className="p-4">
                        <p className="text-white text-sm">{payout.toEmail}</p>
                        <p className="text-slate-400 text-xs">{payout.toDepartment}</p>
                      </td>
                      <td className="p-4 text-right text-green-400 font-semibold">
                        {formatCurrency(payout.amount)}
                      </td>
                      <td className="p-4 text-slate-400 text-sm max-w-[150px] truncate">
                        {payout.note || '-'}
                      </td>
                      <td className="p-4 text-slate-400 text-xs">
                        {formatDate(payout.createdAt)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminEarnings;
