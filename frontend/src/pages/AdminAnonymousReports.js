import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { MdExpandMore } from "react-icons/md";
import SummaryApi from "../common";

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
      console.log("Fetching contact us messages from:", SummaryApi.getContactUsMessages.url);

      const response = await fetch(SummaryApi.getContactUsMessages.url, {
        method: SummaryApi.getContactUsMessages.method || 'GET',
        credentials: "include",
      });

      console.log("Contact us messages response:", response);

      if (!response.ok) {
        const errorMessage = `Failed to fetch contact us messages. Status: ${response.status}`;
        console.error(errorMessage);
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log("Contact us messages data:", data);

      if (data.success && Array.isArray(data.data)) {
        console.log("Successfully fetched contact us messages:", data.data);
        setAnonymousReports(data.data);
      } else {
        console.log("No contact us messages found in the data or data format is incorrect.");
        setAnonymousReports([]);
      }
    } catch (error) {
      console.error("Error fetching contact us messages:", error);
      toast.error("Could not fetch contact us messages.");
    } finally {
      setLoading(false);
      console.log("Fetching contact us messages completed. Loading:", loading);
    }
  };

  return (
    <div className="container p-4 mt-12 max-w-4xl mx-auto bg-white rounded-xl shadow-lg h-[650px] flex flex-col overflow-hidden">
      <h2 className="text-xl font-bold mb-4">Anonymous Contact Messages</h2>

      {loading ? (
        <p className="text-gray-500">Loading messages...</p>
      ) : anonymousReports.length === 0 ? (
        <p className="text-gray-500">No contact messages available.</p>
      ) : (
        <div className="flex-grow overflow-y-auto border rounded-lg p-2 h-[550px]">
          {anonymousReports.map((report) => (
            <div
              key={report._id}
              className={`p-4 border rounded-lg mb-3 bg-gray-50`}
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-gray-700 font-medium">Contact Us</p>
                  <p className="text-xs text-gray-500">
                    By: Anonymous | {report.email || "N/A"}
                  </p>
                </div>
                <button
                  onClick={() =>
                    setExpandedReport(expandedReport === report._id ? null : report._id)
                  }
                >
                  <MdExpandMore className="text-gray-600 text-2xl" />
                </button>
              </div>

              {expandedReport === report._id && (
                <div className="mt-3">
                  <p className="text-gray-600">{report.reason}</p>
                </div>
              )}

              <div className="flex justify-end mt-2">
                <span className={`text-xs px-2 py-1 rounded-full bg-blue-500 text-white`}>
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