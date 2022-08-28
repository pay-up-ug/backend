const express = require("express");
const cors = require("cors");

require('dotenv').config()
// let BlockChain = require("./app/blockChain")
const app = express();

// let PROOF 

app.use(cors());

// parse requests of content-type - application/json
app.use(express.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

// let blockChain = new BlockChain;

const db = require("./app/models/index");
db.mongoose
  .connect(db.url, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log("Connected to the database!");
    // blockChain.addNewTransaction("system", "IDX", 200);
    // blockChain.addNewBlock(null);
  })
  .catch(err => {
    console.log("Cannot connect to the database!", err);
    process.exit();
  });

// simple route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to payup application api." });
});


require("./app/routes/user.routes")(app);
require("./app/routes/api.test.route")(app);
require("./app/routes/link.routes")(app);

// set port, listen for requests
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});