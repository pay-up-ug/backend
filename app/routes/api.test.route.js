

module.exports = app => {
    const api = require("../controllers/api.test.controllers");
  
    var router = require("express").Router();
    //momo
    router.post("/mobilepay/:key",api.MomoPay);
    router.get("/mobilepay/track/:key",api.MomoTracking);
    //card  payment
    router.post("/cardpayment/:key",api.cardPay);
    router.get("/cardpayment/track/:key",api.cardTracking);
  
    app.use('/api/playground/v1', router);
  };