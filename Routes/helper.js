import { client } from "../index.js";

export async function getlogindata(data){
    return await client.db("madan").collection("details").insertOne(data);
};

export async function getusername(email){
    return await client.db("madan").collection("details").findOne({email:email});
};

