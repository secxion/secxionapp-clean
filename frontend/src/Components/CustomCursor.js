import React, { useEffect } from 'react';
import SecxionLogo from '../app/slogo.png';
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
