import UserProduct from "../../models/userProduct.js"; // Adjust path as per your project structure

const getLastUserMarketStatusController = async (req, res) => {
  try {
    // 1. Check for authentication (userId should be set by a middleware, e.g., from JWT)
    if (!req.userId) {
      return res.status(401).json({
        message: "Unauthorized! Please login.",
        error: true,
        success: false,
      });
    }

    // 2. Find the latest user product for the authenticated user
    //    - userId: req.userId ensures only products belonging to the current user are fetched.
    //    - sort({ createdAt: -1 }): Sorts by the creation timestamp in descending order (latest first).
    //    - limit(1): Limits the result to only the first document (which is the latest after sorting).
    const lastUserMarket = await UserProduct.findOne({ userId: req.userId })
      .sort({ createdAt: -1 }) // Assuming 'createdAt' is added by timestamps: true
      .limit(1);

    // 3. Handle case where no market records are found for the user
    if (!lastUserMarket) {
      return res.status(200).json({
        // Use 200 OK, as it's not an error, just no data
        message: "No recent market activities found for this user.",
        error: false,
        success: true,
        data: null, // Explicitly return null data when no record is found
      });
    }

    // 4. Return the latest market record
    res.json({
      message: "Latest User Market Status",
      success: true,
      error: false,
      data: lastUserMarket,
    });
  } catch (err) {
    console.error("Error fetching last user market status:", err);
    res.status(500).json({
      // Use 500 for server-side errors
      message: err.message || "An unexpected error occurred.",
      error: true,
      success: false,
    });
  }
};

export default getLastUserMarketStatusController;
