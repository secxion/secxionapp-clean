import userModel from "../../models/userModel.js";

async function userDetailsController(req, res) {
  try {
    if (!req.userId) {
      return res.status(401).json({
        message: "Unauthorized, user ID not found",
        error: true,
        success: false,
      });
    }

    const user = await userModel.findById(req.userId).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
        error: true,
        success: false,
      });
    }

    res.status(200).json({
      data: user,
      error: false,
      success: true,
      message: "User details",
    });
  } catch (err) {
    console.error("Error fetching user details:", err);
    res.status(400).json({
      message: err.message || err,
      error: true,
      success: false,
    });
  }
}

export default userDetailsController;
