/**
 * Admin Department Configuration
 * 
 * This file defines:
 * - Department keys (from .env)
 * - Authorized emails per department
 * - Route access per department
 * 
 * SUPER department has access to ALL routes
 */

// Department definitions with their routes
export const DEPARTMENTS = {
  SUPER: {
    name: 'Super Admin',
    envKey: 'ADMIN_KEY_SUPER',
    routes: ['*'], // Full access
    description: 'Full access to all admin features'
  },
  USERS: {
    name: 'Users Management',
    envKey: 'ADMIN_KEY_USERS',
    routes: ['dashboard', 'all-users'],
    description: 'Manage platform users and roles'
  },
  PRODUCTS: {
    name: 'Products Management',
    envKey: 'ADMIN_KEY_PRODUCTS',
    routes: ['dashboard', 'all-products'],
    description: 'Manage product listings'
  },
  PAYMENTS: {
    name: 'Payments & RPR',
    envKey: 'ADMIN_KEY_PAYMENTS',
    routes: ['dashboard', 'admin-rpr'],
    description: 'Handle payment verifications'
  },
  ETH: {
    name: 'ETH Withdrawals',
    envKey: 'ADMIN_KEY_ETH',
    routes: ['dashboard', 'eth-requests'],
    description: 'Process ETH withdrawal requests'
  },
  MARKET: {
    name: 'Market Management',
    envKey: 'ADMIN_KEY_MARKET',
    routes: ['dashboard', 'users-market'],
    description: 'Manage user marketplace'
  },
  DATAPAD: {
    name: 'Datapad Management',
    envKey: 'ADMIN_KEY_DATAPAD',
    routes: ['dashboard', 'users-datapad'],
    description: 'Manage user datapads'
  },
  BLOG: {
    name: 'Blog Management',
    envKey: 'ADMIN_KEY_BLOG',
    routes: ['dashboard', 'system-blog'],
    description: 'Create and manage blog posts'
  },
  EARNINGS: {
    name: 'Earnings Management',
    envKey: 'ADMIN_KEY_EARNINGS',
    routes: ['dashboard', 'earnings'],
    description: 'View platform earnings and commissions'
  },
  REPORTS: {
    name: 'Reports Management',
    envKey: 'ADMIN_KEY_REPORTS',
    routes: ['dashboard', 'admin-report', 'anonymous-report'],
    description: 'Handle user reports'
  },
  COMMUNITY: {
    name: 'Community Management',
    envKey: 'ADMIN_KEY_COMMUNITY',
    routes: ['dashboard', 'community-feeds'],
    description: 'Moderate community posts'
  },
  LIVESCRIPT: {
    name: 'LiveScript Management',
    envKey: 'ADMIN_KEY_LIVESCRIPT',
    routes: ['dashboard', 'livescript'],
    description: 'Manage live scripts'
  }
};

/**
 * Authorized emails per department
 * 
 * Add/remove emails here to grant/revoke department access
 * An email can be authorized for multiple departments
 */
export const AUTHORIZED_ADMINS = {
  SUPER: [
    'boardmanxii@gmail.com',
    'secxionxii@gmail.com',
    // Add more super admins here
  ],
  USERS: [
    'boardmanxii@gmail.com',
    // Add users department admins
  ],
  PRODUCTS: [
    'boardmanxii@gmail.com',
    // Add products department admins
  ],
  PAYMENTS: [
    'boardmanxii@gmail.com',
    // Add payments department admins
  ],
  ETH: [
    'boardmanxii@gmail.com',
    // Add ETH department admins
  ],
  MARKET: [
    'boardmanxii@gmail.com',
    // Add market department admins
  ],
  DATAPAD: [
    'boardmanxii@gmail.com',
    // Add datapad department admins
  ],
  BLOG: [
    'boardmanxii@gmail.com',
    // Add blog department admins
  ],
  REPORTS: [
    'boardmanxii@gmail.com',
    // Add reports department admins
  ],
  COMMUNITY: [
    'boardmanxii@gmail.com',
    // Add community department admins
  ],
  LIVESCRIPT: [
    'boardmanxii@gmail.com',
    // Add livescript department admins
  ]
};

/**
 * Get department by key
 * @param {string} key - The department key from login
 * @returns {object|null} - Department info or null
 */
export const getDepartmentByKey = (key) => {
  for (const [deptId, dept] of Object.entries(DEPARTMENTS)) {
    const envKey = process.env[dept.envKey];
    if (envKey && envKey === key) {
      return { id: deptId, ...dept };
    }
  }
  return null;
};

/**
 * Check if email is authorized for department
 * @param {string} email - User email
 * @param {string} departmentId - Department ID
 * @returns {boolean}
 */
export const isEmailAuthorized = (email, departmentId) => {
  const normalizedEmail = email.toLowerCase().trim();
  const authorizedEmails = AUTHORIZED_ADMINS[departmentId] || [];
  return authorizedEmails.map(e => e.toLowerCase().trim()).includes(normalizedEmail);
};

/**
 * Get all routes for a department
 * @param {string} departmentId - Department ID
 * @returns {string[]} - Array of allowed routes
 */
export const getDepartmentRoutes = (departmentId) => {
  const dept = DEPARTMENTS[departmentId];
  if (!dept) return [];
  if (dept.routes.includes('*')) {
    // Super admin - return all routes
    return Object.values(DEPARTMENTS).flatMap(d => d.routes).filter(r => r !== '*');
  }
  return dept.routes;
};

export default {
  DEPARTMENTS,
  AUTHORIZED_ADMINS,
  getDepartmentByKey,
  isEmailAuthorized,
  getDepartmentRoutes
};
