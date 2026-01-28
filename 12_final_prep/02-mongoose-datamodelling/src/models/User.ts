import { kMaxLength } from "node:buffer";
import { model, Schema } from "mongoose";

const userSchema = new Schema({
  firstName: {
    type: String,
    required: [true, "Firstname is required"],
  },
  lastName: {
    type: String,
    required: [true, "Lastname is required"],
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  role: {
    type: String,
    default: "user",
  },
  favourites: [{ type: Schema.Types.ObjectId, ref: "Post" }],

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default model("User", userSchema);
