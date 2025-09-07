import React, { useState, useCallback } from "react";
import ReportForm from "../Components/ReportForm";
import ReportList from "../Components/ReportList";

const Report = () => {
  const [newReport, setNewReport] = useState(null);

  const handleReportSubmit = useCallback((report) => {
    setNewReport(report);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br mt-16 from-gray-950 via-gray-900 to-gray-800 text-gray-100 py-10 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-950 p-6 rounded-2xl shadow-lg border border-gray-700">
          <h1 className="text-2xl font-bold text-yellow-400 mb-4">
            Submit a Report
          </h1>
          <p className="text-gray-400 text-sm mb-6">
            If you encounter any issues, bugs, or fraudulent activities, please
            submit a report below. Our team will review it and get back to you as
            soon as possible.
          </p>
          <ReportForm onReportSubmit={handleReportSubmit} />
        </div>
        <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-950 p-6 rounded-2xl shadow-lg border border-gray-700">
          <h2 className="text-xl font-bold text-yellow-400 mb-4">
            Your Reports
          </h2>
          <ReportList newReport={newReport} />
        </div>
      </div>
    </div>
  );
};

export default Report;