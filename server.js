import express from 'express'
import mongoose from 'mongoose'
import dotenv from 'dotenv'

dotenv.config()

const app = express()
app.use(express.json())

const uri = process.env.MONGO_URI
const port = process.env.PORT || 5000

mongoose
  .connect(uri)
  .then(() => console.log('🔥 MongoDB Connected Successfully'))
  .catch((error) => console.error('❌ MongoDB Error:', error))

app.get('/', (req, res) => {
  res.send('Server Running with MongoDB 🔥')
})

app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`)
})
