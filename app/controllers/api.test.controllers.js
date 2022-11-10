const db = require("../models/index");
// const generateApiKey = require('generate-api-key').default;
// const bcrypt = require("bcrypt");
// const jwt = require('jsonwebtoken');
const mtnFunctions = require("../../middleware/mtn");
const visaFunctions = require("../../middleware/visa");
const masterCardFunctions = require("../../middleware/mastercard");
const { testTransactions } = require("../models/index");
"use strict";

 const TestTransactions = db.testTransactions;
 const Users = db.Users;

 function sleep(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }

exports.MomoPay =  async (req, res) => {
    //confirm key
    //access momo for transaction
    //save transaction and initial status
    const key = req.params.key;
    const {payeeName,payeeContact, amount, payeeInfor} = req.body
    if (!(payeeName && payeeContact && amount && payeeInfor)) {
      return res.status(400).send({state: 'failed', message: 'bad request'});
    }   
    

    Users.findOne({publicKey: key}).then(Data => {
        if(Data !== null){
            const payload = {
              amount:amount,
              number:payeeContact,
              ownerName: payeeName
            }
            mtnFunctions.MobileMoneyMtnTest(payload,  async function(result){
                if(result.state==="success"){
                  // track and store transactiond
                  //wait for 5 seconds
                  await sleep(5000);
                  mtnFunctions.handleTracking(result.id,  async function(data){
                    if(data.state==="success"){          
                        const transaction = new TestTransactions({
                            payExternalId: result.id,
                            status: data.data.status,
                            ownerId: Data._id,
                            amount: amount,
                            paymentMethod:"mobile",
                            payee: {...payeeInfor, payeeContact,
                                payeeInfor
                            },
                            metaInfor: data.data,
                          });
                          transaction
                        .save(transaction)
                          .then( async (data2)  =>  {
                             //update amount
                                  await  Users.findByIdAndUpdate(Data._id,  
                                    {testBalance:Data.testBalance+ amount, latestBalanceId:data2._id}
                                 , {useFindAndModify: false})
                             res.status(200).send({
                                state:'success',
                                data:{ 
                                    status: data.data.status,
                                    ownerId: Data._id,
                                    amount: amount,
                                    payee: {...payeeInfor, payeeContact,
                                        payeeInfor
                                    },
                                    InternalTrasactionid:data2._id },
                                message: 'successfully accepted and saved transaction'});
                            return;
                          })
                          .catch(err => {
                           res.status(500).send({
                             message:
                               err.message || "Some error occurred while creating the transaction."
                            });
                          }); 
                    }else{
                        const transaction = new TestTransactions({
                            payExternalId: result.id,
                            status: data.data.status,
                            ownerId: Data._id,
                            amount: amount,
                            paymentMethod:"mobile",
                            payee: {...payeeInfor, payeeContact,
                                payeeInfor
                            },  
                          });
                          transaction
                        .save(transaction)
                          .then( async (data2) => {
                             //update amount
                             res.status(200).send({
                                state:'success',
                                data:{ 
                                    status: data.data.status,
                                    ownerId: Data._id,
                                    amount: amount,
                                    payee: {...payeeInfor, payeeContact,
                                        payeeInfor
                                    },
                                    InternalTrasactionid:data2._id },
                                message: 'successfully saved transaction'});
                             return;
                          })
                          .catch(err => {
                           res.status(500).send({
                             message:
                               err.message || "Some error occurred while creating the transaction."
                            });
                          });  
                    }  
               });
                }else{
                 res.status(500).send({state: 'failed', message: 'Server , something went wrong'}); 
                 return;
                }
            }); 
        }else{
            res.status(401).send({state: 'failed', message: 'Not authorised'}); 
            return;
        }
    })  
}

exports.MomoTracking =  async (req, res) => {
    // access transaction for status
    // if status is diferent update record
    const key = req.params.key;
    const {internalId} = req.body
    Users.findOne({privateKey: key}).then(user => {
    if(user !== null){
    TestTransactions.findById(internalId).then(transaction=>{
        if(transaction !== null){
    mtnFunctions.handleTracking(transaction.payExternalId ,async function(data){
        if(data.state==="success"){
            if(user.latestBalanceId !== internalId){
             await Users.findByIdAndUpdate(user._id,  
              {testBalance:user.testBalance+transaction.amount,
                latestBalanceId:internalId
              }
             , {useFindAndModify: false})
            }
        if(transaction.status !== data.data.status){
            await TestTransactions.findByIdAndUpdate(internalId,  
                {status:data.data.status}
             , {useFindAndModify: false})
            } 
            res.status(200).send({
                state:'success',
                data:transaction,
                message: 'successfully tracking'});
             return;
        }else{
            if(transaction.status !== data?.data?.status){
                await TestTransactions.findByIdAndUpdate(internalId,  
                    {status:data.data.status}
                 , {useFindAndModify: false})
            }
            res.status(200).send({
                state:'failed',
                data:transaction,
                message: data.message});
             return;
        }
     });
    }else{
        res.status(400).send({state: 'failed', message: 'No such transaction'}); 
        return;  
    }
   });
  }else{
    res.status(401).send({state: 'failed', message: 'Not authorised'}); 
    return;
  }
})
};

exports.cardPay =  async (req, res) => {
    //confirm key
    //access visa for transaction
    //save transaction
    const key = req.params.key;
    const {cardNumber,cardDate,cardCvv, amount, payeeInfor} = req.body
    if (!(cardNumber && cardDate && amount && cardCvv && payeeInfor)) {
      return res.status(400).send({state: 'failed', message: 'bad request'});
    }   
    Users.findOne({publicKey: key}).then(user => {
        if(user !== null){
          const obj ={
            cardNumber,
            cvv:cardCvv,
            date:cardDate
          }
        
          if(Array.from(cardNumber)[0] === "4"){   
            visaFunctions.VisaPaymentTest(obj,async function(data){
             if(data==="TransactionSuccess"){
              const transaction = new TestTransactions({
                status: "success",
                ownerId: user._id,
                amount: amount,
                paymentMethod:"card",
                payee: payeeInfor,
                metaInfor: {
                  cardType:"visa"
                },
              });
              transaction
              .save(transaction)
                .then( async (data2) => {
                 if(user.latestBalanceId !== data2._id){
                   await Users.findByIdAndUpdate(user._id,  
                    {
                      testBalance:user.testBalance+data2.amount,
                      latestBalanceId:data2._id
                    }
                   , {useFindAndModify: false})
                  }
                   return res.status(200).send({
                    state:'success',
                    data:data2,
                    message: "successfully transacted",
                    internalId:data2._id
                  })
                }).catch((e)=>{

                  return res.status(500).send({
                    state:'fail',
                    message: "failed to save transaction",
                  });
                })
            }else if(data==="TransactionPending"){
              const transaction = new TestTransactions({
                status: "pending",
                ownerId: user._id,
                amount: amount,
                paymentMethod:"card",
                payee: payeeInfor,
                metaInfor: {
                  cardType:"visa"
                },
              });
              transaction.save(transaction).then( async (data2) => { 
                  return res.status(200).send({
                    state:'success',
                    data:data2,
                    message: "successfully transacted",
                    internalId:data2._id
                  });
                }).catch((e)=>{
                  return res.status(500).send({
                    state:'fail',
                    message: "failed to save transaction",
                  });
                });
             }else if(data==="invalidCard"){
              return res.status(400).send({state: 'failed',
              message:'this is not an invalid card'});
             }else{
              return res.status(402).send({state: 'failed',
             message: 'something went wrong'});
             }
            });
          
          }else if(Array.from(cardNumber)[0] === "5"){
            masterCardFunctions.MasterCardTest(obj,async function(data){
              
                if(data==="TransactionSuccess"){
                 const transaction = new TestTransactions({
                   status: "success",
                   ownerId: user._id,
                   amount: amount,
                   paymentMethod:"card",
                   payee: payeeInfor,
                   metaInfor: {
                     cardType:"mastercard"
                   },
                 });
                 transaction
                 .save(transaction)
                   .then( async (data2) => {
                    if(user.latestBalanceId !== data2._id){
                      await Users.findByIdAndUpdate(user._id,  
                       {
                        testBalance:user.testBalance+transaction.amount,
                         latestBalanceId:data2._id
                       }
                      , {useFindAndModify: false})
                     }
                     return res.status(200).send({
                      state:'success',
                      data:data2,
                      message: "successfully transacted",
                      internalId:data2._id
  
                    });
                   });
                }else if(data==="TransactionPending"){
                 const transaction = new TestTransactions({
                   status: "pending",
                   ownerId: user._id,
                   amount: amount,
                   paymentMethod:"card",
                   payee: payeeInfor,
                   metaInfor: {
                     cardType:"mastercard"
                   },
                 });
                 transaction
                 .save(transaction)
                   .then( async (data2) => {
                    return res.status(200).send({
                      state:'success',
                      data:data2,
                      message: "successfully transacted",
                      internalId:data2._id
                    });
                   });
                }else if(data==="invalidCard"){
                 return res.status(400).send({state: 'failed',
                 message:'this is not an invalid card'});
                }else{
                 return res.status(402).send({state: 'failed',
                message: 'something went wrong'});
                }
               });
          }else{
            // console.log(Array.from(cardNumber)[0])
            return res.status(403).send({state: 'failed',
            message: 'only visa and mastercard allowed'});
          }
        }else{  
          return res.status(401).send({state: 'failed', message: 'unauthorized key'}); 
          
        }
    });
}

exports.cardTracking =  async (req, res) => {
  //check transation status
  const key = req.params.key;
  const {id} = req.body
  if (!(id)) {
    return res.status(400).send({state: 'failed', message: 'bad request'});
  } 
  Users.findOne({privateKey: key}).then(user => {
    if(user !== null){
     testTransactions.findById(id).then(transaction =>{
       if(transaction !== null){  
        return res.status(200).send({
          state:'success',
          data:transaction,
          message: "successfully returned transaction",
          internalId:transaction._id
        });  
       }else{
        return res.status(404).send({state: 'failed', message: 'these no such transaction stored'});
       }
     }).catch((e)=>{
      return res.status(500).send({state: 'failed', message: 'failed to get transaction'});
     });
    }else{
      return res.status(401).send({state: 'failed', message: 'unauthorized key'});
    }
  })
}

exports.getAllUserTransactions = async (req, res) => {
  const { 
    adminId
} = req.body;
if (!(adminId)) {
    return res.status(500).send({message:"No user spacified"});
}
testTransactions.find({  ownerId: adminId  })
.then(data => {
  //res.send(data);
  if( data !== null){
    res.status(200).send( { message: 'success', data:data});
  }
 else{
  res.status(404).send( {message:'transactions retrieved', data:[]});
 }
})
.catch(err => {
  res.status(500).send({
    message:
      err.message || "Some error occurred while retrieving transactions."
  });
});
}

