module.exports = mongoose => {
    const Block = mongoose.model(
      "Block",
      mongoose.Schema(
        {
          index: {
            required: true,
            type: Number
          },
         
          timestamp:{
            required: true,
            type: Date,
            default: Date.now()
          },
          transactions: {
            type: Array,
            required:true
          },
          prevHash:{
            type: String,
            required: false
         },
         hash:{
            type: String,
            required: false
         },
        },
        
      )
    );
  
    return Block;
  };