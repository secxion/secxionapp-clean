import { useState, useRef, useEffect, useCallback } from "react";
import SummaryApi from "../common";
import { MdSend, MdClose, MdAdd } from "react-icons/md";
import uploadImage from "../helpers/uploadImage";
import { format } from "date-fns";
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const ReportCard = () => {
    const { reportId } = useParams();
    const navigate = useNavigate();
    const [report, setReport] = useState(null);
    const [isLoadingInitial, setIsLoadingInitial] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const [userReplyText, setUserReplyText] = useState("");
    const [userReplyImage, setUserReplyImage] = useState(null);
    const [uploadingReplyImage, setUploadingReplyImage] = useState(false);
    const chatHistoryRef = useRef(null);
    const pollingIntervalRef = useRef(null);
    const { user } = useSelector((state) => state.user);
    const [hasReceivedReply, setHasReceivedReply] = useState(false);
    const [isAutoScrolling, setIsAutoScrolling] = useState(true);

    const fetchReport = useCallback(async () => {
        try {
            const response = await fetch(SummaryApi.getReports.url, {
                method: SummaryApi.getReports.method,
                credentials: "include",
            });
            if (!response.ok) throw new Error("Network response was not ok");
            const data = await response.json();
            const foundReport = data.data.find((r) => r._id === reportId);
            if (foundReport) {
                setReport(foundReport);
                const adminReply = foundReport.chatHistory?.some(msg => msg.sender === "admin");
                setHasReceivedReply(adminReply);
            } else {
                navigate("/report");
            }
        } catch (error) {
            console.error("Error fetching report:", error);
            navigate("/report");
        } finally {
            setIsLoadingInitial(false);
        }
    }, [reportId, navigate]);

    useEffect(() => {
        fetchReport();
        pollingIntervalRef.current = setInterval(fetchReport, 5000);
        return () => clearInterval(pollingIntervalRef.current);
    }, [fetchReport]);

    useEffect(() => {
        if (report && chatHistoryRef.current && isAutoScrolling) {
            chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
        }
    }, [report?.chatHistory, isAutoScrolling]);

    const handleUserReplySubmit = async () => {
        if (!userReplyText && !userReplyImage) return;
        setIsSending(true);
        try {
            const response = await fetch(
                SummaryApi.userReplyReport.url.replace(":id", reportId),
                {
                    method: SummaryApi.userReplyReport.method,
                    credentials: "include",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        userReply: userReplyText,
                        userReplyImage,
                    }),
                }
            );
            const data = await response.json();
            if (data.success) {
                setUserReplyText("");
                setUserReplyImage(null);
                await fetchReport();
            } else {
                console.error("Reply failed");
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsSending(false);
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setUploadingReplyImage(true);
        try {
            const uploaded = await uploadImage(file);
            setUserReplyImage(uploaded.url);
        } catch (err) {
            console.error(err);
        } finally {
            setUploadingReplyImage(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleUserReplySubmit();
        }
    };

    const handleScroll = () => {
        const element = chatHistoryRef.current;
        if (!element) return;

        // If the user scrolls to the top, disable auto-scrolling
        if (element.scrollTop + element.clientHeight < element.scrollHeight - 50) {
            setIsAutoScrolling(false);
        } else {
            setIsAutoScrolling(true);
        }
    };

    if (isLoadingInitial) {
        return <div className="flex justify-center items-center h-screen text-secxion-black">Initiating chat...</div>;
    }

    if (!report) return null;

    return (
        <div className="fixed w-full h-screen flex flex-col bg-secxion-cream z-50">
            {/* Header */}
            <div className="w-full px-6 mt-8 py-2 border-b border-secxion-gold flex items-center justify-between bg-white shadow-md z-50">
                <div className="flex flex-col mt-2">
                    <h2 className="text-xl font-semibold text-secxion-black">{report.category}</h2>
                    <span className="text-sm text-gray-600">Report ID: {report._id.slice(-6)}</span>
                </div>
                <button
                    onClick={() => navigate("/report")}
                    className="p-2 mt-2 rounded-full hover:bg-gray-200"
                >
                    <MdClose className="text-2xl text-secxion-black" />
                </button>
            </div>

            {/* Chat history */}
            <div
                ref={chatHistoryRef}
                className="flex-1 overflow-y-auto px-6 py-4 space-y-4"
                onScroll={handleScroll}
            >
                {/* Auto-reply */}
                {!hasReceivedReply && report.autoReply && (
                    <div className="bg-secxion-cream border border-secxion-gold text-secxion-black px-4 py-3 rounded-lg shadow-md">
                        <p className="text-sm">{report.autoReply}</p>
                        <p className="text-xs text-right mt-2 text-gray-600">
                            {format(new Date(), "yyyy-MM-dd")}
                        </p>
                    </div>
                )}

                {/* Messages */}
                {report.chatHistory?.map((msg, i) => (
                    <div
                        key={i}
                        className={`flex items-start max-w-2xl rounded-xl px-4 py-3 shadow-md text-sm ${msg.sender === "admin"
                            ? "ml-auto bg-secxion-gold-light text-secxion-black flex-row-reverse"
                            : "mr-auto bg-white text-secxion-black"
                            }`}
                    >
                        {/* Avatar */}
                        {msg.sender !== "admin" && (
                            <img
                                src={user?.profilePic || 'https://via.placeholder.com/50'} // Default avatar
                                alt="User Avatar"
                                className="w-8 h-8 rounded-full mr-3"
                            />
                        )}
                        {msg.sender === "admin" && (
                            <img
                                src={'https://via.placeholder.com/50'} // Default avatar
                                alt="Admin Avatar"
                                className="w-8 h-8 rounded-full ml-3"
                            />
                        )}
                        <div>
                            <p className="whitespace-pre-line break-words">{msg.message}</p>
                            {msg.image && (
                                <img
                                    src={msg.image}
                                    alt="attachment"
                                    className="mt-2 rounded-lg max-w-full"
                                />
                            )}
                            <p className="text-xs text-gray-600 text-right mt-1">
                                {format(new Date(msg.createdAt), "HH:mm")}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Input */}
            <div className="border-t border-secxion-gold bg-white px-6 py-6 space-y-2 z-50">
                <div className="relative">
                    <textarea
                        className="w-full p-3 text-secxion-black border rounded-lg pr-16 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-secxion-gold"
                        placeholder="Type your message..."
                        rows={3}
                        value={userReplyText}
                        onChange={(e) => setUserReplyText(e.target.value)}
                        onKeyDown={handleKeyDown}
                    />
                    <label className="absolute right-12 top-3 cursor-pointer text-gray-600 hover:text-secxion-gold">
                        <MdAdd className="text-xl" />
                        <input
                            type="file"
                            className="hidden"
                            onChange={handleImageUpload}
                        />
                    </label>
                    <button
                        className="absolute right-3 top-3 text-secxion-gold hover:text-secxion-gold-dark disabled:opacity-50"
                        onClick={handleUserReplySubmit}
                        disabled={isSending || uploadingReplyImage || (!userReplyText && !userReplyImage)}
                    >
                        <MdSend className="text-xl" />
                    </button>
                </div>
                {userReplyImage && (
                    <div className="flex items-center gap-2 mt-1">
                        <img
                            src={userReplyImage}
                            alt="preview"
                            className="w-20 h-20 object-cover rounded-lg border border-gray-400"
                        />
                        <button
                            onClick={() => setUserReplyImage(null)}
                            className="text-red-600 hover:text-red-800"
                        >
                            <MdClose />
                        </button>
                    </div>
                )}
                {uploadingReplyImage && (
                    <p className="text-xs text-gray-600">Uploading image...</p>
                )}
            </div>
        </div>
    );
};

export default ReportCard;