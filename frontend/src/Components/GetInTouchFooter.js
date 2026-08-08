import React from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight, Headphones } from 'lucide-react';

const GetInTouchFooter = ({ fixed = true }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/report');
  };

  const footer = (
    <footer
      className={`${
        fixed ? 'fixed bottom-0 left-0 right-0 z-40' : 'relative w-full'
      } border-t border-brand-gold/25 bg-brand-dark-elevated/95 px-4 py-3 shadow-[0_-12px_35px_rgba(0,0,0,0.35)] backdrop-blur-xl`}
    >
      <div className="mx-auto flex max-w-7xl items-center gap-3 sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-brand-gold/25 bg-brand-gold/10 text-brand-gold">
            <Headphones className="h-5 w-5" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="font-spaceGrotesk text-[9px] font-black uppercase tracking-[0.25em] text-brand-gold/70">
              Secxion Support
            </p>
            <p className="max-w-[9rem] text-xs font-bold leading-tight text-white sm:max-w-none sm:text-sm">
              Can't find what you're looking for?
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleClick}
          className="ml-auto inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-lg bg-brand-gold px-4 font-spaceGrotesk text-[10px] font-black uppercase tracking-[0.16em] text-brand-dark-base shadow-[0_8px_24px_rgba(212,175,55,0.2)] transition-colors hover:bg-yellow-300 focus:outline-none focus:ring-2 focus:ring-brand-gold focus:ring-offset-2 focus:ring-offset-brand-dark-elevated"
          aria-label="Open Secxion support report"
        >
          <span className="hidden sm:inline">Contact Support</span>
          <span className="sm:hidden">Support</span>
          <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </footer>
  );

  if (fixed && typeof document !== 'undefined') {
    return createPortal(footer, document.body);
  }

  return footer;
};

export default GetInTouchFooter;
