// Brand colors for gift card placeholders
// Used when no product image is uploaded

const brandColors = {
  // Popular
  itunes: { bg: 'from-pink-500 to-pink-700', text: 'iTunes', icon: '🎵' },
  apple: { bg: 'from-gray-700 to-gray-900', text: 'Apple', icon: '🍎' },
  amazon: { bg: 'from-orange-500 to-orange-700', text: 'Amazon', icon: '📦' },
  google: { bg: 'from-blue-500 to-green-500', text: 'Google Play', icon: '▶️' },
  'google play': {
    bg: 'from-blue-500 to-green-500',
    text: 'Google Play',
    icon: '▶️',
  },

  // Gaming
  steam: { bg: 'from-blue-800 to-blue-950', text: 'Steam', icon: '🎮' },
  xbox: { bg: 'from-green-600 to-green-800', text: 'Xbox', icon: '🎮' },
  playstation: {
    bg: 'from-blue-600 to-blue-800',
    text: 'PlayStation',
    icon: '🎮',
  },
  roblox: { bg: 'from-red-500 to-red-700', text: 'Roblox', icon: '🎲' },
  razer: { bg: 'from-green-500 to-green-700', text: 'Razer Gold', icon: '🐍' },
  gamestop: { bg: 'from-red-600 to-red-800', text: 'GameStop', icon: '🎯' },

  // Retail
  sephora: { bg: 'from-black to-gray-800', text: 'Sephora', icon: '💄' },
  nordstrom: { bg: 'from-gray-800 to-black', text: 'Nordstrom', icon: '🛍️' },
  target: { bg: 'from-red-600 to-red-800', text: 'Target', icon: '🎯' },
  walmart: { bg: 'from-blue-600 to-blue-800', text: 'Walmart', icon: '🏪' },
  macys: { bg: 'from-red-700 to-red-900', text: "Macy's", icon: '⭐' },
  kohls: { bg: 'from-red-600 to-red-800', text: "Kohl's", icon: '🏷️' },
  ebay: { bg: 'from-blue-500 to-yellow-500', text: 'eBay', icon: '🛒' },
  footlocker: { bg: 'from-red-600 to-black', text: 'Foot Locker', icon: '👟' },
  cvs: { bg: 'from-red-600 to-red-800', text: 'CVS', icon: '💊' },
  saks: { bg: 'from-black to-gray-700', text: 'SAKS', icon: '👗' },
  'michael kors': {
    bg: 'from-amber-700 to-amber-900',
    text: 'Michael Kors',
    icon: '👜',
  },
  coach: { bg: 'from-amber-800 to-amber-950', text: 'Coach', icon: '👜' },

  // Prepaid/Debit
  amex: { bg: 'from-blue-600 to-blue-800', text: 'Amex', icon: '💳' },
  visa: { bg: 'from-blue-700 to-blue-900', text: 'Visa', icon: '💳' },
  mastercard: {
    bg: 'from-red-600 to-orange-600',
    text: 'Mastercard',
    icon: '💳',
  },
  vanilla: { bg: 'from-yellow-500 to-yellow-700', text: 'Vanilla', icon: '💳' },
  netspend: { bg: 'from-green-600 to-green-800', text: 'Netspend', icon: '💳' },
  greendot: {
    bg: 'from-green-500 to-green-700',
    text: 'Green Dot',
    icon: '💳',
  },
  go2bank: { bg: 'from-green-600 to-teal-600', text: 'GO2Bank', icon: '🏦' },
  paysafe: { bg: 'from-blue-500 to-blue-700', text: 'Paysafe', icon: '💳' },

  // Food/Delivery
  doordash: { bg: 'from-red-500 to-red-700', text: 'DoorDash', icon: '🍔' },
  uber: { bg: 'from-black to-gray-800', text: 'Uber', icon: '🚗' },

  // Default
  default: {
    bg: 'from-yellow-600 to-yellow-800',
    text: 'Gift Card',
    icon: '🎁',
  },
};

// Get brand color config by searching product name or brand name
export const getBrandColor = (productName, brandName) => {
  const searchTerms = `${productName} ${brandName}`.toLowerCase();

  for (const [key, value] of Object.entries(brandColors)) {
    if (key !== 'default' && searchTerms.includes(key)) {
      return value;
    }
  }

  return brandColors.default;
};

// Generate initials from product name
export const getInitials = (name) => {
  if (!name) return 'GC';
  return name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export default brandColors;
