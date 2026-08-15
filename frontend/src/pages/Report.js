import React, { useState, useCallback } from 'react';
import ReportForm from '../Components/ReportForm';
import ReportList from '../Components/ReportList';
import BackButton from '../Components/BackButton';

const Report = () => {
  const [newReport, setNewReport] = useState(null);

  const handleReportSubmit = useCallback((report) => {
    setNewReport(report);
  }, []);

  return (
    <main className="mt-20 min-h-screen w-full overflow-x-hidden px-4 py-10 text-gray-100 sm:px-6 md:mt-28 lg:px-8">
      <div className="w-full space-y-12">
        <section className="w-full py-2">
          <div className="mb-4 flex items-center gap-4">
            <BackButton fallbackTo="/home" ariaLabel="Go to previous page" />
            <h1 className="font-spaceGrotesk text-2xl font-black uppercase tracking-tight text-brand-gold">
              Support & Feedback
            </h1>
          </div>
          <p className="mb-10 max-w-2xl text-[10px] font-bold uppercase leading-relaxed tracking-[0.2em] text-gray-400">
            Submit a ticket regarding bugs, transaction issues, or feedback. Our
            support team will review your request shortly.
          </p>
          <ReportForm onReportSubmit={handleReportSubmit} />
        </section>
        <section className="w-full py-2">
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
