import React, { useState, useCallback } from "react";
import ReportForm from "../Components/ReportForm";
import ReportList from "../Components/ReportList";

const Report = () => {
    const [newReport, setNewReport] = useState(null);

    const handleReportSubmit = useCallback((report) => {
        setNewReport(report);
    }, []);

    return (
        <div className="mt-28 mb-8">
            <ReportForm onReportSubmit={handleReportSubmit} />
            <ReportList newReport={newReport} />
        </div>
    );
};

export default Report;