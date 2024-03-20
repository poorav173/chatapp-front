const jwt = require('jsonwebtoken');
const SECERT_KEY = 'Krun@l143'

const generateToken = (id)=>{
    return jwt.sign({id},SECERT_KEY,{
        expiresIn  : "30d",
    });
}

module.exports = generateToken;