const connectToDatabase = require("../config/db");
const User = require("../models/user");

export default async function handler(req, res) {
  try {
    await connectToDatabase();

    if (req.method === 'POST') {
      console.log('Request body:', req.body); // Log the incoming request
      
      const { email, password, role = 'User' } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ 
          success: false, 
          message: 'Email and password are required' 
        });
      }

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ 
          success: false, 
          message: 'User already exists' 
        });
      }

      // Create new user
      const newUser = new User({ 
        email, 
        password, 
        role 
      });
      
      await newUser.save();
      console.log('User created successfully:', newUser);

      return res.status(201).json({ 
        success: true,
        user: {
          email: newUser.email,
          role: newUser.role
        } 
      });
    }
  } catch (error) {
    console.error('Error in user creation API:', error);
    return res.status(500).json({ 
      success: false, 
      message: error.message || 'Internal server error',
      error: error.toString() 
    });
  }

  return res.status(405).json({ 
    message: 'Method not allowed' 
  });
}