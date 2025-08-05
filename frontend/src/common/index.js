const backendDomain = process.env.REACT_APP_BACKEND_URL

const SummaryApi = {
    signUP : {
        url : `${backendDomain}/api/signup`,
        method : "post"
    },
    verifyEmail : {
        url : `${backendDomain}/api/verify-email`,
        method : "get"
    },
     sliderVerification : {
        url : `${backendDomain}/api/slider-verification`,
        method : "get"
    },
    resendVEmail : {
        url : `${backendDomain}/api/resend-verification`,
        method : "post"
    },
    sendBankCode: {
  url: `${backendDomain}/api/send-bank-code`,
  method: "POST",
},
verifyAddBank: {
  url: `${backendDomain}/api/verify-add-bank`,
  method: "POST",
},
    
    requestReset: {
  url: `${backendDomain}/api/request-reset`,
  method: "POST",
},
confirmReset: {
  url: `${backendDomain}/api/confirm-reset`,
  method: "POST",
},

    fetchLatestCryptoNews : {
        url : `${backendDomain}/api/fetch-latest-cryptonews`,
        method : "get"
    },
    fetchCryptoGlobalData : {
        url : `${backendDomain}/api/fetch-crypto-globaldata`,
        method : "get"
    },
    fetchCurrencyRates : {
        url : `${backendDomain}/api/fetch-currency-rates`,
        method : "get"
    },
     fetchEthPrice : {
        url : `${backendDomain}/api/eth-price`,
        method : "GET"
    },
     fetchEthTrend : {
        url : `${backendDomain}/api/eth-trend`,
        method : "GET"
    },

    signIn : {
        url : `${backendDomain}/api/signin`,
        method : "post"
    },
   current_user : {
        url : `${backendDomain}/api/user-details`,
        method : "get"
    },
    logout_user : {
        url : `${backendDomain}/api/userLogout`,
        method : "get"
    },
    allUser : {
        url : `${backendDomain}/api/all-user`,
        method : "get"
    },
    updateUser : {
        url : `${backendDomain}/api/update-user`,
        method : "post"
    },
    deleteUser : {
        url : `${backendDomain}/api/delete-user`,
        method : "delete"
    },    
    uploadProduct : {
        url : `${backendDomain}/api/upload-product`,
        method : 'post'
    },
    
    allProduct : {
        url : `${backendDomain}/api/get-product`,
        method : 'get'
    },
    
    updateProduct : {
        url : `${backendDomain}/api/update-product`,
        method : 'post'
    },
    marketRecord : {
        url : `${backendDomain}/api/market-record`,
        method : 'get'
    },
    userMarket : {
        url : `${backendDomain}/api/upload-market`,
        method : 'post'
    },
    myMarket : {
        url : `${backendDomain}/api/get-market`,
        method : 'get'
    },
    myMarketById : {
        url : `${backendDomain}/api/get-market/:marketId`,
        method : 'get'
    },
    lastUserMarketStatus: {
        url: `${backendDomain}/api/last-market-status`,
        method: "get"
    },
    allUserMarkets : {
        url : `${backendDomain}/api/get-all-users-market`,
        method : 'get'
    },
    updateMarketStatus : {
        url : `${backendDomain}/api/update-market-status`,
        method : 'post'
    },
    createNotification : {
        url : `${backendDomain}/api/create-notification`,
        method : 'post'
    },
    categoryProduct : {
        url : `${backendDomain}/api/get-categoryProduct`,
        method : 'get'
    },
    categoryWiseProduct : {
        url : `${backendDomain}/api/category-product`,
        method : 'post'
    },
    productDetails : {
        url : `${backendDomain}/api/product-details`,
        method : 'post'
    },
    searchProduct : {
        url : `${backendDomain}/api/search`,
        method : 'get'
    },
    filterProduct : {
        url : `${backendDomain}/api/filter-product`,
        method : 'post'
    },
    createBlog : {
        url : `${backendDomain}/api/create-blog`,
        method : 'post'
    },
    getBlogs : {
        url : `${backendDomain}/api/get-blogs`,
        method : 'get'
    },
    updateBlog : {
        url : `${backendDomain}/api/update-blog`,
        method : 'put'
    },
    deleteBlog : {
        url : `${backendDomain}/api/delete-blog`,
        method : 'delete'
    },
    
    submitReport: {
        url: `${backendDomain}/api/submit-report`,
        method: "POST"
    },    
   
    getReports: {
        url: `${backendDomain}/api/get-reports`,
        method: "GET"
    },
    getAllReports: {
        url: `${backendDomain}/api/all-reports`,
        method: "GET"
    },
        
    replyReport: {
        url: `${backendDomain}/api/reply-report/:id`,
        method: "POST"
    },
    createData : {
        url : `${backendDomain}/api/createdata`,
        method : 'post'
    },
    allData : {
        url : `${backendDomain}/api/alldata`,
        method : 'get'
    },
    adminAllData : {
        url : `${backendDomain}/api/getAllDataForAdmin`,
        method : 'get'
    },
    updateData : {
        url : `${backendDomain}/api/updatedata`,
        method : 'put'
    },
    deleteData : {
        url : `${backendDomain}/api/deletedata`,
        method : 'delete'
    },
    uploadMedia : {
        url : `${backendDomain}/api/upload-media`,
        method : 'post'
    },
    contactUsMessage: {
        url: `${backendDomain}/api/contact-us-message`,
        method: "POST"
    },    
   
    getContactUsMessages: {
        url: `${backendDomain}/api/get-contact-us-messages`,
        method: "GET"
    },
    walletBalance: {
        url: `${backendDomain}/api/wallet/balance`,
        method: 'GET',
      },
      getWalletBalance: {
        url: `${backendDomain}/api/wallet/balane`,
        method: 'GET',
      },
      createPayment: {
        url: `${backendDomain}/api/pr/create`,
        method: 'POST',
      },
       ethWithdrawal : {
        url : `${backendDomain}/api/eth/withdrawal-request`,
        method : "POST"
    },
    ethWithdrawals: {
        getAll: `${backendDomain}/api/eth-withdrawals`,
        updateStatus: (id) => `${backendDomain}/api/eth-withdrawal-status/${id}`,
        },

    withdrawalStatus : {
        url : `${backendDomain}/api/eth/get-withdrawal-status`,
        method : "GET"
    },
      getAllPayment: {
        url: `${backendDomain}/api/pr/getall`,
        method: 'GET',
      },
      getUserPayment: {
        url: `${backendDomain}/api/pr/getuser`,
        method: 'GET',
      },
      updatePayment: {
        url: `${backendDomain}/api/pr/update`,
        method: 'PATCH',
      },
       resolveBankAccount: {
        url: `${backendDomain}/api/verify-account`,
        method: 'POST',
        },
        bankList: {
            url: `${backendDomain}/api/banks`,
            method: 'GET',
        },
      addBankAccount: {
        url: `${backendDomain}/api/ba/add`,
        method: 'POST',
      },
      getBankAccounts: {
        url: `${backendDomain}/api/ba/get`,
        method: 'GET',
      },
      deleteBankAccount: {
        url: `${backendDomain}/api/ba/delete`,
        method: 'DELETE',
      },
      transactions: {
        url: `${backendDomain}/api/transactions/get`,
        method: 'GET',
      },
      getTransactionNotifications: {
        url: `${backendDomain}/api/tr-notifications/get`,
        method: 'GET',
      },
      markNotificationAsRead: {
        url: `${backendDomain}/api/tr-notifications/read`, 
        method: 'PATCH',
    },
    deleteNotification: {
        url: `${backendDomain}/api/tr-notifications/delete`, 
        method: 'DELETE',
    },
    markAllNotificationsAsRead: {
        url: `${backendDomain}/api/tr-notifications/read-all`,
        method: 'PUT',
    },
    deleteAllNotifications: {
        url: `${backendDomain}/api/tr-notifications/all`,
        method: 'DELETE',
    },
    getReportNotifications: {
        url: `${backendDomain}/api/report/notifications`,
        method: 'GET',
      },
      notificationCount: {
        url: `${backendDomain}/api/unread-notificationCount`,
        method: 'GET',
      },
      getNewNotifications: {
        url: `${backendDomain}/api/get-new-notifications`,
        method: 'GET',
      },
      getMarketNotifications: {
        url: `${backendDomain}/api/get-market-notifications`,
        method: 'GET',
      },
      fetchReportDetails: {
        url: `${backendDomain}/api/notifications/report-details`,
        method: 'GET',
    },
    fetchReportDetail: {
        url: `${backendDomain}/api/user-report-details`,
        method: 'GET',
    },
    userReplyReport: {
        url: `${backendDomain}/api/reports/:id/reply`,
        method: "POST",
    },
    getReportChat: {
        url: `${backendDomain}/api/reports/admin/:id/chat`,
        method: "GET",
    },
    sendChatMessage: {
        url: `${backendDomain}/api/reports/admin/:id/sendchat`,
        method: "POST",
    },
    getUserProfile: {
        url: `${backendDomain}/api/profile`,
        method: "GET",
      },
      getUserProfileBankAccounts: {
        url: `${backendDomain}/api/profile/bank-accounts`,
        method: "GET",
      },
      getUserProfileWalletBalance: {
        url: `${backendDomain}/api/profile/wallet-balance`,
        method: "GET",
      },
      editProfile: {
        url: `${backendDomain}/api/profile/edit`,
        method: 'PUT', 
    },
    getApprovedPosts: {
        url: `${backendDomain}/api/posts/approved`,
        method: 'GET', 
    },
    submitNewPost: {
        url: `${backendDomain}/api/posts/submit`,
        method: 'POST', 
    },
    deletePost: (postId) => ({
        url: `${backendDomain}/api/posts/${postId}/delete`,
        method: 'DELETE', 
    }),
    addComment:(postId) => ({
        url: `${backendDomain}/api/posts/${postId}/comment`,
        method: 'POST', 
    }),
    getPendingPosts: {
        url: `${backendDomain}/api/community/pending`,
        method: 'GET',
    },
    approvePost: (postId) => ({
        url: `${backendDomain}/api/community/post/${postId}/approve`,
        method: 'PUT',
    }),
    rejectPost: (postId) => ({
        url: `${backendDomain}/api/community/post/${postId}/reject`,
        method: 'PUT',
    }),
    myposts: {
        url: `${backendDomain}/api/myposts`,
        method: "GET",
      }
    
}

export default SummaryApi;
