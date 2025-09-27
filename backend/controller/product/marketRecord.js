import userProduct from "../../models/userProduct.js";


async function marketRecordController(req, res, next) {
    try {
        const { _id, ...resBody } = req.body;
        if (!req.userId) {
            const err = new Error("Unauthorized! Please login.");
            err.status = 401;
            throw err;
        }
        if (!_id) {
            const err = new Error("Product ID (_id) is required.");
            err.status = 400;
            throw err;
        }
        const existingProduct = await userProduct.findById(_id);
        if (!existingProduct) {
            const err = new Error("Product not found.");
            err.status = 404;
            throw err;
        }
        if (existingProduct.userId.toString() !== req.userId) {
            const err = new Error("You are not authorized to modify this product.");
            err.status = 403;
            throw err;
        }
        if (!resBody.pricing && existingProduct.pricing) {
            resBody.pricing = existingProduct.pricing;
        }
        const marketRecord = await userProduct.findByIdAndUpdate(_id, resBody, {
            new: true,
            runValidators: true,
        });
        res.json({
            message: "Product updated successfully.",
            data: marketRecord,
            success: true,
            error: false,
        });
    } catch (err) {
        err.message = err.message || 'Could not update product. Please try again.';
        next(err);
    }
}

export default marketRecordController;