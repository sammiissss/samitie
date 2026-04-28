const express = require('express')
const cors = require('cors')

const app = express()
const PORT = 5000

app.use(cors())
app.use(express.json())

app.get('/api/data', (req, res) => {
  res.json({
    message: 'Data loaded successfully from Node server.',
    items: [
      { id: 1, name: 'Laptop', price: 900 },
      { id: 2, name: 'Phone', price: 650 },
      { id: 3, name: 'Headphones', price: 120 },
    ],
  })
})

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
