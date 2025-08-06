import { useContext, useState, useMemo, useCallback, useEffect, useRef } from "react";
import { FcSearch } from "react-icons/fc";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { setUserDetails } from "../store/userSlice";
import Context from "../Context";
import { useSound } from "../Context/SoundContext";
import { useDebounce } from "../hooks/useDebounce";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faSignOutAlt, faVolumeUp, faVolumeMute, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { PiBell } from 'react-icons/pi';
import notificationSound from '../Assets/notification.mp3';
import SummaryApi from "../common";
import { BiSearch } from 'react-icons/bi';
import SidePanel from "./SidePanel";
import NotificationBadge from "../helper/NotificationBadge";
import LogoShimmer from "./LogoShimmer";

const Header = () => {
  const dispatch = useDispatch();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useSelector((state) => state.user);
  const { soundEnabled, toggleSound } = useSound();
  const { token } = useContext(Context);
  const navigate = useNavigate();
  const location = useLocation();

  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const [animateNotification, setAnimateNotification] = useState(false);
  const audioRef = useRef(null);

  const searchQuery = useMemo(() => {
    const URLSearch = new URLSearchParams(location.search);
    return URLSearch.get("q") || "";
  }, [location]);
  const [search, setSearch] = useState(searchQuery);
  const debouncedSearch = useDebounce(search, 300);

  const playNotificationSound = () => {
    if (soundEnabled && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(err => {
        console.warn("Notification sound failed:", err);
      });
    }
  };

  const triggerVibration = () => {
    if (navigator.vibrate) {
      navigator.vibrate([100, 50, 100]);
    }
  };

  const truncateWords = (text, limit) => {
    const words = text.split(/\s+/);
    if (words.length > limit) {
      return {
        truncated: words.slice(0, limit).join(' ') + '...',
        original: text,
        isTruncated: true,
      };
    }
    return { truncated: text, original: text, isTruncated: false };
  };

  const fetchUnreadCount = useCallback(async () => {
    if (user?._id) {
      try {
        const response = await fetch(SummaryApi.notificationCount.url, {
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        });
        const data = await response.json();
        if (data.success) {
          setUnreadNotificationCount(data.count);
        }
      } catch (error) {
        console.error("❌ Error fetching unread count:", error);
      }
    }
  }, [user?._id]);

  const fetchNewNotifications = useCallback(async () => {
    if (user?._id) {
      try {
        const response = await fetch(SummaryApi.getNewNotifications.url, {
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        });
        const data = await response.json();
        if (data.success && Array.isArray(data.newNotifications)) {
          const latest = data.newNotifications[0];
          const lastShownId = localStorage.getItem('lastNotifiedId');
          if (latest && latest._id !== lastShownId) {
            localStorage.setItem('lastNotifiedId', latest._id);
            setPopupMessage(latest.message || "New notification received!");
            setShowPopup(true);
            setAnimateNotification(true);
            playNotificationSound();
            triggerVibration();
            setTimeout(() => setAnimateNotification(false), 2000);
            setTimeout(() => setShowPopup(false), 4000);
          }
        }
      } catch (error) {
        console.error("❌ Error fetching new notifications:", error);
      }
    }
  }, [user?._id]);

  useEffect(() => {
    if (debouncedSearch.trim()) {
      navigate(`/search?q=${encodeURIComponent(debouncedSearch)}`);
    }
  }, [debouncedSearch, navigate]);

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

  useEffect(() => {
    fetchUnreadCount();
    fetchNewNotifications();
    const unreadInterval = setInterval(fetchUnreadCount, 5000);
    const notifyInterval = setInterval(fetchNewNotifications, 5000);
    return () => {
      clearInterval(unreadInterval);
      clearInterval(notifyInterval);
    };
  }, [fetchUnreadCount, fetchNewNotifications]);

  const goBack = () => navigate(-1);
  const toggleMobileMenu = () => setMobileMenuOpen(prev => !prev);
  const closeMobileMenu = () => setMobileMenuOpen(false);
  const truncatedMessage = useMemo(() => truncateWords(popupMessage, 10), [popupMessage]);

  // Hide menu buttons based on current route
  const hideTradeStatus = location.pathname === "/record";
  const hideDataPad = location.pathname === "/datapad";

  return (
    <header className="fixed z-40 bg-white text-black right-0 left-0 top-0 px-4 sm:px-6 lg:px-8 shadow-sm flex flex-col gap-2 sm:mt-9 md:mt-9 lg:mt-9 mt-9 ">
      <div className="flex items-center justify-between min-h-[48px]">
        <div className="flex items-center justify-between md:mt-1 md:pt-1 lg:mt-1 lg:pt-1 w-full">
          <div className="flex items-center gap-4">
            <button onClick={toggleMobileMenu} className="text-gray-700 mt-1 md:hidden">
              <FontAwesomeIcon icon={faBars} className="h-6 w-6 glossy-text" />
            </button>

            <div className="md:hidden flex-1 flex items-center mt-1 justify-center">
              <div className="flex items-center ml-4 py-1 w-full max-w-[200px]">
                <BiSearch className="text-yellow-700 h-4 w-4 mr-1 glossy-text" />
                <input
                  type="text"
                  placeholder="gift cards, vc, cc...."
                  className="bg-transparent text-black text-xs outline-none w-full placeholder:text-[14px] placeholder-gray-500 glossy-text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
          </div>

          <Link to="/home" className="relative hidden md:flex items-center font-bold text-yellow-600 tracking-wide">
            <div className=" flex py-1 flex-col justify-center">
              <div className="relative py-2  sm:mx-auto ">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-blue-500 shadow-lg transform rounded-3xl border-4 border-yellow-700"></div>
                <div className="relative px-4 p-1.5 bg-white shadow-lg rounded-2xl sm:p-1.5 border-4 border-yellow-700">
                  <div className="">
                    <div className="grid grid-cols-1">
                      <LogoShimmer type="button" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Link>

          <div className="hidden md:flex gap-3 items-center">
            {location.pathname === "/search" && (
              <button onClick={goBack} className="text-yellow-600 hover:text-yellow-800">
                <FontAwesomeIcon icon={faArrowLeft} className="h-5 w-5 glossy-text" />
              </button>
            )}

            <div className="flex items-center  px-3 py-1 w-64">
              <FcSearch className="text-gray-600 h-4 w-4 mr-2 glossy-text" />
              <input
                type="text"
                placeholder="gift cards, vc, cc..."
                className="bg-transparent text-black text-sm outline-none w-full placeholder:text-sm placeholder-gray-500 glossy-text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <nav className="flex items-center justify-between mx-auto gap-3 text-xs">
              {!hideTradeStatus && (
                <Link to="/record" className="px-2 py-1 border-4 border-cyan-700 text-black hover:bg-cyan-600 hover:text-black rounded glossy-text">
                  Trade Status
                </Link>
              )}
              {!hideDataPad && (
                <Link to="/datapad" className="px-3 py-1 border-4 border-yellow-700 text-black hover:bg-yellow-500 hover:text-black rounded glossy-text">
                  DataPad
                </Link>
              )}
            </nav>
          </div>

          <button
            onClick={toggleSound}
            className="px-3 py-1  ml-4  text-black hover:text-blue-500 rounded flex items-center glossy-text"
          >
            <FontAwesomeIcon icon={soundEnabled ? faVolumeUp : faVolumeMute} className="mr-1" />
          </button>
        </div>
      </div>

      <audio ref={audioRef} src={notificationSound} preload="auto" />
      <SidePanel
        open={mobileMenuOpen}
        setOpen={setMobileMenuOpen}
        handleLogout={handleLogout}
        loading={loading}
        onCloseMenu={closeMobileMenu}
      />
    </header>
  );
};

export default Header;