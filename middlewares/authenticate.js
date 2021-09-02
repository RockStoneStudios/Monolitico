const jwt = require('jsonwebtoken');
const TOKEN_SECRET = require('../config/index');

const validateSignature = async (req,res,next)=>{
    const signature = req.get('Authorization');
      if(signature) {
          const payload = await jwt.verify(signature.split(' ')[1],TOKEN_SECRET.TOKEN_SECRET);
          req.user = payload;
          next();
      } else {
          res.json({message : "Token Invalid!!"});
      }
 }

 module.exports = validateSignature;