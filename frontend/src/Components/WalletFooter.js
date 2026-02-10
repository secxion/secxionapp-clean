import { FaWallet, FaHistory, FaUniversity } from 'react-icons/fa';
import '../styles/walletUtilities.css';

const WalletFooter = ({ activeTab, setActiveTab }) => {
  return (
    <footer
      className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-700 shadow-lg z-40"
      style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
    >
      <div className="flex justify-around py-3 items-center px-4">
        <button
          onClick={() => setActiveTab('wallet')}
          className={`flex flex-col items-center text-sm transition-colors duration-200 ${
            activeTab === 'wallet'
              ? 'text-yellow-400'
              : 'text-gray-400 hover:text-gray-200'
          } focus:outline-none`}
        >
          <FaWallet className="text-lg mb-1" />
          <span className="font-medium">Wallet</span>
        </button>
        <button
          onClick={() => setActiveTab('accounts')}
          className={`flex flex-col items-center text-sm transition-colors duration-200 ${
            activeTab === 'accounts'
              ? 'text-yellow-400'
              : 'text-gray-400 hover:text-gray-200'
          } focus:outline-none`}
        >
          <FaUniversity className="text-lg mb-1" />
          <span className="font-medium">Accounts</span>
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex flex-col items-center text-sm transition-colors duration-200 ${
            activeTab === 'history'
              ? 'text-yellow-400'
              : 'text-gray-400 hover:text-gray-200'
          } focus:outline-none`}
        >
          <FaHistory className="text-lg mb-1" />
          <span className="font-medium">History</span>
        </button>
      </div>
    </footer>
  );
};

export default WalletFooter;
