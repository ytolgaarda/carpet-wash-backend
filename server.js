const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./src/config/db');
const authRoutes = require('./src/routes/auth');

dotenv.config();

const app = express()


// Gelen json verileri okuyabilmek için
app.use(express.json());

// auth rotaları
app.use('/api/auth', authRoutes);


async function startServer() {
  try {
    await connectDB();

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Sserver ${PORT} portunda çalışıyor`);
    });

  } catch (error) {
    console.error('Sunucu başlatma hatası:', error.message);
    process.exit(1);
  }
}


startServer();