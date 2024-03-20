const jwt = require('jsonwebtoken');

const User = require('../Models/userModel');
const SECERT_KEY = 'Krun@l143'


const protect = async(req,res,next)=>{
    let token;
    if(
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ){
        try {
            token = req.headers.authorization.split(" ")[1];

            // decode token id
            const decoded = jwt.verify(token,SECERT_KEY);

            req.user = await User.findById(decoded.id).select("-password");

            next();
        } catch (error) {
            console.log(error);
        }
    }
}
module.exports = protect;