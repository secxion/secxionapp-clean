import React from 'react';
import PropTypes from 'prop-types';

const AdminPageLayout = ({
  title,
  subtitle,
  icon: Icon,
  actions,
  children,
  className = '',
}) => {
  return (
    <div className={`p-4 lg:p-6 max-w-7xl mx-auto ${className}`.trim()}>
      {(title || subtitle) && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center space-x-3 min-w-0">
            {Icon && (
              <div className="p-2 bg-yellow-500/10 rounded-xl shrink-0">
                <Icon className="text-yellow-500 text-xl" />
              </div>
            )}
            <div className="min-w-0">
              {title && (
                <h1 className="text-xl font-bold text-white truncate">{title}</h1>
              )}
              {subtitle && (
                <p className="text-slate-400 text-sm truncate">{subtitle}</p>
              )}
            </div>
          </div>
          {actions && <div className="shrink-0">{actions}</div>}
        </div>
      )}
      {children}
    </div>
  );
};

AdminPageLayout.propTypes = {
  title: PropTypes.string,
  subtitle: PropTypes.string,
  icon: PropTypes.elementType,
  actions: PropTypes.node,
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

export default AdminPageLayout;
