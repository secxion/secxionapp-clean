import jwt from 'jsonwebtoken';
import { getDepartmentRoutes } from '../config/adminDepartments.js';

/**
 * Maps backend API routes to frontend admin panel sections
 * This ensures backend protection matches frontend access
 */
const API_TO_DEPARTMENT_ROUTES = {
  // Users Management APIs
  '/all-user': 'all-users',
  '/update-user': 'all-users',
  '/get-all-users-for-admin': 'all-users',
  '/delete-user': 'all-users',
  
  // Products Management APIs
  '/upload-product': 'all-products',
  '/get-product': 'all-products',
  '/update-product': 'all-products',
  
  // ETH Withdrawal APIs
  '/eth-withdrawals': 'eth-requests',
  '/eth-withdrawal/status': 'eth-requests',
  '/eth-withdrawal-requests': 'eth-requests',
  
  // Market Management APIs
  '/get-all-users-market': 'users-market',
  '/update-market-status': 'users-market',
  
  // Blog Management APIs
  '/create-blog': 'system-blog',
  '/get-blogs': 'system-blog',
  '/update-blog': 'system-blog',
  '/delete-blog': 'system-blog',
  
  // Reports Management APIs
  '/all-reports': 'admin-report',
  '/reply-report': 'admin-report',
  '/anonymous-reports': 'anonymous-report',
  '/anonymous-reports-admin': 'anonymous-report',
  '/submit-anonymous-report-reply': 'anonymous-report',
  
  // Community Management APIs
  '/community/pending': 'community-feeds',
  '/community/approve': 'community-feeds',
  '/community/reject': 'community-feeds',
  
  // Datapad Management APIs
  '/all-datapads-admin': 'users-datapad',
  
  // LiveScript Management APIs
  '/livescript/admin/all': 'livescript',
  '/livescript/admin': 'livescript',
  
  // Payment/RPR Management APIs
  '/pr/getall': 'admin-rpr',
  '/pr/update': 'admin-rpr',
};

/**
 * Check if a route is an admin-only route that needs department verification
 */
const isAdminRoute = (path) => {
  const adminOnlyPatterns = [
    '/all-user',
    '/update-user',
    '/delete-user',
    '/update-product',
    '/upload-product',
    '/eth-withdrawals',
    '/eth-withdrawal',
    '/get-all-users-market',
    '/update-market-status',
    '/create-blog',
    '/update-blog',
    '/delete-blog',
    '/all-reports',
    '/reply-report',
    '/anonymous-reports',
    '/community/pending',
    '/community/approve',
    '/community/reject',
    '/all-datapads-admin',
    '/livescript/admin',
    '/pr/getall',
    '/pr/update',
  ];
  
  return adminOnlyPatterns.some(pattern => path.includes(pattern));
};

/**
 * Get the frontend route that corresponds to a backend API path
 */
const getFrontendRoute = (apiPath) => {
  // Direct mapping
  for (const [api, route] of Object.entries(API_TO_DEPARTMENT_ROUTES)) {
    if (apiPath.includes(api)) {
      return route;
    }
  }
  return null;
};

/**
 * Middleware to verify department access for admin routes
 * 
 * This middleware:
 * 1. Checks if the route is an admin-only route
 * 2. Extracts department from JWT token
 * 3. Verifies the admin has access to the required frontend route
 * 4. Blocks access if unauthorized
 */
export const verifyDepartmentAccess = (req, res, next) => {
  const path = req.path;
  
  // Skip if not an admin route
  if (!isAdminRoute(path)) {
    return next();
  }
  
  // Get token from cookie or header
  const token = req.cookies?.token || req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({
      success: false,
      error: true,
      message: 'Authentication required'
    });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.TOKEN_SECRET_KEY);
    const departmentId = decoded.department;
    
    // If no department in token, deny access to admin routes
    if (!departmentId) {
      return res.status(403).json({
        success: false,
        error: true,
        message: 'Admin department access required. Please login through admin panel.'
      });
    }
    
    // Get allowed frontend routes for this department
    const allowedRoutes = getDepartmentRoutes(departmentId);
    
    // Get the frontend route this API corresponds to
    const requiredRoute = getFrontendRoute(path);
    
    // If we can't map this route, allow access (for safety)
    if (!requiredRoute) {
      console.log(`[DepartmentAuth] No mapping for API: ${path}, allowing access`);
      return next();
    }
    
    // Check if department has access
    const hasAccess = allowedRoutes.includes(requiredRoute) || 
                      allowedRoutes.includes('*') || 
                      allowedRoutes.includes('dashboard');
    
    if (!hasAccess) {
      console.log(`[DepartmentAuth] ACCESS DENIED - Department: ${departmentId}, Route: ${requiredRoute}, Allowed: ${allowedRoutes.join(', ')}`);
      return res.status(403).json({
        success: false,
        error: true,
        message: `Access denied. Your department (${departmentId}) does not have permission to access this resource.`,
        department: departmentId,
        requiredAccess: requiredRoute
      });
    }
    
    // Store department in request for downstream use
    req.adminDepartment = departmentId;
    req.allowedRoutes = allowedRoutes;
    
    next();
  } catch (error) {
    console.error('[DepartmentAuth] Token verification error:', error.message);
    return res.status(401).json({
      success: false,
      error: true,
      message: 'Invalid or expired token'
    });
  }
};

/**
 * Middleware to require specific department access
 * Use this for routes that need specific department access
 * 
 * Usage: router.get('/route', authToken, requireDepartment('PRODUCTS'), controller)
 */
export const requireDepartment = (...allowedDepartments) => {
  return (req, res, next) => {
    const token = req.cookies?.token || req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: true,
        message: 'Authentication required'
      });
    }
    
    try {
      const decoded = jwt.verify(token, process.env.TOKEN_SECRET_KEY);
      const departmentId = decoded.department;
      
      if (!departmentId) {
        return res.status(403).json({
          success: false,
          error: true,
          message: 'Admin department access required'
        });
      }
      
      // SUPER has access to everything
      if (departmentId === 'SUPER') {
        req.adminDepartment = departmentId;
        return next();
      }
      
      // Check if user's department is in allowed list
      if (!allowedDepartments.includes(departmentId)) {
        return res.status(403).json({
          success: false,
          error: true,
          message: `This action requires ${allowedDepartments.join(' or ')} department access`,
          yourDepartment: departmentId
        });
      }
      
      req.adminDepartment = departmentId;
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        error: true,
        message: 'Invalid or expired token'
      });
    }
  };
};

export default verifyDepartmentAccess;
