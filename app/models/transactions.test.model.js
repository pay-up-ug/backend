module.exports = mongoose => {
    const testTransactions = mongoose.model(
      "testTransactions",
      mongoose.Schema(
        {
        payExternalId: String,
        status: String,
        ownerId: String,
        amount: {
         type: Number,
         default:''
        },
        paymentMethod: {
          type: String,
          default:''
         },
        payee: {
         type: Object,
         default:{}
        },
        metaInfor: {
            type: Object,
            default:{}
        },
        currency: {
          type: String,
          default: 'UGX'
        },
        },
        { timestamps: true }
      )
    );
  
    return testTransactions;
  }; 