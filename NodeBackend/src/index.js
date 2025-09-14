// require('dotenv').config({path:'./env'}) /// this is also correct but for code improvements we use import

import dotenv from "dotenv"// ise use karne ke liye experimental features use karne padenge 
import {app} from './app.js'

import connectDB from "./db/index.js";

dotenv.config({
    path:'./env'
})


connectDB()
.then(()=>{
    app.listen(process.env.PORT || 8000, ()=>{
        console.log(`⚙️  Server is running at port : ${process.env.PORT}`);
        
    })
})

.then(()=>{ // assignment 
    app.on("error",(error)=>{
        console.log("ERROR: ",error);
        throw error;
        
    })
})
.catch((err)=>{
    console.log("MONGO db connection failed !!! ",err);
    
})







/*
// one way to connect with database 


import express from "express"
const app = express()

(async ()=>{
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        app.on("error",(error)=>{
            console.log("Error: ",error);
            throw error;
            
        })

        app.listen(process.env.PORT, ()=>{
            console.log(`App is listening on port ${process.env.PORT}`);

        })

    } catch (error) {
        console.error("ERROR: ",error);
        throw error;
    }
})()
*/






// ##NOTES## // 

// iffee concept 

// iffee se pehle semicolon laga dete hai clearty ke liye 


// async jab bhi return hota hai bo ek promiss bhi return karta hai 