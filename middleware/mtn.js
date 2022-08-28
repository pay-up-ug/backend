const { v4: uuidv4 } = require('uuid');
const axios = require('axios').default;

exports.MobileMoneyMtnTest = async (payload,next) =>{
    var url =
    'https://sandbox.momodeveloper.mtn.com/collection/v1_0/requesttopay';
   var idx;

//let resp = await TokenGetter();
var tokenUrl = 'https://sandbox.momodeveloper.mtn.com/collection/token/';
axios({
    method: 'post',
    url: tokenUrl,
    headers: {
        'Authorization': process.env.MOMO_ENCODED,
        'Ocp-Apim-Subscription-Key': process.env.MOMO_MY_SECRET_SUBSCRIPTION_KEY,
    }
  }).then(( response) => {
   statusCode = response.statusCode;
  if (statusCode < 200 || statusCode >= 400 ) {
    const ret = {
        state:"failed",
        message:"failed to get token"
    }    
   
    next(ret)
  } else {
    idx = uuidv4();
    var auth2 = "Bearer"+" "+ response.data.access_token;
    axios({
      method: 'post',
      url: url,
      data: {
          amount: payload.amount,
          currency: "EUR",
          externalId: idx,
          payer: {
            partyIdType: "MSISDN",
            partyId: payload.number,
          },
          payerMessage: "Pay for to"+" "+payload.ownerName,
          payeeNote: "Enter pin to confirm",
      },
      headers: {
        'Authorization': auth2,
        'X-Reference-Id': idx,
        'X-Target-Environment': 'sandbox',
        'Content-Type': 'application/json',
        'Ocp-Apim-Subscription-Key': process.env.MOMO_MY_SECRET_SUBSCRIPTION_KEY,
      }
    })
    .then(( response)=> {
      var statusCode = response.statusCode;
      //check status code
      if (statusCode < 200 || statusCode >= 400) {
        const ret = {
          state: "failed",
          errorCode: statusCode
        }
        next(ret)
      } else {
          const ret = {
              state: "success",
              token: "token",
              id:idx
            }
          // console.log(ret)
          next(ret)
      }
    });
   }
});

}
exports.handleTracking = async (id,callback)=>{
    TokenGetter(async function(result){
      if(result.state === "success"){
        const payload = {
            token: result.token.access_token,
            id
        }
        //  console.log(result.token.access_token)
        TransactionState(payload, async function(result){
            callback(result)
        });
      }else{
        callback(result)
      }
   });
}

exports.MobileMoneyTransferTest = async (payload,next) =>{
  var url2 =
  'https://sandbox.momodeveloper.mtn.com/disbursement/v1_0/transfer';
 var idx;
//let resp = await TokenGetter();
var tokenUrl = 'https://sandbox.momodeveloper.mtn.com/disbursement/token/';
axios({
  method: 'post',
  url: tokenUrl,
  headers: {
      'Authorization': process.env.MOMO_MY_TRANSFER_ENCODED,
      'Ocp-Apim-Subscription-Key': process.env.MOMO_MY_TRANSFER_PRIMARY_KEY,
  }
}).then((response) => {
 statusCode = response.statusCode;
if (statusCode < 200 || statusCode >= 400 ) {
  const ret = {
      state:"failed",
      message:"failed to get token"
  }    
 
  next(ret)
} else {
  idx = uuidv4();
  var auth4 = "Bearer"+" "+response.data.access_token;
  axios({
    method: 'post',
    url: url2,
    data: {
        amount:payload.amount,
        currency:"EUR",
        externalId:idx,
        payee: {
          partyIdType: "MSISDN",
          partyId: payload.number,
        },
        payerMessage: "Transfer to"+" "+payload.ownerName,
        payeeNote: "Secured by payup"
    },
    headers: {
      'Host': 'sandbox.momodeveloper.mtn.com',
      'Authorization':auth4,
      'X-Reference-Id':idx,
      'X-Target-Environment':'sandbox',
      'Content-Type':'application/json',
      'Ocp-Apim-Subscription-Key':process.env.MOMO_MY_TRANSFER_PRIMARY_KEY,
    }
  })
  .then(( response)=> {
    var statusCode = response.statusCode;
    //check status code
    if (statusCode < 200 || statusCode >= 400) {
      const ret = {
        state: "failed",
        errorCode: statusCode
      }
      next(ret)
    } else {
      // check status
      const newPayload = {
        token: auth4,
        id:idx
      }
      TransferStatus(newPayload,function async (retn){
        if(retn.state === "success"){
        const ret = {
          state: "success",
          id:idx,
          data:retn.data
        }
        next(ret)
      }else{
        const ret = {
          state:"success",
          id:idx,
          data:"Transaction Initiated please wait"
        }
        next(ret)
      }
      })    
    }
  }).catch((e)=>{
    const ret = {
      state:"failed",
      message:e.message
    }
    next(ret)
  })
 }
}).catch((e)=>{
  const ret = {
    state:"failed",
    message:e.message

  }
  next(ret)
})
}
 
const TransferStatus = async (payload,out)=>{
  var auth3 = payload.token;
     
  var Url =
      'https://sandbox.momodeveloper.mtn.com/disbursement/v1_0/transfer/'+payload.id;

  axios({
      method: 'get',
      url: Url,
      headers: {
          'Authorization':auth3,
          'X-Target-Environment': 'sandbox',
          'Ocp-Apim-Subscription-Key': process.env.MOMO_MY_TRANSFER_PRIMARY_KEY
      }
    }).then(( response) => {
     let statusCode = response.statusCode;
    //  console.log(statusCode)
    if (statusCode < 200 || statusCode >= 400) {
      const ret = {
          state:"failed",
          data:response.data
      } 
     // console.log(response.data)
      return out(ret);
    } else {
      const ret = {
          state:"success",    
          data:response.data
      } 
     // console.log(response.data)
     return out(ret);
    }
  }).catch((e)=>{
      const ret = {
          state:"failed",
          data:{
            status:"FAILED"
          },
          message:"failed to get transaction",
      } 
   return out(ret);
  })
}

 const TransactionState = async (payload,out)=>{
    var auth3 = "Bearer"+" "+payload.token;
     
    var Url =
        'https://sandbox.momodeveloper.mtn.com/collection/v1_0/requesttopay/'+payload.id;

    axios({
        method: 'get',
        url: Url,
        headers: {
            'Authorization':auth3,
            'X-Target-Environment': 'sandbox',
            'Ocp-Apim-Subscription-Key': process.env.MOMO_MY_SECRET_SUBSCRIPTION_KEY,
        }
      }).then(( response) => {
       let statusCode = response.statusCode;
      //  console.log(statusCode)
      if (statusCode < 200 || statusCode >= 400) {
        const ret = {
            state:"failed",
            data:response.data,
            message:"failed to get transaction",
        } 
       // console.log(response.data)
        return out(ret);
      } else {
        const ret = {
            state:"success",    
            data:response.data
        } 
       // console.log(response.data)
       return out(ret);
      }
    }).catch((e)=>{
        const ret = {
            state:"failed",
            data:{
              status:"FAILED"
            },
            message:"failed to get transaction",
        } 
        
     return out(ret);
    })
}

 const TokenGetter = async (next) => {
    
    var tokenUrl = 'https://sandbox.momodeveloper.mtn.com/collection/token/';
    axios({
        method: 'post',
        url: tokenUrl,
        headers: {
            'Authorization': process.env.MOMO_ENCODED,
            'Ocp-Apim-Subscription-Key': process.env.MOMO_MY_SECRET_SUBSCRIPTION_KEY,
        }
      }).then(( response) => {
       statusCode = response.statusCode;
      if (statusCode < 200 || statusCode >= 400 ) {
        const ret = {
            state:"failed",
            StatusCode:statusCode
        } 
       next(ret)
      } else {
        const ret = {
            state:"success",
            token:response.data
        } 
        next(ret)
       }
    });
}


