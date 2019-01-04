 const express = require("express");
const mongoose = require("mongoose");
const morgan = require("morgan");
const request = require("request");
const bodyParser = require('body-parser');
const multer = require('multer'); // v1.0.5
const upload = multer(); // for parsing multipart/form-data
const Joi = require('joi'); 
const path = require("path");
const Eth = require("./EthProvider.js");
const app = express();
const port = 8000;
const Identity = require('./db/Identity');
require('dotenv').config();



var Web3 = require('web3');
var web3 = undefined;
var networkId = 0;



app.listen(port, () => console.log("server listening on port " + port));
app.set('views', path.join(__dirname, 'templates'));
app.set('view engine', 'ejs');

/////////////////////////////////////////////////////////////////////////////////
//////////////////////////////// middlewares ////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////

app.use(express.static(__dirname + '/static'));
app.use(morgan('combined'));  // logger middleware
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

/////////////////////////////////////////////////////////////////////////////////
///////////////////////////// DB connection /////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////
var dbPassword = process.env.MONGO_PASSWORD;
mongoose.connect('mongodb+srv://DipsyChan:'+dbPassword+'@cluster0-g6fei.mongodb.net/test?retryWrites=true', function (err) {
  if(err){
    console.error(err);
  }else{
    console.log('successfully connected to MongoDB!!');
  }
});

/////////////////////////////////////////////////////////////////////////////////
//////////////////////////////// post mothod ////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////
app.post('/configNetwork', function(req, res){
  var networkId = parseInt(req.body.network);
  
  if(networkId == 1){
    web3 = new Web3(new Web3.providers.WebsocketProvider("wss://mainnet.infura.io/ws/v3/88d2f86d1bfc42689611a88ea2a5dd43"));
    return res.send('server set to mainnet');
  }else if(networkId == 3){
    web3 = new Web3(new Web3.providers.WebsocketProvider("wss://ropsten.infura.io/ws/v3/88d2f86d1bfc42689611a88ea2a5dd43"));
    return res.send('server set to ropsten');
  }else if(networkId == 4){
    web3 = new Web3(new Web3.providers.WebsocketProvider("wss://rinkeby.infura.io/ws/v3/88d2f86d1bfc42689611a88ea2a5dd43"));
    return res.send('server set to rinkeby');
  }else if(networkId == 42){
    web3 = new Web3(new Web3.providers.WebsocketProvider("wss://kovan.infura.io/ws/v3/88d2f86d1bfc42689611a88ea2a5dd43"));
    return res.send('server set to kovan');
  }else{
    return res.send('FROM SEVER: somthing went wrong with your network provider!');
  }
  
});

app.post('/IdentityPage', function(req, res){

  // Get Id and network
  // if no redirect to metamask
  // get data from blockchain by account
  // render data to personal page
  return res.send(req.body);
});


app.post('/storeId2DB', function(req, res){

  var network = req.body.network;
  var ethAccounct = req.body.ethAccount;
  var idetity = req.body.identity;

  const identity = new Identity({
    _id: new mongoose.Types.ObjectId(),
    network: "aaa",
    ethAccount: "bbb",
    identity: {
      name: "ccc",
      keyHolderAddr: "ddd",
      ClaimHolderAddre: "eee"
    },
    date: Date.now()
  });

  identity.save()
  .then(function(result) {
    console.log(result);
  });

  return res.stat(201).json({
    message: 'Handleing POST request to /storeId2DB',
    createdId: identity
  })
});

/////////////////////////////////////////////////////////////////////////////////
//////////////////////////////// get mothod /////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////


app.get('/eth/GreetingFromBlockchain/', (req, res) => {
  
  web3.eth.getBlockNumber().then((RES) => res.send('Hello this is block no.' + RES));

});

app.get('/IdentityPage', (req, res) => {
  return res.render("main");
});

app.get('/fetchContractDatas', (req, res) => {
  var keyHolderContractObject = Eth.keyHolderContract;
  var keyHolderABI = keyHolderContractObject.KeyHolderABI;
  var keyHolderByteCode = keyHolderContractObject.KeyHolderByteCode;

  var claimHolderContractObject = Eth.claimHolderContract;
  var claimHolderABI = claimHolderContractObject.ClaimHolderABI;
  var claimHolderByteCode = claimHolderContractObject.ClaimHolderByteCode;

  return res.send({
    keyHolderABI: keyHolderABI, 
    keyHolderByteCode: keyHolderByteCode,
    claimHolderABI: claimHolderABI,
    claimHolderByteCode: claimHolderByteCode

  });
  
});

app.get("/getDatasbyObjectId", function(){
  var objectId = "5c2c9a279bf4f25a352dc1a8";
});

/////////////////////////////////////////////////////////////////////////////////
//////////////////////////////// delete mothod //////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////



function validateName(course) {
  const schema = {
    name: Joi.string().min(3).required()
  };

  return Joi.validate(course, schema);

}

