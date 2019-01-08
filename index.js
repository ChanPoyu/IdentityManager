const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const request = require('request');
const bodyParser = require('body-parser');
const multer = require('multer'); // v1.0.5
const upload = multer(); // for parsing multipart/form-data
const Joi = require('joi'); 
const path = require('path');
const app = express();
const port = 80;
const cors = require('cors');
const Identity = require('./db/Identity');
require('dotenv').config();


// var Web3 = require('web3');
// var web3 = undefined;
// var networkId = 0;


app.listen(port, () => console.log('server listening on port ' + port));
app.set('views', path.join(__dirname, 'templates'));
app.set('view engine', 'ejs');

/////////////////////////////////////////////////////////////////////////////////
//////////////////////////////// middlewares ////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////

app.use(cors());
// app.use(express.static(__dirname + '/static'));
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

app.post('/storeId2DB', function(req, res){

  var network = req.body.network;
  var ethAccount = req.body.ethAccount;
  var id = req.body.identity;

  var idObj =  {
    ethAccount: ethAccount,
      identity: {
        name: id.name,
        keyHolderAddr: id.keyHolderAddr,
        claimHolderAddr: id.claimHolderAddr
      }
  };

  var velidationInfo = validateIdentity(idObj);

  if(!velidationInfo.error){
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
    res.send(velidationInfo.error);
  }
});

/////////////////////////////////////////////////////////////////////////////////
//////////////////////////////// get mothod /////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////
app.get('/', function(req, res) {
  res.send("yo");
});


app.get('/sayHello', function(req, res){

  res.send({message: "hello dicky"});
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
//////////////////////////////// functions //////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////

function validateIdentity(id) {
  const schema = {
    ethAccount: Joi.string().regex(/^0[xX][a-fA-F0-9]/).length(42),
      identity: {
        name: Joi.string().min(1).max(100),
        keyHolderAddr: Joi.string().regex(/^0[xX][a-fA-F0-9]/).length(42),
        claimHolderAddr: Joi.string().regex(/^0[xX][a-fA-F0-9]/).length(42)
      }
  };

  return Joi.validate(id, schema);
}



