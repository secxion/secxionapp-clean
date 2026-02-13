import ContactUs from "../models/contactUsModel.js";

export const createContactUsMessage = async (req, res, next) => {
  try {
    const { name, email, phoneNumber, reason } = req.body;
    const newContactRequest = new ContactUs({
      name,
      email,
      phoneNumber,
      reason,
    });
    const savedRequest = await newContactRequest.save();
    res.status(201).json({
      success: true,
      message: "Thanks for contacting us! We will get back to you ASAP.",
      data: savedRequest,
    });
  } catch (error) {
    error.message = "Failed to submit your request. Please try again later.";
    next(error);
  }
};

export const getAllContactUsMessages = async (req, res, next) => {
  try {
    const messages = await ContactUs.find().sort({ timestamp: -1 });
    res.status(200).json({
      success: true,
      count: messages.length,
      data: messages,
    });
  } catch (error) {
    error.message = "Failed to fetch contact us messages.";
    next(error);
  }
};

export const getContactUsMessageById = async (req, res, next) => {
  try {
    const message = await ContactUs.findById(req.params.id);
    if (!message) {
      const err = new Error("Contact message not found.");
      err.status = 404;
      return next(err);
    }
    res.status(200).json({
      success: true,
      data: message,
    });
  } catch (error) {
    error.message = "Failed to fetch contact us message.";
    next(error);
  }
};

export const updateContactUsMessageStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const updatedMessage = await ContactUs.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true },
    );
    if (!updatedMessage) {
      const err = new Error("Contact message not found.");
      err.status = 404;
      return next(err);
    }
    res.status(200).json({
      success: true,
      message: "Contact message status updated successfully.",
      data: updatedMessage,
    });
  } catch (error) {
    error.message = "Failed to update contact us message status.";
    next(error);
  }
};
