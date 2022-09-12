import express from "express"
import {cadastrar, login, registros, insereregistro, deslogar} from "../controllers/controllers.js"

const router = express.Router()

router.post("/cadastro", cadastrar)

router.post("/login", login)

router.get("/registros", registros)

router.post("/insereregistro", insereregistro)

router.delete("/deslogar", deslogar)

export default router