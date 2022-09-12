import express from "express"
import cors from "cors"
import router from "./routes/routes.js"


const app = express()
app.use(express.json())
app.use(cors())
app.use(router)

app.listen(5000, () => {
    console.log("Server is running on port 5000")
})


/*
credenciais válidas
"email": "nyx@gmail.com",
"senha": "nyx22"

"email": "thiago@gmail.com",
"senha": "123456"

*/