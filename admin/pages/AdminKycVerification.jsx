import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { FaCheckCircle, FaClock, FaSearch, FaTimesCircle, FaUserShield } from 'react-icons/fa';
import SummaryApi, { authFetch } from '../common';

const statusPill = {
  pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  approved: 'bg-green-500/20 text-green-400 border-green-500/30',
  rejected: 'bg-red-500/20 text-red-400 border-red-500/30',
};

const faceMatchLabels = {
  not_started: 'Not Started',
  pending: 'Pending Review',
  passed: 'Passed',
  failed: 'Failed',
};

const parseAddressString = (address = '') => {
  const parsed = {
    addressLine1: '',
    addressLine2: '',
    city: '',
    stateProvince: '',
    postalCode: '',
    raw: String(address || '').trim(),
  };

  if (!parsed.raw) return parsed;

  const parts = parsed.raw
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);

  const streetParts = [];

  parts.forEach((part) => {
    const lower = part.toLowerCase();

    if (lower.startsWith('city:')) {
      parsed.city = part.slice(5).trim();
      return;
    }

    if (lower.startsWith('state/province:')) {
      parsed.stateProvince = part.slice(15).trim();
      return;
    }

    if (lower.startsWith('postal code:')) {
      parsed.postalCode = part.slice(12).trim();
      return;
    }

    streetParts.push(part);
  });

  parsed.addressLine1 = streetParts[0] || '';
  parsed.addressLine2 = streetParts.slice(1).join(', ');

  return parsed;
};

const formatDateValue = (value) => {
  if (!value) return 'Not provided';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return 'Not provided';
  return parsed.toLocaleDateString();
};

const AdminKycVerification = () => {
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [submissions, setSubmissions] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [decision, setDecision] = useState('approved');
  const [adminNotes, setAdminNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  const fetchStats = async () => {
    try {
      const response = await authFetch(SummaryApi.adminKycStats.url, {
        method: SummaryApi.adminKycStats.method,
      });
      const result = await response.json();
      if (result.success) {
        setStats(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch KYC stats:', error);
    }
  };

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('status', statusFilter);
      if (search.trim()) params.set('search', search.trim());

      const response = await authFetch(`${SummaryApi.adminKycSubmissions.url}?${params.toString()}`, {
        method: SummaryApi.adminKycSubmissions.method,
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to fetch KYC submissions.');
      }
      setSubmissions(result.data || []);
    } catch (error) {
      toast.error(error.message || 'Could not load KYC submissions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    fetchSubmissions();
  }, [statusFilter]);

  const filtered = useMemo(() => {
    if (!search.trim()) return submissions;
    const q = search.toLowerCase();
    return submissions.filter((item) =>
      [item.fullName, item.idNumber, item.userId?.email, item.userId?.name]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(q)),
    );
  }, [submissions, search]);

  const openReview = (item) => {
    setSelected(item);
    setDecision(item.status === 'pending' ? 'approved' : item.status);
    setAdminNotes(item.adminNotes || '');
    setRejectionReason('');
  };

  const selectedAddress = useMemo(
    () => parseAddressString(selected?.address || ''),
    [selected?.address],
  );

  const submitReview = async () => {
    if (!selected) return;

    if (decision === 'rejected' && !rejectionReason.trim()) {
      toast.error('Rejection reason is required.');
      return;
    }

    setUpdating(true);
    try {
      const response = await authFetch(
        `${SummaryApi.reviewKycSubmission.url}/${selected._id}`,
        {
          method: SummaryApi.reviewKycSubmission.method,
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            status: decision,
            adminNotes,
            rejectionReason,
          }),
        },
      );

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Review update failed.');
      }

      toast.success(result.message || 'KYC review updated.');
      setSelected(null);
      await Promise.all([fetchSubmissions(), fetchStats()]);
    } catch (error) {
      toast.error(error.message || 'Unable to update review status.');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="p-4 lg:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-yellow-500/10">
            <FaUserShield className="text-yellow-500 text-xl" />
          </div>
          <div>
            <h1 className="text-white text-xl font-bold">KYC Verification</h1>
            <p className="text-slate-400 text-sm">Review and approve identity submissions</p>
          </div>
        </div>
        <button
          onClick={fetchSubmissions}
          className="px-4 py-2 rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700"
        >
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { key: 'total', label: 'Total', icon: FaClock },
          { key: 'pending', label: 'Pending', icon: FaClock },
          { key: 'approved', label: 'Approved', icon: FaCheckCircle },
          { key: 'rejected', label: 'Rejected', icon: FaTimesCircle },
        ].map((card) => (
          <div key={card.key} className="bg-slate-800/60 border border-slate-700 rounded-xl p-4">
            <p className="text-slate-400 text-xs uppercase">{card.label}</p>
            <p className="text-white text-2xl font-bold mt-1">{stats[card.key] || 0}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        {['all', 'pending', 'approved', 'rejected'].map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-3 py-2 rounded-lg text-sm font-medium ${
              statusFilter === status
                ? 'bg-yellow-500 text-slate-900'
                : 'bg-slate-800/70 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {status === 'all' ? 'All' : status[0].toUpperCase() + status.slice(1)}
          </button>
        ))}

        <div className="relative ml-auto">
          <FaSearch className="absolute left-3 top-3 text-slate-400" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search name, email, id number"
            className="pl-9 pr-3 py-2 rounded-lg bg-slate-800 text-white border border-slate-700 focus:border-yellow-500 outline-none"
          />
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-700">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-800/80 text-slate-300">
            <tr>
              <th className="p-3">User</th>
              <th className="p-3">ID Type</th>
              <th className="p-3">ID Number</th>
              <th className="p-3">Status</th>
              <th className="p-3">Submitted</th>
              <th className="p-3">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700 bg-slate-900/40 text-slate-200">
            {loading ? (
              <tr>
                <td className="p-4" colSpan={6}>Loading submissions...</td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td className="p-4" colSpan={6}>No KYC submissions found.</td>
              </tr>
            ) : (
              filtered.map((item) => (
                <tr key={item._id}>
                  <td className="p-3">
                    <p className="font-semibold">{item.fullName}</p>
                    <p className="text-xs text-slate-400">{item.userId?.email || 'No email'}</p>
                  </td>
                  <td className="p-3">{item.idType}</td>
                  <td className="p-3">{item.idNumber}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded-full text-xs border ${statusPill[item.status] || statusPill.pending}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="p-3">{new Date(item.submittedAt).toLocaleString()}</td>
                  <td className="p-3">
                    <button
                      onClick={() => openReview(item)}
                      className="px-3 py-1 rounded-lg bg-yellow-500 text-slate-900 font-semibold hover:bg-yellow-400"
                    >
                      Review
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl bg-slate-900 border border-slate-700">
            <div className="sticky top-0 z-10 flex justify-between items-start p-5 mb-4 border-b border-slate-700 bg-slate-900/95 backdrop-blur">
              <div>
                <h2 className="text-white text-lg font-bold">Review KYC: {selected.fullName}</h2>
                <p className="text-sm text-slate-400">{selected.userId?.email}</p>
              </div>
              <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-white">Close</button>
            </div>

            <div className="px-5">

            <div className="mb-4 rounded-xl border border-slate-700 bg-slate-800/40 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-3">
                Submitted Identity Details
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-slate-400">Full Name</p>
                  <p className="text-slate-100">{selected.fullName || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-slate-400">Date of Birth</p>
                  <p className="text-slate-100">{formatDateValue(selected.dateOfBirth)}</p>
                </div>
                <div>
                  <p className="text-slate-400">Country</p>
                  <p className="text-slate-100">{selected.country || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-slate-400">Phone Number</p>
                  <p className="text-slate-100">{selected.phoneNumber || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-slate-400">ID Type</p>
                  <p className="text-slate-100">{selected.idType || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-slate-400">Phone Verification</p>
                  <p className="text-slate-100">
                    {selected.phoneVerification?.isVerified
                      ? `Verified${selected.phoneVerification?.verifiedAt ? ` (${new Date(selected.phoneVerification.verifiedAt).toLocaleString()})` : ''}`
                      : 'Not verified'}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400">KYC Consent</p>
                  <p className="text-slate-100">
                    {selected.consent?.accepted
                      ? `Accepted${selected.consent?.acceptedAt ? ` (${new Date(selected.consent.acceptedAt).toLocaleString()})` : ''}`
                      : 'Not accepted'}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400">Face Match</p>
                  <p className="text-slate-100">
                    {faceMatchLabels[selected.faceMatch?.status] ||
                      faceMatchLabels.not_started}
                    {Number.isFinite(selected.faceMatch?.score)
                      ? ` (${selected.faceMatch.score.toFixed(2)}%)`
                      : ''}
                  </p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-slate-400">ID Number</p>
                  <p className="text-slate-100 break-all">{selected.idNumber || 'Not provided'}</p>
                </div>
              </div>

              <div className="mt-4 border-t border-slate-700 pt-3">
                <p className="text-slate-400 text-sm mb-2">Residential Address</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-slate-400">Street Address Line 1</p>
                    <p className="text-slate-100">{selectedAddress.addressLine1 || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Street Address Line 2</p>
                    <p className="text-slate-100">{selectedAddress.addressLine2 || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">City</p>
                    <p className="text-slate-100">{selectedAddress.city || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">State / Province</p>
                    <p className="text-slate-100">{selectedAddress.stateProvince || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Postal Code</p>
                    <p className="text-slate-100">{selectedAddress.postalCode || 'Not provided'}</p>
                  </div>
                </div>

                {!selectedAddress.addressLine1 && selectedAddress.raw && (
                  <div className="mt-3">
                    <p className="text-slate-400 text-xs">Original Address Value</p>
                    <p className="text-slate-200 text-sm break-words">{selectedAddress.raw}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="sticky top-[88px] z-[9] mb-4 border-b border-slate-700 bg-slate-900/95 py-3 backdrop-blur">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <a href={selected.documents?.frontUrl} target="_blank" rel="noreferrer" className="p-3 rounded-lg border border-slate-700 bg-slate-800 text-yellow-400 hover:underline">View ID Front</a>
                {selected.documents?.backUrl ? (
                  <a href={selected.documents.backUrl} target="_blank" rel="noreferrer" className="p-3 rounded-lg border border-slate-700 bg-slate-800 text-yellow-400 hover:underline">View ID Back</a>
                ) : (
                  <div className="p-3 rounded-lg border border-slate-700 bg-slate-800 text-slate-500">No ID Back</div>
                )}
                <a href={selected.documents?.selfieUrl} target="_blank" rel="noreferrer" className="p-3 rounded-lg border border-slate-700 bg-slate-800 text-yellow-400 hover:underline">View Selfie</a>
              </div>
            </div>

            <div className="mb-4 rounded-xl border border-slate-700 bg-slate-800/40 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-3">
                Face Match Result (Automated)
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-slate-400">Status</p>
                  <p className="text-slate-100">
                    {faceMatchLabels[selected.faceMatch?.status] ||
                      faceMatchLabels.not_started}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400">Score</p>
                  <p className="text-slate-100">
                    {Number.isFinite(selected.faceMatch?.score)
                      ? `${selected.faceMatch.score.toFixed(2)}%`
                      : 'Not available'}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400">Provider</p>
                  <p className="text-slate-100">
                    {selected.faceMatch?.provider || 'Not provided'}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400">Reference ID</p>
                  <p className="text-slate-100 break-all">
                    {selected.faceMatch?.referenceId || 'Not provided'}
                  </p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-slate-400">Checked At</p>
                  <p className="text-slate-100">
                    {selected.faceMatch?.checkedAt
                      ? new Date(selected.faceMatch.checkedAt).toLocaleString()
                      : 'Not checked yet'}
                  </p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-slate-400">Notes</p>
                  <p className="text-slate-100">
                    {selected.faceMatch?.notes || 'No notes provided'}
                  </p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-slate-400">Evidence URL</p>
                  {selected.faceMatch?.evidenceUrl ? (
                    <a
                      href={selected.faceMatch.evidenceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-yellow-400 hover:underline break-all"
                    >
                      {selected.faceMatch.evidenceUrl}
                    </a>
                  ) : (
                    <p className="text-slate-100">Not provided</p>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
              <select
                value={decision}
                onChange={(event) => setDecision(event.target.value)}
                className="px-3 py-2 rounded-lg bg-slate-800 border border-slate-600 text-white"
              >
                <option value="approved">Approve</option>
                <option value="rejected">Reject</option>
              </select>
              <input
                value={adminNotes}
                onChange={(event) => setAdminNotes(event.target.value)}
                placeholder="Admin notes (optional)"
                className="px-3 py-2 rounded-lg bg-slate-800 border border-slate-600 text-white"
              />
            </div>

            {decision === 'rejected' && (
              <textarea
                rows={3}
                value={rejectionReason}
                onChange={(event) => setRejectionReason(event.target.value)}
                placeholder="Rejection reason (required)"
                className="w-full mb-4 px-3 py-2 rounded-lg bg-slate-800 border border-red-500/50 text-white"
              />
            )}

            <div className="sticky bottom-0 z-10 flex justify-end gap-3 p-5 mt-5 border-t border-slate-700 bg-slate-900/95 backdrop-blur">
              <button onClick={() => setSelected(null)} className="px-4 py-2 rounded-lg bg-slate-700 text-slate-100">Cancel</button>
              <button
                onClick={submitReview}
                disabled={updating}
                className="px-4 py-2 rounded-lg bg-yellow-500 text-slate-900 font-bold hover:bg-yellow-400 disabled:opacity-60"
              >
                {updating ? 'Saving...' : 'Save Review'}
              </button>
            </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminKycVerification;
