module.exports = mongoose => {
    const Users = mongoose.model(
      "Users",
      mongoose.Schema(
        {
          email: String,
          name: String,
          contact: String,
          password: String,
        publicKey: {
          type: String,
          default: ''
        },
        privateKey: {
          type: String,
          default: ''
        },
        prodPublicKey: {
          type: String,
          default: ''
        },
        prodPrivateKey: {
          type: String,
          default: ''
        },
        environment: {
          type: String,
          default: 'test'
        },
        latestBalanceId: {
          type: String,
          default: ''
        },
        latestBalanceIdProd: {
          type: String,
          default: ''
        },
        balance: {
          type: Number,
          default: 0
        },
        testBalance: {
          type: Number,
          default: 0
        },
        token:{
          type: String,
          default: ''
        }
        },
        { timestamps: true }
      )
    );
  
    return Users;
  };