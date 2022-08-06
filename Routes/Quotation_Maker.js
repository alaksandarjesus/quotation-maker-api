import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { getlogindata,getusername } from "./helper.js";

const router = express.Router();

async function genhashpassword(password){
    //no.of.salting = 10
    const salt = await bcrypt.genSalt(10);
    const hashedpassword = await bcrypt.hash(password,salt);
    // console.log(hashedpassword);
    return hashedpassword;
};

router.post("/register",async function(req,res){
    try {
        const {email,password} = req.body;
        const hashedpassword = await genhashpassword(password);
        const existuser = await getusername(email);
    
        if(existuser){
            res.status(401).send("already email exist");
        }else{
            const result = getlogindata({email:email,password:hashedpassword});
            res.status(200).send("sucessfully registered");
        }
    } catch (error) {
        res.status(500).send("internal server error");
    };
});

router.post("/login",async function(req,res){
    try {
        const {email,password} = req.body;
        const existuser = await getusername(email);
        if(!existuser){
            res.status(401).send({error:"invalid  credential"})
        }else{
            const storedpassword =  existuser.password;
            const ispasswordmatch = await bcrypt.compare(password,storedpassword);
            if(ispasswordmatch){
                const token =  jwt.sign({id:existuser._id},process.env.SECRET_KEY);
                res.send({msg:"sucessfull login",token:token});
            }else{
                res.status(401).send({error:"invalid password or email"});
            }
        }
    } catch (error) {
        res.status(500).send({error:"internal server error"});
    }
});

export  const Quotation_Maker_Route = router;
