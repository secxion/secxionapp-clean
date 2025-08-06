import Report from "../../models/report.js";

const getReportDetailsController = async (req, res) => {
    try {
        if (!req.userId) {
            return res.status(401).json({ message: "Unauthorized! Please login.", error: true, success: false });
        }

        const { reportId } = req.params;
        const report = await Report.findOne({ _id: reportId, userId: req.userId });

        if (!report) {
            return res.status(404).json({ message: "Report not found or does not belong to this user.", error: true, success: false });
        }

        res.json({ message: "Report Details", success: true, error: false, data: report });
    } catch (err) {
        console.error("Error fetching report details:", err);
        res.status(400).json({ message: err.message || "Failed to fetch report details.", error: true, success: false });
    }
};

export default getReportDetailsController;