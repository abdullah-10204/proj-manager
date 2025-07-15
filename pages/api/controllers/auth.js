const connectToDatabase = require("../config/db");
const User = require("../models/user");

const loginUser = async (req, res) => {
  await connectToDatabase();

  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user || user.password !== password) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  return res.status(200).json({
    message: "Login successful",
    role: user.role || "User",
  });
};



module.exports = { loginUser };
