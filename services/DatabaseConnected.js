const mongoose = require('mongoose');
const config = require('../config/index');


const conexion = mongoose.connect(config.DB, {
    useNewUrlParser : true,
    useCreateIndex : true,
    useUnifiedTopology : true
}).then(()=>{
    console.log('Connected Database Successfull');
}).catch(error=>{
    console.log(error);
});
module.exports = conexion;