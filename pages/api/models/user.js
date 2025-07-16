const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      default: "User",
    },
    createdBy: { 
      type: String, 
      required: true 
    }, // This will store the admin's email
  });

module.exports = mongoose.models.User || mongoose.model("User", UserSchema);
