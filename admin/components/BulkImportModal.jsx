import React, { useState } from 'react';
import {
  FaTimes,
  FaFileImport,
  FaCheck,
  FaExclamationTriangle,
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import currencyData from '../helpers/currencyData';

/**
 * BulkImportModal - Parse pasted product data and import into form
 * Parses format from giftcard websites with Face Value, Rate, Requirements, Currency
 */
const BulkImportModal = ({
  isOpen,
  onClose,
  onImport,
  existingCurrencies = [],
}) => {
  const [rawText, setRawText] = useState('');
  const [parsedData, setParsedData] = useState(null);
  const [step, setStep] = useState('paste'); // 'paste' or 'preview'
  const [fallbackCurrency, setFallbackCurrency] = useState('');

  if (!isOpen) return null;

  // Parse the raw text into structured data
  const parseRawText = (text) => {
    const results = [];

    // Split by common separators - SELL NOW, X-TEAM, or double newlines with Face Value
    const blocks = text
      .split(/(?=Face Value:)/gi)
      .filter((block) => block.trim());

    for (const block of blocks) {
      try {
        const entry = parseBlock(block);
        if (entry && entry.faceValue && entry.rate) {
          results.push(entry);
        }
      } catch (e) {
        console.warn('Failed to parse block:', block, e);
      }
    }

    return results;
  };

  // Parse a single block of product data
  const parseBlock = (block) => {
    const lines = block
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l);

    let faceValue = '';
    let rate = '';
    let currency = '';
    let requirementParts = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Currency detection FIRST: "1 GBP = 1132.45 NGN" or "1 USD = 1600 NGN"
      const currencyMatch = line.match(/1\s+([A-Z]{3})\s*=\s*[\d.,]+\s*NGN/i);
      if (currencyMatch) {
        currency = currencyMatch[1].toUpperCase();
        continue;
      }

      // Skip noise lines (after currency check)
      if (line.match(/^(SELL NOW|X-TEAM-\d+|^\d+\s+[A-Z]{3}\s+=)/i)) continue;
      if (line === 'NGN') continue;

      // Face Value: 100-500 or Face Value: 50
      const fvMatch = line.match(/Face Value:\s*(.+)/i);
      if (fvMatch) {
        faceValue = fvMatch[1].trim();
        continue;
      }

      // Wait time: X min
      const waitMatch = line.match(/Wait time:\s*(.+)/i);
      if (waitMatch) {
        requirementParts.push(`Wait Time: ${waitMatch[1].trim()}`);
        continue;
      }

      // Requisite/Requirement: ...
      const reqMatch = line.match(/Requisite?:\s*(.+)/i);
      if (reqMatch) {
        requirementParts.push(reqMatch[1].trim());
        continue;
      }

      // Card type lines (E-CODE, Physical Card, Virtual Card, Horizontal Card, Fast Card)
      if (
        line.match(
          /E-CODE|Physical Card|Virtual Card|Horizontal Card|Fast Card/i,
        )
      ) {
        // Clean up concatenated text like "E-CODEVirtual CardFast Card"
        const cardTypes = line
          .replace(/E-CODE/gi, 'E-CODE, ')
          .replace(/Physical Card/gi, 'Physical Card, ')
          .replace(/Virtual Card/gi, 'Virtual Card, ')
          .replace(/Horizontal Card/gi, 'Horizontal Card, ')
          .replace(/Fast Card/gi, 'Fast Card')
          .replace(/,\s*,/g, ',')
          .replace(/,\s*$/, '')
          .trim();
        requirementParts.unshift(`Card Type: ${cardTypes}`);
        continue;
      }

      // Price with Naira symbol (₦933.54) - extract this as the rate
      const nairaMatch = line.match(/^₦([\d.,]+)$/);
      if (nairaMatch && !rate) {
        rate = nairaMatch[1].replace(',', '');
        continue;
      }

      // Skip other currency symbols - we already got rate from NGN
      if (line.match(/^[$€£¥][\d.,]+$/)) {
        continue;
      }

      // Standalone number (like 4.64) - skip, we want the NGN rate instead
      if (line.match(/^(\d+\.?\d*)$/)) {
        continue;
      }
    }

    // Combine requirements
    const requirement = requirementParts.join('\n');

    return {
      faceValue,
      rate,
      currency,
      requirement,
    };
  };

  const handleParse = () => {
    if (!rawText.trim()) {
      toast.error('Please paste some product data first');
      return;
    }

    const parsed = parseRawText(rawText);

    if (parsed.length === 0) {
      toast.error('Could not parse any products from the pasted text');
      return;
    }

    // Group by currency
    const grouped = {};
    for (const item of parsed) {
      const curr = item.currency || 'UNKNOWN';
      if (!grouped[curr]) {
        grouped[curr] = [];
      }
      grouped[curr].push({
        faceValue: item.faceValue,
        sellingPrice: item.rate,
        requirement: item.requirement,
      });
    }

    setParsedData(grouped);
    setStep('preview');
  };

  const handleImport = () => {
    if (!parsedData) return;

    // If there are UNKNOWN currency items and user selected a fallback, reassign them
    const dataToImport = { ...parsedData };
    if (dataToImport['UNKNOWN'] && fallbackCurrency) {
      if (dataToImport[fallbackCurrency]) {
        // Add to existing currency
        dataToImport[fallbackCurrency] = [
          ...dataToImport[fallbackCurrency],
          ...dataToImport['UNKNOWN'],
        ];
      } else {
        // Create new entry
        dataToImport[fallbackCurrency] = dataToImport['UNKNOWN'];
      }
      delete dataToImport['UNKNOWN'];
    }

    onImport(dataToImport);
    handleClose();
    toast.success(
      `Imported ${Object.values(dataToImport).flat().length} face values`,
    );
  };

  const handleClose = () => {
    setRawText('');
    setParsedData(null);
    setStep('paste');
    setFallbackCurrency('');
    onClose();
  };

  const handleBack = () => {
    setStep('paste');
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={handleClose}
      />

      <div className="relative bg-slate-900 rounded-2xl border border-slate-700 w-full max-w-3xl max-h-[85vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-yellow-500/10 rounded-xl">
              <FaFileImport className="text-yellow-500 text-lg" />
            </div>
            <div>
              <h3 className="text-white font-semibold">Bulk Import Products</h3>
              <p className="text-slate-400 text-xs">
                {step === 'paste'
                  ? 'Paste product data from website'
                  : 'Review parsed data'}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <FaTimes size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4">
          {step === 'paste' ? (
            <div className="space-y-4">
              {/* Instructions */}
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
                <h4 className="text-yellow-500 font-medium text-sm mb-2">
                  How to use:
                </h4>
                <ol className="text-slate-400 text-sm space-y-1 list-decimal list-inside">
                  <li>Copy product listings from the source website</li>
                  <li>
                    Paste the text below (include Face Value, Rate,
                    Requirements)
                  </li>
                  <li>Click "Parse Data" to extract product information</li>
                  <li>Review and import into the form</li>
                </ol>
              </div>

              {/* Paste Area */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Paste Product Data
                </label>
                <textarea
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  rows={15}
                  placeholder={`Paste copied text here. Example format:

Face Value: 100-500
Wait time: 10 min

Horizontal CardFast Card
Requisite: 1. multiple of 50. ...
₦1132.45

5.63
1 GBP = 1132.45 NGN

SELL NOW

Face Value: 50
Wait time: 6 min
...`}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-yellow-500/50 focus:ring-1 focus:ring-yellow-500/50 transition-colors resize-none text-sm font-mono"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Preview Header */}
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 flex items-center gap-3">
                <FaCheck className="text-emerald-500" />
                <span className="text-emerald-400 text-sm">
                  Found {Object.values(parsedData).flat().length} face values
                  across {Object.keys(parsedData).length} currencies
                </span>
              </div>

              {/* Parsed Data Preview */}
              {Object.entries(parsedData).map(([currency, faceValues]) => (
                <div
                  key={currency}
                  className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-yellow-500 font-medium">
                      {currency === 'UNKNOWN'
                        ? '⚠️ Unknown Currency'
                        : currency}
                    </h4>
                    <span className="text-slate-400 text-xs">
                      {faceValues.length} face value(s)
                    </span>
                  </div>

                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {faceValues.map((fv, idx) => (
                      <div
                        key={idx}
                        className="bg-slate-900/50 rounded-lg p-3 text-sm"
                      >
                        <div className="grid grid-cols-2 gap-2 mb-2">
                          <div>
                            <span className="text-slate-500">Face Value:</span>
                            <span className="text-white ml-2">
                              {fv.faceValue}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-500">Rate:</span>
                            <span className="text-emerald-400 ml-2">
                              {fv.sellingPrice}
                            </span>
                          </div>
                        </div>
                        {fv.requirement && (
                          <div className="text-slate-400 text-xs border-t border-slate-700 pt-2 mt-2 whitespace-pre-line">
                            {fv.requirement}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {Object.keys(parsedData).includes('UNKNOWN') && (
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <FaExclamationTriangle className="text-yellow-500 mt-0.5" />
                    <span className="text-yellow-400 text-sm">
                      Some items have unknown currency. Select a currency below:
                    </span>
                  </div>
                  <select
                    value={fallbackCurrency}
                    onChange={(e) => setFallbackCurrency(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-yellow-500/50 rounded-lg text-white text-sm focus:outline-none focus:border-yellow-500"
                  >
                    <option value="" className="bg-slate-900">
                      Select Currency for Unknown Items
                    </option>
                    {currencyData.map((cur) => (
                      <option
                        value={cur.value}
                        key={cur.value}
                        className="bg-slate-900"
                      >
                        {cur.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-slate-700 flex-shrink-0">
          {step === 'paste' ? (
            <>
              <button
                onClick={handleClose}
                className="px-4 py-2.5 bg-slate-800 text-slate-300 font-medium rounded-xl hover:bg-slate-700 transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleParse}
                className="px-6 py-2.5 bg-gradient-to-r from-yellow-500 to-yellow-600 text-slate-900 font-semibold rounded-xl hover:from-yellow-400 hover:to-yellow-500 transition-all text-sm"
              >
                Parse Data
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleBack}
                className="px-4 py-2.5 bg-slate-800 text-slate-300 font-medium rounded-xl hover:bg-slate-700 transition-colors text-sm"
              >
                ← Back to Edit
              </button>
              <button
                onClick={handleImport}
                className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold rounded-xl hover:from-emerald-400 hover:to-emerald-500 transition-all text-sm flex items-center gap-2"
              >
                <FaCheck size={14} />
                Import to Form
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default BulkImportModal;
