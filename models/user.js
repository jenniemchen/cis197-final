var mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  name: { type: String },
  email: { type: String, unique: true },
  access_token: { type: String}, 
  refresh_token: { type: String }, 
  friends: { type: [String] }
})

module.exports = mongoose.model('User', userSchema);
