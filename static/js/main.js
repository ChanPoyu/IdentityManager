function IdThumbnailClicked(e){
  var id = e.id;
  // var keyHolderAddress = undefined;
  // var claimHolderAddress = undefined;
  // var keyHolderContract = undefined;

  $.ajax({
    url: '/getDatasbyObjectId/' + id,
    type: 'GET',
    success: (data) => {
      var keyHolderAddress = data.identity.keyHolderAddr;
      var claimHolderAddress = data.identity.claimHolderAddr;

        $.ajax({
          url: "fetchContractDatas/",
          type: "GET",
          success: (data, stat, xhr) => {
            var keyHolderABI = data.keyHolderABI;

            var keyHolderContract = new web3.eth.Contract(keyHolderABI);

            keyHolderContract.options.address = keyHolderAddress;

            keyHolderContract.methods.getKeysByPurpose([1]).call({from: "0x6FE11fF5A4c84f993869e69DAe630CF192c8bbF5"},function(res){

                console.log(res);  
              
            });

          }
        });
    }
  });

};



$("#addKeyBtn").click(function(){

  console.log("clicked");
});

$("#addClaimBtn").click(function(){
  console.log("clicked");
});


$(function(){

  var keyHolderABI = undefined;
  var claimHolderABI = undefined;
  var account = undefined;
  var network = undefined;

  /////////////////////// routines //////////////////////////  
  /////////////////// set eth provider //////////////////////
  if (typeof web3 !== 'undefined') {
    web3 = new Web3(web3.currentProvider);
    
  } else {
      // Set the provider you want from Web3.providers
      web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
  }

  ////////////////// display current Network ////////////////
  web3.eth.net.getId((err, res) => {
    
    if(res){
      switch (res) {
        case 1:
          network = 'mainnet';
          var networkDisplay = new Vue({
            el: '#networkDisplay',
            data: {network: 'Mainnet'}
          });
          
            break
        case 3:
          network = 'ropsten';
          var networkDisplay = new Vue({
            el: '#networkDisplay',
            data: {network: 'Ropsten'}
          });
          
            break
        case 4:
        network = 'rinkeby';
          var networkDisplay = new Vue({
            el: '#networkDisplay',
            data: {network: 'Rinkeby'}
          });
          
        case 42:
          network = 'kovan';
          var networkDisplay = new Vue({
            el: '#networkDisplay',
            data: {network: 'Kovan'}
          });

            break
        default:
          network = 'localhost';
          var networkDisplay = new Vue({
            el: '#networkDisplay',
            data: {network: 'localhost'}
          });
      }
    }else{
      var networkDisplay = new Vue({
        el: '#networkDisplay',
        data: {network: 'No network'}
      });
    }
    
  }).then(function(){
    web3.eth.getAccounts((err, res) => {
      if(res){
        if (res == ""){
          var networkDisplay = new Vue({
              el: '#diplayAccount',
              data: {ethAccount: "Can't found any account, please check your provider configuration"}
            });
        }else{
          account = res[0];
          var networkDisplay = new Vue({
              el: '#diplayAccount',
              data: {ethAccount: res[0]}
            }); 
        }
      }
    }).then(function(){
      var url = '/getIdentityByEthAccount/' + network + '/' + account;

      $.ajax({
        url: url,
        type: 'GET',
        success: (data) => {
          for(var i = 0; i < data.length; i ++){
            var name = data[i].identity.name;
            var id = data[i]._id;
            var thumbnail = `<div class="idThumbnail" id="${id}" onclick="IdThumbnailClicked(this)"><div>${name}</div></div>`;
            $("#idArray").prepend(thumbnail);
          }
        }
      });
    });
  });

  ///////////// handel add Id btn clicked ////////////////////
  $("#addIdBtn").click(function(){

    $(this).prop("disabled", true);

    $("#IdentityFormContainer").css("display", "flex");

    $("#overlay").css("display", "block");

    // $(this).prop("disabled", false);
    
  });

  ///////////// input form bg overlay ///////////////////////
  $("#overlay").click(function(){
    $(this).css("display", "none");
    $("#IdentityFormContainer").css("display", "none");
    $("#IdName").val("");

  });

  ////////////// handel id form btn /////////////////////////
  $("#idFormBtn").click(function(){
    var name = $("#IdName").val();
    $("#IdName").val("");

    // var ABI = [{"constant":false,"inputs":[],"name":"createClaimHolder","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"anonymous":false,"inputs":[{"indexed":false,"name":"contractAddress","type":"address"}],"name":"newContractCreated","type":"event"}];
    // var address = "0xA02FE433F0Fd2E203441DD7265b9b9FB95292F0A"; // claimHolder factory address on ropsten
    // var claimHolderFactory = new web3.eth.Contract(ABI, address);




    if (!name){
      console.log("input your name!")
      $("#errorMsg").css("display", "block");
    }
    else{
      // web3.eth.getAccounts((err, res) => {
      //   var address = res[0];
      var ABI = [{"constant":false,"inputs":[],"name":"createClaimHolder","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"anonymous":false,"inputs":[{"indexed":false,"name":"contractAddress","type":"address"}],"name":"newContractCreated","type":"event"}];
       // claimHolder factory address on ropsten
      var claimHolderFactory = new web3.eth.Contract(ABI, address);

      console.log(claimHolderFactory);
      $("#loader").css("display", "flex");

      web3.eth.getAccounts(function(err,res){
        var account = res[0];
        console.log(account);

        claimHolderFactory.methods.createClaimHolder().send({from: account})
        .then(function(receipt){
          console.log(receipt);
          $("#loader").css("display", "none");
        });
        //   console.log();
        //   $("#loader").css("display", "none");
        // })
        // .catch(function(err){
        //   console.log(err);
        // });

      });
      
        // fetch data
        // $.ajax({
      //     url: "fetchContractDatas/",
      //     type: "GET",
      //     success: (data, stat, xhr) => {
      //       var keyHolderABI = data.keyHolderABI;
      //       var keyHolderByte = data.keyHolderByteCode;

      //       var claimHolderABI = data.claimHolderABI;
      //       var claimHolderByte = data.claimHolderByteCode;

      //       var keyHolderContract = new web3.eth.Contract(keyHolderABI);
      //       keyHolderContract.options.data = keyHolderByte;

      //       var claimHolderCotract = new web3.eth.Contract(claimHolderABI);
      //       claimHolderCotract.options.data = claimHolderByte;

      //       var keyHolderAddress = undefined;
      //       var claimHolderAddress = undefined;
      //       var fisrtKey = undefined;

      //       var IDdata = {
      //         "network": "",
      //         "ethAccount": address,
      //         "identity": {
      //           "name": "",
      //           "keyHolderAddr": "",
      //           "claimHolderAddr": ""
      //         }
      //       };

      //       console.log(IDdata);

      //       //////////////  deploy keyHolder ///////////////

            
      //       keyHolderContract.deploy()
      //       .send({
      //         from: address,
      //         gas: 1002702,
      //         gasPrice: 100000000000
      //        })
      //       .on('receipt', function (receipt){
      //         keyHolderAddress = receipt.contractAddress;
      //         console.log("keyHolder address:" + keyHolderAddress);
      //       })
      //       .on('transactionHash', function(transactionHash){
      //         console.log('transactionHash:' + transactionHash);
      //         web3.eth.getTransactionReceipt(transactionHash)
      //         .then(function(obj){
      //           console.log(obj);
      //         });
      //       })
      //       .catch((err) => {
      //           console.log(err);
      //           $("#loader").css("display", "none");
      //       })
      //       .then(function(){

      //         ///////////// deploy claim holder //////////
      //         claimHolderCotract.deploy()
      //         .send({
      //           from: address,
      //           gas: 4712388,
      //           gasPrice: 100000000000
      //         })
      //         .on('receipt', function(receipt){
      //           claimHolderAddress = receipt.contractAddress;
      //           console.log("claimHolder address:" + claimHolderAddress);
      //           $("#loader").css("display", "none");
      //         })
      //         .catch(function(err){
      //           console.log(err);
      //           $("#loader").css("display", "none");
      //         })
      //         .then(function(){
      //           if(keyHolderAddress && claimHolderAddress){
      //             //////////////////////////////////////////////////////
      //             //////////////////////////////////////////////////////
      //             ////////////////////// add to db /////////////////////
      //             //////////////////////////////////////////////////////
      //             //////////////////////////////////////////////////////
      //             IDdata.network = network;
      //             IDdata.ethAccount = address;
      //             IDdata.identity.name = name;
      //             IDdata.identity.keyHolderAddr = keyHolderAddress;
      //             IDdata.identity.claimHolderAddr = claimHolderAddress;

      //             $.ajax({
      //               url: 'storeId2DB',
      //               type: 'POST',
      //               data: IDdata,
      //               success: (result) => {
      //                 var _id = result.createdId._id;
      //                 var thumbnail = `<div class="idThumbnail" id="${_id}" onclick="IdThumbnailClicked(this)"><div>${name}</div></div>`;
      //                 $("#idArray").prepend(thumbnail);

      //                 return 
      //               }
      //             });

      //           }else{
      //             return console.log("something wnet wrong!!");
      //           }
      //         })
      //         .then(function(){
      //           keyHolderContract.options.address = keyHolderAddress;

      //           keyHolderContract.methods.getKeysByPurpose(1).call({from: address}, function(err, res){console.log(res)});
                
      //         })
      //         .then(function(){
      //           ///////////////////// get first key ///////////////////


      //         });

      //         /////////// display keys(first) and claims(null) ///////////


      //       });
      //     }
      //   });

      // });

      $("#IdentityFormContainer").css("display", "none");
      $("#overlay").css("display", "none");
    }

  });
});