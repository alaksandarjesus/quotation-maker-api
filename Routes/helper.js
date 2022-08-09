import { client } from "../index.js";

export async function getlogindata(data){
    return await client.db("madan").collection("details").insertOne(data);
};

export async function getusername(email){
    return await client.db("madan").collection("details").findOne({email:email});
};

//get user fortget pass word token
export async function getUserpasstoken(pass_token){
    const details=await client.db("crm").collection("empolyees").findOne({pass_token:pass_token})
    return details
}

export async function passtokenset(email,randomString) {
    return await client.db("crm").collection("empolyees").updateOne({email:email},{$set:{pass_token:randomString}});
    
 }
 //reset password function
 export async function updateuserpassDetails(pass_token,password){
   
    const details=await client.db("crm").collection("empolyees").updateOne({pass_token:pass_token},{$set:{password:password}});
    return details;
}

