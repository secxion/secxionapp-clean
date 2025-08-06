import ContactUs from "../models/contactUsModel.js";

export const createContactUsMessage = async (req, res) => {
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
      message: 'Thanks for contacting us! We will get back to you ASAP.',
      data: savedRequest,
    });
  } catch (error) {
    console.error('Error saving contact request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit your request. Please try again later.',
      error: error.message,
    });
  }
};

export const getAllContactUsMessages = async (req, res) => {
  try {
    const messages = await ContactUs.find().sort({ timestamp: -1 });
    res.status(200).json({
      success: true,
      count: messages.length,
      data: messages,
    });
  } catch (error) {
    console.error('Error fetching contact us messages:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch contact us messages.',
      error: error.message,
    });
  }
};

export const getContactUsMessageById = async (req, res) => {
  try {
    const message = await ContactUs.findById(req.params.id);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Contact message not found.',
      });
    }
    res.status(200).json({
      success: true,
      data: message,
    });
  } catch (error) {
    console.error('Error fetching contact us message by ID:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch contact us message.',
      error: error.message,
    });
  }
};

export const updateContactUsMessageStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const updatedMessage = await ContactUs.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );
    if (!updatedMessage) {
      return res.status(404).json({
        success: false,
        message: 'Contact message not found.',
      });
    }
    res.status(200).json({
      success: true,
      message: 'Contact message status updated successfully.',
      data: updatedMessage,
    });
  } catch (error) {
    console.error('Error updating contact us message status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update contact us message status.',
      error: error.message,
    });
  }
};
