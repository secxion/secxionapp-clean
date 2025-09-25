import SummaryApi from "../common";

export const fetchUserDetailsAPI = async () => {
    try {
        const response = await fetch(SummaryApi.current_user.url, {
            method: SummaryApi.current_user.method,
            credentials: "include",
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("token")}`,
            },
        });

        return await response.json();
    } catch (error) {
        // console.error("Error fetching user details:", error);
        return { success: false };
    }
};

export const fetchMarketDataAPI = async () => {
    try {
        const response = await fetch(SummaryApi.myMarket.url, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("token")}`,
            },
            credentials: "include",
        });

        return await response.json();
    } catch (error) {
        // console.error("Error fetching market data:", error);
        return { success: false };
    }
};

export const fetchBlogsAPI = async () => {
    try {
        const response = await fetch(SummaryApi.getBlogs.url);
        if (!response.ok) throw new Error("Failed to fetch blogs");

        return await response.json();
    } catch (error) {
        // console.error("Error fetching blogs:", error);
        return [];
    }
};

export const fetchWalletBalanceAPI = async () => {
    try {
        const response = await fetch(SummaryApi.walletBalance.url, {
            method: "GET",
            credentials: "include",
        });

        if (!response.ok) throw new Error("Failed to fetch wallet balance");

        return await response.json();
    } catch (error) {
        // console.error("Error fetching wallet balance:", error);
        return { success: false, balance: 0 };
    }
};

export const signinUserAPI = async (userData) => {
    try {
        const response = await fetch(SummaryApi.signIn.url, {
            method: SummaryApi.signIn.method,
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(userData),
            credentials: "include",
        });

        return await response.json();
    } catch (error) {
        // console.error("Error signing up user:", error);
        return { success: false, message: "Signup failed." };
    }
};