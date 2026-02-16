import React, { useState } from 'react';
import { FaTimes, FaListOl, FaEdit, FaLightbulb } from 'react-icons/fa';

/**
 * RequirementInput - Expandable requirement input with formatting helper
 * Shows a clickable summary that expands to a full editor modal
 */
const RequirementInput = ({
  value,
  onChange,
  placeholder = 'Enter requirements...',
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [localValue, setLocalValue] = useState(value || '');

  const handleOpen = () => {
    setLocalValue(value || '');
    setIsExpanded(true);
  };

  const handleSave = () => {
    onChange(localValue);
    setIsExpanded(false);
  };

  const handleCancel = () => {
    setLocalValue(value || '');
    setIsExpanded(false);
  };

  // Insert template
  const insertTemplate = () => {
    const template = `Card Type: Physical Card
Wait Time: 5-10 minutes
Requirements:
1. Must be multiple of $100
2. Upload complete and clear card image
3. Card must not be scratched
4. Lower rate for non-standard values`;
    setLocalValue(template);
  };

  // Display preview (first line or truncated)
  const getPreview = () => {
    if (!value) return placeholder;
    const lines = value.split('\n');
    const firstLine = lines[0] || '';
    if (firstLine.length > 40) {
      return firstLine.substring(0, 40) + '...';
    }
    if (lines.length > 1) {
      return firstLine + '...';
    }
    return firstLine;
  };

  return (
    <>
      {/* Collapsed View - Clickable */}
      <div
        onClick={handleOpen}
        className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-sm cursor-pointer hover:border-yellow-500/50 transition-colors flex items-center justify-between group"
      >
        <span className={value ? 'text-white' : 'text-slate-500'}>
          {getPreview()}
        </span>
        <FaEdit className="text-slate-500 group-hover:text-yellow-500 transition-colors flex-shrink-0 ml-2" />
      </div>

      {/* Expanded Modal */}
      {isExpanded && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={handleCancel}
          />
          <div className="relative bg-slate-900 rounded-2xl border border-slate-700 w-full max-w-lg max-h-[80vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-700 flex-shrink-0">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-yellow-500/10 rounded-xl">
                  <FaListOl className="text-yellow-500 text-sm" />
                </div>
                <h3 className="text-white font-semibold">Edit Requirements</h3>
              </div>
              <button
                onClick={handleCancel}
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <FaTimes size={16} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Formatting Tips */}
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-3">
                <div className="flex items-center gap-2 text-yellow-500 text-xs font-medium mb-2">
                  <FaLightbulb />
                  <span>Formatting Tips</span>
                </div>
                <ul className="text-xs text-slate-400 space-y-1">
                  <li>• Use line breaks to separate items</li>
                  <li>• Number your requirements (1. 2. 3.)</li>
                  <li>• Keep each point concise</li>
                </ul>
                <button
                  type="button"
                  onClick={insertTemplate}
                  className="mt-3 text-xs text-yellow-500 hover:text-yellow-400 underline"
                >
                  Insert Template
                </button>
              </div>

              {/* Textarea */}
              <textarea
                value={localValue}
                onChange={(e) => setLocalValue(e.target.value)}
                rows={10}
                placeholder={`Example:
Card Type: Physical Card
Wait Time: 5-10 minutes
Requirements:
1. Must be multiple of $100
2. Upload complete and clear card
3. Card must not be scratched`}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-yellow-500/50 focus:ring-1 focus:ring-yellow-500/50 transition-colors resize-none text-sm font-mono"
              />

              {/* Character count */}
              <div className="text-xs text-slate-500 text-right">
                {localValue.length} characters
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center space-x-3 p-4 border-t border-slate-700 flex-shrink-0">
              <button
                type="button"
                onClick={handleSave}
                className="flex-1 py-2.5 bg-gradient-to-r from-yellow-500 to-yellow-600 text-slate-900 font-semibold rounded-xl hover:from-yellow-400 hover:to-yellow-500 transition-all text-sm"
              >
                Save Requirement
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2.5 bg-slate-800 text-slate-300 font-medium rounded-xl hover:bg-slate-700 transition-colors text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default RequirementInput;
