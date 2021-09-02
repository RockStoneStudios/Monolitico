const app = require('./services/PortConnect');
const DB = require('./services/DatabaseConnected');
const config = require('./config/index');

const Inithialize = async()=>{
    
   
  app.listen(process.env.PORT ||3000,()=>{
    console.log('Starting Port');
   });
}

Inithialize();