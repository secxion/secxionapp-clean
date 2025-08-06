import UserProduct from "../../models/userProduct.js";

const getMarketController = async (req, res) => {
    try {

        if (!req.userId) {
            return res.status(401).json({
                message: "Unauthorized! Please login.",
                error: true,
                success: false
            });
        }

        const userMarket = await UserProduct.find({ userId: req.userId }).sort({ createdAt: -1 });

        res.json({
            message: "User Products",
            success: true,
            error: false,
            data: userMarket
        });

    } catch (err) {
        console.error("Error fetching products:", err);
        res.status(400).json({
            message: err.message || err,
            error: true,
            success: false
        });
    }
};

export default getMarketController;
