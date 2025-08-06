import React, { useEffect, useState, useCallback, useRef } from "react";
import { toast } from "react-toastify";
import SummaryApi from "../common";
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
                credentials: "include",
            });

            if (!response.ok) throw new Error("Network response was not ok");

            const data = await response.json();

            if (!data.success || !Array.isArray(data.data)) {
                console.warn("User Fetch Reports: Invalid data format", data);
                setReports([]);
                throw new Error("Invalid report data received");
            }
            if (JSON.stringify(data.data) !== JSON.stringify(reports)) {
                setReports(data.data);
            }
        } catch (error) {
            toast.error("Could not fetch reports.");
            console.error("User Fetch error:", error);
        } finally {
            if (fetchingReports) setFetchingReports(false);
        }
    }, []);

    useEffect(() => {
        fetchReports();
        pollingInterval.current = setInterval(fetchReports, 5000);
        return () => clearInterval(pollingInterval.current);
    }, [fetchReports, newReport]);

    const handleOpenChat = useCallback((reportId) => {
        navigate(`/chat/${reportId}`);
    }, [navigate]);

    const checkAdminReply = (chatHistory) => {
        if (!chatHistory || chatHistory.length === 0) {
            return false;
        }
        const lastMessage = chatHistory[chatHistory.length - 1];
        return lastMessage.sender === "admin";
    };

    return (
        <div className="mt-6 bg-white p-6 rounded-lg shadow-md border border-secxion-gold">
            <h3 className="text-lg font-semibold mb-4 text-secxion-black">Previous Reports</h3>
            {fetchingReports ? (
                <p className="text-gray-700">Loading reports...</p>
            ) : reports.length === 0 ? (
                <p className="text-gray-700">No reports submitted yet.</p>
            ) : (
                reports.map((report) => (
                    <div key={report._id} className="mb-4 p-4 border border-secxion-gold rounded-lg hover:bg-secxion-cream transition-colors duration-200">
                        <div className="flex justify-between items-center mb-2">
                            <p className="font-semibold text-secxion-black">{report.category}</p>
                            <button onClick={() => handleOpenChat(report._id)} className="bg-secxion-gold text-white py-2 px-4 rounded hover:bg-secxion-gold-dark focus:outline-none focus:ring-2 focus:ring-secxion-gold-light">Open Chat</button>
                        </div>
                        {checkAdminReply(report.chatHistory) ? (
                            <p className="text-secxion-black">You have a message...</p>
                        ) : (
                            report.autoReply && <p className="text-gray-700">{report.autoReply}</p>
                        )}
                    </div>
                ))
            )}
        </div>
    );
};

export default ReportList;