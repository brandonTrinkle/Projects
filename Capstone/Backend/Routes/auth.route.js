import express from 'express';//Imports express files for use of routing
import {signup,signin,signout} from '../controllers/auth.controller.js';//Imports files for controllers to use in routing process

const router = express.Router();//Creates a route object for the web application

router.post("/SignUp", signup)//Creates a route for the signup page
router.post("/SignIn", signin)//Creates a route for the signIn page
router.get("/SignOut", signout)//Creates a route for signing out users

export default router;//Returns the route
