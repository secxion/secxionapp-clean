import { useDispatch } from "react-redux";
import { useQuery } from "@tanstack/react-query";
import { setUserDetails, setLoading } from "../store/userSlice";
import { fetchUserDetailsAPI, fetchMarketDataAPI, fetchBlogsAPI } from "../services/apiService";

const useAppData = () => {
  const dispatch = useDispatch();

  const {
    data: user,
    refetch: fetchUserDetails,
    isLoading: isUserLoading,
    error: userError,
  } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      dispatch(setLoading(true));
      try {
        const res = await fetchUserDetailsAPI();
        if (res.success) {
          dispatch(setUserDetails(res.data));
          return res.data;
        } else {
          throw new Error(res.message || "Failed to fetch user data");
        }
      } catch (error) {
        console.error("User Fetch Error:", error);
        return null;
      } finally {
        dispatch(setLoading(false));
      }
    },
    staleTime: 5 * 60 * 1000, 
    cacheTime: 30 * 60 * 1000,
    retry: 2, 
  });

  const {
    data: marketData,
    refetch: fetchMarketData,
    isLoading: isMarketLoading,
    error: marketError,
  } = useQuery({
    queryKey: ["marketData"],
    queryFn: fetchMarketDataAPI,
    staleTime: 5 * 60 * 1000,
    cacheTime: 30 * 60 * 1000,
    retry: 2,
  });

  const {
    data: blogs,
    refetch: fetchBlogs,
    isLoading: isBlogsLoading,
    error: blogsError,
  } = useQuery({
    queryKey: ["blogs"],
    queryFn: fetchBlogsAPI,
    staleTime: 5 * 60 * 1000,
    cacheTime: 30 * 60 * 1000,
    retry: 2,
  });

  return {
    user,
    marketData,
    blogs,
    fetchUserDetails,
    fetchMarketData,
    fetchBlogs,
    isLoading: isUserLoading || isMarketLoading || isBlogsLoading,
    error: userError || marketError || blogsError,
  };
};

export default useAppData;
