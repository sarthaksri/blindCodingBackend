const mongoose = require('mongoose');
require("dotenv").config()


const connectToMongo = async ()=>{
   await mongoose.connect(process.env.mongodburl)
    .then(() => console.log('Connected Successfully To Database'))
    .catch(error => console.log('Failed to connect', error))
}

module.exports = connectToMongo ;