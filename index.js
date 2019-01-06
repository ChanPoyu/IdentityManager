const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const request = require('request');
const bodyParser = require('body-parser');
const multer = require('multer'); // v1.0.5
const upload = multer(); // for parsing multipart/form-data
const Joi = require('joi'); 
const path = require('path');
const Eth = require('./EthProvider.js');
const app = express();
const port = 8000;
const Identity = require('./db/Identity');
require('dotenv').config();



var Web3 = require('web3');
var web3 = undefined;
var networkId = 0;



app.listen(port, () => console.log('server listening on port ' + port));
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

app.post('/storeId2DB', function(req, res){

  var verification = true;
  var network = req.body.network;
  var ethAccount = req.body.ethAccount;
  var id = req.body.identity;

  // start verify datas
  // verify network
  // verify ethAccount
  // verify id name
  // verify id keyHolderAddr
  // verify id claimHolder

  if(verification){

    const identity = new Identity({
      _id: new mongoose.Types.ObjectId(),
      network: network,
      ethAccount: ethAccount,
      identity: {
        name: id.name,
        keyHolderAddr: id.keyHolderAddr,
        claimHolderAddr: id.claimHolderAddr
      },
      date: Date.now()
    });

    identity.save()
    .then(function(result) {
      console.log(result);
      return res.status(201).json({
        message: 'Handleing POST request to /storeId2DB',
        createdId: identity
      });
    })
    .catch(function(err){
      return res.status(500).json({
        message: `Failed to store Identity to DB`
      });
    });
  }else{
    return res.status(400).json({
      message: 'BAD REQUEST! check network config or Id name!!!'
    });
  }
});

/////////////////////////////////////////////////////////////////////////////////
//////////////////////////////// get mothod /////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////

app.get('/eth/GreetingFromBlockchain/', (req, res) => {
  
  web3.eth.getBlockNumber().then((RES) => res.send('Hello this is block no.' + RES));
});

app.get('/test/:aa/:bb', function(req, res){
  var parm = req.params;
  res.send(parm);
});

app.get('/getIdentityByEthAccount/:network/:ethAccount', (req, res) => {

  var network = req.params.network;
  var ethAccount = req.params.ethAccount;

  var sql = {
    "network": network,
    "ethAccount": ethAccount
  };

  Identity.find(sql)
  // Identity.find()
  .then(function(doc){
    if(doc && doc.length != 0){
      return res.status(200).json(doc);
    }else{
      return res.status(404).json({message: "NOT FOUND"});
    }
    
  })
  .catch(function(err){
    return res.status(500).json({message: "QUERY ERROR"});
  });
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

app.get('/getDatasbyObjectId/:Objectid', function(req, res){

  // var objectId = "5c2f043e6a27ee67cadcadc7";
  var objectId = req.params.Objectid;

  Identity.findById(objectId)
  .exec()
  .then(function(doc){
    console.log(doc);
    if(doc){
      res.status(200).json(doc);  
    }else{
      res.status(404).json({message: `No valid entry found for provided ID`});  
    }
  })
  .catch(function(err){
    console.log(err);
    console.log("can't find data which has object id" + objectId);
    res.status(500).json({error: err});
  });

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

