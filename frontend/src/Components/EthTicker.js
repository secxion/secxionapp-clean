Ethereum Wallet

ETH Rate (NGN)

₦2,612,972.00

Est. Gas Fee (ETH)

0.00000067 ETH

Naira Balance

₦126,642,260.00

ETH Balance

48.466750 ETH

Recipient ETH Address
Enter or scan 0x...

Amount to Withdraw (NGN)
e.g., 50000
Est. ETH Equivalent:
0.000000 ETH

Network Gas Fee:
0.00000067 ETH

Service Fee (1.5%):
0.000000 ETH

Net ETH to Send:
import React, { useEffect, useState } from 'react';
export default function EthTicker() {
  const [price, setPrice] = useState(null);
  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const res = await fetch(
          'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd',
        );
        const data = await res.json();
        setPrice(data.ethereum.usd);
      } catch (error) {
        console.error('EthTicker fetch error:', error);
      }
    };
    fetchPrice();
    const interval = setInterval(fetchPrice, 60000);
    return () => clearInterval(interval);
  }, []);
  return (
    <div className="flex items-center justify-center gap-2 text-yellow-400 text-sm font-mono">
      <span>ETH/USD:</span>
      <span className="font-bold">{price ? `$${price}` : '...'}</span>
    </div>
  );
}
