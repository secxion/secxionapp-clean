import { AnimatePresence, motion } from "framer-motion";
import { SiEthereum } from 'react-icons/si';
import {
  ShieldCheck,
  UserPlus,
  ArrowRight,
  Zap,
  Globe,
  Headphones,
  Menu,
  X,
  ChevronUp,
  LayoutDashboard,
  Gift,
  Wrench,
  Shapes,
  Smartphone,
  Code,
  Star,
  CheckCircle,
  ArrowUpRight
} from "lucide-react";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaEthereum } from "react-icons/fa";
import SecxionLogo from "../app/slogo.png";
import NFTBadge from "../Components/NFTBadge";

const Button = ({ children, className = "", variant = "default", ...props }) => {
  const baseClasses =
    "inline-flex items-center justify-center px-6 py-3 rounded-xl font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 shadow-lg";
  const variantClasses = {
    default:
      "bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-600 hover:from-yellow-600 hover:to-yellow-800 text-gray-900 focus:ring-yellow-500 backdrop-blur-xl",
    ghost:
      "bg-white/10 hover:bg-yellow-700/10 text-yellow-400 border border-yellow-500 focus:ring-yellow-500 backdrop-blur-xl",
    secondary:
      "bg-gray-800 hover:bg-gray-700 text-gray-100 focus:ring-yellow-500 backdrop-blur-xl"
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

const NavLink = ({ href, children }) => (
  <a
    href={href}
    className="text-gray-300 hover:text-yellow-400 font-medium transition-colors"
  >
    {children}
  </a>
);

const MobileNavLink = ({ href, children }) => (
  <a
    href={href}
    className="block py-2 text-gray-100 hover:text-yellow-400 font-medium transition-colors"
  >
    {children}
  </a>
);

const ServiceCard = ({ icon, title, description, highlight }) => (
  <motion.div
    className="relative group"
    whileHover={{ scale: 1.04, y: -8 }}
    transition={{ type: "spring", stiffness: 300 }}
  >
    <div className="bg-gradient-to-br from-gray-900/90 to-gray-800/80 p-8 rounded-3xl shadow-2xl border border-yellow-700/20 relative overflow-hidden h-full backdrop-blur-xl">
      {highlight && (
        <div className="absolute top-4 right-4 bg-gradient-to-r from-yellow-600 to-yellow-800 text-gray-900 text-xs font-bold px-3 py-1 rounded-full shadow">
          POPULAR
        </div>
      )}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-yellow-700/10 to-yellow-800/10 rounded-full transform translate-x-16 -translate-y-16 group-hover:scale-150 transition-transform duration-500 opacity-60"></div>
      <div className="relative z-10">
        <div className="mb-6 inline-block p-4 bg-gradient-to-br from-yellow-900/30 to-yellow-700/20 rounded-2xl group-hover:from-yellow-800/40 group-hover:to-yellow-700/30 transition-all duration-300 shadow-lg">
          {icon}
        </div>
        <h3 className="text-2xl font-bold text-yellow-200 mb-4 drop-shadow">{title}</h3>
        <p className="text-gray-200 leading-relaxed text-lg">{description}</p>
      </div>
    </div>
  </motion.div>
);

const FeatureCard = ({ icon, title, description }) => (
  <motion.div
    className="relative group"
    whileHover={{ y: -5, scale: 1.03 }}
    transition={{ type: "spring", stiffness: 300 }}
  >
    <div className="bg-gradient-to-br from-gray-900/90 to-gray-800/80 p-6 rounded-2xl shadow-xl border border-yellow-700/10 h-full backdrop-blur-xl">
      <div className="flex items-start mb-4">
        <div className="p-3 bg-gradient-to-br from-yellow-900/30 to-yellow-700/20 rounded-xl mr-4 flex-shrink-0 shadow">
          {icon}
        </div>
        <div>
          <h3 className="text-lg font-semibold text-yellow-200 mb-2">{title}</h3>
          <p className="text-gray-200 text-sm leading-relaxed">{description}</p>
        </div>
      </div>
    </div>
  </motion.div>
);

// NFT Showcase Card
const NFTShowcase = () => {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <motion.div
        className="relative max-w-md mx-auto bg-gradient-to-br from-gray-900/80 via-gray-800/70 to-gray-950/90 rounded-3xl shadow-2xl border border-yellow-700/30 p-8 mb-12 backdrop-blur-2xl"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.7, type: "spring" }}
      >
        {/* <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-tr from-yellow-500/30 to-yellow-700/30 rounded-full blur-2xl animate-pulse"></div> */}
        <div className="flex flex-col items-center z-10 relative">
          <div className="relative w-32 h-32 mb-4">
            <img
              src="https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80"
              alt="NFT Preview"
              className="rounded-2xl border-4 border-yellow-500 shadow-lg object-cover w-full h-full"
            />
            <div className="absolute bottom-2 right-2 bg-gradient-to-r from-yellow-400 to-yellow-700 text-gray-900 px-2 py-1 rounded-lg text-xs font-bold shadow">
              Featured NFT
            </div>
          </div>
          <h3 className="text-2xl font-extrabold text-yellow-200 mb-2 drop-shadow-lg tracking-wide">
            Secxion Genesis NFT
          </h3>
          <p className="text-gray-300 text-center mb-4 text-lg">
            Unlock exclusive rewards and access by trading or holding our Genesis NFT. Powered by Ethereum.
          </p>
          <Button
            className="bg-gradient-to-r from-yellow-500 to-yellow-700 text-gray-900 shadow-xl"
            onClick={() => setShowModal(true)}
          >
            <FaEthereum className="mr-2" /> View NFT Collection
          </Button>
        </div>
      </motion.div>
      {showModal && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="nft-glass max-w-sm w-full p-8 rounded-2xl shadow-2xl border border-yellow-700/30 flex flex-col items-center relative"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", duration: 0.4 }}
          >
            <div className="absolute top-4 right-4 cursor-pointer text-yellow-400 hover:text-yellow-600 text-xl"
              onClick={() => setShowModal(false)}
              title="Close"
            >
              <X className="w-6 h-6" />
            </div>
            <div className="mb-4">
              <FaEthereum className="text-yellow-400 text-4xl animate-pulse" />
            </div>
            <h2 className="text-2xl font-bold text-yellow-200 mb-2 text-center tracking-wide">
              NFT Collection
            </h2>
            <p className="text-gray-300 text-center mb-4 text-lg">
              <span className="font-semibold text-yellow-400">Coming Soon</span>
            </p>
            <div className="w-full flex justify-center">
              <div className="w-20 h-20 rounded-xl bg-gradient-to-tr from-yellow-500/30 to-yellow-700/30 blur-sm animate-pulse"></div>
            </div>
            <p className="mt-6 text-sm text-gray-400 text-center">
              Stay tuned for exclusive digital assets, membership NFTs, and more. Follow us for updates!
            </p>
          </motion.div>
        </motion.div>
      )}
    </>
  );
};

// Testimonial Carousel
const transactionTypes = [
  "Gift Card Sale",
  "Ethereum Trade",
  "Bank Payment",
  "Custom Tool Delivered",
  "Open Source Integration"
];
const testimonials = Array.from({ length: 1200 }).map((_, i) => ({
  name: ["Alex M.", "Jade L.", "Samir K.", "Chris O.", "Linda S.", "Mohammed T.", "Priya R.", "John D.", "Sophia W.", "Carlos F."][Math.floor(Math.random() * 10)],
  avatar: `https://randomuser.me/api/portraits/${Math.random() > 0.5 ? "men" : "women"}/${Math.floor(Math.random() * 80)}.jpg`,
  text: [
    "Secxion made selling my gift cards effortless. The custom tools are a game changer!",
    "The NFT showcase is stunning and the platform feels ultra-secure. Highly recommended.",
    "Lightning-fast payouts and amazing support. Secxion is my go-to for digital assets.",
    "Received my bank payment instantly. Trustworthy and reliable!",
    "Traded Ethereum with the best rates. Secxion rocks!",
    "Custom scripts delivered live, solved my workflow issues.",
    "Support team helped me integrate open source tools in minutes.",
    "Gift card sale completed in seconds, super fast!",
    "Bank transfer successful, funds received immediately.",
    "Secxion's NFT collection looks amazing, can't wait!"
  ][Math.floor(Math.random() * 10)],
  type: transactionTypes[Math.floor(Math.random() * transactionTypes.length)],
  date: (() => {
    const now = new Date();
    const offset = Math.floor(Math.random() * 48 * 60 * 60 * 1000);
    const d = new Date(now.getTime() - offset);
    return d.toLocaleString("en-US", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "short", year: "numeric" });
  })()
}));

const TestimonialCarousel = () => {
  const [index, setIndex] = useState(Math.floor(Math.random() * testimonials.length));
  useEffect(() => {
    const timer = setTimeout(() => setIndex((i) => (i + 1) % testimonials.length), 3500);
    return () => clearTimeout(timer);
  }, [index]);
  const t = testimonials[index];
  return (
    <motion.div
      className="max-w-xl mx-auto bg-gradient-to-br from-gray-900/80 to-gray-800/80 rounded-2xl shadow-xl border border-yellow-700/20 p-8 mt-16 mb-8 backdrop-blur-xl"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, type: "spring" }}
    >
      <div className="flex items-center mb- 2">
        <img src={t.avatar} alt={t.name} className="w-12 h-12 rounded-full border-2 border-yellow-500 mr-3 shadow" />
        <span className="font-bold text-yellow-200">{t.name}</span>
        <span className="ml-auto text-xs text-gray-400">{t.date}</span>
      </div>
      <div className="flex items-center mb-2">
        <span className="px-2 py-1 bg-yellow-700/20 text-yellow-400 rounded font-mono text-xs mr-2">{t.type}</span>
        <span className="text-xs text-gray-400">#{index + 1} of {testimonials.length} live</span>
      </div>
      <p className="text-gray-200 text-lg italic mb-2">"{t.text}"</p>
      <div className="flex justify-center mt-2 space-x-2">
        {[...Array(5)].map((_, i) => (
          <span
            key={i}
            className={`w-3 h-3 rounded-full ${i === index % 5 ? "bg-yellow-500" : "bg-gray-700"}`}
            style={{ transition: "background 0.3s" }}
          />
        ))}
      </div>
    </motion.div>
  );
};

export default function Landing() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const updateCurrencies = () => {
     
    };
    const interval = setInterval(updateCurrencies, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 300);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-800 text-gray-100 font-sans relative overflow-hidden"
      initial={false}
      animate="visible"
      variants={containerVariants}
    >
      {/* Animated geometric background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {/* Add animated SVG waves for NFT feel */}
        <svg className="absolute top-0 left-0 w-full h-40" viewBox="0 0 1440 320">
          <path fill="#facc15" fillOpacity="0.08" d="M0,160L60,165.3C120,171,240,181,360,165.3C480,149,600,107,720,117.3C840,128,960,192,1080,218.7C1200,245,1320,235,1380,229.3L1440,224L1440,0L1380,0C1320,0,1200,0,1080,0C960,0,840,0,720,0C600,0,480,0,360,0C240,0,120,0,60,0L0,0Z"></path>
        </svg>
        <div className="absolute top-10 left-10 w-32 h-32 border-4 border-yellow-700/20 rotate-45 animate-spin [animation-duration:20s]"></div>
        <div className="absolute top-1/4 right-20 w-20 h-20 bg-gradient-to-r from-yellow-900/40 to-yellow-800/40 rounded-full animate-pulse"></div>
        <div className="absolute bottom-1/4 left-1/4 w-40 h-40 border-4 border-yellow-700/20 rounded-full animate-bounce [animation-duration:3s]"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 border border-yellow-700/20 rounded-full"></div>
        <div className="absolute bottom-20 right-10 w-24 h-24 bg-gradient-to-br from-yellow-800/30 to-yellow-700/30 transform rotate-12 animate-pulse"></div>
      </div>

      {/* Navigation Header */}
      <motion.header className="fixed top-0 h-24 left-0 right-0 z-50 bg-gray-950/95 backdrop-blur-xl border-b border-yellow-700/10 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-24">
            <div className="flex items-center space-x-4">
              <div className="relative">
                    <div >
                      <img
                        src={SecxionLogo}
                        alt="Secxion Official Logo"
                        className="w-14 h-14 object-contain rounded-2xl"
                        style={{ display: "block" }}
                      />
                    </div>

              </div>
              <div className="md:hidden flex items-center space-x-2">
               
                <p className="text-yellow-400 text-sm font-mono tracking-wider">
                  System Design in Progress<span className="animate-blink">_</span>
                </p>
              </div>
            </div>
            <nav className="hidden md:flex items-center space-x-8">
              <NavLink href="/about-us">About</NavLink>
              <NavLink href="/terms">Terms</NavLink>
              <NavLink href="/privacy">Privacy</NavLink>
              <NavLink href="/contact-us">Contact</NavLink>
            </nav>
            <div className="hidden md:flex items-center space-x-4">
              {isLoggedIn ? (
                <>
                  <Button variant="ghost" className="text-gray-300 hover:text-yellow-400 flex items-center">
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Dashboard
                  </Button>
                  <Button
                    className="bg-gray-800 hover:bg-gray-700 text-gray-100"
                    onClick={() => setIsLoggedIn(false)}
                  >
                    Log Out
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="ghost" className="text-gray-300 hover:text-yellow-400">
                    <a href="/login">Sign In</a>
                  </Button>
                  <Button className="bg-gradient-to-r from-yellow-600 to-yellow-800 hover:from-yellow-700 hover:to-yellow-900 text-gray-900 shadow-lg">
                    <a href="/sign-up">Get Started</a>
                  </Button>
                </>
              )}
            </div>
            <button
              className="md:hidden p-2 rounded-lg hover:bg-gray-800 transition-colors text-yellow-400"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              key="mobile-menu"
              className="absolute top-full left-0 right-0 bg-gray-900 border-t border-yellow-700/20 shadow-md rounded-b-xl overflow-hidden"
              initial={{ opacity: 0, y: 0 }}
              animate={{ opacity: 1, y: 0, transition: { duration: 0.1, ease: 'easeOut' } }}
              exit={{ opacity: 0, y: 0, transition: { duration: 0.1, ease: 'easeIn' } }}
            >
              <div className="px-4 py-6 space-y-4">
                <MobileNavLink href="/about-us">About</MobileNavLink>
                <MobileNavLink href="/terms">Terms</MobileNavLink>
                <MobileNavLink href="/privacy">Privacy</MobileNavLink>
                <MobileNavLink href="/contact-us">Contact</MobileNavLink>
                <div className="border-t border-yellow-700/20 pt-4 space-y-3">
                  {isLoggedIn ? (
                    <Button
                      className="w-full bg-gray-800 hover:bg-gray-700 text-gray-100"
                      onClick={() => setIsLoggedIn(false)}
                    >
                      Log Out
                    </Button>
                  ) : (
                    <>
                      <a href="/login" className="block">
                        <Button variant="ghost" className="w-full text-gray-100 hover:text-yellow-400">
                          Sign In
                        </Button>
                      </a>
                      <a href="/sign-up" className="block">
                        <Button className="w-full bg-gradient-to-r from-yellow-600 to-yellow-800 hover:from-yellow-700 hover:to-yellow-900 text-gray-900">
                          Get Started
                        </Button>
                      </a>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}
          <div className="hidden lg:flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            <p className="text-yellow-400 text-sm font-mono tracking-wider">
              System Design in Progress<span className="animate-blink">_</span>
            </p>
          </div>
        </AnimatePresence>
        <div className="mt-8">
                </div>
      </motion.header>

      <main className="relative z-10 mt-24">
        {/* Hero Section */}
        <motion.section className="relative overflow-hidden py-16 lg:py-36 flex flex-col items-center justify-center min-h-[70vh]">
          {/* SVG Pattern/Blurred Background */}
          {/* <div className="absolute inset-0 z-0 opacity-30 pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-yellow-900/30 rounded-full filter blur-3xl opacity-50 animate-pulse"></div>
            <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-yellow-800/30 rounded-full filter blur-3xl opacity-50 animate-pulse"></div>
            <div className="absolute bottom-1/4 left-1/2 w-80 h-80 bg-yellow-700/30 rounded-full filter blur-3xl opacity-50 animate-pulse"></div>
          </div> */}
          {/* NFT Showcase Card */}
          <NFTShowcase />
          {/* Main Card */}
          <motion.div
           
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.7, type: "spring" }}
          >
            <div className="flex items-center space-x-3 mb-4">
              {/* <div className="w-4 h-4 bg-yellow-500 rounded-full shadow-lg animate-pulse"></div> */}
              <span className="text-yellow-400 font-mono text-xs tracking-widest uppercase">System Design in Progress</span>
            </div>
            <h1 className="text-6xl md:text-8xl font-extrabold bg-gradient-to-r from-yellow-400 via-yellow-200 to-yellow-600 bg-clip-text text-transparent text-center mb-8 tracking-tight">
              Welcome to Secxion
            </h1>
            <p className="text-xl md:text-2xl text-gray-200 mb-8 text-center font-medium drop-shadow">
              Instantly Sell your unused gift cards and digital assets for Ethereum or cash.<br />
              Need custom digital tools? We build them live for you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6">
              <Button>
                <a href="/login">Login</a>
              </Button>
              <span className="text-gray-400">|</span>
              <Button>
                <UserPlus className="mr-2 h-5 w-5" />
                <a href="/sign-up">Create an Account</a>
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
            <div className="flex flex-wrap justify-center items-center gap-6 text-sm text-gray-400">
              <div className="flex items-center">
                <ShieldCheck className="h-4 w-4 mr-2 text-yellow-500" />
                Bank-Grade Security
              </div>
              <div className="flex items-center">
                <Zap className="h-4 w-4 mr-2 text-yellow-500" />
                Instant Transactions
              </div>
              <div className="flex items-center">
                <Star className="h-4 w-4 mr-2 text-yellow-500" />
                24/7 Support
              </div>
            </div>
          </motion.div>
        </motion.section>

        {/* Services Section */}
        <motion.section id="services" className="py-24 bg-gradient-to-br from-gray-900 to-gray-800 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute top-10 right-10 w-24 h-24 border-2 border-yellow-700 transform rotate-45"></div>
            <div className="absolute bottom-20 left-10 w-32 h-32 bg-gradient-to-br from-yellow-800 to-yellow-700 rounded-full opacity-50"></div>
          </div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-yellow-200 mb-4">
                Our Core Services
              </h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                We provide secure, fast, and reliable services to help you maximize the value of your digital assets
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              <ServiceCard
                icon={<Gift className="h-12 w-12 text-yellow-500" />}
                title="Gift Card Exchange"
                description="Sell your unused gift cards from major retailers for Ethereum or cash. We offer competitive rates and support 50+ popular gift card brands."
                highlight={true}
              />
              <ServiceCard
                icon={<SiEthereum className="h-12 w-12 text-black" />}
                title="Ethereum Trading"
                description="Securely buy, sell, and store Ethereum with our user-friendly platform. Real-time market rates and instant transactions."
              />
              <ServiceCard
                icon={<Smartphone className="h-12 w-12 text-gray-400" />}
                title="Bank Transfer Payments"
                description="Receive your payments directly to your bank account, get Instant credit on payment request, secure, and reliable transfer services with no limited transactions"
              />
              <ServiceCard
                icon={<Code className="h-12 w-12 text-yellow-500" />}
                title="Custom Development"
                description="Struggling with off-the-shelf tools or bad scripts? At Secxion, we specialize in crafting custom software solutions designed precisely for your unique needs. Our expert developers in the LiveScript department build robust, reliable tools and scripts, ensuring 100% ownership and full functionality. We understand the frustration of failed tasks, restrictive protocols, and unmet expectations – that's why over 400 users trust Secxion for excellent, dependable results. Create a free Secxion account today and use 'LIVESCRIPT' to submit your custom development request. Let us build the perfect solution to empower your success."
              />
              <ServiceCard
                icon={<Wrench className="h-12 w-12 text-yellow-500" />}
                title="Open Source Tools"
                description="Access and customize powerful open-source tools. We help you integrate and modify existing solutions for your needs."
              />
            </div>
          </div>
        </motion.section>

        {/* Features Section */}
        <motion.section className="py-24 bg-gray-950 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-yellow-200 mb-4">
                Why Choose Secxion?
              </h2>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                Built with security, speed, and user experience at the forefront
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <FeatureCard
                icon={<ShieldCheck className="h-8 w-8 text-yellow-500" />}
                title="Bank-Level Security"
                description="Your transactions and data are protected with multi-layer encryption, cold storage, and real-time fraud monitoring."
              />
              <FeatureCard
                icon={<Zap className="h-8 w-8 text-yellow-500" />}
                title="Lightning-Fast Processing"
                description="Complete transactions in minutes, not hours. Our optimized system ensures quick verification and instant payouts."
              />
              <FeatureCard
                icon={<Globe className="h-8 w-8 text-yellow-500" />}
                title="Global Accessibility"
                description="Access our services from anywhere in the world. Support for multiple currencies and payment methods."
              />
              <FeatureCard
                icon={<Headphones className="h-8 w-8 text-yellow-500" />}
                title="24/7 Expert Support"
                description="Our dedicated support team is always available to help with any questions or issues you may encounter."
              />
              <FeatureCard
                icon={<CheckCircle className="h-8 w-8 text-yellow-500" />}
                title="Transparent Pricing"
                description="No hidden fees or surprise charges. Our transparent pricing structure ensures you know exactly what you'll receive."
              />
              <FeatureCard
                icon={<Shapes className="h-8 w-8 text-yellow-500" />}
                title="Flexible Solutions"
                description="From gift card exchanges to custom tool development, we adapt our services to meet your specific needs."
              />
            </div>
          </div>
        </motion.section>

        {/* Testimonial Carousel */}
        <TestimonialCarousel />

        {/* CTA Section */}
        <motion.section className="py-24 bg-gradient-to-r from-black via-gray-900 to-gray-800 relative overflow-hidden">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="absolute inset-0">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-gray-900/80 to-gray-800/80"></div>
          </div>
          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-yellow-200 mb-6">
              Ready to Start Trading?
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Join thousands of users who trust Secxion for their gift card exchanges and custom development needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button>
                <a href="/sign-up" className="flex items-center">
                  Create Free Account
                  <ArrowUpRight className="ml-2 h-5 w-5" />
                </a>
              </Button>
              <Button variant="ghost">
                <a href="/contact-us">Contact Sales</a>
              </Button>
            </div>
          </div>
        </motion.section>
      </main>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <motion.button
          className="fixed bottom-6 right-6 bg-gradient-to-r from-yellow-600 to-yellow-800 hover:from-yellow-700 hover:to-yellow-900 text-gray-900 p-3 rounded-full shadow-lg z-50"
          onClick={scrollToTop}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <ChevronUp className="h-6 w-6" />
        </motion.button>
      )}

      <footer className="bg-gray-950 text-gray-400 py-16 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 animate-pulse"></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
            {/* Branding Section */}
            <div className="md:col-span-1">
              <div className="flex items-center space-x-3 mb-6">
                <div className="italic underline text-green-600 text-sm animate-fade-in">signature:</div>
                <div className="relative">
                  <h1 className="text-3xl font-extrabold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600">
                    SXN
                  </h1>
                  <div className="absolute -bottom-1 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 rounded-full"></div>
                </div>
              </div>
              <Link to="/contact-us" className="text-sm text-gray-300 hover:text-yellow-400 transition duration-300">
                Send us a direct message
              </Link>
            </div>
            {/* Navigation Sections */}
            <div className="md:col-span-3 grid grid-cols-2 md:grid-cols-3 gap-8">
              <div>
                <h3 className="font-semibold text-yellow-200 mb-4 uppercase tracking-wide">Company</h3>
                <ul className="space-y-2 text-sm">
                  <li><a href="/about-us" className="hover:text-yellow-400 transition duration-300">About Us</a></li>
                  <li><a href="/terms" className="hover:text-yellow-400 transition duration-300">Terms of Service</a></li>
                  <li><a href="/privacy" className="hover:text-yellow-400 transition duration-300">Privacy Policy</a></li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-yellow-200 mb-4 uppercase tracking-wide">Social</h3>
                <ul className="space-y-2 text-sm">
                  <li><a href="https://t.me/secxion" target="_blank" rel="noopener noreferrer" className="hover:text-yellow-400 transition duration-300">Telegram: @secxion</a></li>
                  <li><a href="https://facebook.com/secxion" target="_blank" rel="noopener noreferrer" className="hover:text-yellow-400 transition duration-300">Facebook: @secxion</a></li>
                  <li><a href="https://dev.to/secxion" target="_blank" rel="noopener noreferrer" className="hover:text-yellow-400 transition duration-300">Dev: @secxion</a></li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-yellow-200 mb-4 uppercase tracking-wide">More</h3>
                <ul className="space-y-2 text-sm">
                  <li><a href="https://twitch.tv/secxion" target="_blank" rel="noopener noreferrer" className="hover:text-yellow-400 transition duration-300">Twitch: @secxion</a></li>
                  <li><a href="https://x.com/secxion" target="_blank" rel="noopener noreferrer" className="hover:text-yellow-400 transition duration-300">X / Twitter: @secxion</a></li>
                  <li><a href="https://instagram.com/secxionapp" target="_blank" rel="noopener noreferrer" className="hover:text-yellow-400 transition duration-300">Instagram: @secxionapp</a></li>
                </ul>
              </div>
            </div>
          </div>
          {/* Footer Bottom Line */}
          <div className="border-t border-gray-700 mt-12 pt-6 text-center text-sm">
            {/* Feature NFTBadge */}
            <div className="flex justify-center mb-4">
              <NFTBadge />
            </div>
            <p className="text-gray-500">
              © {new Date().getFullYear()} <span className="text-yellow-500 font-semibold">Secxion</span>. All Rights Reserved. Built with ❤️ by{" "}
              <a
                href="https://bmxii.org"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-yellow-400 hover:underline"
              >
                BMXII.org
              </a>.
            </p>
          </div>
        </div>
      </footer>
      {/* Custom Styles */}
      <style jsx>{`
        @keyframes animate-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-scroll {
          animation: animate-scroll 30s linear infinite;
        }
        @keyframes blink {
          50% { opacity: 0; }
        }
        .animate-blink {
          animation: blink 1s step-end infinite;
        }
        /* NFT glassmorphism */
        .nft-glass {
          background: rgba(30, 30, 30, 0.7);
          box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
          backdrop-filter: blur(8px);
          border-radius: 20px;
          border: 1px solid rgba(255, 255, 255, 0.18);
        }
      `}</style>
    </motion.div>
  );
}