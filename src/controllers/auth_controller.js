const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');



const generateTokens = (userId) => {
  const accessToken = jwt.sign({id: userId}, process.env.JWT_SECRET, {
    expiresIn: '15m', // kısa süreli
  });

  const refreshToken = jwt.sign({id: userId}, process.env.JWT_REFRESH_SECRET, {
    expiresIn: '7d', // uzun süreli
  });

  return {accessToken, refreshToken};
};



// Register - Kayıt İşlemi
exports.register = async (req, res) => {
  const {name, email, password, phone, role} = req.body;

  try {
    const userExists = await User.findOne({email});
    if (userExists) return res.status(400).json({message: 'Email zaten kayıtlı'});

    const user = new User({
      name,
      email,
      password,
      phone,
      role
    });


    const {accessToken, refreshToken} = generateTokens(user._id);
    user.refreshToken = refreshToken;
    await user.save();

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: accessToken,
      refreshToken,
    });

  } catch (error) {
    res.status(500).json({message: error.message});
  }
};

// ✅ Kullanıcı Giriş
exports.login = async (req, res) => {
  const {email, password} = req.body;

  try {
    const user = await User.findOne({email});
    if (!user) return res.status(400).json({message: 'Geçersiz email veya şifre'});

    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(400).json({message: 'Geçersiz email veya şifre'});

    const {accessToken, refreshToken} = generateTokens(user._id);
    user.refreshToken = refreshToken;

    await user.save();

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      token: accessToken,
      refreshToken,
    });
  } catch (error) {
    res.status(500).json({message: error.message});
  }
};

// Refresh Token Endpoint
exports.refreshToken = async (req, res) => {
  const {refreshToken} = req.body;

  if (!refreshToken) {
    return res.status(401).json({message: 'Refresh token gerekli'});
  }

  try {
    // Refresh token'ı doğrula
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    // Kullanıcıyı bul
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({message: 'Kullanıcı bulunamadı'});
    }

    // Refresh token eşleşiyor mu kontrolü
    if (user.refreshToken !== refreshToken) {
      return res.status(403).json({message: 'Geçersiz refresh token'});
    }

    // Yeni tokenlar üret
    const {accessToken, refreshToken: newRefreshToken} = generateTokens(user._id);

    // Kullanıcı refresh token'ını güncelle
    user.refreshToken = newRefreshToken;
    await user.save();

    res.json({
      accessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    res.status(403).json({message: 'Token süresi dolmuş veya geçersiz'});
  }
};