// on creating link if am a buyer its create and upload cash
// if cash fails up upload, link is not added
// if am seller, no need to upload cash
// when adding one self to a link, if money upload is needed and it failed
// user is not added 
const mtnFunctions = require("../../middleware/mtn");

const db = require("../models/index");
"use strict";

const Users = db.Users;
const links = db.Links;

function sleep(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }
exports.createLinkSeller = async (req, res) =>{
    const { 
        title,description,ownerId,ownerType,sellerId,sellerName,amount,sellerContact,
    } = req.body;
    if (!( title && description&& ownerId&& ownerType&& 
        sellerId&& sellerName&&  amount&& sellerContact)) {
        return res.status(500).send({message:"All input is required"});
      }
   
    const newLink = new links({
        title,
        description,
        ownerId,
        ownerType,//seller
        status:"inactive",
        sellerId,
        sellerName,
        buyerId:"",
        buyerName:"",
        cashed:false,
        amount,
        sellerContact,
        buyerContact:"",
        delivered:false,
        recieved:false,
      });
      newLink.save(newLink)
      .then( async (linkData)  =>  {
        res.status(200).send({
            messege:"Link created successfully",
            data:linkData,
            linkId:linkData._id
        });
      })
      .catch(err => {
       res.status(500).send({
         message:
           err.message ||
            "Some error occurred while creating the link."
        });
      }); 
}
exports.createLinkBuyer = async (req, res) =>{
    const { 
        title,description,ownerId,ownerType,
        buyerId,buyerName,
        amount,buyerContact
    } = req.body;
    if (!( title && description&& ownerId&& 
        ownerType&& buyerId&&
        buyerName&& amount && buyerContact )) {
        return res.status(500).send({message:"All input is required"});
      }
   
    //handle payment first
    const payload = {
        amount:amount,
        number:buyerContact,
        ownerName: buyerName
      }
    mtnFunctions.MobileMoneyMtnTest(payload,  async function(result){
        if(result.state==="success"){
        //wait for 7 seconds
        await sleep(7000);
        mtnFunctions.handleTracking(result.id,  async function(data){
            if(data.state==="success"){   
                // check for success only 
                if(data.data.status==="SUCCESSFUL"){
                const newLink = new links({
                    title,
                    description,
                    ownerId,
                    ownerType,
                    status:"inactive",
                    sellerId:"",
                    sellerName:"",
                    buyerId,
                    buyerName,
                    cashed:true,
                    amount,
                    buyerContact,
                    sellerContact:"",
                    delivered:false,
                    recieved:false,
                    cashState:"success",
                    uploadTransactionId:result.id
                  });
                  newLink.save(newLink)
                 .then( async (linkData)  =>  {
                    res.status(200).send({
                        messege:"Link created successfully",
                        data:linkData,
                        linkId:linkData._id
                    });
                 })
                 .catch(err => {
               res.status(500).send({
                 message:
                   err.message ||
                    "Some error occurred while creating the link."
                });
                 }); 
                }else if(data.data.status==="PENDING"){
                    const newLink = new links({
                        title,
                        description,
                        ownerId,
                        ownerType,
                        status:"inactive",
                        sellerId:"",
                        sellerName:"",
                        buyerId,
                        buyerName,
                        cashed:false,
                        amount,
                        buyerContact,
                        sellerContact:"",
                        delivered:false,
                        recieved:false,
                        cashState:"pending",
                        uploadTransactionId:result.id
                      });
                      newLink.save(newLink)
                     .then( async (linkData)  =>  {
                        res.status(200).send({
                            messege:"Link created successfully,payment pending",
                            data:linkData,
                            linkId:linkData._id
                        });
                     })
                     .catch(err => {
                   res.status(500).send({
                     message:
                       err.message ||
                        "Some error occurred while creating the link."
                    });
                }); 
                }else{
                    res.status(400).send({
                        message: "timeout, transaction took too long to process or failed"
                    }); 
                }
            }else{
                res.status(500).send({
                message: err.message || "Some error occurred while creating the transaction."
                });
            }
        });
         }else{
         res.status(500).send({state: 'failed', message: 'Server, something went wrong'}); 
         return;
         }
    })
      
};
exports.GetAllLinks = async (req, res) =>{
    const { 
        userId
    } = req.body;
    if (!(userId)) {
        return res.status(500).send({message:"No user spacified"});
    }
    links.find({ $or: [ { sellerId: userId },
       { buyerId: userId } ] })
    .then(data => {
      //res.send(data);
      if( data !== null){
        res.status(200).send( { message: 'success', data:data});
      }
     else{
      res.status(404).send( {message:'no links retrieved', data:[]});
     }
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving links."
      });
    });
   
};
exports.GetSingleLink = async (req, res) =>{
    const id = req.params.id;
    links.findById(id)
    .then(data => {
      if( data !== null){
        res.status(200).send( { message: 'success', data:data});
      }
     else{
      res.status(404).send( {message:'no link retrieved', data:null});
     }
    })
    .catch(err => {
      res.status(500).send({
        message: "error, can't retrieve data"
      });
    });
};

exports.AddSeller = async (req, res) =>{
  const { 
    linkId,sellerId,sellerName,sellerContact
 }= req.body;
 if (!( linkId && sellerId&& sellerName&& sellerContact)) {
  return res.status(500).send({message:"All input is required"});
}
  links.findById(linkId).then(async (link1) =>{

  if(link1.ownerType === "buyer"){
  links.findByIdAndUpdate(linkId,  
    {
      sellerId,
      sellerName,
      sellerContact,
      status:"active"
    }
   , {useFindAndModify: false}).then(async (data2) => {
    return res.status(200).send(
      {message:'added seller successfully' });
   }).catch((e)=>{
     return res.status(400)
     .send({message:'failed to add seller' });
   });
  }else{
    return res.status(409)
    .send({message:'cant add seller to this link' });
  }
  }).catch((e)=>{
    return res.status(500)
    .send({message:'failed to add seller' });
  })
};
exports.AddBuyer = async (req, res) =>{
  const { 
    linkId,buyerId,buyerName,buyerContact
 }= req.body;
 if (!( linkId && buyerId&& buyerName&& buyerContact)) {
  return res.status(500).send({message:"All input is required"});
}
  links.findById(linkId).then(async (link1) =>{
  if(link1.ownerType === "seller"){
    const payload = {
      amount:link1.amount,
      number:buyerContact,
      ownerName: buyerName
    } 
    mtnFunctions.MobileMoneyMtnTest(payload,  async function(result){
      if(result.state==="success"){
      //wait for 7 seconds
      await sleep(7000);
      mtnFunctions.handleTracking(result.id,  async function(data){
        if(data.state==="success"){   
            // check for success only 
            if(data.data.status==="SUCCESSFUL"){
            //update link
            links.findByIdAndUpdate(linkId,  
              {
                buyerId,
                buyerName,
                buyerContact,
                buyerContact,
                status:"active",
                cashed:true,
                cashState:"success",
                uploadTransactionId:result.id
              }
                 , {useFindAndModify: false}).then(async (data2) => {
              return res.status(200).send(
                {message:'added buyer successfully' });
                 }).catch((e)=>{
               return res.status(400)
               .send({message:'failed to add buyer' });
                 });
            }else if(data.data.status==="PENDING"){
              //update link
              links.findByIdAndUpdate(linkId,  
                {
                  buyerId,
                  buyerName,
                  buyerContact,
                  buyerContact,
                  status:"active",
                  cashed:true,
                  cashState:"pending",
                  uploadTransactionId:result.id
                }
                   , {useFindAndModify: false}).then(async (data2) => {
                return res.status(200).send(
                  {message:'added buyer successfully, transaction pending' });
                   }).catch((e)=>{
                 return res.status(400)
                 .send({message:'failed to add buyer, couldnt add buyer' });
                   });
            }else{
                res.status(400).send({
                    message: "timeout, transaction took too long to process or failed"
                }); 
            }
        }else{
            res.status(500).send({
            message: "Some error occurred while creating the transaction."
            });
        }
   });
      
    }else{
    res.status(500).send({state: 'failed', message: 'Payment Server, something went wrong'}); 
    return;
    }
});
  }else{
    return res.status(409)
    .send({message:'cant add buyer to this link' });
  }
  }).catch((e)=>{
    return res.status(500)
    .send({message:'failed to add buyer' });
  })
    
};
exports.UpdatedRecievedState = async (req, res) =>{
  const { 
    linkId, userId
 }= req.body;
 if (!(linkId && userId)){
  return res.status(400).send({message:"No link Id provided"});
}
links.findById(linkId).then(async (link1) =>{
  if(!link1.recieved && !link1.delivered){
  if(userId === link1.buyerId 
    && link1.status !=="complete" && link1.cashed === true){
    if(link1.delivered){
     // pay seller - 2%
    let amountToPush = link1.amount*(98/100);

    mtnFunctions.MobileMoneyTransferTest({
      number:link1.sellerContact,
      amount:amountToPush,
      ownerName:link1.sellerName
     },async function(result){
      if(result.state==="success"){
        await  links.findByIdAndUpdate(linkId,  
          {status:"complete",
          recieved:true,
          offloadTransactionId:result.id
        }
       , {useFindAndModify: false})
       return res.status(200).send({
        message: "Link done"
      });
      }else{
        return res.status(500).send({
          message: "error, can't complete transaction"
        });
      }
    }) 
      
    }else{
      await  links.findByIdAndUpdate(linkId,  
        {recieved:true}
     , {useFindAndModify: false})
     return res.status(200).send({
      message: "Link updated"
    });
    }
  }else{
    return res.status(400).send({message:"Bad request"});
  }
}else{
  return res.status(409).send({message:"Link already done"});
}
})


};
exports.UpdatedDelievedState = async (req, res) =>{
  const { 
    linkId, userId
 }= req.body;
 if (!(linkId && userId)){
  return res.status(400).send({message:"No link Id provided"});
}
links.findById(linkId).then(async (link1) =>{
  if(!link1.recieved && !link1.delivered){
  if(userId === link1.sellerId 
    && link1.status !=="complete"  && link1.cashed === true){
    if(link1.recieved){
     // pay seller - 2%
    let amountToPush = link1.amount*(98/100);

    mtnFunctions.MobileMoneyTransferTest({
      number:link1.sellerContact,
      amount:amountToPush,
      ownerName:link1.sellerName
     },async function(result){
      if(result.state==="success"){
        await  links.findByIdAndUpdate(linkId,  
          {status:"complete",
          delivered:true,
          offloadTransactionId:result.id
        }
       , {useFindAndModify: false})
       return res.status(200).send({
        message: "Link updated"
      });
      }else{
        return res.status(500).send({
          message: "error, can't complete transaction"
        });
      }
    }) 
      
    }else{
      await  links.findByIdAndUpdate(linkId,  
        {delivered:true}
     , {useFindAndModify: false})
     return res.status(200).send({
      message: "Link updated"
    });
    }
  }

  else{
    return res.status(400).send({message:"Bad request"});
  }
}else{
  return res.status(409).send({message:"Link already done"});
}
})

};
exports.UpdateCashReturn = async (req, res) =>{
  const { 
    linkId,userId
 }= req.body;
 if (!(linkId && userId)){
  return res.status(400).send({message:"No link Id provided"});
}
links.findById(linkId).then(async (link1) =>{
  if(userId === link1.buyerId 
    && link1.status !=="complete"  && link1.cashed===true){
    let amountToReturn;
  if(link1.delivered ){
    //returns less by 5%
    amountToReturn = link1.amount*(95/100);
  }else{
    //return less by 2%
    amountToReturn = link1.amount*(98/100); 
  }
  mtnFunctions.MobileMoneyTransferTest({
    number:link1.buyerContact,
    amount:amountToReturn,
    ownerName:link1.buyerName
   },async function(result){
    if(result.state==="success"){
      await  links.findByIdAndUpdate(linkId,  
        {cashState:"returned",
        status:"killed",
        cashed:false}
     , {useFindAndModify: false})
     return res.status(200).send({
      message: "Cash returned successfully"
    });
    }else{
      return res.status(500).send({
        message: "error, can't complete transaction"
      });
    }
  }) 
}else{
  return res
  .status(400)
  .send({message: "Can't return cash from this link"}); 
} 
});
};
exports.RefreshCashState = async (req,res)=>{
    const id = req.params.id;
    links.findById(id)
    .then(link => {
      if( link !== null){
        if(link.uploadTransactionId !== ""){
        mtnFunctions.handleTracking(link.uploadTransactionId,  async function(data){
            if(data.state==="success"){   
                // check for success only  
                //console.log(data)
                if(link.cashState!=="success"){
                if(data.data.status!=="PENDING"&& data.data.status!=="SUCCESSFUL"){
                return res.status(202).send({
                        message: "transaction was failed, not pending nor successfull"
                 }); 
                }
                if(data.data.status==="SUCCESSFUL" && link.cashState !=="success"){
                    // update link
                    await  links.findByIdAndUpdate(id,  
                        {cashState:"success",cashed:true}
                     , {useFindAndModify: false})
                     return res.status(200).send({message: "link cash has been refreshed"});
                }
                if(data.data.status==="PENDING"){
                    return res.status(201).send({
                            message: "transaction still pending"
                     }); 
                }
            }else{
                return res.status(200).send({message: "Nothing to update"
            }); 
            }
            }else{
                return res.status(500).send({message: "Some error occurred while creating the link transaction."
                });
            }
       });
     }else{
      return  res.status(404).send( {message:'nothing to refresh', data:null});
       }
      }
     else{
        return res.status(404).send( {message:'something went wrong', data:null});
     }
    })
    .catch(err => {
    return res.status(500).send({
        message: "error, can't retrieve data"
      });
    });
};

exports.updateLink = async (req,res)=>{
  const id = req.params.id;
  const { 
    title,description
 }= req.body;

let update={}
if(title!==""){
  update={...update,title}
}
if(description!==""){
  update={...update,description}
}
if(Object.keys(update).length >0){
await  links.findByIdAndUpdate(id,  
  update
, {useFindAndModify: false})
return res.
status(200).
send({message:"Link updated"});
}else{
  return res.status(400).send({message:"bad request"});
}
  
};

exports.killLink = async (req,res)=>{
  const id = req.params.id;
  links.findById(id).then(async (link1) =>{
    if(link1.status ==="inactive"){
await  links.findByIdAndUpdate(id,  
  {status:"killed"}
, {useFindAndModify: false})
return res.
status(200).
send({message:"Link updated"});
    }else{
      return res.
status(200).
send({message:"Can't kill this link"});
    }
});

};