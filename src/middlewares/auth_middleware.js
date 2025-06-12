const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  // Token header’da yoksa veya "Bearer ..." formatında değilse
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({message: 'Yetkisiz erişim'});
  }

  // Header'dan token'ı ayıkla
  const token = authHeader.split(' ')[1];

  try {
    // Token'ı doğrula
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // İstek objesine kullanıcı bilgisi ekle (ID gibi)
    req.user = decoded;

    // Korumalı route'a devam etmesine izin ver
    next();
  } catch (err) {
    return res.status(401).json({message: 'Geçersiz token'});
  }
}

module.exports = authMiddleware;
