import express from 'express'
import cors from 'cors'
import { PORT } from '../src/shared/config/config.js'
import { checkConnection } from './infrastructure/database/connection.js'

const app = express()
app.use(cors())
app.use(express.json())

//verificar conexion a la BD cuando se inicia la app
checkConnection()

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto${PORT}`)
})
