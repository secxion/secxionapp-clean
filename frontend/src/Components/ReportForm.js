import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { FaPaperclip } from 'react-icons/fa';
import { MdSend, MdDelete } from 'react-icons/md';
import uploadImage from '../helpers/uploadImage';
import { toast } from 'react-toastify';
import SummaryApi from '../common';
import { useNavigate } from 'react-router-dom';

const ReportForm = ({ onReportSubmit }) => {
  const { user } = useSelector((state) => state.user);
  const [reportText, setReportText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState({
    category: '',
    autoReply: 'wait for reply...',
  });
  const [uploadedImage, setUploadedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const categories = ['Fraud', 'Transaction Issue', 'Bug Report', 'Other'];

  const handleUploadImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoading(true);
    try {
      const uploadResponse = await uploadImage(file);
      setUploadedImage(uploadResponse.url);
      toast.success('Image uploaded!');
    } catch (error) {
      toast.error('Upload failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReport = async () => {
    if (!user) {
      toast.error('Please log in.');
      return;
    }

    if (!reportText && !uploadedImage) {
      toast.error('Message or image required.');
      return;
    }

    setLoading(true);

    try {
      const initialChatHistory = [
        {
          message: reportText,
          sender: 'user',
          createdAt: new Date().toISOString(),
          image: uploadedImage,
        },
      ];

      const newReport = {
        userId: user?.id || user?._id,
        email: user?.email || '',
        name: user?.name || 'Anonymous',
        category: selectedCategory.category,
        message: reportText,
        image: uploadedImage || '',
        status: 'Pending',
        adminReply: '',
        createdAt: new Date().toISOString(),
        chatHistory: initialChatHistory,
        autoReply: selectedCategory.autoReply,
      };

      const response = await fetch(SummaryApi.submitReport.url, {
        method: SummaryApi.submitReport.method,
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newReport),
      });

      const responseData = await response.json();

      if (response.ok && responseData.success) {
        toast.success('Report submitted!');
        setReportText('');
        setUploadedImage(null);
        const updatedReport = {
          ...newReport,
          _id: responseData.data?._id || Date.now(),
        };
        onReportSubmit(updatedReport);
        navigate(`/chat/${responseData.data?._id}`);
      } else {
        toast.error(responseData.message || 'Submission failed.');
      }
    } catch (error) {
      toast.error('Error submitting.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full pt-2">
      <h2 className="text-[10px] font-black mb-8 text-brand-gold uppercase tracking-[0.4em] font-spaceGrotesk">
        New Support Ticket
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div className="group">
          <label className="block text-[10px] font-black font-spaceGrotesk text-gray-500 uppercase tracking-widest mb-3 group-focus-within:text-brand-gold transition-colors">
            Category
          </label>
          <div className="relative">
            <select
              className="w-full appearance-none rounded-lg border border-white/10 bg-brand-dark-base px-5 py-4 text-sm font-medium text-white outline-none transition-colors focus:border-brand-gold/60"
              value={selectedCategory.category}
              onChange={(e) =>
                setSelectedCategory({
                  category: e.target.value,
                  autoReply: selectedCategory.autoReply,
                })
              }
            >
              <option value="" className="bg-brand-dark-base">
                Select Category
              </option>
              {categories.map((cat) => (
                <option key={cat} value={cat} className="bg-brand-dark-base">
                  {cat.toUpperCase()}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="group">
          <label className="block text-[10px] font-black font-spaceGrotesk text-gray-500 uppercase tracking-widest mb-3 group-focus-within:text-brand-gold transition-colors">
            Message
          </label>
          <textarea
            className="w-full resize-none rounded-lg border border-white/10 bg-brand-dark-base px-5 py-4 text-sm font-medium text-white outline-none transition-colors placeholder:text-gray-600 focus:border-brand-gold/60"
            placeholder="Describe your issue..."
            value={reportText}
            onChange={(e) => setReportText(e.target.value)}
            rows={4}
          />
        </div>
      </div>

      <div className="mb-10">
        <label className="block text-[10px] font-black font-spaceGrotesk text-gray-500 uppercase tracking-widest mb-4">
          Attachment
        </label>
        <div className="flex items-center gap-6">
          <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-white/10 bg-brand-dark-base px-6 py-3.5 font-spaceGrotesk text-[10px] font-black uppercase tracking-widest text-gray-300 transition-colors hover:border-brand-gold/40 hover:text-white">
            <FaPaperclip className="text-brand-gold" />
            <span>Upload File</span>
            <input
              type="file"
              className="hidden"
              onChange={handleUploadImage}
            />
          </label>
          {uploadedImage && (
            <div className="relative group/img">
              <img
                src={uploadedImage}
                alt="Uploaded"
                className="h-16 w-16 rounded-lg border border-brand-gold/30 object-cover"
              />
              <button
                className="absolute -right-2 -top-2 rounded-full bg-red-600 p-1.5 text-white opacity-0 transition-opacity group-hover/img:opacity-100"
                onClick={() => setUploadedImage(null)}
              >
                <MdDelete className="text-xs" />
              </button>
            </div>
          )}
        </div>
      </div>

      <button
        className="w-full rounded-lg border border-brand-gold bg-brand-gold px-12 py-5 font-spaceGrotesk text-sm font-black uppercase tracking-wider text-brand-dark-base transition-colors hover:bg-brand-gold-light disabled:cursor-not-allowed disabled:opacity-30 sm:w-auto"
        onClick={handleSubmitReport}
        disabled={loading}
      >
        <MdSend className="inline-block mr-3 text-lg" />
        {loading && uploadedImage === null
          ? 'Synchronizing...'
          : loading
            ? 'Submitting...'
            : 'Submit Ticket'}
      </button>
    </div>
  );
};

export default ReportForm;
