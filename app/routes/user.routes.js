const auth = require("../../middleware/auth");

module.exports = app => {
    const users = require("../controllers/user.controllers");
  
    var router = require("express").Router();
  
    router.post("/Createuser",users.Createuser);
    router.post("/login", users.login);
    router.post("/generatekeys/:id",auth, users.generateKeys);

   // router.get("/information",auth, users.Getuser);
    
    app.use('/users', router);
  };