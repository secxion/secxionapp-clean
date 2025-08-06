import Report from "../../models/report.js";

async function submitReportController(req, res) {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Unauthorized! Please login.", error: true, success: false });
    }

    const { email, name, category, message, image } = req.body;

    if (!category || !message) {
      return res.status(400).json({ message: "Category and message are required.", error: true, success: false });
    }

    const newReport = new Report({
      userId: req.userId,
      email: email || "No Email",
      name: name || "Anonymous",
      category,
      message,
      image: image || "",
    });

    const savedReport = await newReport.save();

    res.status(201).json({ message: "Report submitted successfully.", error: false, success: true, data: savedReport });
  } catch (err) {
    res.status(400).json({ message: err.message || err, error: true, success: false });
  }
}

export default submitReportController;
