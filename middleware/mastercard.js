
exports.MasterCardTest =  async (payload,next) => {
    const passList = [
     {"cardNumber": "5444222211114444",
      "cvv": "432",
      "date": "02/24",
     }, 
     {"cardNumber": "5443333333333333",
     "cvv": "324",
     "date": "04/24",
     }]
    const pendingList = [
      {"cardNumber": "5444101010101010",
      "cvv": "987",
      "date": "08/24",
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
};
