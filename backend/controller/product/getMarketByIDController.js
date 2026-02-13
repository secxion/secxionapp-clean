import UserProduct from "../../models/userProduct.js";

const getMarketByIdController = async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({
        message: "Unauthorized! Please login.",
        error: true,
        success: false,
      });
    }

    const { marketId } = req.params;

    if (!marketId) {
      return res.status(400).json({
        message: "Market ID is required.",
        error: true,
        success: false,
      });
    }

    const userMarket = await UserProduct.findOne({
      _id: marketId,
      userId: req.userId,
    });

    if (!userMarket) {
      return res.status(404).json({
        message: "Market record not found.",
        error: true,
        success: false,
      });
    }

    res.json({
      message: "User Product Details",
      success: true,
      error: false,
      data: userMarket,
    });
  } catch (err) {
    console.error("Error fetching product by ID:", err);
    res.status(400).json({
      message: err.message || err,
      error: true,
      success: false,
    });
  }
};

export default getMarketByIdController;
