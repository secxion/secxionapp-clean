import React from 'react';
import { MdClose } from 'react-icons/md';
import { motion } from 'framer-motion';

const FullBlogDialog = ({ blog, onClose }) => {
    return (
        <motion.div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
        >
            <motion.div
                className="bg-white/10 dark:bg-gray-900/40 backdrop-blur-lg rounded-2xl max-w-2xl w-full p-6 relative shadow-2xl text-white overflow-y-auto max-h-[90vh] border border-white/20"
                onClick={e => e.stopPropagation()}
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-300 hover:text-white transition-colors"
                >
                    <MdClose size={24} />
                </button>

                <h2 className="text-3xl font-bold neon-text mb-4">{blog.title}</h2>
                <p className="text-gray-200 leading-relaxed whitespace-pre-line">
                    {blog.content || 'No content available.'}
                </p>
            </motion.div>
        </motion.div>
    );
};

export default FullBlogDialog;
