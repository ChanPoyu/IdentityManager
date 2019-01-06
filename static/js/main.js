function IdThumbnailClicked(e){
  var id = e.id;
  
  $.ajax({
    url: '/getDatasbyObjectId/' + id,
    type: 'GET',
    success: (data) => {
      var keyHolderAddress = data.identity.keyHolderAddr;
      var claimHolderAddress = data.identity.claimHolderAddr;

      // var keyHolderContract = web3.eth.Contract(keyHolderABI);
      // keyHolder.options.address = keyHolderAddress;

      // keyHolderContract.methods.getkeysByPurpose(1).then();

      console.log("keyHolder: "+ keyHolderAddress);
      console.log("claimHolder: "+ claimHolderAddress);
    }
  });
};


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
  

  //// fetch key and claim holder datas from db and render ////

  $.ajax({
    url:'',
    type:'',
    success: (data) => {
      // make div tag by Object Id
      //
    }
  });

  ///////// fetch keys and claims and render /////////////////

  keyHolderContract = undefined;

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

    if (!name){
      console.log("input your name!")
      $("#errorMsg").css("display", "block");
    }
    else{
      web3.eth.getAccounts((err, res) => {
        var address = res[0];

        $("#loader").css("display", "flex");

        // fetch data
        $.ajax({
          url: "fetchContractDatas/",
          type: "GET",
          success: (data, stat, xhr) => {
            var keyHolderABI = data.keyHolderABI;
            var keyHolderByte = data.keyHolderByteCode;

            var claimHolderABI = data.claimHolderABI;
            var claimHolderByte = data.claimHolderByteCode;

            var keyHolderContract = new web3.eth.Contract(keyHolderABI);
            keyHolderContract.options.data = keyHolderByte;

            var claimHolderCotract = new web3.eth.Contract(claimHolderABI);
            claimHolderCotract.options.data = claimHolderByte;

            var keyHolderAddress = undefined;
            var claimHolderAddress = undefined;
            var fisrtKey = undefined;

            var IDdata = {
              "network": "",
              "ethAccount": account,
              "identity": {
                "name": "",
                "keyHolderAddr": "",
                "claimHolderAddr": ""
              }
            };

            //////////////  deploy keyHolder ///////////////
            keyHolderContract.deploy()
            .send({
              from: address,
                gas: 4712388,
                gasPrice: 100000000
             })
            .on('receipt', function (receipt){
              keyHolderAddress = receipt.contractAddress;
              console.log("keyHolder address:" + keyHolderAddress);
            })
            .then((ContractInstance) => {
                var ContractAddress = ContractInstance._address;

                // $.ajax({
                //  url: "addKeyHolderToDB",
                //  type: "POST",
                //  data: {
                //    OwnerAddress: address,
                //    keyHolderContractAddress: ContractAddress,
                //  }
                // });
            })
            .catch((err) => {
                console.log(err);
                $("#loader").css("display", "none");
            })
            .then(function(){

              ///////////// deploy claim holder //////////
              claimHolderCotract.deploy()
              .send({
                from: address,
                gas: 4712388,
                gasPrice: 100000000
              })
              .on('receipt', function(receipt){
                claimHolderAddress = receipt.contractAddress;
                console.log("claimHolder address:" + claimHolderAddress);
                $("#loader").css("display", "none");
              })
              .catch(function(err){
                console.log(err);
                $("#loader").css("display", "none");
              })
              .then(function(){
                if(keyHolderAddress && claimHolderAddress){
                  //////////////////////////////////////////////////////
                  //////////////////////////////////////////////////////
                  ////////////////////// add to db /////////////////////
                  //////////////////////////////////////////////////////
                  //////////////////////////////////////////////////////
                  IDdata.network = network;
                  IDdata.ethAccount = address;
                  IDdata.identity.name = name;
                  IDdata.identity.keyHolderAddr = keyHolderAddress;
                  IDdata.identity.claimHolderAddr = claimHolderAddress;

                  $.ajax({
                    url: 'storeId2DB',
                    type: 'POST',
                    data: IDdata,
                    success: (result) => {
                      console.log(result);
                    }
                  });
                  /// log
                  console.log("keys and claims holder added to DB");
                }else{
                  return console.log("something wnet wrong!!");
                }
              })
              .then(function(){
                var thumbnail = `<div class="idThumbnail" id="dipsy" onclick="IdThumbnailClicked(this)"><div>${name}</div></div>`;
                $("#idArray").prepend(thumbnail);
              })
              .then(function(){
                ///////////////////// get first key ///////////////////


              });

              /////////// display keys(first) and claims(null) ///////////


            });
          }
        });

      });

      $("#IdentityFormContainer").css("display", "none");
      $("#overlay").css("display", "none");
    }

  });

  $("#addKeyBtn").click(function(){

    console.log("clicked");
  });

  $("#addClaimBtn").click(function(){
    console.log("clicked");
  });

  //////////////// Id thumbnail clicked ////////////////
  













});