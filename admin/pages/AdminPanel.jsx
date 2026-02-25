import React, { useState, useMemo, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Outlet, useLocation, useNavigate, Navigate } from 'react-router-dom';
import {
	FaTachometerAlt,
	FaUsers,
	FaBoxOpen,
	FaMoneyBillAlt,
	FaShoppingCart,
	FaMobileAlt,
	FaPenAlt,
	FaFileAlt,
	FaUserSecret,
	FaChartBar,
	FaCode,
	FaBars,
	FaTimes,
	FaEthereum,
	FaArrowLeft,
	FaSignOutAlt,
	FaCoins,
} from 'react-icons/fa';

const AdminPanel = () => {
	const reduxUser = useSelector((state) => state?.user?.user);
	const navigate = useNavigate();
	const location = useLocation();
	const [isSidebarOpen, setIsSidebarOpen] = useState(false);

	// Get user and department from localStorage
	const adminUser = useMemo(() => {
		try {
			return JSON.parse(localStorage.getItem('adminUser')) || reduxUser || { name: 'Admin' };
		} catch {
			return { name: 'Admin' };
		}
	}, [reduxUser]);

	const department = useMemo(() => {
		try {
			return JSON.parse(localStorage.getItem('adminDepartment')) || null;
		} catch {
			return null;
		}
	}, []);

	// Check if authenticated
	const isAuthenticated = localStorage.getItem('adminAuth') === 'true';

	// All available menu items
	const allMenuItems = [
		{ path: 'dashboard', label: 'Dashboard', icon: <FaTachometerAlt /> },
		{ path: 'all-users', label: 'Users', icon: <FaUsers /> },
		{ path: 'all-products', label: 'Products', icon: <FaBoxOpen /> },
		{ path: 'admin-rpr', label: 'Payments', icon: <FaMoneyBillAlt /> },
		{ path: 'eth-requests', label: 'ETH', icon: <FaEthereum /> },
		{ path: 'users-market', label: 'Market', icon: <FaShoppingCart /> },
		{ path: 'earnings', label: 'Earnings', icon: <FaCoins /> },
		{ path: 'users-datapad', label: 'Datapad', icon: <FaMobileAlt /> },
		{ path: 'system-blog', label: 'Blog', icon: <FaPenAlt /> },
		{ path: 'admin-report', label: 'Reports', icon: <FaFileAlt /> },
		{ path: 'anonymous-report', label: 'Anonymous', icon: <FaUserSecret /> },
		{ path: 'community-feeds', label: 'Community', icon: <FaChartBar /> },
		{ path: 'livescript', label: 'LiveScript', icon: <FaCode /> },
	];

	// Filter menu items based on department's allowed routes
	const menuItems = useMemo(() => {
		if (!department?.allowedRoutes) return allMenuItems;
		if (department.allowedRoutes.includes('*')) return allMenuItems; // Wildcard = full access
		return allMenuItems.filter(item => 
			department.allowedRoutes.includes(item.path)
		);
	}, [department]);

	const handleTabClick = (path) => {
		navigate(path);
		setIsSidebarOpen(false);
	};

	const handleLogout = () => {
		localStorage.removeItem('adminAuth');
		localStorage.removeItem('adminUser');
		localStorage.removeItem('adminDepartment');
		navigate('/');
	};

	// Redirect to login if not authenticated
	if (!isAuthenticated) {
		return <Navigate to="/" replace />;
	}

	// Check if current route is allowed
	const currentPath = location.pathname.split('/').pop() || 'dashboard';
	const isCurrentRouteAllowed = () => {
		if (!department?.allowedRoutes) return true;
		if (department.allowedRoutes.includes('*')) return true; // Wildcard = full access
		if (currentPath === 'dashboard') return true; // Dashboard is always allowed
		return department.allowedRoutes.includes(currentPath);
	};

	// Block access to unauthorized routes
	if (!isCurrentRouteAllowed()) {
		return (
			<div className="min-h-screen bg-slate-950 flex items-center justify-center">
				<div className="text-center p-8 bg-slate-900 rounded-2xl border border-red-500/30 max-w-md">
					<div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
						<FaSignOutAlt className="text-red-500 text-2xl" />
					</div>
					<h2 className="text-xl font-bold text-white mb-2">Access Denied</h2>
					<p className="text-slate-400 mb-4">You don't have permission to access this section.</p>
					<p className="text-yellow-500 text-sm mb-6">Your department: {department?.name || 'Unknown'}</p>
					<button
						onClick={() => navigate('/dashboard')}
						className="px-6 py-3 bg-yellow-500 text-slate-900 rounded-xl font-semibold hover:bg-yellow-400 transition-colors"
					>
						Go to Dashboard
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-slate-950">
			{/* Mobile Header */}
			<div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-slate-900 border-b border-slate-800 px-4 py-3">
				<div className="flex items-center justify-between">
					<div className="flex items-center space-x-2">
						<button
							onClick={() => setIsSidebarOpen(!isSidebarOpen)}
							className="p-2 rounded-lg bg-slate-800 text-yellow-500 hover:bg-slate-700 transition-colors"
						>
							{isSidebarOpen ? (
								<FaTimes className="w-5 h-5" />
							) : (
								<FaBars className="w-5 h-5" />
							)}
						</button>
						<button
							onClick={() => navigate('/dashboard')}
							className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white transition-colors"
						>
							<FaArrowLeft className="w-4 h-4" />
						</button>
					</div>
					<div className="flex items-center space-x-3">
						<FaTachometerAlt className="text-yellow-500" />
						<span className="text-white font-semibold">Admin</span>
					</div>
					<div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-500 to-yellow-600 flex items-center justify-center text-slate-900 font-bold text-sm">
						{adminUser?.name?.charAt(0).toUpperCase()}
					</div>
				</div>
			</div>

			{/* Sidebar Overlay (Mobile) */}
			{isSidebarOpen && (
				<div
					className="lg:hidden fixed inset-0 z-30 bg-black/60 backdrop-blur-sm"
					onClick={() => setIsSidebarOpen(false)}
				/>
			)}

			{/* Sidebar */}
			<aside
				className={`fixed top-0 left-0 z-40 h-full w-64 bg-slate-900 border-r border-slate-800 transform transition-transform duration-300 ease-in-out ${
					isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
				} lg:translate-x-0`}
			>
				{/* Sidebar Header */}
				<div className="p-4 border-b border-slate-800">
					<div className="flex items-center space-x-3">
						<div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-500 to-yellow-600 flex items-center justify-center text-slate-900 font-bold">
							{adminUser?.name?.charAt(0).toUpperCase()}
						</div>
						<div className="flex-1 min-w-0">
							<p className="text-white font-semibold truncate">{adminUser?.name}</p>
							<p className="text-yellow-500 text-xs font-medium uppercase tracking-wide">
								{department?.name || 'Admin'}
							</p>
						</div>
					</div>
				</div>

				{/* Navigation */}
				<nav className="p-3 space-y-1 overflow-y-auto h-[calc(100vh-180px)]">
					{menuItems.map(({ path, label, icon }) => {
						const isActive = location.pathname.includes(path);
						return (
							<button
								key={path}
								onClick={() => handleTabClick(path)}
								className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
									isActive
										? 'bg-gradient-to-r from-yellow-500/20 to-yellow-600/10 text-yellow-500 border border-yellow-500/30'
										: 'text-slate-400 hover:bg-slate-800 hover:text-white'
								}`}
							>
								<span
									className={`text-lg ${isActive ? 'text-yellow-500' : ''}`}
								>
									{icon}
								</span>
								<span>{label}</span>
							</button>
						);
					})}
				</nav>

				{/* Logout */}
				<div className="absolute bottom-0 left-0 right-0 p-3 border-t border-slate-800 bg-slate-900">
					<button
						onClick={handleLogout}
						className="w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-xl text-sm font-medium bg-slate-800 text-slate-300 hover:bg-red-600/20 hover:text-red-400 transition-all duration-200"
					>
						<FaSignOutAlt className="text-lg" />
						<span>Logout</span>
					</button>
				</div>
			</aside>

			{/* Main Content */}
			<main className="lg:ml-64 min-h-screen pt-16 lg:pt-0">
				{/* Desktop Header */}
				<div className="hidden lg:flex items-center justify-between p-6 border-b border-slate-800 bg-slate-900/50 backdrop-blur-xl sticky top-0 z-20">
					<div className="flex items-center space-x-4">
						<button
							onClick={() => navigate('/dashboard')}
							className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white transition-colors"
							title="Back to Dashboard"
						>
							<FaArrowLeft className="w-4 h-4" />
						</button>
					</div>
					<div className="flex items-center space-x-4">
						<span className="text-slate-400 text-sm">Welcome back,</span>
						<span className="text-yellow-500 font-semibold">{adminUser?.name}</span>
					</div>
				</div>

				{/* Content Area */}
				<div className="p-4 lg:p-6">
					<div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-800 min-h-[calc(100vh-180px)] lg:min-h-[calc(100vh-140px)]">
						<Outlet />
					</div>
				</div>
			</main>
		</div>
	);
};

export default AdminPanel;