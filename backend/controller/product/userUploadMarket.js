import userProduct from "../../models/userProduct.js";

async function UserUploadMarketController(req, res) {
  try {
    if (!req.userId) {
      return res.status(401).json({
        message: "Unauthorized! Please login.",
        error: true,
        success: false
      });
    }

    const newProduct = new userProduct({
      ...req.body,
      userId: req.userId,
    });

    const saveProduct = await newProduct.save();

    res.status(201).json({
      message: "Correct!",
      error: false,
      success: true,
      data: saveProduct,
    });

  } catch (err) {
    res.status(400).json({
      message: err.message || err,
      error: true,
      success: false
    });
  }
}

export default UserUploadMarketController;