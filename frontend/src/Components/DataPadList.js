import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { FaEdit, FaTrash, FaTag, FaClock, FaDownload } from 'react-icons/fa';
import { jsPDF } from 'jspdf';
import SecxionLogo from '../Assets/optimized/secxion-logo-224.png';
import SecxionShimmer from './SecxionShimmer';

const DataPadList = ({
  dataPads,
  onOpen,
  onDelete,
  onImageClick,
  isLoading,
}) => {
  const [exportTarget, setExportTarget] = useState(null);
  const toRoman = (num) => {
    const map = [
      [1000, 'M'],
      [900, 'CM'],
      [500, 'D'],
      [400, 'CD'],
      [100, 'C'],
      [90, 'XC'],
      [50, 'L'],
      [40, 'XL'],
      [10, 'X'],
      [9, 'IX'],
      [5, 'V'],
      [4, 'IV'],
      [1, 'I'],
    ];

    let value = num;
    let result = '';

    map.forEach(([arabic, roman]) => {
      while (value >= arabic) {
        result += roman;
        value -= arabic;
      }
    });

    return result;
  };

  const escapeHtml = (value = '') =>
    String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');

  const safeFileName = (value = 'data-record') =>
    String(value)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'data-record';

  const getPadMeta = (pad) => {
    const createdAt = new Date(pad.createdAt).toLocaleString();
    const updatedAt = new Date(pad.updatedAt || pad.createdAt).toLocaleString();

    return {
      title: pad.title || 'Untitled',
      content: pad.content || '',
      tags: Array.isArray(pad.tags) ? pad.tags : [],
      createdAt,
      updatedAt,
      mediaCount: Array.isArray(pad.media) ? pad.media.length : 0,
    };
  };

  const loadImageDataUrl = (src, { maxWidth = 0, alpha = 1 } = {}) =>
    new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const scale =
          maxWidth > 0 && img.width > maxWidth ? maxWidth / img.width : 1;
        const width = Math.max(1, Math.round(img.width * scale));
        const height = Math.max(1, Math.round(img.height * scale));

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          reject(new Error('Canvas context unavailable'));
          return;
        }

        ctx.clearRect(0, 0, width, height);
        ctx.globalAlpha = alpha;
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/png'));
      };
      img.onerror = () => reject(new Error('Failed to load logo image'));
      img.src = src;
    });

  const downloadBlob = (fileName, mimeType, content) => {
    const blob = new Blob([content], { type: mimeType });
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(blobUrl);
  };

  const exportAsTxt = (pad) => {
    const meta = getPadMeta(pad);
    const lines = [
      'SECXION DATAPAD EXPORT',
      '========================================',
      'Letterhead: Secxion Official',
      'Watermark: SECXION',
      `Exported: ${new Date().toLocaleString()}`,
      '========================================',
      '',
      `Title   : ${meta.title}`,
      `Created : ${meta.createdAt}`,
      `Updated : ${meta.updatedAt}`,
      `Tags    : ${meta.tags.length > 0 ? meta.tags.join(', ') : 'None'}`,
      `Images  : ${meta.mediaCount}`,
      '',
      'CONTENT',
      '----------------------------------------',
      meta.content,
      '',
      '========================================',
      'Secxion DataPad Export',
    ];

    downloadBlob(
      `${safeFileName(meta.title)}.txt`,
      'text/plain;charset=utf-8',
      lines.join('\n'),
    );
    toast.success('Data exported as TXT.');
  };

  const exportAsDoc = async (pad) => {
    const meta = getPadMeta(pad);
    let logoDataUrl = '';

    try {
      logoDataUrl = await loadImageDataUrl(SecxionLogo, {
        maxWidth: 120,
        alpha: 1,
      });
    } catch (error) {
      console.warn('DOC logo load failed:', error);
    }

    const html = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>${escapeHtml(meta.title)}</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        color: #0f172a;
        margin: 36px;
        position: relative;
        letter-spacing: 0.1px;
      }
      .watermark {
        position: fixed;
        top: 54%;
        left: 50%;
        transform: translate(-50%, -50%);
        opacity: 0.045;
        z-index: 0;
        pointer-events: none;
      }
      .watermark img { width: 460px; height: auto; }
      .header {
        position: relative;
        z-index: 1;
        display: flex;
        align-items: center;
        justify-content: space-between;
        border-top: 3px solid #d4af37;
        border-bottom: 1px solid #d5dbe5;
        padding: 12px 0 12px;
        margin-bottom: 24px;
      }
      .brand-title {
        margin: 0;
        font-size: 28px;
        color: #16213b;
        letter-spacing: 0.2px;
      }
      .brand-subtitle {
        margin: 6px 0 0;
        font-size: 13px;
        color: #62748f;
        text-transform: uppercase;
        letter-spacing: 1.2px;
      }
      .brand-logo {
        width: 72px;
        height: 72px;
        object-fit: contain;
      }
      h1 { margin: 0 0 10px; font-size: 36px; color: #16213b; }
      .summary {
        border: 1px solid #dbe4f1;
        background: #f7f9fc;
        border-radius: 14px;
        padding: 14px 16px;
        margin-bottom: 20px;
        font-size: 13px;
        color: #334155;
      }
      .summary-row { margin: 0 0 7px; }
      .section-title {
        margin: 0 0 10px;
        font-size: 18px;
        color: #1f2937;
        text-transform: uppercase;
        letter-spacing: 1px;
      }
      .content { white-space: pre-wrap; line-height: 1.7; font-size: 14px; color: #1f2937; }
      .footer {
        margin-top: 26px;
        padding-top: 10px;
        border-top: 1px solid #d5dbe5;
        font-size: 11px;
        color: #64748b;
      }
    </style>
  </head>
  <body>
    ${logoDataUrl ? `<div class="watermark"><img src="${logoDataUrl}" alt="Secxion watermark" /></div>` : ''}
    <div class="header">
      <div>
        <h2 class="brand-title">Secxion DataPad Export</h2>
        <p class="brand-subtitle">Generated from your private archive</p>
      </div>
      ${logoDataUrl ? `<img class="brand-logo" src="${logoDataUrl}" alt="Secxion logo" />` : ''}
    </div>
    <h1>${escapeHtml(meta.title)}</h1>
    <div class="summary">
      <p class="summary-row"><strong>Created:</strong> ${escapeHtml(meta.createdAt)}</p>
      <p class="summary-row"><strong>Updated:</strong> ${escapeHtml(meta.updatedAt)}</p>
      <p class="summary-row"><strong>Tags:</strong> ${escapeHtml(meta.tags.length > 0 ? meta.tags.join(', ') : 'None')}</p>
      <p class="summary-row"><strong>Images:</strong> ${meta.mediaCount}</p>
    </div>
    <h3 class="section-title">Content</h3>
    <div class="content">${escapeHtml(meta.content)}</div>
    <div class="footer">Exported: ${escapeHtml(new Date().toLocaleString())}</div>
  </body>
</html>`;

    downloadBlob(
      `${safeFileName(meta.title)}.doc`,
      'application/msword;charset=utf-8',
      html,
    );
    toast.success('Data exported as DOC.');
  };

  const exportAsPdf = async (pad) => {
    const meta = getPadMeta(pad);
    try {
      let logoDataUrl = '';
      let watermarkDataUrl = '';

      try {
        logoDataUrl = await loadImageDataUrl(SecxionLogo, {
          maxWidth: 140,
          alpha: 1,
        });
        watermarkDataUrl = await loadImageDataUrl(SecxionLogo, {
          maxWidth: 620,
          alpha: 0.03,
        });
      } catch (error) {
        console.warn('PDF logo load failed:', error);
      }

      const doc = new jsPDF({ unit: 'pt', format: 'a4' });
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 44;
      const headerHeight = 88;
      const contentWidth = pageWidth - margin * 2;
      let y = margin + headerHeight;

      const drawPageShell = () => {
        if (watermarkDataUrl) {
          const watermarkSize = Math.min(pageWidth, pageHeight) * 0.58;
          doc.addImage(
            watermarkDataUrl,
            'PNG',
            (pageWidth - watermarkSize) / 2,
            (pageHeight - watermarkSize) / 2 + 18,
            watermarkSize,
            watermarkSize,
            undefined,
          );
        }

        doc.setDrawColor(212, 175, 55);
        doc.setLineWidth(2.2);
        doc.line(margin, margin + 4, pageWidth - margin, margin + 4);

        doc.setDrawColor(230, 230, 230);
        doc.setLineWidth(1);
        doc.line(
          margin,
          margin + headerHeight - 18,
          pageWidth - margin,
          margin + headerHeight - 18,
        );

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(18);
        doc.setTextColor(15, 23, 42);
        doc.text('Secxion DataPad Export', margin, margin + 32);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9.5);
        doc.setTextColor(100, 116, 139);
        doc.text('Generated from your private archive', margin, margin + 50);

        if (logoDataUrl) {
          doc.addImage(
            logoDataUrl,
            'PNG',
            pageWidth - margin - 58,
            margin + 10,
            58,
            58,
            undefined,
          );
        }
      };

      const drawFooter = () => {
        const pageCount = doc.getNumberOfPages();
        const exportedAt = new Date().toLocaleString();

        for (let page = 1; page <= pageCount; page += 1) {
          doc.setPage(page);
          doc.setDrawColor(230, 230, 230);
          doc.setLineWidth(1);
          doc.line(
            margin,
            pageHeight - 42,
            pageWidth - margin,
            pageHeight - 42,
          );

          doc.setFont('helvetica', 'normal');
          doc.setFontSize(9);
          doc.setTextColor(100, 116, 139);
          doc.text(`Exported: ${exportedAt}`, margin, pageHeight - 26);
          doc.text(
            `Page ${page} of ${pageCount}`,
            pageWidth - margin,
            pageHeight - 26,
            { align: 'right' },
          );
        }
      };

      drawPageShell();

      const ensurePageSpace = (nextBlockHeight = 0) => {
        if (y + nextBlockHeight > pageHeight - margin - 52) {
          doc.addPage();
          drawPageShell();
          y = margin + headerHeight;
        }
      };

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(20);
      doc.setTextColor(15, 23, 42);
      doc.text(meta.title, margin, y);
      y += 22;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      doc.setTextColor(71, 85, 105);
      doc.text('Record summary', margin, y);
      y += 18;

      const boxPadding = 12;
      const metaBoxHeight = 78;
      ensurePageSpace(metaBoxHeight + 16);
      doc.setFillColor(247, 249, 252);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(margin, y, contentWidth, metaBoxHeight, 8, 8, 'FD');

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(51, 65, 85);

      const metaLines = [
        `Created: ${meta.createdAt}`,
        `Updated: ${meta.updatedAt}`,
        `Tags: ${meta.tags.length > 0 ? meta.tags.join(', ') : 'None'}`,
        `Images: ${meta.mediaCount}`,
      ];

      let metaY = y + boxPadding + 10;
      metaLines.forEach((line) => {
        doc.text(line, margin + boxPadding, metaY);
        metaY += 16;
      });

      y += metaBoxHeight + 20;
      ensurePageSpace(20);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(20, 20, 20);
      doc.text('Content', margin, y);
      y += 18;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      doc.setTextColor(31, 41, 55);

      const paragraphs = (meta.content || 'No content')
        .split(/\n+/)
        .map((chunk) => chunk.trim())
        .filter(Boolean);

      paragraphs.forEach((paragraph, paragraphIndex) => {
        const paragraphLines = doc.splitTextToSize(paragraph, contentWidth);

        paragraphLines.forEach((line) => {
          ensurePageSpace(16);
          doc.text(line, margin, y);
          y += 16;
        });

        if (paragraphIndex < paragraphs.length - 1) {
          y += 8;
        }
      });

      drawFooter();

      doc.save(`${safeFileName(meta.title)}.pdf`);
      toast.success('Data exported as PDF.');
    } catch (error) {
      console.error('PDF export failed:', error);
      toast.error('Failed to export PDF. Please try again.');
    }
  };

  const handleExportClick = (event, pad) => {
    event.preventDefault();
    event.stopPropagation();
    setExportTarget(pad);
  };

  if (isLoading) {
    return <SecxionShimmer type="list" count={5} />;
  }

  return (
    <>
      <div className="space-y-3.5 sm:space-y-4">
        {dataPads.map((pad, index) => (
          <motion.div
            key={pad._id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.24, delay: index * 0.03 }}
            className="group relative overflow-hidden rounded-[24px] border border-white/8 bg-brand-dark-secondary/75 p-4 sm:p-[18px] shadow-[0_14px_44px_rgba(0,0,0,0.26)] backdrop-blur-xl transition-all duration-300 hover:border-brand-gold/25 hover:shadow-[0_20px_60px_rgba(0,0,0,0.34)]"
          >
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
              <div
                className="flex-1 cursor-pointer"
                onClick={() => onOpen(pad)}
              >
                <div className="mb-2.5 flex items-center gap-2">
                  <span className="rounded-full border border-brand-gold/15 bg-brand-gold/10 px-3 py-1 text-[9px] font-black uppercase tracking-[0.24em] text-brand-gold">
                    DATA {toRoman(index + 1)}
                  </span>
                  <span className="text-[9px] font-black uppercase tracking-[0.24em] text-gray-500">
                    {pad.tags?.length || 0} tags
                  </span>
                </div>

                <h3 className="mb-2 text-lg font-black text-white transition-colors duration-200 group-hover:text-brand-gold font-spaceGrotesk tracking-tight line-clamp-1">
                  {pad.title}
                </h3>
                <p className="mb-3 line-clamp-2 max-w-4xl text-sm leading-6 text-gray-300">
                  {pad.content}
                </p>

                {/* Image Previews */}
                {pad.media && pad.media.length > 0 && (
                  <div className="mb-3 flex gap-2 overflow-x-auto pb-1.5 scrollbar-hide">
                    {pad.media.slice(0, 2).map((img, imgIdx) => (
                      <div
                        key={`${pad._id}-img-${imgIdx}`}
                        className="relative flex-shrink-0 h-14 w-14 overflow-hidden rounded-xl border border-white/8 bg-black/30 transition-all hover:-translate-y-0.5 hover:border-brand-gold/35"
                        onClick={(e) => {
                          e.stopPropagation();
                          onImageClick(img);
                        }}
                      >
                        <img
                          src={img}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                        {imgIdx === 1 && pad.media.length > 2 && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-xs font-black text-white backdrop-blur-sm">
                            +{pad.media.length - 2}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Tags */}
                {pad.tags && pad.tags.length > 0 && (
                  <div className="mb-3 flex items-start gap-2.5">
                    <FaTag className="mt-0.5 h-3.5 w-3.5 text-brand-gold" />
                    <div className="flex flex-wrap gap-2">
                      {pad.tags.slice(0, 2).map((tag, tagIndex) => (
                        <span
                          key={`${pad._id}-tag-${tagIndex}`}
                          className="rounded-full border border-white/8 bg-white/5 px-3 py-1 text-[9px] font-black uppercase tracking-[0.2em] text-gray-200"
                        >
                          {tag}
                        </span>
                      ))}
                      {pad.tags.length > 2 && (
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-brand-gold">
                          +{pad.tags.length - 2} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Timestamp */}
                <div className="flex items-center text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
                  <FaClock className="mr-2 h-3 w-3" />
                  {new Date(pad.updatedAt || pad.createdAt).toLocaleDateString(
                    'en-US',
                    {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    },
                  )}
                </div>
              </div>

              {/* Actions: always visible across all screen sizes */}
              <div className="mt-1 flex items-center gap-2 md:mt-0 md:ml-3">
                <button
                  onClick={(e) => handleExportClick(e, pad)}
                  className="rounded-xl border border-white/10 bg-white/5 p-2 text-gray-300 transition-all duration-200 hover:border-brand-gold/30 hover:bg-brand-gold/10 hover:text-brand-gold focus:outline-none focus:ring-2 focus:ring-brand-gold"
                  title="Export (PDF/DOC/TXT)"
                  aria-label={`Export data: ${pad.title || 'Untitled'}`}
                >
                  <FaDownload className="h-3.5 w-3.5" aria-hidden="true" />
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpen(pad);
                  }}
                  className="rounded-xl border border-brand-gold/15 bg-brand-gold/10 p-2 text-brand-gold transition-all duration-200 hover:bg-brand-gold/20 hover:text-white focus:outline-none focus:ring-2 focus:ring-brand-gold"
                  title="Edit"
                  aria-label={`Edit note: ${pad.title || 'Untitled'}`}
                >
                  <FaEdit className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(pad._id);
                  }}
                  className="rounded-xl border border-red-400/15 bg-red-400/10 p-2 text-red-300 transition-all duration-200 hover:bg-red-400/20 hover:text-white focus:outline-none focus:ring-2 focus:ring-red-400"
                  title="Delete"
                  aria-label={`Delete note: ${pad.title || 'Untitled'}`}
                >
                  <FaTrash className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {exportTarget && (
        <div
          className="fixed inset-0 z-[100] flex items-end justify-center bg-black/55 p-4 backdrop-blur-sm sm:items-center"
          onClick={() => setExportTarget(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Export data"
        >
          <div
            className="w-full max-w-md rounded-3xl border border-white/10 bg-brand-dark-secondary/95 p-5 shadow-[0_25px_90px_rgba(0,0,0,0.5)]"
            onClick={(e) => e.stopPropagation()}
          >
            <h4 className="text-lg font-black uppercase tracking-[0.14em] text-white font-spaceGrotesk">
              Export Data
            </h4>
            <p className="mt-2 text-sm text-gray-300">
              Choose a format for {exportTarget.title || 'Untitled'}.
            </p>

            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <button
                onClick={() => {
                  exportAsPdf(exportTarget);
                  setExportTarget(null);
                }}
                className="rounded-xl border border-brand-gold/25 bg-brand-gold/10 px-4 py-2.5 text-xs font-black uppercase tracking-[0.14em] text-brand-gold transition hover:bg-brand-gold/20"
              >
                PDF
              </button>
              <button
                onClick={() => {
                  exportAsDoc(exportTarget);
                  setExportTarget(null);
                }}
                className="rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-xs font-black uppercase tracking-[0.14em] text-white transition hover:border-brand-gold/30 hover:text-brand-gold"
              >
                DOC
              </button>
              <button
                onClick={() => {
                  exportAsTxt(exportTarget);
                  setExportTarget(null);
                }}
                className="rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-xs font-black uppercase tracking-[0.14em] text-white transition hover:border-brand-gold/30 hover:text-brand-gold"
              >
                TXT
              </button>
            </div>

            <button
              onClick={() => setExportTarget(null)}
              className="mt-4 w-full rounded-xl border border-white/10 bg-transparent px-4 py-2.5 text-xs font-black uppercase tracking-[0.14em] text-gray-300 transition hover:border-white/20 hover:text-white"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default DataPadList;
