import React, { useContext, useEffect, useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Home, Settings, Shield } from "lucide-react";
import { useSelector } from "react-redux";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FaCaretDown } from "react-icons/fa";
import ROLE from "../common/role";
import "./Net.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { useDispatch } from "react-redux";
import Context from "../Context";
import NotificationBadge from "../helper/NotificationBadge";
import { toast } from "react-toastify";
import { setUserDetails } from "../store/userSlice";
import SummaryApi from "../common";

// A custom, accessible dialog component
const CustomDialog = ({ open, onOpenChange, children, title, description }) => {
    const dialogRef = useRef(null);

    // Close dialog on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dialogRef.current && !dialogRef.current.contains(event.target) && open) {
                onOpenChange(false);
            }
        };
        if (open) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [open, onOpenChange]);

    // Close dialog on 'Escape' key press
    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'Escape' && open) {
                onOpenChange(false);
            }
        };
        if (open) {
            window.addEventListener('keydown', handleKeyDown);
        }
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [open, onOpenChange]);

    if (!open) return null;

    return (
        <div className="net-container fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <motion.div
                ref={dialogRef}
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md mx-4 border-4 border-yellow-500" // Added bold yellow border
                role="dialog"
                aria-modal="true"
                aria-labelledby="dialog-title"
                aria-describedby="dialog-description"
            >
                {title && (
                    <h2 id="dialog-title" className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 glossy-heading"> {/* Applied glossy-heading */}
                        {title}
                    </h2>
                )}
                {description && (
                    <div id="dialog-description" className="text-gray-600 mb-6 max-h-60 overflow-y-auto glossy-text"> {/* Applied glossy-text */}
                        <p className="leading-relaxed">{description}</p>
                    </div>
                )}
                {children}
                <button
                    onClick={() => onOpenChange(false)}
                    className="w-full mt-4 px-4 py-3 bg-gray-800 text-white rounded-xl font-medium hover:bg-gray-900 transition-colors duration-200 shadow-md hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98] glossy-text" // Applied glossy-text
                >
                    Close
                </button>
            </motion.div>
        </div>
    );
};


const Net = ({ blogs }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const timeoutRef = useRef(null);
    const [loading, setLoading] = useState(false);
    const [transitionClass, setTransitionClass] = useState("translate-x-0");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedBlog, setSelectedBlog] = useState(null);
    const [screenSize, setScreenSize] = useState({
        isMobile: false,
        isTablet: false,
        isDesktop: true
    });
    const dispatch = useDispatch();
    const { token } = useContext(Context);
    const navigate = useNavigate();
    const location = useLocation();

    const { user } = useSelector((state) => state.user);
    const { profilePic, name, role } = user || {};

    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    // Utility function to handle responsive text truncation
    const getResponsiveText = (text, mobileLength, tabletLength, desktopLength) => {
        if (!text) return '';

        let maxLength;
        if (screenSize.isMobile) {
            maxLength = mobileLength;
        } else if (screenSize.isTablet) {
            maxLength = tabletLength;
        } else {
            maxLength = desktopLength;
        }

        return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
    };

    // Screen size detection
    const updateScreenSize = useCallback(() => {
        const width = window.innerWidth;
        setScreenSize({
            isMobile: width < 640,
            isTablet: width >= 640 && width < 1024,
            isDesktop: width >= 1024
        });
    }, []);

    useEffect(() => {
        updateScreenSize();
        window.addEventListener('resize', updateScreenSize);
        return () => window.removeEventListener('resize', updateScreenSize);
    }, [updateScreenSize]);

    // Handle dropdown outside clicks
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target) &&
                !event.target.closest('.user-profile-section')
            ) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleBlogClick = (blog) => {
        setSelectedBlog(blog);
        setIsDialogOpen(true);
    };
    // Blog rotation with smooth transitions
    useEffect(() => {
        const resetTimeout = () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };

        const nextBlog = () => {
            resetTimeout();
            setTransitionClass("translate-x-full opacity-0");
            setTimeout(() => {
                setCurrentIndex((prevIndex) => (prevIndex + 1) % blogs.length);
                setTransitionClass("translate-x-0 opacity-100");
                timeoutRef.current = setTimeout(nextBlog, 15000);
            }, 600);
        };

        if (blogs && blogs.length > 0) {
            setLoading(true);
            timeoutRef.current = setTimeout(() => {
                setLoading(false);
                if (blogs.length > 1) {
                    timeoutRef.current = setTimeout(nextBlog, 15000);
                }
            }, 1000);
        }

        return () => resetTimeout();
    }, [blogs]);

    const currentBlog = blogs && blogs.length > 0 ? blogs[currentIndex] : null;

    // Get responsive text lengths based on screen size
    const getNameLength = () => screenSize.isMobile ? 8 : screenSize.isTablet ? 15 : 20;
    const getTitleLength = () => screenSize.isMobile ? 12 : screenSize.isTablet ? 30 : 50;
    const getContentLength = () => screenSize.isMobile ? 20 : screenSize.isTablet ? 60 : 120;

    // Determine the current route
    const currentRoute = location.pathname;

    // Add logout function similar to SidePanel
    const handleLogout = useCallback(async () => {
        setLoading(true);
        try {
            const response = await fetch(SummaryApi.logout_user.url, {
                method: SummaryApi.logout_user.method,
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });
            const data = await response.json();
            if (data.success) {
                toast.success(data.message);
                dispatch(setUserDetails(null));
                navigate("/");
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error("Logout failed. Please try again.");
        } finally {
            setLoading(false);
        }
    }, [dispatch, navigate, token]);

    return (
        <div className="net-container fixed top-0 left-0 w-full bg-yellow-400 h-9 shadow-sm md:h-11 px-2 md:px-4 lg:px-6 flex items-center font-mono text-gray-900 transition-all duration-300 z-50"> {/* Black border applied */}


            {/* User Profile Section */}
            {(profilePic && name) && (
                <div className="user-profile-section relative flex items-center mr-3 md:mr-6 lg:mr-8 shrink-0">


                    <div
                        className="ml-2 md:ml-3 flex items-center cursor-pointer group"
                        onClick={toggleDropdown}
                    >
                        <FaCaretDown
                            className={`w-7 h-7 md:w-7 md:h-7 ml-1 md:ml-1.5 text-gray-500 hover:text-black transition-transform duration-300 glossy-text ${isDropdownOpen ? 'rotate-180' : ''
                                }`}
                        />
                    </div>

                    {/* Dropdown Menu */}
                    {isDropdownOpen && (
                        <motion.div
                            ref={dropdownRef}
                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                            className="absolute top-full left-0 mt-2 w-52 bg-white rounded-xl shadow-lg py-2 z-50 border-4 border-yellow-500" // Added bold yellow border
                        >
                            <div className=" flex px-4 py-3 border-b border-gray-100">
                                <p className="text-sm font-bold text-gray-800 truncate glossy-text">{name}</p>
                                {user?._id && (
                                    <button
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setIsDropdownOpen(false);
                                            handleLogout();
                                        }}
                                        disabled={loading}
                                        className="px-1 py-1 -mt-1 text-xs ml-20 border-4 border-red-700 text-black rounded flex items-center glossy-text disabled:opacity-50"
                                    >
                                        <FontAwesomeIcon icon={faSignOutAlt} className="mr-1" />
                                    </button>
                                )}
                            </div>

                            {/* Conditionally render Home link */}
                            {currentRoute !== '/home' && (
                                <Link
                                    to="/home"
                                    className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 transition-colors duration-150 group glossy-text" // Applied glossy-text
                                    onClick={() => setIsDropdownOpen(false)}
                                >
                                    <Home className="w-4 h-4 mr-3 text-gray-500 group-hover:text-blue-600" />
                                    <span className="group-hover:text-blue-600">Home</span>
                                </Link>
                            )}

                            {/* Conditionally render Admin Panel link */}
                            {user?.role === ROLE.ADMIN && currentRoute !== '/admin-panel' && (
                                <Link
                                    to="/admin-panel"
                                    className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-purple-50 transition-colors duration-150 group glossy-text" // Applied glossy-text
                                    onClick={() => setIsDropdownOpen(false)}
                                >
                                    <Shield className="w-4 h-4 mr-3 text-gray-500 group-hover:text-purple-600" />
                                    <span className="group-hover:text-purple-600">Admin Panel</span>
                                </Link>
                            )}

                            {/* Conditionally render Profile Settings link */}
                            {currentRoute !== '/profile' && (
                                <Link
                                    to="/profile"
                                    className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-green-50 transition-colors duration-150 group glossy-text" // Applied glossy-text
                                    onClick={() => setIsDropdownOpen(false)}
                                >
                                    <Settings className="w-4 h-4 mr-3 text-gray-500 group-hover:text-green-600" />
                                    <span className="group-hover:text-green-600">Profile Settings</span>
                                </Link>
                            )}


                        </motion.div>
                    )}
                </div>
            )}
            <Link to="/notifications" title="Notifications" aria-label="Notifications">
                <div className="relative ml-2 h-6 w-7 pr-8 mr-4">
                    <NotificationBadge />
                </div>
            </Link>

            {/* News Ticker Section */}
            <div className="flex-grow relative h-8 md:h-10 overflow-hidden flex items-center min-w-0">
                {loading ? (
                    <div className="flex items-center space-x-3">
                        <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-gray-400/70 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-gray-400/70 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-gray-400/70 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                        <span className="text-xs md:text-sm font-medium text-gray-500 glossy-text">Loading latest news...</span>
                    </div>
                ) : currentBlog ? (
                    <motion.div
                        className={`absolute inset-0 flex items-center transition-all duration-600 ease-in-out ${transitionClass}`}
                        initial={{ opacity: 0, x: 100 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <div className="flex items-center space-x-2 md:space-x-4 cursor-pointer group w-full" onClick={() => handleBlogClick(currentBlog)}>
                            <div className="flex items-center space-x-2 md:space-x-3 flex-shrink-0">
                                <div className="relative">
                                    <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-yellow-400 rounded-full border border-yellow-600"></div> {/* Added yellow border */}
                                    <div className="absolute inset-0 w-1.5 h-1.5 md:w-2 md:h-2 bg-yellow-400 rounded-full animate-ping"></div>
                                </div>
                                <span className="text-xs md:text-sm lg:text-base font-bold text-yellow-600  transition-colors duration-300 glossy-text"> {/* Applied glossy-text */}
                                    {getResponsiveText(currentBlog.title, getTitleLength(), getTitleLength(), currentBlog.title.length)}
                                </span>
                            </div>

                            <ArrowRight className="w-3 h-3 md:w-4 md:h-4 text-gray-400   flex-shrink-0 glossy-text" /> {/* Applied glossy-text */}

                            <span className="text-xs md:text-sm font-medium text-gray-800  truncate flex-grow glossy-text"> {/* Applied glossy-text */}
                                {getResponsiveText(currentBlog.content, getContentLength(), getContentLength(), currentBlog.content.length)}
                            </span>
                        </div>
                    </motion.div>
                ) : (
                    <div className="flex items-center space-x-2 text-gray-500">
                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full opacity-50 border border-gray-600"></div> {/* Added border */}
                        <span className="italic text-xs md:text-sm glossy-text">No news available at the moment</span> {/* Applied glossy-text */}
                    </div>
                )}
            </div>

            {/* Blog count indicator */}
            {blogs && blogs.length > 1 && (
                <div className="hidden md:flex items-center space-x-1 ml-4 text-gray-400 text-xs glossy-text"> {/* Applied glossy-text */}
                    <span>{currentIndex + 1}</span>
                    <div className="w-1 h-1 bg-gray-400/70 rounded-full border border-gray-600"></div> {/* Added border */}
                    <span>{blogs.length}</span>
                </div>
            )}

            {/* Blog Details Dialog */}
            <CustomDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                title={selectedBlog?.title}
                description={selectedBlog?.content}
            />
        </div>
    );
};

export default Net;