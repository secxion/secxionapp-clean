import React, { useEffect, useState } from "react";
import  SummaryApi  from "../common";
import toast from "react-hot-toast";

const AdminEthWithdrawals = () => {
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [statusFilter, setStatusFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const requestsPerPage = 10;

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await fetch(SummaryApi.ethWithdrawals.getAll, {
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        setRequests(data.data);
      } else {
        toast.error("Failed to fetch requests");
      }
    } catch (err) {
      toast.error("Server error");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      const res = await fetch(SummaryApi.ethWithdrawals.updateStatus(id), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Status updated");
        fetchRequests();
      } else {
        toast.error("Failed to update status");
      }
    } catch (err) {
      toast.error("Error updating status");
    }
  };

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setStatusFilter("All");
    setSearchTerm("");
    setStartDate("");
    setEndDate("");
    setCurrentPage(1);
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  useEffect(() => {
    let filtered = [...requests];

    if (statusFilter !== "All") {
      filtered = filtered.filter((req) => req.status === statusFilter);
    }

    if (searchTerm.trim() !== "") {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (req) =>
          req.userId?.email?.toLowerCase().includes(term) ||
          req.userId?.name?.toLowerCase().includes(term)
      );
    }

    if (startDate && endDate) {
      const start = new Date(startDate).getTime();
      const end = new Date(endDate).getTime();
      filtered = filtered.filter((req) => {
        const created = new Date(req.createdAt).getTime();
        return created >= start && created <= end;
      });
    }

    setFilteredRequests(filtered);
  }, [requests, statusFilter, searchTerm, startDate, endDate]);

  const indexOfLast = currentPage * requestsPerPage;
  const indexOfFirst = indexOfLast - requestsPerPage;
  const currentRequests = filteredRequests.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredRequests.length / requestsPerPage);

  const handlePageChange = (pageNum) => setCurrentPage(pageNum);

  if (loading) return <p className="text-center mt-10">Loading...</p>;

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">ETH Withdrawal Requests</h2>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium mb-1">Filter by Status:</label>
          <select
            value={statusFilter}
            onChange={handleStatusFilterChange}
            className="w-full border px-2 py-1 rounded"
          >
            <option value="All">All</option>
            <option value="Pending">Pending</option>
            <option value="Processed">Processed</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Search (email or name):</label>
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Start Date:</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full border px-2 py-1 rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">End Date:</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full border px-2 py-1 rounded"
          />
        </div>

        <div className="flex items-end">
          <button
            onClick={handleClearFilters}
            className="bg-gray-200 hover:bg-gray-300 text-sm px-4 py-2 rounded w-full"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Table */}
      {currentRequests.length === 0 ? (
        <p>No matching results.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border shadow text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-2 px-3 border">Name</th>
                <th className="py-2 px-3 border">Email</th>
                <th className="py-2 px-3 border">Naira</th>
                <th className="py-2 px-3 border">ETH (Full)</th>
                <th className="py-2 px-3 border">ETH (Net)</th>
                <th className="py-2 px-3 border">Recipient</th>
                <th className="py-2 px-3 border">Date</th>
                <th className="py-2 px-3 border">Status</th>
                <th className="py-2 px-3 border">Action</th>
              </tr>
            </thead>
            <tbody>
              {currentRequests.map((req) => (
                <tr key={req._id}>
                  <td className="py-2 px-3 border">{req.userId?.name}</td>
                  <td className="py-2 px-3 border">{req.userId?.email}</td>
                  <td className="py-2 px-3 border">{req.nairaRequestedAmount}</td>
                  <td className="py-2 px-3 border">{Number(req.ethCalculatedAmount).toFixed(6)}</td>
                  <td className="py-2 px-3 border">{Number(req.ethNetAmountToSend).toFixed(6)}</td>
                  <td className="py-2 px-3 border">{req.ethRecipientAddress}</td>
                  <td className="py-2 px-3 border">
                    {new Date(req.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-2 px-3 border">{req.status}</td>
                  <td className="py-2 px-3 border">
                    <select
                      className="border px-2 py-1 rounded"
                      value={req.status}
                      onChange={(e) => updateStatus(req._id, e.target.value)}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Processed">Processed</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="mt-4 flex justify-center gap-2">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => handlePageChange(i + 1)}
                className={`px-3 py-1 rounded border ${
                  currentPage === i + 1 ? "bg-blue-600 text-white" : "bg-white"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminEthWithdrawals;
