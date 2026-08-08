import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const BackButton = ({
  to = -1,
  fallbackTo = '/',
  label = 'Back',
  iconOnly = true,
  onClick,
  className = '',
  ariaLabel,
  type = 'button',
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick();
      return;
    }

    if (typeof to === 'number') {
      if (to < 0 && window.history.length <= 1) {
        navigate(fallbackTo);
        return;
      }

      navigate(to);
      return;
    }

    navigate(to || fallbackTo);
  };

  const baseClass = iconOnly
    ? 'inline-flex items-center justify-center rounded-xl border border-brand-gold/30 bg-brand-gold/10 p-2.5 text-brand-gold transition-all duration-200 hover:bg-brand-gold/20 hover:text-white focus:outline-none focus:ring-2 focus:ring-brand-gold/40'
    : 'inline-flex items-center gap-2 rounded-xl border border-brand-gold/30 bg-brand-gold/10 px-3 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-brand-gold transition-all duration-200 hover:bg-brand-gold/20 hover:text-white focus:outline-none focus:ring-2 focus:ring-brand-gold/40';

  return (
    <button
      type={type}
      onClick={handleClick}
      className={`${baseClass} ${className}`.trim()}
      aria-label={ariaLabel || label}
      title={ariaLabel || label}
    >
      <ArrowLeft className={iconOnly ? 'h-4 w-4' : 'h-3.5 w-3.5'} />
      {!iconOnly && <span>{label}</span>}
    </button>
  );
};

export default BackButton;
