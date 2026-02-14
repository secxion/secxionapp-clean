/**
 * Notification Type Helper
 * Determines styling, colors, icons, and priority for different notification types
 */

export const getNotificationTypeMetadata = (type) => {
  const typeMetadata = {
    // Transaction notifications
    'transaction:credit': {
      icon: '⬆️',
      color: 'success',
      bgGradient: 'from-green-50/95 to-emerald-50/95',
      borderColor: 'border-green-300/50',
      badgeBg: '#dcfce7',
      badgeText: '#166534',
      textColor: 'text-green-900',
      priority: 'high',
      displayTime: 4000,
      label: 'Money Received',
    },
    'transaction:debit': {
      icon: '⬇️',
      color: 'warning',
      bgGradient: 'from-amber-50/95 to-orange-50/95',
      borderColor: 'border-amber-300/50',
      badgeBg: '#fef3c7',
      badgeText: '#92400e',
      textColor: 'text-amber-900',
      priority: 'medium',
      displayTime: 3500,
      label: 'Payment Sent',
    },
    'transaction:payment_completed': {
      icon: '✓',
      color: 'success',
      bgGradient: 'from-green-50/95 to-emerald-50/95',
      borderColor: 'border-green-300/50',
      badgeBg: '#dcfce7',
      badgeText: '#166534',
      textColor: 'text-green-900',
      priority: 'high',
      displayTime: 4000,
      label: 'Payment Complete',
    },
    'transaction:withdrawal': {
      icon: '💳',
      color: 'info',
      bgGradient: 'from-blue-50/95 to-indigo-50/95',
      borderColor: 'border-blue-300/50',
      badgeBg: '#dbeafe',
      badgeText: '#1e40af',
      textColor: 'text-blue-900',
      priority: 'high',
      displayTime: 4000,
      label: 'Withdrawal Request',
    },
    'transaction:rejected': {
      icon: '⚠️',
      color: 'error',
      bgGradient: 'from-red-50/95 to-rose-50/95',
      borderColor: 'border-red-300/50',
      badgeBg: '#fee2e2',
      badgeText: '#991b1b',
      textColor: 'text-red-900',
      priority: 'critical',
      displayTime: 5000,
      label: 'Transaction Rejected',
    },
    'transaction:eth_processed': {
      icon: 'Ξ',
      color: 'info',
      bgGradient: 'from-purple-50/95 to-indigo-50/95',
      borderColor: 'border-purple-300/50',
      badgeBg: '#f3e8ff',
      badgeText: '#6b21a8',
      textColor: 'text-purple-900',
      priority: 'high',
      displayTime: 4000,
      label: 'ETH Processed',
    },

    // Market notifications
    'market_upload:DONE': {
      icon: '✓',
      color: 'success',
      bgGradient: 'from-green-50/95 to-emerald-50/95',
      borderColor: 'border-green-300/50',
      badgeBg: '#dcfce7',
      badgeText: '#166534',
      textColor: 'text-green-900',
      priority: 'high',
      displayTime: 4000,
      label: 'Upload Complete',
    },
    'market_upload:PROCESSING': {
      icon: '⏳',
      color: 'info',
      bgGradient: 'from-blue-50/95 to-cyan-50/95',
      borderColor: 'border-blue-300/50',
      badgeBg: '#dbeafe',
      badgeText: '#1e40af',
      textColor: 'text-blue-900',
      priority: 'medium',
      displayTime: 3500,
      label: 'Processing Upload',
    },
    'market_upload:CANCEL': {
      icon: '✕',
      color: 'error',
      bgGradient: 'from-red-50/95 to-rose-50/95',
      borderColor: 'border-red-300/50',
      badgeBg: '#fee2e2',
      badgeText: '#991b1b',
      textColor: 'text-red-900',
      priority: 'medium',
      displayTime: 4000,
      label: 'Upload Cancelled',
    },

    // Content notifications
    new_blog: {
      icon: '📰',
      color: 'info',
      bgGradient: 'from-blue-50/95 to-cyan-50/95',
      borderColor: 'border-blue-300/50',
      badgeBg: '#dbeafe',
      badgeText: '#1e40af',
      textColor: 'text-blue-900',
      priority: 'low',
      displayTime: 3000,
      label: 'New Blog Post',
    },
    report_reply: {
      icon: '💬',
      color: 'info',
      bgGradient: 'from-indigo-50/95 to-blue-50/95',
      borderColor: 'border-indigo-300/50',
      badgeBg: '#e0e7ff',
      badgeText: '#3730a3',
      textColor: 'text-indigo-900',
      priority: 'medium',
      displayTime: 3500,
      label: 'New Reply',
    },

    // Default fallback
    default: {
      icon: 'ℹ️',
      color: 'info',
      bgGradient: 'from-gray-50/95 to-slate-50/95',
      borderColor: 'border-gray-300/50',
      badgeBg: '#f3f4f6',
      badgeText: '#1f2937',
      textColor: 'text-gray-900',
      priority: 'low',
      displayTime: 3000,
      label: 'Notification',
    },
  };

  return typeMetadata[type] || typeMetadata.default;
};

/**
 * Get vibration pattern based on priority
 */
export const getVibrationPattern = (priority) => {
  const patterns = {
    critical: [200, 100, 200, 100, 200], // Strong triple buzz
    high: [150, 100, 150], // Double buzz
    medium: [100, 100], // Single buzz
    low: [50], // Subtle buzz
  };
  return patterns[priority] || patterns.low;
};

/**
 * Get sound volume based on priority
 */
export const getSoundVolume = (priority) => {
  const volumes = {
    critical: 1.0,
    high: 0.8,
    medium: 0.6,
    low: 0.4,
  };
  return volumes[priority] || 0.5;
};
