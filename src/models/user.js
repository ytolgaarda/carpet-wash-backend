
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userModel = new mongoose.Schema({
  name: {type: String, required: true},
  email: {type: String, required: true, unique: true},
  password: {type: String, required: true},
  phone: {type: String},
  addressList: [{
    label: String,
    fullAddress: String,
    location: {
      lat: Number,
      lng: Number
    }
  }],
  role: {type: String, enum: ['customer', 'business'], default: 'customer'},
  createdAt: {type: Date, default: Date.now}
});

// Şifre hashleme middleware
userModel.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Şifre karşılaştırma metodu
userModel.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userModel);