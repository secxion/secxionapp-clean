import productModel from "../../models/productModel.js";

const filterProductController = async (req, res) => {
    try {
        const categoryList = req.body.category; 

        const products = await productModel.find(
            { category: { $in: categoryList } }
        ).lean(); 

        return res.status(200).json({
            data: products,
            message: "Products retrieved successfully.",
            error: false,
            success: true,
        });

    } catch (err) {
        console.error("❌ Error fetching products:", err);
        return res.status(500).json({
            message: "Internal Server Error",
            error: true,
            success: false,
        });
    }
};

export default filterProductController;
