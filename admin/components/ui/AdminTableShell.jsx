import React from 'react';

const joinClasses = (...classes) => classes.filter(Boolean).join(' ');

const AdminTableShell = ({ children, className = '', contentClassName = '' }) => {
  return (
    <div className={joinClasses('admin-table-shell', className)}>
      <div
        className={joinClasses(
          'overflow-x-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent',
          contentClassName,
        )}
      >
        {children}
      </div>
    </div>
  );
};

export default AdminTableShell;
