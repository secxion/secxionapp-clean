import {
  useContext,
  useState,
  useMemo,
  useCallback,
  useEffect,
  useRef,
} from 'react';
import { FcSearch } from 'react-icons/fc';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { setUserDetails } from '../store/userSlice';
import Context from '../Context';
import { useSound } from '../Context/SoundContext';
import { useDebounce } from '../hooks/useDebounce';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBars,
  faVolumeUp,
  faVolumeMute,
  faVolumeDown,
  faArrowLeft,
} from '@fortawesome/free-solid-svg-icons';
import notificationSound from '../Assets/notification.mp3';
import SummaryApi from '../common';
import { BiSearch } from 'react-icons/bi';
import SidePanel from './SidePanel';
import Slogo from '../app/slogo.png';
import DataPadButtonImg from '../app/Buttons/datapadbutton.png';
import TradeStatusButtonImg from '../app/Buttons/tradestatusbutton.png';

const nftButton =
  'nft-btn inline-flex items-center justify-center px-5 py-2 rounded-xl font-bold text-base transition-all duration-200 shadow-[0_2px_8px_rgba(0,0,0,0.08)] border-2 border-yellow-600 bg-gradient-to-br from-yellow-400 via-yellow-200 to-yellow-500 hover:from-yellow-500 hover:to-yellow-700 text-gray-900 hover:text-yellow-900 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2';

const ghostButton =
  'nft-btn inline-flex items-center justify-center px-4 py-1 rounded-xl font-bold text-base transition-all duration-200 border-2 border-yellow-600 bg-white/10 hover:bg-yellow-700/10 text-yellow-600 hover:text-yellow-900 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2';

// Clean gradient search input style
const searchInputStyle = `
  w-full 
  bg-gradient-to-r from-gray-50 to-white 
  border-2 border-transparent 
  bg-clip-padding
  rounded-full 
  py-3 px-4
  text-gray-800 
  placeholder-gray-500
  shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)]
  focus:outline-none 
  focus:ring-2 
  focus:ring-yellow-400/50
  focus:border-yellow-400
  focus:shadow-[inset_0_2px_4px_rgba(0,0,0,0.06),0_0_0_3px_rgba(251,191,36,0.1)]
  transition-all 
  duration-300 
  ease-in-out
  backdrop-blur-sm
`;

const mobileSearchInputStyle = `
  w-full 
  bg-gradient-to-r from-gray-50 to-white 
  border border-gray-200
  rounded-full 
  py-2 px-3
  text-gray-800 
  placeholder-gray-500
  shadow-sm
  focus:outline-none 
  focus:ring-2 
  focus:ring-yellow-400/50
  focus:border-yellow-400
  transition-all 
  duration-300 
  ease-in-out
  text-sm
`;

const Header = () => {
  const dispatch = useDispatch();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useSelector((state) => state.user);
  const { soundEnabled, toggleSound, volume, setVolume } = useSound();
  const { token } = useContext(Context);
  const navigate = useNavigate();
  const location = useLocation();

  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const [animateNotification, setAnimateNotification] = useState(false);
  const [showVolumeControl, setShowVolumeControl] = useState(false);
  const audioRef = useRef(null);
  const volumeControlRef = useRef(null);

  const searchQuery = useMemo(() => {
    const URLSearch = new URLSearchParams(location.search);
    return URLSearch.get('q') || '';
  }, [location]);
  const [search, setSearch] = useState(searchQuery);
  const debouncedSearch = useDebounce(search, 300);

  // Fixed playNotificationSound function that respects sound settings
  const playNotificationSound = useCallback(() => {
    if (soundEnabled && audioRef.current) {
      try {
        audioRef.current.volume = volume; // Apply current volume
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch((err) => {
          console.warn('Notification sound failed:', err);
        });
      } catch (error) {
        console.warn('Error playing notification sound:', error);
      }
    }
  }, [soundEnabled, volume]);

  // Set audio volume when volume changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

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
        console.error('❌ Error fetching unread count:', error);
      }
    }
  }, [user?._id]);

  const fetchNewNotifications = useCallback(async () => {
    if (user?._id) {
      try {
        const response = await fetch(SummaryApi.getNewNotifications.url, {
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        });
        const data = await response.json();
        if (data.success && Array.isArray(data.newNotifications)) {
          const latest = data.newNotifications[0];
          const lastShownId = localStorage.getItem('lastNotifiedId');
          if (latest && latest._id !== lastShownId) {
            localStorage.setItem('lastNotifiedId', latest._id);
            setPopupMessage(latest.message || 'New notification received!');
            setShowPopup(true);
            setAnimateNotification(true);
            playNotificationSound(); // This now respects sound settings
            triggerVibration();
            setTimeout(() => setAnimateNotification(false), 2000);
            setTimeout(() => setShowPopup(false), 4000);
          }
        }
      } catch (error) {
        console.error('❌ Error fetching new notifications:', error);
      }
    }
  }, [user?._id, playNotificationSound]);

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
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        toast.success(data.message);
        dispatch(setUserDetails(null));
        navigate('/');
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error('Logout failed. Please try again.');
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

  // Close volume control when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        volumeControlRef.current &&
        !volumeControlRef.current.contains(event.target)
      ) {
        setShowVolumeControl(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Volume control functions
  const handleVolumeChange = (newVolume) => {
    setVolume(newVolume);
    // Play a brief sound to test volume
    if (soundEnabled && audioRef.current) {
      audioRef.current.volume = newVolume;
      audioRef.current.currentTime = 0;
      audioRef.current
        .play()
        .catch((err) => console.warn('Volume test sound failed:', err));
    }
  };

  const getVolumeIcon = () => {
    if (!soundEnabled) return faVolumeMute;
    if (volume === 0) return faVolumeMute;
    if (volume < 0.5) return faVolumeDown;
    return faVolumeUp;
  };

  const getVolumeColor = () => {
    if (!soundEnabled) return 'text-red-400';
    if (volume === 0) return 'text-red-400';
    if (volume < 0.5) return 'text-yellow-400';
    return 'text-green-400';
  };

  const goBack = () => navigate(-1);
  const toggleMobileMenu = () => setMobileMenuOpen((prev) => !prev);
  const closeMobileMenu = () => setMobileMenuOpen(false);
  const truncatedMessage = useMemo(
    () => truncateWords(popupMessage, 10),
    [popupMessage],
  );

  // Hide menu buttons based on current route
  const hideTradeStatus = location.pathname === '/record';
  const hideDataPad = location.pathname === '/datapad';

  return (
    <header className="fixed z-40 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white right-0 left-0 top-0 px-4 sm:px-6 lg:px-8 shadow-lg border-b border-gray-700 flex flex-col gap-2 sm:mt-9 md:mt-9 lg:mt-9 mt-9">
      <div className="flex items-center justify-between min-h-[48px]">
        <div className="flex items-center justify-between md:mt-1 md:pt-1 lg:mt-1 lg:pt-1 w-full">
          <div className="flex items-center gap-4">
            <button
              onClick={toggleMobileMenu}
              className="inline-flex items-center justify-center px-4 py-1 rounded-xl font-bold text-base transition-all duration-200 border-2 border-yellow-600 bg-gray-800/50 hover:bg-yellow-700/20 text-yellow-400 hover:text-yellow-300 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 text-gray-100 mt-1 md:hidden"
              aria-label="Open menu"
            >
              <FontAwesomeIcon icon={faBars} className="h-6 w-6" />
            </button>

            <div className="md:hidden flex-1 flex items-center mt-1 justify-center">
              <div className="relative w-full max-w-[220px]">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                  <BiSearch className="text-yellow-400 h-4 w-4" />
                </div>
                <input
                  type="text"
                  placeholder="Search assets..."
                  className="w-full bg-gray-800/70 border border-gray-600 rounded-full py-2 px-3 pl-10 pr-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400 transition-all duration-300 ease-in-out text-sm"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Logo block */}
          <Link
            to="/home"
            className="relative hidden md:flex items-center font-bold text-yellow-400 tracking-wide"
          >
            <img
              src={Slogo}
              alt="Slogo Logo"
              className="w-12 h-12 object-contain"
              style={{ display: 'block' }}
            />
          </Link>

          <div className="hidden md:flex gap-3 items-center">
            {location.pathname === '/search' && (
              <button
                onClick={goBack}
                className="inline-flex items-center justify-center px-4 py-1 rounded-xl font-bold text-base transition-all duration-200 border-2 border-yellow-600 bg-gray-800/50 hover:bg-yellow-700/20 text-yellow-400 hover:text-yellow-300 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
                aria-label="Go back"
              >
                <FontAwesomeIcon icon={faArrowLeft} className="h-5 w-5" />
              </button>
            )}

            <div className="relative w-72">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                <FcSearch className="text-gray-400 h-5 w-5" />
              </div>
              <input
                type="text"
                placeholder="Search gift cards, vc, cc..."
                className="w-full bg-gray-800/70 border border-gray-600 rounded-full py-2 px-3 pl-10 pr-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400 transition-all duration-300 ease-in-out text-sm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <nav className="flex items-center justify-between mx-auto gap-3 text-xs">
              {!hideTradeStatus && (
                <Link
                  to="/record"
                  className="group relative flex items-center transition-all duration-300 ease-in-out transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-opacity-50 rounded-lg"
                  style={{
                    padding: '4px',
                    border: 'none',
                    background: 'none',
                    height: '52px',
                    alignItems: 'center',
                    overflow: 'hidden',
                  }}
                >
                  {/* Overlay to prevent flash */}
                  <div className="absolute inset-0 bg-gray-800/0 group-hover:bg-gray-800/10 group-active:bg-gray-800/20 transition-all duration-200 rounded-lg"></div>

                  <img
                    src={TradeStatusButtonImg}
                    alt="Trade Status"
                    className="relative z-10 object-contain transition-all duration-300 ease-in-out group-hover:brightness-110 group-active:brightness-90 select-none"
                    style={{
                      height: '100px',
                      width: 'auto',
                      maxHeight: '110px',
                      maxWidth: '120px',
                      display: 'block',
                      filter: 'brightness(1) contrast(1)',
                      WebkitUserSelect: 'none',
                      userSelect: 'none',
                    }}
                    draggable={false}
                  />
                </Link>
              )}

              {!hideDataPad && (
                <Link
                  to="/datapad"
                  className="group relative flex items-center transition-all duration-300 ease-in-out transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-opacity-50 rounded-lg"
                  style={{
                    padding: '4px',
                    border: 'none',
                    background: 'none',
                    height: '52px',
                    alignItems: 'center',
                    overflow: 'hidden',
                  }}
                >
                  {/* Overlay to prevent flash */}
                  <div className="absolute inset-0 bg-gray-800/0 group-hover:bg-gray-800/10 group-active:bg-gray-800/20 transition-all duration-200 rounded-lg"></div>

                  <img
                    src={DataPadButtonImg}
                    alt="DataPad"
                    className="relative z-10 object-contain transition-all duration-300 ease-in-out group-hover:brightness-110 group-active:brightness-90 select-none"
                    style={{
                      height: '80px',
                      width: 'auto',
                      maxHeight: '80px',
                      maxWidth: '120px',
                      display: 'block',
                      filter: 'brightness(1) contrast(1)',
                      WebkitUserSelect: 'none',
                      userSelect: 'none',
                    }}
                    draggable={false}
                  />
                </Link>
              )}
            </nav>
          </div>

          {/* Enhanced Sound Control with Volume */}
          <div className="relative" ref={volumeControlRef}>
            <button
              onClick={() => setShowVolumeControl(!showVolumeControl)}
              className={`inline-flex items-center justify-center px-4 py-1 rounded-xl font-bold text-base transition-all duration-200 border-2 border-yellow-600 bg-gray-800/50 hover:bg-yellow-700/20 hover:text-yellow-300 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 shadow-md ml-4 ${getVolumeColor()}`}
              aria-label="Sound control"
            >
              <FontAwesomeIcon icon={getVolumeIcon()} className="mr-1" />
              <span className="text-xs">{Math.round(volume * 100)}%</span>
            </button>

            {/* Volume Control Panel */}
            {showVolumeControl && (
              <div className="absolute right-0 top-full mt-2 bg-gray-800 border border-gray-600 rounded-lg shadow-lg p-4 w-64 z-50">
                <div className="space-y-4">
                  {/* Sound Toggle */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-300">Sound Effects</span>
                    <button
                      onClick={toggleSound}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        soundEnabled ? 'bg-yellow-600' : 'bg-gray-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          soundEnabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Volume Slider */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-300">Volume</span>
                      <span className="text-xs text-yellow-400">
                        {Math.round(volume * 100)}%
                      </span>
                    </div>

                    <div className="relative">
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={volume}
                        onChange={(e) =>
                          handleVolumeChange(parseFloat(e.target.value))
                        }
                        disabled={!soundEnabled}
                        className={`w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider ${
                          !soundEnabled ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                        style={{
                          background: soundEnabled
                            ? `linear-gradient(to right, #eab308 0%, #eab308 ${volume * 100}%, #374151 ${volume * 100}%, #374151 100%)`
                            : '#374151',
                        }}
                      />
                    </div>

                    {/* Quick Volume Buttons */}
                    <div className="flex justify-between text-xs">
                      <button
                        onClick={() => handleVolumeChange(0)}
                        disabled={!soundEnabled}
                        className={`px-2 py-1 rounded ${
                          !soundEnabled
                            ? 'text-gray-500 cursor-not-allowed'
                            : 'text-gray-300 hover:text-yellow-400'
                        }`}
                      >
                        Mute
                      </button>
                      <button
                        onClick={() => handleVolumeChange(0.5)}
                        disabled={!soundEnabled}
                        className={`px-2 py-1 rounded ${
                          !soundEnabled
                            ? 'text-gray-500 cursor-not-allowed'
                            : 'text-gray-300 hover:text-yellow-400'
                        }`}
                      >
                        50%
                      </button>
                      <button
                        onClick={() => handleVolumeChange(1)}
                        disabled={!soundEnabled}
                        className={`px-2 py-1 rounded ${
                          !soundEnabled
                            ? 'text-gray-500 cursor-not-allowed'
                            : 'text-gray-300 hover:text-yellow-400'
                        }`}
                      >
                        Max
                      </button>
                    </div>
                  </div>

                  {/* Test Sound Button */}
                  <button
                    onClick={() => playNotificationSound()}
                    disabled={!soundEnabled}
                    className={`w-full py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                      soundEnabled
                        ? 'bg-yellow-600 hover:bg-yellow-700 text-gray-900'
                        : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    Test Sound
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Audio element with controlled volume */}
      <audio
        ref={audioRef}
        src={notificationSound}
        preload="auto"
        volume={volume}
      />

      <SidePanel
        open={mobileMenuOpen}
        setOpen={setMobileMenuOpen}
        handleLogout={handleLogout}
        loading={loading}
        onCloseMenu={closeMobileMenu}
      />

      {/* Enhanced CSS for smooth button interactions */}
      <style>{`
        /* Prevent image selection and dragging */
        .group img {
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          user-select: none;
          -webkit-user-drag: none;
          -khtml-user-drag: none;
          -moz-user-drag: none;
          -o-user-drag: none;
          user-drag: none;
          pointer-events: none;
        }

        /* Smooth transitions for button containers */
        .group {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          will-change: transform;
        }

        /* Prevent flash on click */
        .group:active {
          transition-duration: 0.1s;
        }

        /* Focus ring styling */
        .group:focus-visible {
          outline: none;
          box-shadow: 0 0 0 2px rgba(251, 191, 36, 0.5);
        }

        /* Disable image highlighting */
        .group img::selection {
          background: transparent;
        }

        .group img::-moz-selection {
          background: transparent;
        }

        /* Volume slider styling */
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #eab308;
          cursor: pointer;
          border: 2px solid #1f2937;
          transition: all 0.2s ease;
        }

        .slider::-webkit-slider-thumb:hover {
          transform: scale(1.1);
          box-shadow: 0 0 8px rgba(234, 179, 8, 0.5);
        }

        .slider::-moz-range-thumb {
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #eab308;
          cursor: pointer;
          border: 2px solid #1f2937;
          transition: all 0.2s ease;
        }

        .slider::-moz-range-thumb:hover {
          transform: scale(1.1);
          box-shadow: 0 0 8px rgba(234, 179, 8, 0.5);
        }

        /* Prevent unwanted highlights */
        * {
          -webkit-tap-highlight-color: transparent;
        }
      `}</style>
    </header>
  );
};

export default Header;
