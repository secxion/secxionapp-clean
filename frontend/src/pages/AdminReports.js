import React, { useState, useEffect, useRef, useCallback } from 'react';
import { toast } from 'react-toastify';
import SummaryApi from '../common';
import { FaCloudUploadAlt } from 'react-icons/fa';
import uploadImage from '../helpers/uploadImage';
import { format } from 'date-fns';
import { MdSend } from 'react-icons/md';

const AdminReports = () => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [expandedReportId, setExpandedReportId] = useState(null);
    const [chatMessages, setChatMessages] = useState({});
    const [newMessage, setNewMessage] = useState('');
    const [uploadingImage, setUploadingImage] = useState(false);
    const [sendingMessage, setSendingMessage] = useState(false);
    const [imageToSend, setImageToSend] = useState(null);
    const pollingInterval = useRef(null);

    const fetchReports = useCallback(async () => {
        try {
            const response = await fetch(SummaryApi.getAllReports.url, {
                method: SummaryApi.getAllReports.method,
                credentials: 'include',
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to fetch reports.');
            }
            const data = await response.json();
            setReports(data.data);
        } catch (err) {
            setError(err.message);
            toast.error(err.message);
        } finally {
            if (loading) setLoading(false);
        }
    }, []);

    const fetchChat = useCallback(async (reportId) => {
        try {
            const response = await fetch(SummaryApi.getReportChat.url.replace(':id', reportId), {
                method: SummaryApi.getReportChat.method,
                credentials: 'include',
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to fetch chat.');
            }
            const data = await response.json();
            setChatMessages(prev => ({ ...prev, [reportId]: data.data }));
        } catch (err) {
            toast.error(err.message);
        }
    }, []);

    useEffect(() => {
        fetchReports();
        pollingInterval.current = setInterval(() => {
            fetchReports();
            if (expandedReportId) {
                fetchChat(expandedReportId);
            }
        }, 5000);
        return () => clearInterval(pollingInterval.current);
    }, [fetchReports, fetchChat, expandedReportId]);

    const toggleExpand = async (reportId) => {
        setExpandedReportId(expandedReportId === reportId ? null : reportId);
        if (reportId !== expandedReportId && !chatMessages[reportId]) {
            await fetchChat(reportId);
        }
    };

    const handleSendMessage = async (reportId) => {
        if (!newMessage.trim() && !imageToSend) {
            toast.error('Message cannot be empty (text or image required).');
            return;
        }

        setSendingMessage(true);
        try {
            const requestBody = {};
            if (newMessage.trim()) {
                requestBody.message = newMessage;
            }
            if (imageToSend) {
                requestBody.image = imageToSend;
            }

            const response = await fetch(SummaryApi.sendChatMessage.url.replace(':id', reportId), {
                method: SummaryApi.sendChatMessage.method,
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to send message.');
            }
            setNewMessage('');
            setImageToSend(null);
            await fetchChat(reportId);
        } catch (err) {
            toast.error(err.message);
        } finally {
            setSendingMessage(false);
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setUploadingImage(true);
        try {
            const uploadResponse = await uploadImage(file);
            setImageToSend(uploadResponse.url);
            toast.success('Image uploaded!');
        } catch (error) {
            toast.error('Failed to upload image.');
        } finally {
            setUploadingImage(false);
        }
    };

    const handleRemoveImage = () => {
        setImageToSend(null);
    };

    if (loading) {
        return <div className="flex justify-center items-center h-60"><div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div></div>;
    }

    if (error) {
        return <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">{error}</div>;
    }

    return (
        <div className="container mx-auto py-6">
            <h2 className="text-2xl font-semibold mb-4">Admin Reports</h2>
            {reports.map(report => (
                <div key={report._id} className="bg-white shadow rounded-md p-4 mb-4">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="text-lg font-semibold">{report.category}</h3>
                        <span className={`text-xs px-2 py-1 rounded-full ${report.status === 'Pending' ? 'bg-yellow-500 text-white' : report.status === 'Resolved' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                            {report.status}
                        </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-2">Submitted by: {report.name} ({report.email}) on {format(new Date(report.createdAt), 'yyyy-MM-dd HH:mm:ss')}</p>
                    <p className="text-gray-700 mb-2">{report.message}</p>
                    {report.image && <img src={report.image} alt="Report Attachment" className="max-w-full h-auto rounded-md mb-2" />}

                    <button onClick={() => toggleExpand(report._id)} className="text-blue-500 text-sm">
                        {expandedReportId === report._id ? 'Collapse' : 'View Chat'}
                    </button>

                    {expandedReportId === report._id && (
                        <div className="mt-4 border-t pt-4">
                            <h4 className="text-md font-semibold mb-2">Chat with User:</h4>
                            <div className="overflow-y-auto h-64 p-2 bg-gray-100 rounded-md mb-2">
                                {chatMessages[report._id] && chatMessages[report._id].length > 0 ? (
                                    chatMessages[report._id].map((msg, index) => (
                                        <div key={index} className={`mb-2 p-2 rounded-md ${msg.sender === 'admin' ? 'bg-blue-100 text-blue-700 self-end text-right' : 'bg-gray-200 text-gray-700 self-start text-left'}`}>
                                            <p className="text-xs font-semibold">{msg.sender === 'admin' ? 'Admin' : report.name}:</p>
                                            <p className="text-sm break-words">{msg.message}</p>
                                            {msg.image && <img src={msg.image} alt="Chat Attachment" className="max-w-xs h-auto rounded-md mt-1" />}
                                            <p className="text-xs text-gray-500">{format(new Date(msg.createdAt), 'yyyy-MM-dd HH:mm:ss')}</p>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-gray-500">No messages yet.</p>
                                )}
                            </div>

                            <div className="flex items-center gap-2">
                                <textarea
                                    className="w-full p-2 border rounded-md"
                                    placeholder="Type your message..."
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                />
                                <label className="cursor-pointer">
                                    <FaCloudUploadAlt className="text-blue-500 text-xl" />
                                    <input type="file" className="hidden" onChange={handleImageUpload} />
                                </label>
                                <button
                                    onClick={() => handleSendMessage(report._id)}
                                    className="bg-blue-600 text-white py-2 px-3 rounded-md hover:bg-blue-700 disabled:bg-blue-300"
                                    disabled={sendingMessage || uploadingImage || (!newMessage.trim() && !imageToSend)}
                                >
                                    <MdSend className="inline-block mr-1" /> Send
                                </button>
                            </div>
                            {imageToSend && (
                                <div className="relative mt-2 inline-block">
                                    <img src={imageToSend} alt="To Send" className="w-20 h-20 object-cover rounded-md" />
                                    <button onClick={handleRemoveImage} className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs -mt-1 -mr-1">×</button>
                                </div>
                            )}
                            {uploadingImage && <p className="text-gray-500 text-sm mt-1">Uploading image...</p>}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

export default AdminReports;