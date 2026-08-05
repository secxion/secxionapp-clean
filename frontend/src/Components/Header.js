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
import { useDispatch } from 'react-redux';
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
import { Activity, Layout } from 'lucide-react';
import notificationSound from '../Assets/notification.mp3';
import SummaryApi from '../common';
import { BiSearch } from 'react-icons/bi';
import SidePanel from './SidePanel';
import LiveScript from './LiveScript';
import Slogo from '../app/slogo.png';
import SidePanelLogo from '../Assets/optimized/secxion-logo-112.png';

const Header = () => {
  const dispatch = useDispatch();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isLiveScriptOpen, setIsLiveScriptOpen] = useState(false);
  const { soundEnabled, toggleSound, volume, setVolume } = useSound();
  const { token } = useContext(Context);
  const navigate = useNavigate();
  const location = useLocation();

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

  useEffect(() => {
    const img = new Image();
    img.src = SidePanelLogo;
    if (img.decode) {
      img.decode().catch(() => {});
    }
  }, []);

  useEffect(() => {
    if (debouncedSearch.trim()) {
      navigate(`/search?q=${encodeURIComponent(debouncedSearch)}`);
    }
  }, [debouncedSearch, navigate]);

  const handleLogout = useCallback(async () => {
    // Clear any pending toasts before logout
    toast.dismiss();
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

            <div className="md:hidden flex-1 flex items-center justify-center">
              <div className="relative w-full max-w-[220px]">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                  <BiSearch className="text-brand-gold h-4 w-4" />
                </div>
                <input
                  type="text"
                  placeholder="Search assets..."
                  className="w-full bg-brand-dark-elevated border border-white/10 rounded-full py-2 px-3 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-gold/50 focus:border-brand-gold transition-all duration-300 ease-in-out text-sm"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Logo block */}
          <Link
            to="/home"
            className="relative hidden md:flex items-center font-bold text-brand-gold tracking-wide hover:opacity-80 transition-opacity"
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
                className="inline-flex items-center justify-center px-4 py-1 rounded-xl font-bold text-base transition-all duration-200 border-2 border-brand-gold bg-brand-dark-elevated hover:bg-brand-gold/20 text-brand-gold hover:text-brand-gold-light focus:outline-none focus:ring-2 focus:ring-brand-gold focus:ring-offset-2"
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
                className="w-full bg-brand-dark-elevated border border-white/10 rounded-full py-2 px-3 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-gold/50 focus:border-brand-gold transition-all duration-300 ease-in-out text-sm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <nav className="flex items-center justify-between mx-auto gap-4">
              {!hideTradeStatus && (
                <Link
                  to="/record"
                  className="group relative flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-300 hover:bg-white/5 active:scale-95"
                  title="Trade Status"
                >
                  <div className="p-2 rounded-lg bg-brand-gold/10 text-brand-gold group-hover:bg-brand-gold group-hover:text-brand-dark-base transition-colors duration-300">
                    <Activity className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] mt-1 font-semibold tracking-wider uppercase opacity-60 group-hover:opacity-100">
                    Trade
                  </span>
                </Link>
              )}

              {!hideDataPad && (
                <Link
                  to="/datapad"
                  className="group relative flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-300 hover:bg-white/5 active:scale-95"
                  title="DataPad"
                >
                  <div className="p-2 rounded-lg bg-brand-gold/10 text-brand-gold group-hover:bg-brand-gold group-hover:text-brand-dark-base transition-colors duration-300">
                    <Layout className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] mt-1 font-semibold tracking-wider uppercase opacity-60 group-hover:opacity-100">
                    DataPad
                  </span>
                </Link>
              )}

              {/* LiveScript Button */}
              <button
                onClick={() => setIsLiveScriptOpen(true)}
                className="group relative flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all duration-300 ease-in-out transform hover:scale-105 active:scale-95 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white border-2 border-purple-500 shadow-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
              >
                <span className="text-lg">{'</>'}</span>
                <span className="hidden lg:inline">LiveScript</span>
              </button>
            </nav>
          </div>

          <div className="relative" ref={volumeControlRef}>
            <button
              onClick={() => setShowVolumeControl(!showVolumeControl)}
              className={`inline-flex items-center justify-center px-4 py-1 rounded-xl font-bold text-base transition-all duration-200 border-2 border-brand-gold bg-brand-dark-elevated hover:bg-brand-gold/20 hover:text-brand-gold-light focus:outline-none focus:ring-2 focus:ring-brand-gold focus:ring-offset-2 shadow-md ml-4 ${getVolumeColor()}`}
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
                            ? `linear-gradient(to right, #D4AF37 0%, #D4AF37 ${volume * 100}%, #374151 ${volume * 100}%, #374151 100%)`
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
                        ? 'bg-brand-gold hover:bg-brand-gold-dark text-brand-dark-base'
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
        onOpenLiveScript={() => setIsLiveScriptOpen(true)}
      />

      {/* LiveScript Modal */}
      <LiveScript
        isOpen={isLiveScriptOpen}
        onClose={() => setIsLiveScriptOpen(false)}
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
          background: #D4AF37;
          cursor: pointer;
          border: 2px solid #1f2937;
          transition: all 0.2s ease;
        }

        .slider::-webkit-slider-thumb:hover {
          transform: scale(1.1);
          box-shadow: 0 0 8px rgba(212, 175, 55, 0.5);
        }

        .slider::-moz-range-thumb {
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #D4AF37;
          cursor: pointer;
          border: 2px solid #1f2937;
          transition: all 0.2s ease;
        }

        .slider::-moz-range-thumb:hover {
          transform: scale(1.1);
          box-shadow: 0 0 8px rgba(212, 175, 55, 0.5);
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
