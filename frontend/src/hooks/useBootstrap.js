// src/hooks/useBootstrap.js
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import {
  fetchUserDetails,
  fetchMarketData,
  fetchBlogs,
  fetchWalletBalance,
} from "../redux/userSlice";

const useBootstrap = (shouldRun = true) => {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!shouldRun) {
      setIsLoading(false); // ✅ don't block login page
      return;
    }

    const bootstrap = async () => {
      try {
        await dispatch(fetchUserDetails()).unwrap();
        await dispatch(fetchMarketData()).unwrap();
        await dispatch(fetchBlogs()).unwrap();
        await dispatch(fetchWalletBalance()).unwrap();
      } catch (err) {
        console.error("Bootstrap error:", err.message || err);
      } finally {
        setIsLoading(false);
      }
    };

    bootstrap();
  }, [dispatch, shouldRun]);

  return { isLoading };
};

export default useBootstrap;
