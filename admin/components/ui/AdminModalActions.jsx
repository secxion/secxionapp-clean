import React from 'react';

const joinClasses = (...classes) => classes.filter(Boolean).join(' ');

const AdminModalActions = ({
  children,
  stacked = false,
  padded = true,
  divider = true,
  className = '',
}) => {
  return (
    <div
      className={joinClasses(
        divider && 'border-t border-slate-700',
        stacked ? 'flex flex-col gap-3' : 'flex flex-wrap items-center gap-3',
        padded ? 'p-4' : 'pt-4',
        className,
      )}
    >
      {children}
    </div>
  );
};

export default AdminModalActions;
