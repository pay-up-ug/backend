// test environment
const config = process.env;

exports.VisaPaymentTest = async (payload,next) => {
  const passList = [
   {
    "cardNumber": "4444222211114444",
    "cvv": "432",
    "date": "11/24",
   }, 
   {
   "cardNumber": "4443333333333333",
   "cvv": "324",
   "date": "09/24",
   }]

  const pendingList = [
    {"cardNumber": "4444101010101010",
    "cvv": "987",
    "date": "12/24",
    }
   ]
    for(i = 0; i< 2; i++){
        if(payload.cardNumber === passList[i].cardNumber){
            if(payload.cvv === passList[i].cvv && payload.date === passList[i].date){           
              return next("TransactionSuccess")
             
            }
        }
    }
    if(payload.cardNumber === pendingList[0].cardNumber){
        if(payload.cvv === pendingList[0].cvv && payload.date === pendingList[0].date){ 
          return next("TransactionPending")
         }
    }
    return next("invalidCard")
  //return next();
}







