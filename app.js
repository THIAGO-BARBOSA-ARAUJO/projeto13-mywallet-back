import { MongoClient, ObjectId } from "mongodb"
import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import joi from "joi"

const app = express()
app.use(express.json())
app.use(cors())
dotenv.config();

const mongoClient = new MongoClient("mongodb://localhost:27017")
let db

mongoClient.connect().then(() => {
    db = mongoClient.db("MyWallet")
})

const validaCadastro = joi.object({
    email: joi.string()
    .email()
    .empty()
    .required(),
    
    senha: joi.string()
    .alphanum()
    .pattern(new RegExp('^[a-zA-Z0-9]{3,30}$'))
    .empty()
    .required(),
    
    nome: joi.string()
    .required()
}).options({ abortEarly: false })

app.post("/cadastro", async (req, res) => {
    const { email, senha, nome } = req.body

    const validador = validaCadastro.validate(req.body)

    if(!email || !senha || !nome){
        return res.sendStatus(400)
    }

    if(validador.error){
        console.log(validador.error)
        res.sendStatus(422)
        console.log(validador.error)
        return
    }

    try {

        const resposta = await db.collection("users").findOne({email: email})
            
        if(resposta){
            res.status(409).send("Usuário já cadastrado!")
            return
        }
    } catch (error) {
        return res.sendStatus(401)
    }
    
    db.collection("users").insertOne({email, senha, nome});
    return res.sendStatus(201)
    
})



app.listen(5000, () => {
    console.log("Server is running on port 5000")
})
