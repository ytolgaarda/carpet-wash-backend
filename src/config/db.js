const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();



async function connectDB() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('db uri error');
    }

    console.log('Veritabanına bağlanılıyor...');

    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    console.log('Veritabanı bağlantısı başarılı');

  } catch (error) {
    console.error('Veritabanı bağlantı hatası:', error.message);

    if (error.message.includes('bad auth')) {
      console.error('Kimlik doğrulama hatası: kullanıcı adı veya şifre yanlış');
    } else if (error.message.includes('ENOTFOUND')) {
      console.error('Ağ hatası: MongoDB sunucusuna ulaşılamıyor');
    }

    process.exit(1);
  }
}

// Connection event listeners
mongoose.connection.on('connected', () => {
  console.log('🔗 Mongoose MongoDB\'ye bağlandı');
});

mongoose.connection.on('error', (err) => {
  console.error('Mongoose bağlantı hatası:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('🔌 Mongoose MongoDB bağlantısı kesildi');
});



module.exports = connectDB;