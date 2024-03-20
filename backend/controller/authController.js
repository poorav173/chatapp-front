const mongoose = require('mongoose');
const User = require('../Models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const generateToken = require('../middleware/generateToken');

const login = async(req,res)=>{
    const {email,password} = req.body;
    if(!(email && password)){
        return res.status(400).json({success:false, message: "ALL fields are required"});
    }
    try{
        const user = await User.findOne({email});

        if(!user){
            return res.status(404).json({success : false, message : "User Not Found"});
        }

        const check = await bcrypt.compare(password,user.password);

        if(!check){
            return res.status(401).json({success : false, message : "Invalid Credentials"});
        }
        // const token = jwt.sign(
        //     {
        //         user_id : user._id,
        //         email 
        //     },
        //     SECERT_KEY,
        //     {
        //         expiresIn : "2h"
        //     }
        // )
        const token = generateToken(user._id);
        user.password = undefined;
        user.token = token;
        res.status(200).cookie('token',token).json({success : true, message :"Successfully LoggedIn",user, token});
    }catch(error){
        console.log("Error",error);
        res.status(500).json({success : false,message:"Internal Server Error"});
    }
}


const register = async(req,res)=>{
    const {name,email,password,pic} = req.body;
    // console.log(name,email,password,pic);
    if(!( name && email && password)){
        return res.status(400).json({success:false, message: "ALL fields are required"});
    }
    try{
        const validityCheck = await User.findOne({email});

        if(validityCheck){
            return res.status(404).json({success : false, message : "Already Registered Using this email"});
        }
        const user = await User.create({name,email,password,pic});
        // const token = jwt.sign(
        //     {
        //         user_id : user._id,
        //         email 
        //     },
        //     SECERT_KEY,
        //     {
        //         expiresIn : "2h"
        //     }
        // )
        const token = generateToken(user._id);
        user.password = undefined;
        user.token = token;
        // user.password = undefined;
        res.status(200).cookie('token',token).json({success : true, message :"Successfully Registered",user, token});
        // res.status(200).json({success : true, message :"Successfully Registered",user});
    }catch(error){
        console.log("Error",error);
        res.status(500).json({success : false,message:"Internal Server Error"});
    }
}

// const allUsers = async(req,res)=>{
//     const keyword = req.query.search?{
//         $or:[
//             {name: {$regex: req.query.search, $options: "i"}},
//             {email : {$regex: req.query.search, $options: "i"}}
//         ]
//     }:{};
//     console.log(req.user);
//     const users = await User.find(keyword).find({_id : {$ne : req.user._id}});
//     res.send(users);
//     console.log(keyword);
// }
const allUsers = async (req, res) => {
    const keyword = req.query.search
      ? {
          $or: [
            { name: { $regex: req.query.search, $options: "i" } },
            { email: { $regex: req.query.search, $options: "i" } },
          ],
        }
      : {};
  
    const users = await User.find(keyword).find({ _id: { $ne: req.user._id } });
    res.send(users);
};
module.exports = {login,register,allUsers};