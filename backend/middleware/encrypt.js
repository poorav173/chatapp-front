const bcrypt = require('bcryptjs');

const encrypt = async(req,res,next)=>{
    const {password} = req.body;
    if(!password){
        return res.status(400).json({success : false, message : "All feilds are mandatory"});
    }
    try{
        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(password,salt);
        req.body.password = hashPassword;
        next();
    }catch(Error){
        console.log("Error Occured at encryption ", Error);
        return res.status(500).json({success : false, message : "Internal Server Error"});
    }
}

module.exports = encrypt;