const connectToDatabase = require("../config/db");
const User = require("../models/user");

const getUsers = async (req, res) => {
    try {
      await connectToDatabase();
      const { createdBy } = req.query;
      
      // If createdBy parameter is provided, filter by it
      const query = createdBy ? { createdBy } : {};
      const users = await User.find(query, 'email role createdBy');
      
      res.status(200).json(users);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

export default async function handler(req, res) {
  if (req.method === 'GET' && req.query.action === 'getUsers') {
    return await getUsers(req, res);
  }
    try {
      await connectToDatabase();
  
      if (req.method === 'POST') {
        console.log('Request body:', req.body);
        
        const { email, password, role = 'User', createdBy } = req.body;
        
        if (!email || !password || !createdBy) {
          return res.status(400).json({ 
            success: false, 
            message: 'Email, password, and createdBy are required' 
          });
        }
  
        const existingUser = await User.findOne({ email });
        if (existingUser) {
          return res.status(400).json({ 
            success: false, 
            message: 'User already exists' 
          });
        }
  
        const newUser = new User({ 
          email, 
          password, 
          role,
          createdBy // Add the admin's email here
        });
        
        await newUser.save();
        console.log('User created successfully:', newUser);
  
        return res.status(201).json({ 
          success: true,
          user: {
            email: newUser.email,
            role: newUser.role,
            createdBy: newUser.createdBy
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