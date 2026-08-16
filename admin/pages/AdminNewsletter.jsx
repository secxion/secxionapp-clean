import React, { useEffect, useMemo, useState } from 'react';
import {
  FaEnvelopeOpenText,
  FaPaperPlane,
  FaSyncAlt,
  FaUsers,
  FaUserCheck,
  FaUserClock,
  FaUserTimes,
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import SummaryApi, { authFetch } from '../common';
import AdminPageLayout from '../components/layout/AdminPageLayout';
import AdminTableShell from '../components/ui/AdminTableShell';

const defaultStats = {
  total: 0,
  active: 0,
  pending: 0,
  unsubscribed: 0,
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SEND_CAMPAIGN_TIMEOUT_MS = 45000;

const AdminNewsletter = () => {
  const [stats, setStats] = useState(defaultStats);
  const [mailHealth, setMailHealth] = useState(null);
  const [subscribers, setSubscribers] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [recipientMode, setRecipientMode] = useState('all');
  const [selectedEmails, setSelectedEmails] = useState([]);
  const [manualEmailsInput, setManualEmailsInput] = useState('');
  const [formData, setFormData] = useState({
    subject: '',
    html: '',
    text: '',
  });

  const filteredSubscribers = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return subscribers;

    return subscribers.filter((subscriber) =>
      subscriber.email?.toLowerCase().includes(query),
    );
  }, [search, subscribers]);

  const fetchStats = async () => {
    const response = await authFetch(SummaryApi.adminNewsletterStats.url, {
      method: SummaryApi.adminNewsletterStats.method,
    });
    const result = await response.json();
    if (!response.ok || !result.success) {
      throw new Error(result.message || 'Unable to fetch newsletter stats.');
    }
    setStats(result.data || defaultStats);
  };

  const fetchSubscribers = async () => {
    const params = new URLSearchParams();
    params.set('status', statusFilter);

    const response = await authFetch(
      `${SummaryApi.adminNewsletterSubscribers.url}?${params.toString()}`,
      {
        method: SummaryApi.adminNewsletterSubscribers.method,
      },
    );

    const result = await response.json();
    if (!response.ok || !result.success) {
      throw new Error(result.message || 'Unable to fetch newsletter subscribers.');
    }

    setSubscribers(Array.isArray(result.data) ? result.data : []);
  };

  const fetchMailHealth = async () => {
    const response = await authFetch(SummaryApi.adminNewsletterHealth.url, {
      method: SummaryApi.adminNewsletterHealth.method,
    });

    const result = await response.json();
    if (!response.ok || !result.success) {
      throw new Error(result.message || 'Unable to fetch newsletter mail health.');
    }

    setMailHealth(result.data || null);
  };

  const activeFilteredSubscribers = useMemo(
    () => filteredSubscribers.filter((subscriber) => subscriber.status === 'active'),
    [filteredSubscribers],
  );

  const selectedEmailSet = useMemo(() => new Set(selectedEmails), [selectedEmails]);

  const parsedManualEmails = useMemo(() => {
    return [...new Set(
      manualEmailsInput
        .split(/[\s,;]+/)
        .map((value) => value.trim().toLowerCase())
        .filter((value) => value.length > 0 && EMAIL_REGEX.test(value)),
    )];
  }, [manualEmailsInput]);

  const combinedSpecificEmails = useMemo(
    () => [...new Set([...selectedEmails, ...parsedManualEmails])],
    [selectedEmails, parsedManualEmails],
  );

  const allFilteredActiveSelected =
    activeFilteredSubscribers.length > 0 &&
    activeFilteredSubscribers.every((subscriber) => selectedEmailSet.has(subscriber.email));

  const toggleEmailSelection = (email) => {
    setSelectedEmails((prev) => {
      const next = new Set(prev);
      if (next.has(email)) {
        next.delete(email);
      } else {
        next.add(email);
      }
      return Array.from(next);
    });
  };

  const toggleSelectAllFilteredActive = () => {
    const filteredActiveEmails = activeFilteredSubscribers.map((subscriber) => subscriber.email);
    setSelectedEmails((prev) => {
      const next = new Set(prev);

      if (allFilteredActiveSelected) {
        filteredActiveEmails.forEach((email) => next.delete(email));
      } else {
        filteredActiveEmails.forEach((email) => next.add(email));
      }

      return Array.from(next);
    });
  };

  const refreshData = async () => {
    setLoading(true);
    try {
      await Promise.all([fetchStats(), fetchSubscribers(), fetchMailHealth()]);
    } catch (error) {
      toast.error(error.message || 'Newsletter data refresh failed.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, [statusFilter]);

  const handleSendCampaign = async (event) => {
    event.preventDefault();

    if (!formData.subject.trim() || (!formData.html.trim() && !formData.text.trim())) {
      toast.error('Subject and campaign body are required.');
      return;
    }

    if (recipientMode === 'specific' && combinedSpecificEmails.length === 0) {
      toast.error('Select at least one active subscriber or enter a valid email.');
      return;
    }

    setSending(true);
    let timeoutId;
    try {
      const payload = {
        ...formData,
        recipientMode,
        recipientEmails: recipientMode === 'specific' ? combinedSpecificEmails : [],
      };

      const controller = new AbortController();
      timeoutId = setTimeout(() => controller.abort(), SEND_CAMPAIGN_TIMEOUT_MS);

      const response = await authFetch(SummaryApi.sendNewsletterCampaign.url, {
        method: SummaryApi.sendNewsletterCampaign.method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.success) {
        const issueMessage = Array.isArray(result?.data?.issues) && result.data.issues.length
          ? ` ${result.data.issues.join(' ')}`
          : '';
        throw new Error((result.message || 'Failed to send newsletter campaign.') + issueMessage);
      }

      if (result?.data?.skippedRequestedEmails?.length) {
        toast.warn(
          `${result.data.skippedRequestedEmails.length} email(s) were skipped (inactive or not found).`,
        );
      }

      toast.success(result.message || 'Newsletter campaign sent successfully.');
      setFormData({ subject: '', html: '', text: '' });
      setSelectedEmails([]);
      setManualEmailsInput('');
      await refreshData();
    } catch (error) {
      if (error?.name === 'AbortError') {
        toast.error('Campaign send timed out. Please retry or reduce recipients.');
        return;
      }
      toast.error(error.message || 'Failed to send newsletter campaign.');
    } finally {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      setSending(false);
    }
  };

  return (
    <AdminPageLayout
      title="Newsletter"
      subtitle="Manage subscribers and send campaigns"
      icon={FaEnvelopeOpenText}
      actions={
        <button onClick={refreshData} className="admin-btn-muted" disabled={loading}>
          <span className="inline-flex items-center gap-2">
            <FaSyncAlt className={loading ? 'animate-spin' : ''} /> Refresh
          </span>
        </button>
      }
    >
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 mb-6">
        <div className="admin-card p-4">
          <p className="text-xs uppercase tracking-wide text-slate-400">Total</p>
          <p className="mt-1 text-2xl font-bold text-white">{stats.total}</p>
          <FaUsers className="mt-2 text-slate-500" />
        </div>
        <div className="admin-card p-4">
          <p className="text-xs uppercase tracking-wide text-slate-400">Active</p>
          <p className="mt-1 text-2xl font-bold text-green-400">{stats.active}</p>
          <FaUserCheck className="mt-2 text-green-400" />
        </div>
        <div className="admin-card p-4">
          <p className="text-xs uppercase tracking-wide text-slate-400">Pending</p>
          <p className="mt-1 text-2xl font-bold text-yellow-400">{stats.pending}</p>
          <FaUserClock className="mt-2 text-yellow-400" />
        </div>
        <div className="admin-card p-4">
          <p className="text-xs uppercase tracking-wide text-slate-400">Unsubscribed</p>
          <p className="mt-1 text-2xl font-bold text-red-400">{stats.unsubscribed}</p>
          <FaUserTimes className="mt-2 text-red-400" />
        </div>
      </div>

      {mailHealth && !mailHealth.ready ? (
        <div className="mb-6 rounded-xl border border-amber-500/40 bg-amber-500/10 p-4">
          <h3 className="text-sm font-semibold text-amber-300">Newsletter delivery setup needs attention</h3>
          <p className="mt-1 text-xs text-amber-200">
            Campaign sending is restricted to domain-aligned providers. Resolve the issues below to match industry sender standards.
          </p>
          <ul className="mt-2 list-disc pl-5 text-xs text-amber-100 space-y-1">
            {(mailHealth.issues || []).map((issue) => (
              <li key={issue}>{issue}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="admin-card p-4 mb-6">
        <form onSubmit={handleSendCampaign} className="space-y-3">
          <h2 className="text-white font-semibold text-lg">Send Campaign</h2>
          <div className="rounded-xl border border-slate-700 bg-slate-900/40 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Recipients
            </p>
            <div className="mt-2 flex flex-col gap-2 text-sm text-slate-200 sm:flex-row sm:items-center">
              <label className="inline-flex items-center gap-2">
                <input
                  type="radio"
                  name="recipient-mode"
                  checked={recipientMode === 'all'}
                  onChange={() => setRecipientMode('all')}
                />
                <span>All active subscribers ({stats.active})</span>
              </label>
              <label className="inline-flex items-center gap-2">
                <input
                  type="radio"
                  name="recipient-mode"
                  checked={recipientMode === 'specific'}
                  onChange={() => setRecipientMode('specific')}
                />
                <span>Specific emails ({combinedSpecificEmails.length})</span>
              </label>
            </div>
            {recipientMode === 'specific' ? (
              <div className="mt-2 space-y-2">
                <p className="text-xs text-slate-400">
                  Pick active subscribers below and/or paste additional emails.
                </p>
                <textarea
                  rows={3}
                  placeholder="Paste emails separated by commas, spaces, semicolons, or new lines"
                  className="admin-input w-full resize-y"
                  value={manualEmailsInput}
                  onChange={(event) => setManualEmailsInput(event.target.value)}
                />
                <p className="text-xs text-slate-400">
                  Manual valid emails: {parsedManualEmails.length} | Combined recipients: {combinedSpecificEmails.length}
                </p>
              </div>
            ) : null}
          </div>
          <input
            type="text"
            placeholder="Campaign subject"
            className="admin-input w-full"
            value={formData.subject}
            onChange={(event) =>
              setFormData((prev) => ({ ...prev, subject: event.target.value }))
            }
          />
          <textarea
            rows={8}
            placeholder="HTML content"
            className="admin-input w-full resize-y"
            value={formData.html}
            onChange={(event) =>
              setFormData((prev) => ({ ...prev, html: event.target.value }))
            }
          />
          <textarea
            rows={4}
            placeholder="Optional text fallback"
            className="admin-input w-full resize-y"
            value={formData.text}
            onChange={(event) =>
              setFormData((prev) => ({ ...prev, text: event.target.value }))
            }
          />
          <button
            type="submit"
            className="admin-btn-primary font-semibold disabled:opacity-60"
            disabled={sending}
          >
            <span className="inline-flex items-center gap-2">
              <FaPaperPlane />
              {sending ? 'Sending...' : 'Send Campaign'}
            </span>
          </button>
        </form>
      </div>

      <div className="flex flex-col gap-3 mb-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2 flex-wrap">
          {['all', 'active', 'pending', 'unsubscribed'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={
                statusFilter === status
                  ? 'admin-btn-primary px-3 py-1.5 text-xs'
                  : 'admin-btn-muted px-3 py-1.5 text-xs'
              }
            >
              {status[0].toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        <input
          type="text"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="admin-input w-full sm:w-72"
          placeholder="Search subscriber email"
        />
      </div>

      {recipientMode === 'specific' ? (
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={toggleSelectAllFilteredActive}
            className="admin-btn-muted px-3 py-1.5 text-xs"
            disabled={activeFilteredSubscribers.length === 0}
          >
            {allFilteredActiveSelected ? 'Unselect filtered active' : 'Select filtered active'}
          </button>
          <button
            type="button"
            onClick={() => setSelectedEmails([])}
            className="admin-btn-muted px-3 py-1.5 text-xs"
            disabled={selectedEmails.length === 0}
          >
            Clear selected
          </button>
          <p className="text-xs text-slate-400">
            Selected rows: {selectedEmails.length} | Manual valid: {parsedManualEmails.length} | Filtered active: {activeFilteredSubscribers.length}
          </p>
        </div>
      ) : null}

      <AdminTableShell>
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-800/80 text-slate-300">
            <tr>
              <th className="p-3 w-12">Pick</th>
              <th className="p-3">Email</th>
              <th className="p-3">Status</th>
              <th className="p-3">Source</th>
              <th className="p-3">Subscribed</th>
              <th className="p-3">Last Campaign</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700 bg-slate-900/40 text-slate-200">
            {loading ? (
              <tr>
                <td colSpan={6} className="p-4">Loading subscribers...</td>
              </tr>
            ) : filteredSubscribers.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-4">No subscribers found.</td>
              </tr>
            ) : (
              filteredSubscribers.map((subscriber) => (
                <tr key={subscriber._id}>
                  <td className="p-3">
                    <input
                      type="checkbox"
                      checked={selectedEmailSet.has(subscriber.email)}
                      disabled={subscriber.status !== 'active'}
                      onChange={() => toggleEmailSelection(subscriber.email)}
                      aria-label={`Select ${subscriber.email}`}
                    />
                  </td>
                  <td className="p-3">{subscriber.email}</td>
                  <td className="p-3 capitalize">{subscriber.status}</td>
                  <td className="p-3">{subscriber.source || 'website'}</td>
                  <td className="p-3">
                    {subscriber.subscribedAt
                      ? new Date(subscriber.subscribedAt).toLocaleString()
                      : 'N/A'}
                  </td>
                  <td className="p-3">
                    {subscriber.lastCampaignAt
                      ? new Date(subscriber.lastCampaignAt).toLocaleString()
                      : 'Never'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </AdminTableShell>
    </AdminPageLayout>
  );
};

export default AdminNewsletter;
