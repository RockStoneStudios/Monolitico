
const express = require('express');
const app = express();
const {AdminRouter,VandorRouter,ShoppingRouter,CustomerRouter,DeliveryRouter} = require('../routes/index');
const mongoose = require('mongoose');
const path = require('path');

app.use(express.json());
app.use(express.urlencoded({extended : false}));
app.use('/images', express.static(path.join(__dirname,'../images')));
app.use('/admin',AdminRouter);
app.use('/vandor',VandorRouter);
app.use('/customer',CustomerRouter);
app.use(ShoppingRouter);
app.use('/delivery',DeliveryRouter);


module.exports = app;


