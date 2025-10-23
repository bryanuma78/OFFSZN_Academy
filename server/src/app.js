import express from 'express'
import cors from 'cors'
import { PORT } from '../src/shared/config/config.js'
import { checkConnection } from './infrastructure/database/connection.js'
import authRoutes from './infrastructure/http/routes/auth.routes.js';

const app = express()
app.use(cors())
app.use(express.json())

app.use('/api/auth', authRoutes);

checkConnection()

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto${PORT}`)
})
