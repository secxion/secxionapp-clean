import React, { useState } from 'react';

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
    <div className="container mb-6 border p-4 rounded-md shadow-sm">
      <div className="flex items-center justify-between cursor-pointer" onClick={toggleExpand}>
        <h3 className="font-semibold text-lg">{user.name} ({user.email})</h3>
        <button className="text-blue-500 focus:outline-none">
          {isExpanded ? 'Hide Entries' : 'View Entries'}
        </button>
      </div>
      {isExpanded && user.datapadEntries.length > 0 && (
        <div className="mt-4">
          <h4 className="font-semibold text-md mb-2">Datapad Entries:</h4>
          <ul className="list-disc pl-5">
            {user.datapadEntries.map((entry) => (
              <li key={entry._id} className="mb-3"> {/* Added margin-bottom for entry separation */}
                <div className="flex items-center justify-between">
                  <h5 className="font-semibold">{entry.title || '(No Title)'}</h5>
                  <button
                    onClick={() => toggleFullContent(entry._id)}
                    className="text-sm text-gray-600 hover:underline focus:outline-none"
                  >
                    {showFullContent[entry._id] ? 'View Less' : 'View More'}
                  </button>
                </div>
                {showFullContent[entry._id] ? (
                  <p className="mt-1 whitespace-pre-line">{entry.content || '(No Content)'}</p> 
                ) : (
                  <p className="mt-1 whitespace-pre-line">{entry.content?.substring(0, 150)}...</p> 
                )}
                {entry.media && entry.media.length > 0 && (
                  <div className="mt-2 text-sm text-gray-600">
                    <span className="font-semibold">Media:</span>
                    <ul className="list-none pl-0 mt-1">
                      {entry.media.map((m, index) => (
                        <li key={index} className="break-all">{m}</li> 
                      ))}
                    </ul>
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Created At: {new Date(entry.createdAt).toLocaleDateString()} {new Date(entry.createdAt).toLocaleTimeString()}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}
      {isExpanded && user.datapadEntries.length === 0 && (
        <p className="mt-4 text-gray-500">No Datapad entries for this user.</p>
      )}
    </div>
  );
};

export default UserDatapadCard;