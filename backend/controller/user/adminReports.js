import Report from "../../models/report.js";
import { createReportReplyNotification } from "../notifications/notificationsController.js";

// Get all reports (admin view)
export const getAllReportsController = async (req, res) => {
  try {
    const reports = await Report.find().sort({ createdAt: -1 });
    res.json({
      message: "All reports fetched",
      success: true,
      error: false,
      data: reports,
    });
  } catch (err) {
    res.status(400).json({
      message: err.message || "Error fetching reports",
      error: true,
      success: false,
    });
  }
};

// Reply to a user report
export const replyToReportController = async (req, res) => {
  try {
    const { id } = req.params;
    const { adminReply, adminReplyImage } = req.body;

    // Ensure at least one reply content is provided
    if (!adminReply && !adminReplyImage) {
      return res.status(400).json({
        message: "Reply cannot be empty (text or image required).",
        error: true,
        success: false,
      });
    }

    const updateFields = {};
    if (adminReply !== undefined) {
      updateFields.adminReply = adminReply;
    }
    if (adminReplyImage !== undefined) {
      updateFields.adminReplyImage = adminReplyImage;
    }
    updateFields.status = "Resolved";

    const updatedReport = await Report.findByIdAndUpdate(id, updateFields, {
      new: true,
    });

    if (!updatedReport) {
      return res.status(404).json({
        message: "Report not found.",
        error: true,
        success: false,
      });
    }

    // Notify user that their report was replied to
    if (updatedReport.userId) {
      const notificationMessage = `Your report "${updatedReport.category}" has been replied to by the administrator.`;
      const notificationLink = `/user/reports/${updatedReport._id}`;

      await createReportReplyNotification(
        updatedReport.userId,
        updatedReport._id,
        notificationMessage,
        notificationLink,
      );
    } else {
      console.error(
        "User ID not found for the report, cannot create notification.",
      );
    }

    res.json({
      message: "Reply sent successfully.",
      success: true,
      error: false,
      data: updatedReport,
    });
  } catch (err) {
    res.status(400).json({
      message: err.message || "Error replying to report",
      error: true,
      success: false,
    });
  }
};
