import { FaWallet, FaHistory, FaUniversity } from 'react-icons/fa';

const WalletFooter = ({ activeTab, setActiveTab }) => {
    return (
        <footer className="fixed bottom-0 left-0 right-0 bg-yellow-600 dark:bg-yellow-700 border-t border-gray-200 dark:border-gray-700 shadow-md z-40">
            <div className="flex justify-around py-1.5 items-center px-4">
                <button
                    onClick={() => setActiveTab('wallet')}
                    className={`flex flex-col items-center text-sm ${
                        activeTab === 'wallet' ? 'text-black' : 'text-gray-800 dark:text-gray-200'
                    } hover:text-green-200 focus:outline-none`}
                >
                    <FaWallet className="text-md mb-1" />
                    Wallet
                </button>
                <button
                    onClick={() => setActiveTab('accounts')}
                    className={`flex flex-col items-center text-sm ${
                        activeTab === 'accounts' ? 'text-black' : 'text-gray-800 dark:text-gray-200'
                    } hover:text-green-200 focus:outline-none`}
                >
                    <FaUniversity className="text-md mb-1" />
                    Accounts
                </button>
                <button
                    onClick={() => setActiveTab('history')}
                    className={`flex flex-col items-center text-sm ${
                        activeTab === 'history' ? 'text-black' : 'text-gray-800 dark:text-gray-200'
                    } hover:text-green-200 focus:outline-none`}
                >
                    <FaHistory className="text-md mb-1" />
                    History
                </button>
            </div>
        </footer>
    );
};

export default WalletFooter;