import userProduct from "../../models/userProduct.js";

async function marketRecordController(req, res) {
    try {
        const { _id, ...resBody } = req.body;

        if (!req.userId) {
            return res.status(401).json({
                message: "Unauthorized! Please login.",
                error: true,
                success: false
            });
        }

        if (!_id) {
            throw new Error("Product ID (_id) is required");
        }

        const existingProduct = await userProduct.findById(_id);

        if (!existingProduct) {
            return res.status(404).json({
                message: "Product not found",
                data: null,
                success: false,
                error: true,
            });
        }

        if (existingProduct.userId.toString() !== req.userId) {
            return res.status(403).json({
                message: "Forbidden! You are not authorized to modify this product.",
                error: true,
                success: false,
            });
        }

        if (!resBody.pricing && existingProduct.pricing) {
            resBody.pricing = existingProduct.pricing;
        }

        const marketRecord = await userProduct.findByIdAndUpdate(_id, resBody, {
            new: true,
            runValidators: true,
        });


        res.json({
            message: "Updated successfully",
            data: marketRecord,
            success: true,
            error: false,
        });
    } catch (err) {
        console.error("Error updating product:", err);
        res.status(400).json({
            message: err.message || err,
            error: true,
            success: false,
        });
    }
}

export default marketRecordController;