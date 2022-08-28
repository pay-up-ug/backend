let hash = require('object-hash')
const db = require("./models/index");
const TARGET_HASH= hash(1357);

const Block = db.BlockChain;

let valodator = require("./validator")

//let chalk = require("chalk");

class BlockChain {
    constructor(){
        this.chain=[];
        this.current_transactions=[];
    }
addNewBlock(prevHash){
    let block = {
        index: this.chain.length +1,
        timestamp: Date.now(),
        transactions: this.current_transactions,
        hash: null,
        prevHash
    };
    if(valodator.proofOfWork() === TARGET_HASH){
        block.hash =hash(block)
        const newBlock = new Block(block)
        newBlock.save((newBlock), (err)=>{
           if(err) return console.log("Cant save block to db", err.message)
           console.log("Block saved on db");
        });

    }
    this.hash = hash(block);
    this.chain.push(block)
    this.current_transactions=[];
    return block;
}
addNewTransaction(sender,recipiant, amount){
    this.current_transactions.push({sender,recipiant,amount});
}
isEmpty(){
    return this.chain.length==0
}
lastBlock(){
    return this.chain.slice(-1)[0]
}
}

module.exports =BlockChain;
