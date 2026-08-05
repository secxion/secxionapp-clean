import React, { useEffect, useState, useCallback, useRef } from 'react';
import { toast } from 'react-toastify';
import SummaryApi from '../common';
import { useNavigate } from 'react-router-dom';

const ReportList = ({ newReport }) => {
  const [reports, setReports] = useState([]);
  const [fetchingReports, setFetchingReports] = useState(true);
  const pollingInterval = useRef(null);
  const navigate = useNavigate();

  const fetchReports = useCallback(async () => {
    try {
      const response = await fetch(SummaryApi.getReports.url, {
        method: SummaryApi.getReports.method,
        credentials: 'include',
      });

      if (!response.ok) throw new Error('Network response was not ok');

      const data = await response.json();

      if (!data.success || !Array.isArray(data.data)) {
        console.warn('User Fetch Reports: Invalid data format', data);
        setReports([]);
        throw new Error('Invalid report data received');
      }
      if (JSON.stringify(data.data) !== JSON.stringify(reports)) {
        setReports(data.data);
      }
    } catch (error) {
      toast.error('Could not fetch reports.');
      console.error('User Fetch error:', error);
    } finally {
      if (fetchingReports) setFetchingReports(false);
    }
  }, []);

  useEffect(() => {
    fetchReports();
    pollingInterval.current = setInterval(fetchReports, 5000);
    return () => clearInterval(pollingInterval.current);
  }, [fetchReports, newReport]);

  const handleOpenChat = useCallback(
    (reportId) => {
      navigate(`/chat/${reportId}`);
    },
    [navigate],
  );

  const checkAdminReply = (chatHistory) => {
    if (!chatHistory || chatHistory.length === 0) {
      return false;
    }
    const lastMessage = chatHistory[chatHistory.length - 1];
    return lastMessage.sender === 'admin';
  };

  return (
    <div className="mt-6 rounded-3xl border border-white/10 bg-white/[0.02] p-6 shadow-2xl">
      <h3 className="mb-6 font-spaceGrotesk text-[10px] font-black uppercase tracking-[0.3em] text-brand-gold">
        Previous Reports
      </h3>
      {fetchingReports ? (
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">
          Loading reports...
        </p>
      ) : reports.length === 0 ? (
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">
          No reports submitted yet.
        </p>
      ) : (
        reports.map((report, index) => (
          <div
            key={report._id || `report-${index}`}
            className="mb-4 rounded-2xl border border-white/10 bg-black/20 p-5 transition-all duration-300 hover:border-brand-gold/30 hover:bg-white/[0.03]"
          >
            <div className="flex justify-between items-center mb-2">
              <p className="font-spaceGrotesk text-sm font-black uppercase tracking-wide text-white">
                {report.category}
              </p>
              <button
                onClick={() => handleOpenChat(report._id)}
                className="rounded-xl border border-brand-gold/30 bg-brand-gold/10 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-brand-gold transition-colors hover:bg-brand-gold/20 hover:text-white focus:outline-none"
              >
                Open Chat
              </button>
            </div>
            {checkAdminReply(report.chatHistory) ? (
              <p className="text-[10px] font-black uppercase tracking-widest text-brand-gold-light">
                You have a new response.
              </p>
            ) : (
              report.autoReply && (
                <p className="text-sm text-gray-400">{report.autoReply}</p>
              )
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default ReportList;
