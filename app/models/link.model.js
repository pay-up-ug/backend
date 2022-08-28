module.exports = mongoose => {
    const link = mongoose.model(
      "link",
      mongoose.Schema(
        {
        title:{
          required: true,
          type:String,
        },
        description:String,
        ownerId: {
            required: true,
            type:String,
        },
        cashState: {
          type: String,
          default: 'notPaid'// notPaid, success, pending, returned
       },// no failed
        ownerType: {
            required: true,
            type:String,
        },
        status: {
            required: true,
            type:String,
        },//active, inactive, complete, killed
        sellerId: {
            // required: true,
            type:String,
        },
        sellerName:{
           // required: true,
            type:String,
        },
        buyerId:{
         //   required: true,
            type:String,
        },
        buyerName:{
        //  required: true,
            type:String,
        },
        cashed: Boolean,
        amount: {
         required: true,
         type: Number,
         default:0
        },
        sellerContact:{
          type: String,
          default: ''
        },
        buyerContact:{
            type: String,
            default: ''
          },
        delivered:{
          type:Boolean,
          default: false
        },
        recieved:{
          type:Boolean,
          default: false
        },
        currency: {
          type: String,
          default: 'UGX'
        },
        uploadTransactionId: {
          type: String,
          default: ''
        },
        offloadTransactionId: {
          type: String,
          default: ''
        },
        },
        { timestamps: true }
      )
    );
  
    return link;
  }; 