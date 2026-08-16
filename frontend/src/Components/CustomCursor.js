import React, { useEffect } from 'react';
import SecxionLogo from '../Assets/optimized/secxion-logo-112.png';
export default function CustomCursor() {
  useEffect(() => {
    const cursorUrl = `url(${SecxionLogo}) 16 16, auto`;
    document.body.style.cursor = cursorUrl;
    return () => {
      document.body.style.cursor = '';
    };
  }, []);
  return null;
}
