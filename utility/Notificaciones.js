const GenerateOtp = () =>{
     let otp = Math.floor(100000 + Math.random()* 900000);
    
     return otp;
}

const  GenerateExpiry = ()=>{
     let expiry = new Date();
     expiry.setTime(new Date().getTime()+(30*60*1000));
     return expiry;
}

const onRequestOTP = async(otp , toPhoneNumber) =>{
     const accountSid = "AC2d7cf0d626f910a85739e6794ca704c6";
     const authToken = "db560fc3ca18c7569012bd4c7be372c3";
     const client = require('twilio')(accountSid,authToken);
   
     const response = await client.messages.create({
         body : `Your ID is ${otp}`,
         from : '+14847465156',
         to : `+57${toPhoneNumber}`
     });

     return response;
}

module.exports = {
     GenerateExpiry,
     GenerateOtp,
     onRequestOTP
}
