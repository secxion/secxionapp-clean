import productModel from "../../models/productModel.js";


const getProductController = async(req, res, next) => {
    try {
        const allProduct = await productModel.find().sort({ createdAt : -1 });
        res.json({
            message: "All Product",
            success: true,
            error: false,
            data: allProduct
        });
    } catch (err) {
        err.message = 'Unable to fetch products. Please try again later.';
        next(err);
    }
}

export default getProductController