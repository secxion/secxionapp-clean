import Report from "../../models/report.js";

const adminReplyController = async (req, res) => {
    try {
        const { adminReply, status, adminReplyImage } = req.body;

        if (!req.params.id) {
            return res.status(400).json({ message: "Report ID is required.", error: true, success: false });
        }

        if (!adminReply && !adminReplyImage) {
            return res.status(400).json({ message: "Reply message or image is required.", error: true, success: false });
        }

        const updateFields = {};
        if (adminReply !== undefined) {
            updateFields.adminReply = adminReply;
        }
        if (status !== undefined) {
            updateFields.status = status;
        }
        if (adminReplyImage !== undefined) {
            updateFields.adminReplyImage = adminReplyImage;
        }

        const updatedReport = await Report.findByIdAndUpdate(
            req.params.id,
            updateFields,
            { new: true }
        );

        if (!updatedReport) {
            return res.status(404).json({ message: "Report not found.", error: true, success: false });
        }

        res.json({ message: "Reply sent successfully.", success: true, error: false, data: updatedReport });
    } catch (err) {
        res.status(400).json({ message: err.message || err, error: true, success: false });
    }
};

export default adminReplyController;