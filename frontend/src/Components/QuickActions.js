import React from 'react';
import { Send, Download, Upload, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const QuickActions = () => {
  const navigate = useNavigate();

  const actions = [
    {
      icon: <Upload className="w-6 h-6" />,
      label: 'Sell Assets',
      action: () => navigate('/section'),
      gradient: 'from-green-500 to-emerald-600',
    },
    {
      icon: <Send className="w-6 h-6" />,
      label: 'Transfer',
      action: () => navigate('/mywallet'),
      gradient: 'from-blue-500 to-cyan-600',
    },
    {
      icon: <Download className="w-6 h-6" />,
      label: 'Withdraw',
      action: () => navigate('/mywallet'),
      gradient: 'from-purple-500 to-violet-600',
    },
    {
      icon: <Plus className="w-6 h-6" />,
      label: 'Add Funds',
      action: () => navigate('/mywallet'),
      gradient: 'from-orange-500 to-red-600',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {actions.map((action, idx) => (
        <motion.button
          key={idx}
          onClick={action.action}
          className={`bg-gradient-to-br ${action.gradient} hover:scale-105 text-white p-6 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl`}
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.98 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: idx * 0.1 }}
        >
          <div className="flex flex-col items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              {action.icon}
            </div>
            <span className="text-sm font-medium">{action.label}</span>
          </div>
        </motion.button>
      ))}
    </div>
  );
};

export default QuickActions;
