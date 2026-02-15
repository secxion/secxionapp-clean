import mongoose from "mongoose";

const dataPadSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      default: "",
    },
    content: {
      type: String,
      default: "",
    },
    media: {
      type: [
        {
          type: String,
        },
      ],
      default: [],
    },
    tags: {
      type: [
        {
          type: String,
        },
      ],
      default: [],
    },
  },
  { timestamps: true },
);

const DataPad = mongoose.model("DataPad", dataPadSchema);
export default DataPad;
