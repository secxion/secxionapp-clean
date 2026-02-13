import Report from "../../models/report.js";

const getUserReportsController = async (req, res) => {
  try {
    if (!req.userId) {
      return res
        .status(401)
        .json({
          message: "Unauthorized! Please login.",
          error: true,
          success: false,
        });
    }

    const userReports = await Report.find({ userId: req.userId }).sort({
      createdAt: -1,
    });

    res.json({
      message: "User Reports",
      success: true,
      error: false,
      data: userReports,
    });
  } catch (err) {
    res
      .status(400)
      .json({ message: err.message || err, error: true, success: false });
  }
};

export default getUserReportsController;
