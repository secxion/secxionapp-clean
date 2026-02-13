import mongoose from "mongoose";

const contactUsSchema = new mongoose.Schema({
  name: {
    type: String,
    default: null,
  },
  email: {
    type: String,
    required: true,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, // Basic email validation
  },
  phoneNumber: {
    type: String,
    default: null,
  },
  reason: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const ContactUs = mongoose.model("ContactUs", contactUsSchema);

export default ContactUs;
