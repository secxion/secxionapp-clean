import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import '../styles/marketplaceUtilities.css';

/**
 * MarketCalendar - Displays market events and maintenance schedules
 * Shows upcoming events, maintenance windows, and important dates
 */
const MarketCalendar = () => {
  const [events, setEvents] = useState([
    {
      id: 1,
      title: 'Market Peak Hours',
      date: new Date(Date.now() + 86400000), // Tomorrow
      type: 'event',
      description: 'Best time for trading - high activity period',
      time: '18:00 - 22:00 UTC',
    },
    {
      id: 2,
      title: 'System Maintenance',
      date: new Date(Date.now() + 172800000), // Day after tomorrow
      type: 'maintenance',
      description: 'Regular system updates and optimizations',
      time: '02:00 - 04:00 UTC',
    },
    {
      id: 3,
      title: 'Weekly Settlement',
      date: new Date(Date.now() + 345600000), // In 4 days
      type: 'settlement',
      description: 'Weekly transaction settlements complete',
      time: '23:59 UTC',
    },
    {
      id: 4,
      title: 'Feature Release',
      date: new Date(Date.now() + 604800000), // In 7 days
      type: 'release',
      description: 'New marketplace features coming soon',
      time: 'All day',
    },
  ]);

  const getEventColor = (type) => {
    const colors = {
      event: { bg: 'rgba(16, 185, 129, 0.1)', border: '#10b981', icon: '📅' },
      maintenance: { bg: 'rgba(239, 68, 68, 0.1)', border: '#ef4444', icon: '🔧' },
      settlement: { bg: 'rgba(59, 130, 246, 0.1)', border: '#3b82f6', icon: '💰' },
      release: { bg: 'rgba(168, 85, 247, 0.1)', border: '#a855f7', icon: '🚀' },
    };
    return colors[type] || colors.event;
  };

  const formatDate = (date) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const dateStr = date.toDateString();
    const todayStr = today.toDateString();
    const tomorrowStr = tomorrow.toDateString();

    if (dateStr === todayStr) return 'Today';
    if (dateStr === tomorrowStr) return 'Tomorrow';

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      weekday: 'short',
    });
  };

  const getDaysUntil = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const eventDate = new Date(date);
    eventDate.setHours(0, 0, 0, 0);
    const diffTime = eventDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const sortedEvents = [...events].sort((a, b) => a.date - b.date);

  return (
    <motion.div
      className="marketplace-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      style={{
        background: 'linear-gradient(135deg, #1f2937 0%, #111827 100%)',
        color: 'white',
      }}
    >
      {/* Header */}
      <h2 className="marketplace-heading-2" style={{ color: 'white', marginBottom: '1.5rem' }}>
        📅 Market Calendar
      </h2>

      {/* Events Timeline */}
      <div style={{ display: 'grid', gap: '1rem' }}>
        <AnimatePresence>
          {sortedEvents.map((event, idx) => {
            const colorConfig = getEventColor(event.type);
            const daysUntil = getDaysUntil(event.date);

            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: idx * 0.1 }}
                style={{
                  backgroundColor: colorConfig.bg,
                  border: `2px solid ${colorConfig.border}`,
                  borderRadius: '0.75rem',
                  padding: '1rem',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  position: 'relative',
                  overflow: 'hidden',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateX(5px)';
                  e.currentTarget.style.boxShadow = `0 0 20px ${colorConfig.border}40`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateX(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {/* Timeline indicator */}
                {daysUntil <= 2 && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 0,
                      right: 0,
                      backgroundColor: colorConfig.border,
                      color: 'white',
                      padding: '0.25rem 0.75rem',
                      fontSize: '0.75rem',
                      fontWeight: '700',
                      borderRadius: '0 0 0 0.5rem',
                    }}
                  >
                    COMING SOON
                  </div>
                )}

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  {/* Icon */}
                  <div
                    style={{
                      fontSize: '2rem',
                      minWidth: '3rem',
                      textAlign: 'center',
                    }}
                  >
                    {colorConfig.icon}
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'start',
                        marginBottom: '0.5rem',
                      }}
                    >
                      <div>
                        <h4
                          style={{
                            fontSize: '1rem',
                            fontWeight: '700',
                            marginBottom: '0.25rem',
                            color: 'white',
                          }}
                        >
                          {event.title}
                        </h4>
                        <p
                          style={{
                            fontSize: '0.875rem',
                            opacity: 0.7,
                            marginBottom: '0.5rem',
                          }}
                        >
                          {event.description}
                        </p>
                      </div>

                      {/* Days until badge */}
                      <div
                        style={{
                          backgroundColor: colorConfig.border,
                          color: 'white',
                          padding: '0.25rem 0.75rem',
                          borderRadius: '9999px',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          whiteSpace: 'nowrap',
                          marginLeft: '1rem',
                        }}
                      >
                        {daysUntil === 0
                          ? 'Today'
                          : daysUntil === 1
                            ? 'Tomorrow'
                            : `${daysUntil}d away`}
                      </div>
                    </div>

                    {/* Date and time info */}
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'auto auto',
                        gap: '1rem',
                        fontSize: '0.875rem',
                        opacity: 0.8,
                      }}
                    >
                      <div>
                        <span style={{ opacity: 0.6 }}>📍 </span>
                        {formatDate(event.date)}
                      </div>
                      <div>
                        <span style={{ opacity: 0.6 }}>⏰ </span>
                        {event.time}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Legend */}
      <div
        style={{
          marginTop: '2rem',
          paddingTop: '1rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
          gap: '1rem',
          fontSize: '0.75rem',
          opacity: 0.6,
        }}
      >
        <div>
          <span style={{ marginRight: '0.5rem' }}>📅</span>
          Events
        </div>
        <div>
          <span style={{ marginRight: '0.5rem' }}>🔧</span>
          Maintenance
        </div>
        <div>
          <span style={{ marginRight: '0.5rem' }}>💰</span>
          Settlement
        </div>
        <div>
          <span style={{ marginRight: '0.5rem' }}>🚀</span>
          Release
        </div>
      </div>
    </motion.div>
  );
};

export default MarketCalendar;
