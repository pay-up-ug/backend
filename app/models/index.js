
const dbConfig = require("../../config/dbconfig.js");

const mongoose = require("mongoose");
mongoose.Promise = global.Promise;

const db = {};
db.mongoose = mongoose;
db.url = dbConfig.url;
db.Users = require("./user.model.js")(mongoose);
db.BlockChain = require("./block.model")(mongoose);
db.testTransactions = require("./transactions.test.model")(mongoose)
db.Links = require("./link.model")(mongoose);


module.exports = db;