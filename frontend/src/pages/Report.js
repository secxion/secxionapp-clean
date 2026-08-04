import React, { useState, useCallback } from 'react';
import ReportForm from '../Components/ReportForm';
import ReportList from '../Components/ReportList';

const Report = () => {
  const [newReport, setNewReport] = useState(null);

  const handleReportSubmit = useCallback((report) => {
    setNewReport(report);
  }, []);

  return (
    <div className="min-h-screen premium-bg text-gray-100 py-10 px-4">
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="glass-card p-8 rounded-3xl border-white/10 shadow-2xl">
          <h1 className="text-2xl font-black neon-gold-text font-spaceGrotesk uppercase tracking-tighter mb-4">
            Support & Feedback
          </h1>
          <p className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.2em] mb-10 leading-relaxed max-w-2xl">
            Submit a ticket regarding bugs, transaction issues, or feedback. Our
            support team will review your request shortly.
          </p>
          <ReportForm onReportSubmit={handleReportSubmit} />
        </div>
        <div className="glass-card p-8 rounded-3xl border-white/10 shadow-2xl">
          <h2 className="text-lg font-black text-white font-spaceGrotesk uppercase tracking-widest mb-8 flex items-center">
            <span className="w-2 h-2 bg-brand-gold rounded-full mr-3 shadow-brand-gold"></span>
            Support History
          </h2>
          <ReportList newReport={newReport} />
        </div>
      </div>
    </div>
  );
};

export default Report;
