import db from "../database/db.js"
import joi from "joi"
import bcrypt from "bcrypt"
import { v4 as uuid } from 'uuid';
import dayjs from "dayjs"

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

const validaLogin = joi.object({
    email: joi.string()
    .email()
    .empty()
    .required(),

    senha: joi.string()
    .alphanum()
    .pattern(new RegExp('^[a-zA-Z0-9]{3,30}$'))
    .empty()
    .required()
}).options({ abortEarly: false })

const validaInsercaoRegistro = joi.object({
    text: joi.string()
    .min(3)
    .max(30)
    .empty()
    .required(),

    value: joi.number()
    .empty()
    .required()
}).options({ abortEarly: false })


const cadastrar = async (req, res) => {
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
    const hashDaSenha = bcrypt.hashSync(senha, 10)
    db.collection("users").insertOne({email, senha: hashDaSenha, nome});
    return res.sendStatus(201)
    
}

const login = async (req, res) => {
    const { email, senha } = req.body  

    const validador = validaLogin.validate(req.body)

    if(!email || !senha){
       return res.sendStatus(422)
    }

    if(validador.error){
        console.log(validador.error)
        res.sendStatus(422)
        console.log(validador.error)
        return
    }

    const usuario = await db.collection("users").findOne({ email })
    if(!usuario){
        return res.sendStatus(404)
    }
    const senhaEvalida = bcrypt.compareSync(senha, usuario.senha)

    // const usuariojalogado = await db.collection("sessions").findOne({userId: ObjectId(usuario._id)})
    // if(usuariojalogado){
    //     return res.status(422).send("usuário já logado no sistema")
    // }

     if(usuario && senhaEvalida){
          // sucesso, usuário encontrado com este email e senha!
          const token = uuid()
          await db.collection("sessions").insertOne({
              userId: usuario._id,
              token
          })
          return res.status(200).send({token, usuario})
      }else{
          // usuário não encontrado (email ou senha incorretos)
          return res.sendStatus(422)
      }
}

const registros = async (req, res) => {
    const { authorization } = req.headers
    const token = authorization?.replace('Bearer ', '')
    
    if(!token) return res.sendStatus(401)
    
    const sessao = await db.collection("sessions").findOne({ token })

    if(!sessao) return res.sendStatus(401)

    const usuario = await db.collection("users").findOne({
        _id: sessao.userId
    })

    if(usuario){

        const registros = await db.collection("records").find({ iduser: usuario._id }).toArray()

        return res.status(200).send(registros)
    }else{
        return res.sendStatus(401)
    }
}

const insereregistro = async (req, res) => {
    const { authorization } = req.headers
    const token = authorization?.replace('Bearer ', '')
    const { text, value, flag } = req.body
    const valor = value.replace(",", ".")
    const validador = validaInsercaoRegistro.validate({text, value})

    if(validador.error){
        console.log(validador.error)
        res.sendStatus(422)
        console.log(validador.error)
        return
    }
    
    let time = dayjs().format('DD/MM')
    
    if(!token) return res.sendStatus(401)
    
    const sessao = await db.collection("sessions").findOne({ token })

    if(!sessao) return res.sendStatus(402)

    const usuario = await db.collection("users").findOne({
        _id: sessao.userId
    })
    
    if(usuario){
        await db.collection("records").insertOne({ date: time, text, valor, flag, iduser: usuario._id })
        return res.status(200).send()
    }else{
        return res.sendStatus(403)
    }
}

const deslogar = async (req, res) => {
    const { authorization } = req.headers
    const token = authorization?.replace('Bearer ', '')
    
    if(!token) return res.sendStatus(401)
    
    const sessao = await db.collection("sessions").findOne({ token })

    if(!sessao) return res.sendStatus(402)

    const usuario = await db.collection("users").findOne({
        _id: sessao.userId
    })
    
    if(usuario){
        await db.collection("sessions").deleteMany({userId: usuario._id})
        return res.status(200).send()
    }else{
        return res.sendStatus(403)
    }
}

export {cadastrar, login, registros, insereregistro, deslogar}