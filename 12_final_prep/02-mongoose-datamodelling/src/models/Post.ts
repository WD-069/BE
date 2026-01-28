import { model, Schema } from "mongoose";

const postSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default model("Post", postSchema);

// Embedded Documents:
// const orderSchema = new Schema({
//     customerName: String,
//     products: [{productName: String, quantity: Number}]
// })
