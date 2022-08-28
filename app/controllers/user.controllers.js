const db = require("../models/index");
const generateApiKey = require('generate-api-key').default;
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
// const nodemailer = require("nodemailer");
// const { text } = require("express");
// const moment = require('moment');
// const e = require("express");
"use strict";

const Users = db.Users;

exports.Createuser =  async (req, res) => {
   // Our register logic starts here
   try {
    // Get user input
    const { name, contact, email, password } = req.body;

    // Validate user input
    if (!(email && password && name && contact)) {
      return res.status(400).send({message:"All input is required"});
    }
    // check if user already exist
    // Validate if user exist in our database
    const oldUser = await Users.findOne({ email });

    if (oldUser) {
      return res.status(409).send({message:"User Already Exist. Please Login"});
    }

    //Encrypt user password
    encryptedPassword = await bcrypt.hash(password, 10);

    // Create user in our database
    const user = await Users.create({
      name,
      contact,
      email: email.toLowerCase(), // sanitize: convert email to lowercase
      password: encryptedPassword,
    });

    // Create token
    const token = jwt.sign(
      { user_id: user._id, email },
      process.env.JWT_SECRET_KEY,
      {
        expiresIn: "12h",
      }
    );
    // save user token
    user.token = token;

    // return new user
    return  res.status(201).json(user);
  } catch (err) {
    console.log(err);
    return res.status(err.status).json({error: err.message});
  }
};

exports.login = async (req, res) => {

 // Our login logic starts here
 try {
  // Get user input
  const { email, password } = req.body;

  // Validate user input
  if (!(email && password)) {
    return  res.status(400).send({message:"All input is required"});
  }
  // Validate if user exist in our database
  const user = await Users.findOne({ email });

  if (user && (await bcrypt.compare(password, user.password))) {
    // Create token
    const token = jwt.sign(
      { user_id: user._id, email },
      process.env.JWT_SECRET_KEY,
      {
        expiresIn: "1h",
      }
    );
    // save user token
    user.token = token;
    // user
    return  res.status(200).json(user);
  }
  res.status(400).send({messege:"Invalid Credentials"});
} catch (err) {
  console.log(err);
  return res.status(err.status).json({error: err.message});
}
// Our register logic ends here
  // if (!req.body) {
  //   res.status(400).send({text: 'failed',_id: 'null' , msg: 'no body', user:null});
  //   return;
  // }
  // // generate a token
  // Users.findOne({email: req.body.email})
  // .then(data => {
  //  // res.send(data);
  //  if( data !== null){
  //   if(data.password === req.body.password){
  //     if(data.verified===false){
  //       res.send({text: 'success',_id: data._id , msg: 'verify', user:{_id:data._id,
  //         email:data.email,
  //         username: data.username,
  //         contact:data.contact
  //       }});
  //     }else{
  //       res.send({text: 'success', doc : data._id , msg: 'ok', user:{_id:data._id,
  //         email:data.email,
  //         username: data.username,
  //         contact:data.contact
  //       }});
  //     } 
  //   } else{
  //   res.send({text: 'failed',_id: 'null' , msg: 'wrong password', user:null});
  //   }
  // } else{
  //   res.send({text: 'failed',_id: 'null' , msg: 'No such user', user:null});
  // } 
  // })
  // .catch(err => {
  //   res.status(500).send({
  //     message:
  //       err.message || "Some error occurred while retrieving users."
  //   });
  // });
};
exports.generateKeys = async (req, res) =>{
  const id = req.params.id;
  // if (!req.body) {
  //   return res.status(400).send({
  //     message: "Data to update can not be empty!"
  //   });
  // }
  let keys = generateApiKey({ method: 'uuidv4', batch: 2,prefix: 'payup.'+id });
  //console.log(keys)
  // encryptedprivateKey = await bcrypt.hash(keys[1], 10);
   
   Users.findByIdAndUpdate(id, {publicKey: keys[0], privateKey: keys[1] },
     { useFindAndModify: false })
  .then(data => {
    if (!data) {
      res.status(404).send({
        message: `Cannot find this user`
      });
    } else {
     res.send({
        message: "Keys generated successfully",
        data:{publicKey:keys[0],privateKey:keys[1]}
      });
    }
  })
  .catch(err => {
    res.status(500).send({
      message: "failed to find user id=" + id
    });
  });

}


 
// exports.Getuser = (req, res) => {

//   res.status(200).json("success");
// };



