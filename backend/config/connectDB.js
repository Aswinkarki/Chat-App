const mongoose = require('mongoose')
 async function connectDB(){
    try{
        await mongoose.connect(process.env.MONGODB_URL)
        const connection = mongoose.connection
        connection.on('connected',()=>{
            console.log("connect to DB")
        })
        connection.on('error',(error)=>{
            console.log("something is wrong in mongodb", error)

        })
    }
    catch(error){
        console.log("something is wrong",error)
    }
 }

 module.exports= connectDB;