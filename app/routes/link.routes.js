const auth = require("../../middleware/auth");

module.exports = app => {
    const link = require("../controllers/link.controllers");
  
    var router = require("express").Router();
    //create link
    router.post("/createbuyer",auth, link.createLinkBuyer);
    router.post("/createseller",auth, link.createLinkSeller);
    //get all links
    router.get("/",auth, link.GetAllLinks);
    //get specific link
    router.get("/:id",auth, link.GetSingleLink);
    // add to link
    router.post("/addseller",auth, link.AddSeller);
    router.post("/addbuyer", auth, link.AddBuyer);
    //refresh link
    router.patch("/cashrefresh/:id",auth, link.RefreshCashState);
     // cash out link
    //confirm recieved
    router.put("/received",auth, link.UpdatedRecievedState);
    //confirm delivered
    router.put("/delivered",auth, link.UpdatedDelievedState);
    //confirm delivered
    router.post("/return",auth, link.UpdateCashReturn);
    //update link
    router.patch("/update/:id",auth, link.updateLink);
    //kill link
    router.patch("/kill/:id",auth, link.killLink);

    app.use('/links', router);
  };