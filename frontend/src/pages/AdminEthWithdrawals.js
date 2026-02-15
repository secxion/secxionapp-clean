import React, { useEffect, useState } from 'react';
import SummaryApi from '../common';
import { toast } from 'react-toastify';
import {
  FaEthereum,
  FaSearch,
  FaTimes,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
} from 'react-icons/fa';

const AdminEthWithdrawals = () => {
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const requestsPerPage = 10;

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await fetch(SummaryApi.ethWithdrawals.getAll, {
        credentials: 'include',
      });
      const data = await res.json();
      if (data.success) {
        setRequests(data.data);
      } else {
        toast.error('Failed to fetch requests');
      }
    } catch (err) {
      toast.error('Server error');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      const res = await fetch(SummaryApi.ethWithdrawals.updateStatus(id), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Status updated');
        fetchRequests();
      } else {
        toast.error('Failed to update status');
      }
    } catch (err) {
      toast.error('Error updating status');
    }
  };

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setStatusFilter('All');
    setSearchTerm('');
    setStartDate('');
    setEndDate('');
    setCurrentPage(1);
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  useEffect(() => {
    let filtered = [...requests];

    if (statusFilter !== 'All') {
      filtered = filtered.filter((req) => req.status === statusFilter);
    }

    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (req) =>
          req.userId?.email?.toLowerCase().includes(term) ||
          req.userId?.name?.toLowerCase().includes(term),
      );
    }

    if (startDate && endDate) {
      const start = new Date(startDate).getTime();
      const end = new Date(endDate).getTime();
      filtered = filtered.filter((req) => {
        const created = new Date(req.createdAt).getTime();
        return created >= start && created <= end;
      });
    }

    setFilteredRequests(filtered);
  }, [requests, statusFilter, searchTerm, startDate, endDate]);

  const indexOfLast = currentPage * requestsPerPage;
  const indexOfFirst = indexOfLast - requestsPerPage;
  const currentRequests = filteredRequests.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredRequests.length / requestsPerPage);

  const handlePageChange = (pageNum) => setCurrentPage(pageNum);

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'Processed':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'Rejected':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-slate-700/50 text-slate-300 border-slate-600/50';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Pending':
        return <FaClock className="mr-1" />;
      case 'Processed':
        return <FaCheckCircle className="mr-1" />;
      case 'Rejected':
        return <FaTimesCircle className="mr-1" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-yellow-500 border-t-transparent mr-3"></div>
        <span className="text-slate-400">Loading ETH requests...</span>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-yellow-500/10 rounded-xl">
            <FaEthereum className="text-yellow-500 text-xl" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">ETH Withdrawals</h1>
            <p className="text-slate-400 text-sm">
              Process Ethereum withdrawal requests
            </p>
          </div>
        </div>
        <div className="text-sm text-slate-400">
          {filteredRequests.length} requests
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
        <div>
          <label className="block text-xs text-slate-400 mb-1">Status</label>
          <select
            value={statusFilter}
            onChange={handleStatusFilterChange}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-yellow-500/50"
          >
            <option value="All" className="bg-slate-900">
              All
            </option>
            <option value="Pending" className="bg-slate-900">
              Pending
            </option>
            <option value="Processed" className="bg-slate-900">
              Processed
            </option>
            <option value="Rejected" className="bg-slate-900">
              Rejected
            </option>
          </select>
        </div>

        <div>
          <label className="block text-xs text-slate-400 mb-1">Search</label>
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs" />
            <input
              type="text"
              placeholder="Email or name..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:border-yellow-500/50"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs text-slate-400 mb-1">From</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-yellow-500/50"
          />
        </div>

        <div>
          <label className="block text-xs text-slate-400 mb-1">To</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-yellow-500/50"
          />
        </div>

        <div className="flex items-end">
          <button
            onClick={handleClearFilters}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 text-sm hover:bg-slate-700 hover:border-yellow-500/50 transition-colors flex items-center justify-center"
          >
            <FaTimes className="mr-2" /> Clear
          </button>
        </div>
      </div>

      {/* Table */}
      {currentRequests.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-slate-500">
          <FaEthereum className="text-4xl mb-3" />
          <p>No ETH withdrawal requests found.</p>
        </div>
      ) : (
        <>
          <div className="bg-slate-800/30 rounded-xl border border-slate-700/50 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px]">
                <thead>
                  <tr className="border-b border-slate-700/50">
                    <th className="p-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">
                      User
                    </th>
                    <th className="p-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">
                      Naira
                    </th>
                    <th className="p-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">
                      ETH (Gross)
                    </th>
                    <th className="p-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">
                      ETH (Net)
                    </th>
                    <th className="p-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">
                      Recipient
                    </th>
                    <th className="p-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">
                      Date
                    </th>
                    <th className="p-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">
                      Status
                    </th>
                    <th className="p-4 text-center text-xs font-semibold text-slate-400 uppercase tracking-wide">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {currentRequests.map((req) => (
                    <tr
                      key={req._id}
                      className="border-b border-slate-700/30 hover:bg-slate-800/50 transition-colors"
                    >
                      <td className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-500 to-yellow-600 flex items-center justify-center text-slate-900 font-bold text-xs flex-shrink-0">
                            {(req.userId?.name || 'U').charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="text-white text-sm font-medium truncate">
                              {req.userId?.name || 'N/A'}
                            </p>
                            <p className="text-slate-400 text-xs truncate">
                              {req.userId?.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-yellow-500 font-semibold text-sm">
                        ₦{Number(req.nairaRequestedAmount).toLocaleString()}
                      </td>
                      <td className="p-4 text-slate-300 text-sm font-mono">
                        {Number(req.ethCalculatedAmount).toFixed(6)}
                      </td>
                      <td className="p-4 text-white text-sm font-mono font-semibold">
                        {Number(req.ethNetAmountToSend).toFixed(6)}
                      </td>
                      <td className="p-4 text-slate-400 text-xs font-mono max-w-[120px] truncate">
                        {req.ethRecipientAddress}
                      </td>
                      <td className="p-4 text-slate-400 text-sm">
                        {new Date(req.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium border ${getStatusStyle(req.status)}`}
                        >
                          {getStatusIcon(req.status)}
                          {req.status}
                        </span>
                      </td>
                      <td className="p-4">
                        <select
                          className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-xs focus:outline-none focus:border-yellow-500/50"
                          value={req.status}
                          onChange={(e) =>
                            updateStatus(req._id, e.target.value)
                          }
                        >
                          <option value="Pending" className="bg-slate-900">
                            Pending
                          </option>
                          <option value="Processed" className="bg-slate-900">
                            Processed
                          </option>
                          <option value="Rejected" className="bg-slate-900">
                            Rejected
                          </option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-4 flex justify-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => handlePageChange(i + 1)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    currentPage === i + 1
                      ? 'bg-yellow-500 text-slate-900'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminEthWithdrawals;
