const mongoose = require("mongoose");

const url = "mongodb+srv://Poorav:FUCRRZx4OdagvCbw@cluster0.6o76oxw.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
const connect = () => {
  mongoose.connect(url,{
    useNewUrlParser : true,
    useUnifiedTopology : true
  })
  .then(()=>{
    console.log("Connected to Database Successfully");
  })
  .catch((error)=>{
    console.log("Error Occured during database connection ",error);
  });
};

module.exports = connect;
