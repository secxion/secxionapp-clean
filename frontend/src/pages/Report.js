import React, { useState, useCallback } from 'react';
import ReportForm from '../Components/ReportForm';
import ReportList from '../Components/ReportList';

const Report = () => {
  const [newReport, setNewReport] = useState(null);

  const handleReportSubmit = useCallback((report) => {
    setNewReport(report);
  }, []);

  return (
    <main className="mt-28 min-h-screen overflow-x-hidden bg-brand-dark-base px-4 py-10 text-gray-100 md:mt-32 sm:px-6">
      <div className="mx-auto max-w-4xl space-y-8">
        <section className="rounded-lg border border-white/10 bg-brand-dark-elevated p-6 sm:p-8">
          <h1 className="mb-4 font-spaceGrotesk text-2xl font-black uppercase tracking-tight text-brand-gold">
            Support & Feedback
          </h1>
          <p className="mb-10 max-w-2xl text-[10px] font-bold uppercase leading-relaxed tracking-[0.2em] text-gray-400">
            Submit a ticket regarding bugs, transaction issues, or feedback. Our
            support team will review your request shortly.
          </p>
          <ReportForm onReportSubmit={handleReportSubmit} />
        </section>
        <section className="rounded-lg border border-white/10 bg-brand-dark-elevated p-6 sm:p-8">
          <h2 className="mb-8 flex items-center font-spaceGrotesk text-lg font-black uppercase tracking-widest text-white">
            <span className="mr-3 h-2 w-2 rounded-full bg-brand-gold"></span>
            Support History
          </h2>
          <ReportList newReport={newReport} />
        </section>
      </div>
    </main>
  );
};

export default Report;
