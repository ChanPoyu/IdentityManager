var mongoose = require('mongoose');


var IdentitySchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  network: String,
  ethAccount: String,
  identity: {
    name: String,
    keyHolderAddr: String,
    claimHolderAddr: String
  },
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Identity', IdentitySchema);