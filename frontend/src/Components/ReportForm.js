import React, { useState } from "react";
import { useSelector } from "react-redux";
import { FaPaperclip } from "react-icons/fa";
import { MdSend, MdDelete } from "react-icons/md";
import uploadImage from "../helpers/uploadImage";
import { toast } from "react-toastify";
import SummaryApi from "../common";
import { useNavigate } from 'react-router-dom';

const ReportForm = ({ onReportSubmit }) => {
    const { user } = useSelector((state) => state.user);
    const [reportText, setReportText] = useState("");
    const [selectedCategory, setSelectedCategory] = useState({
        category: "",
        autoReply: "wait for reply..."
    });
    const [uploadedImage, setUploadedImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const categories = ["Fraud", "Transaction Issue", "Bug Report", "Other"];

    const handleUploadImage = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setLoading(true);
        try {
            const uploadResponse = await uploadImage(file);
            setUploadedImage(uploadResponse.url);
            toast.success("Image uploaded!");
        } catch (error) {
            toast.error("Upload failed.");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitReport = async () => {
        if (!user) {
            toast.error("Please log in.");
            return;
        }

        if (!reportText && !uploadedImage) {
            toast.error("Message or image required.");
            return;
        }

        setLoading(true);

        try {
            const initialChatHistory = [{
                message: reportText,
                sender: "user",
                createdAt: new Date().toISOString(),
                image: uploadedImage,
            }];

            const newReport = {
                userId: user?.id || user?._id,
                email: user?.email || "",
                name: user?.name || "Anonymous",
                category: selectedCategory.category,
                message: reportText,
                image: uploadedImage || "",
                status: "Pending",
                adminReply: "",
                createdAt: new Date().toISOString(),
                chatHistory: initialChatHistory,
                autoReply: selectedCategory.autoReply,
            };

            const response = await fetch(SummaryApi.submitReport.url, {
                method: SummaryApi.submitReport.method,
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newReport),
            });

            const responseData = await response.json();

            if (response.ok && responseData.success) {
                toast.success("Report submitted!");
                setReportText("");
                setUploadedImage(null);
                const updatedReport = { ...newReport, _id: responseData.data?._id || Date.now() };
                onReportSubmit(updatedReport);
                navigate(`/chat/${responseData.data?._id}`);
            } else {
                toast.error(responseData.message || "Submission failed.");
            }
        } catch (error) {
            toast.error("Error submitting.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container bg-white p-6 rounded-lg shadow-md border border-secxion-gold">
            <h2 className="text-2xl font-semibold mb-4 text-secxion-black">Submit Report</h2>
            <div className="mb-4">
                <label className="block text-secxion-black text-sm font-bold mb-2">Category:</label>
                <select
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-secxion-black leading-tight focus:outline-none focus:ring-2 focus:ring-secxion-gold"
                    value={selectedCategory.category}
                    onChange={(e) => setSelectedCategory({ category: e.target.value, autoReply: selectedCategory.autoReply })}
                >
                    <option value="">Select</option>
                    {categories.map((cat) => (
                        <option key={cat} value={cat}>
                            {cat}
                        </option>
                    ))}
                </select>
            </div>

            <div className="mb-4">
                <label className="block text-secxion-black text-sm font-bold mb-2">Message:</label>
                <textarea
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-secxion-black leading-tight focus:outline-none focus:ring-2 focus:ring-secxion-gold"
                    placeholder="Describe your issue..."
                    value={reportText}
                    onChange={(e) => setReportText(e.target.value)}
                    rows={4}
                />
            </div>

            <div className="mb-6">
                <label className="block text-secxion-black text-sm font-bold mb-2">Attachment:</label>
                <div className="flex items-center mt-1">
                    <label className="cursor-pointer flex items-center gap-2 border border-gray-400 rounded-md shadow-sm px-4 py-2 bg-secxion-cream hover:bg-secxion-gold-light text-secxion-black">
                        <FaPaperclip className="text-secxion-black" />
                        <span className="text-sm">Upload</span>
                        <input type="file" className="hidden" onChange={handleUploadImage} />
                    </label>
                    {uploadedImage && (
                        <div className="relative ml-3">
                            <img
                                src={uploadedImage}
                                alt="Uploaded"
                                className="w-16 h-16 object-cover rounded-md border border-gray-400"
                            />
                            <button
                                className="absolute top-0 right-0 p-1 bg-red-700 text-white rounded-full hover:bg-red-900"
                                onClick={() => setUploadedImage(null)}
                            >
                                <MdDelete className="text-sm" />
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <button
                className="w-full bg-secxion-gold text-white font-bold py-3 px-4 rounded focus:outline-none focus:shadow-outline hover:bg-secxion-gold-dark disabled:bg-gray-500"
                onClick={handleSubmitReport}
                disabled={loading}
            >
                <MdSend className="inline-block mr-2" />
                {loading ? "Submitting..." : "Submit"}
            </button>
        </div>
    );
};

export default ReportForm;