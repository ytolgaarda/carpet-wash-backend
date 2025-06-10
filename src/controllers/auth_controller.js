const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = '15m';
const REFRESH_TOKEN_EXPIRES_IN = '7d';


// Register - Kayıt İşlemi
exports.register = async (req, res) => {
  const {name, email, password, phone, role} = req.body;

  try {
    const userExists = await User.findOne({email});
    if (userExists) return res.status(400).json({message: 'Email zaten kayıtlı'});

    const user = await User.create({name, email, password, phone, role});
    const token = generateToken(user._id);

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      token,
    });
  } catch (error) {
    res.status(500).json({message: error.message});
  }
};


// Login - Giriş İşlemi
exports.login = async (req, res) => {
  const {email, password} = req.body;

  try {
    const user = await User.findOne({email});
    if (!user) return res.status(400).json({message: 'Geçersiz email veya şifre'});

    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(400).json({message: 'Geçersiz email veya şifre'});

    const token = generateToken(user._id);

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      token,
    });
  } catch (error) {
    res.status(500).json({message: error.message});
  }
};

