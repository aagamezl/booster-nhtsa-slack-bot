const axios = require('axios')
// const bodyParser = require('body-parser')
const express = require('express')
const helmet = require('helmet')
const Table = require('easy-table')

const app = express()

// app.use(bodyParser.json()) // for parsing application/json
// app.use(bodyParser.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded
const port = process.env.PORT || 3000

app.use(helmet())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.post('/', async (req, res) => {
  try {
    if (!req.body.text) {
      res.status(500).json({
        error: 'No params supplied'
      })
    }

    const [vin, make, model, year, fuelType] = req.body.text.split(' ')

    if (vin.match(/[OIQ]+/gi) !== null || vin.length !== 17) {
      return res.send('Error: Incorrect VIN format')
    }

    const url = `https://vpic.nhtsa.dot.gov/api/vehicles/getmodelsformakeyear/make/${make}/modelyear/${year}?format=json`

    console.log('url: %s', url)

    const result = await axios.get(url)

    const data = result.data.Results.filter(vehicle => vehicle.Model_Name.includes(model))

    if (data.length === 0) {
      return res.send(`No Results for your search params: ${vin}, ${make}, ${model}, ${year}, ${fuelType}`)
    }

    console.log(Table.print(data))

    res.send(Table.print(data))
  } catch (error) {
    console.error(error)

    res.send(`Error: ${error.message}`)
  }
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})
