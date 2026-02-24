import React, { useState } from 'react';
import { MdExpandMore, MdExpandLess } from 'react-icons/md';

const UserDatapadCard = ({ user }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showFullContent, setShowFullContent] = useState({});

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
    setShowFullContent({});
  };

  const toggleFullContent = (entryId) => {
    setShowFullContent((prevState) => ({
      ...prevState,
      [entryId]: !prevState[entryId],
    }));
  };

  return (
    <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-4">
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={toggleExpand}
      >
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-500 to-yellow-600 flex items-center justify-center text-slate-900 font-bold flex-shrink-0">
            {(user.name || 'U').charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="font-semibold text-white">{user.name}</h3>
            <p className="text-slate-400 text-sm">{user.email}</p>
          </div>
        </div>
        <button className="flex items-center gap-1 text-yellow-500 hover:text-yellow-400 transition-colors">
          {isExpanded ? (
            <>
              <span className="text-sm">Hide</span>
              <MdExpandLess className="text-xl" />
            </>
          ) : (
            <>
              <span className="text-sm">View</span>
              <MdExpandMore className="text-xl" />
            </>
          )}
        </button>
      </div>
      {isExpanded && user.datapadEntries.length > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-700/50">
          <h4 className="font-medium text-slate-300 mb-3">
            Datapad Entries ({user.datapadEntries.length})
          </h4>
          <div className="space-y-3">
            {user.datapadEntries.map((entry) => (
              <div
                key={entry._id}
                className="bg-slate-900/50 rounded-lg p-3 border border-slate-700/50"
              >
                <div className="flex items-center justify-between mb-2">
                  <h5 className="font-medium text-white">
                    {entry.title || '(No Title)'}
                  </h5>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFullContent(entry._id);
                    }}
                    className="text-xs text-yellow-500 hover:text-yellow-400 transition-colors"
                  >
                    {showFullContent[entry._id] ? 'View Less' : 'View More'}
                  </button>
                </div>
                <p className="text-slate-400 text-sm whitespace-pre-line">
                  {showFullContent[entry._id]
                    ? entry.content || '(No Content)'
                    : `${entry.content?.substring(0, 150)}${entry.content?.length > 150 ? '...' : ''}`}
                </p>
                {entry.media && entry.media.length > 0 && (
                  <div className="mt-2 text-xs text-slate-500">
                    <span className="font-medium text-slate-400">Media:</span>
                    <ul className="mt-1 space-y-1">
                      {entry.media.map((m, index) => (
                        <li key={index} className="break-all text-slate-500">
                          {m}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <p className="text-xs text-slate-500 mt-2">
                  {new Date(entry.createdAt).toLocaleDateString()}{' '}
                  {new Date(entry.createdAt).toLocaleTimeString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
      {isExpanded && user.datapadEntries.length === 0 && (
        <p className="mt-4 pt-4 border-t border-slate-700/50 text-slate-500 text-center">
          No Datapad entries for this user.
        </p>
      )}
    </div>
  );
};

export default UserDatapadCard;
