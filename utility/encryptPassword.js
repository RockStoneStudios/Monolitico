const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const TOKEN_SECRET = require('../config/index');


const genSalt = async()=>{
    return await bcrypt.genSalt();
}

const encryptPassword = async (password,salt)=>{
    return await bcrypt.hash(password,salt);
}

const passwordCompare = async(password,passwordSave)=> {
    return await bcrypt.compare(password,passwordSave);
}

const generateSignature = (payload) =>{
   return jwt.sign(payload,TOKEN_SECRET.TOKEN_SECRET,{expiresIn :'365d'});
}


module.exports = {
    genSalt,
    encryptPassword,
    passwordCompare,
    generateSignature
}