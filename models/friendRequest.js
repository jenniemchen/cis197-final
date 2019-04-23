var mongoose = require('mongoose')

const friendRequest = new mongoose.Schema({
  from: { type: String },
  to: { type: String },
  accepted: { type: Boolean}
})

module.exports = mongoose.model('FriendRequest', friendRequest);
