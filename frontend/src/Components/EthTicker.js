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
