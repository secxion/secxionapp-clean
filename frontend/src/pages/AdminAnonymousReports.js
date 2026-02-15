import React, { useEffect, useState } from 'react';
// ...existing code...
import { MdExpandMore } from 'react-icons/md';
import { FaUserSecret } from 'react-icons/fa';
import SummaryApi from '../common';

const AdminAnonymousReports = () => {
  const [anonymousReports, setAnonymousReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedReport, setExpandedReport] = useState(null);

  useEffect(() => {
    fetchAnonymousReports();
  }, []);

  const fetchAnonymousReports = async () => {
    try {
      setLoading(true);

      const response = await fetch(SummaryApi.getContactUsMessages.url, {
        method: SummaryApi.getContactUsMessages.method || 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(
          `Failed to fetch contact us messages. Status: ${response.status}`,
        );
      }

      const data = await response.json();

      if (data.success && Array.isArray(data.data)) {
        setAnonymousReports(data.data);
      } else {
        setAnonymousReports([]);
      }
    } catch (error) {
      console.error('Error fetching contact us messages:', error);
      // ...existing code...
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 lg:p-6">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-yellow-500/10 rounded-xl">
          <FaUserSecret className="text-yellow-500 text-xl" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">
            Anonymous Contact Messages
          </h1>
          <p className="text-slate-400 text-sm">
            Messages from the Contact Us form
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-yellow-500 border-t-transparent mr-3"></div>
          <span className="text-slate-400">Loading messages...</span>
        </div>
      ) : anonymousReports.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-slate-500">
          <FaUserSecret className="text-4xl mb-3" />
          <p>No contact messages available.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {anonymousReports.map((report) => (
            <div
              key={report._id}
              className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-4"
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-white font-medium">Contact Us</p>
                  <p className="text-xs text-slate-400">
                    By: Anonymous | {report.email || 'N/A'}
                  </p>
                </div>
                <button
                  onClick={() =>
                    setExpandedReport(
                      expandedReport === report._id ? null : report._id,
                    )
                  }
                  className={`p-2 text-slate-400 hover:text-yellow-500 transition-transform ${
                    expandedReport === report._id ? 'rotate-180' : ''
                  }`}
                >
                  <MdExpandMore className="text-2xl" />
                </button>
              </div>

              {expandedReport === report._id && (
                <div className="mt-3 pt-3 border-t border-slate-700/50">
                  <p className="text-slate-300">{report.reason}</p>
                </div>
              )}

              <div className="flex justify-end mt-2">
                <span className="text-xs px-2.5 py-1 rounded-lg font-medium bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                  New
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminAnonymousReports;
