import productModel from "../../models/productModel.js";


const SearchProduct = async(req, res, next) => {
    try {
        const query = req.query.q;
        const regex = new RegExp(query, 'i', 'g');
        const product = await productModel.find({
            "$or": [
                { productName: regex },
                { category: regex }
            ]
        });
        res.json({
            data: product,
            message: "Search Trade",
            error: false,
            success: true,
        });
    } catch (err) {
        err.message = 'Could not search for products. Please try again.';
        next(err);
    }
}

export default SearchProduct