import express from 'express'
import cors from "cors"
import cookieParser from 'cookie-parser'

const app = express()

app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true
})) // (app.use) this is use for middleware and configurations(like cors) 


// json accept karne ke liye ham modify kar sakte hai ki kitna json lena hai or more
app.use(express.json({ limit: "16kb" })) // Middleware for parsing JSON data


// ye url ke special char bagera handle karne ke liye - like -- %20 , extended object ke object bhi de sako
app.use(express.urlencoded({extended:true,limit:"16kb"}))


// store pdf and folder which is like public assets koi bhi access kar leta hai
app.use(express.static("public"))// public folder name hai 


app.use(cookieParser()) // server hi karta hai iska kaam to lena dena


// routes import
import userRouter from './routes/user.routes.js'
import videoRouter from './routes/video.routes.js'


// routes declaration 
// achi practice ye hoti hai ki jab bhi ham api define kare to kuch is tarah se kare ---> /api/v1/users intead of /users
app.use("/api/v1/users",userRouter) // ham pehle direct app.get use kar rahe the par router ko lane ke liye middleware use karna padega to uske liye app.use

app.use("/api/v1/videos",videoRouter)

export {app}




// NOTES 


// middlewares :
// use to check the thinks in between like check login when you are trying to get chat history and others 

// update your knowledge -- in call back -- 4 prameters come (err,req,res,next) // next is for middleware it is just a flag 