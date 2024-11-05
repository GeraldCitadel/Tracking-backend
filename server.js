import express from 'express'
import 'dotenv/config'
import fs from "node:fs/promises"
import jwt from 'jsonwebtoken'
import cors from 'cors'


// app config
const app = express()
const port = process.env.PORT || 4000



// middlewares
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static('public'))

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    next();
});


// api endpoints
const trackingFilePath = "./tracking.json"


// API for adding a tracking informaton
app.post('/addTracking', async (req, res) => {

    try {
        const { trackerName, location, senderName, senderNumber, senderEmail, senderAddress, receiverName, receiverNumber, receiverEmail, receiverAddress, origin, destination, status, trackingNumber, paymentMethod, productName, weight, delivery, fee, stage, departure, description, paymentStatus, arrival, account, message } = req.body


        const newTracking = { trackerName, location, senderName, senderNumber, senderEmail, senderAddress, receiverName, receiverNumber, receiverEmail, receiverAddress, origin, destination, status, trackingNumber, paymentMethod, productName, weight, delivery, fee, stage, departure, description, paymentStatus, arrival, account, message }

        const data = await fs.readFile(trackingFilePath)
        const trackingData = JSON.parse(data)

        const invalid = trackingData.find(item => item.trackingNumber === trackingNumber)
        if (invalid) {
            res.send({ success: false, message: 'Tracking number already exists!' })
            return
        }

        trackingData.push({
            id: Math.floor(Math.random() * 10000000000000),
            ...newTracking
        });

        try {
            await fs.writeFile(trackingFilePath, JSON.stringify(trackingData))
            res.status(200).send({ success: true, message: 'Tracking details added successfully!' })
        } catch (error) {
            res.status(500).send({ success: false, message: 'Error creating tracking data' })
        }
    } catch (error) {
        res.status(500).send({ success: false, message: 'Error create tracking data' })
    }

})


//API for getting all tracking information
app.get('/getTracking', async (req, res) => {

    try {
        const data = await fs.readFile(trackingFilePath)
        const trackingData = JSON.parse(data)
        res.status(200).send(trackingData)
    } catch (error) {
        res.status(500).send({ success: false, message: 'Error fetching tracking data' })
    }
})



// API for updating individual tracking details
app.patch(`/tracking/:id`, async (req, res) => {
    const id = req.params.id
    const updatedData = req.body

    try {
        const data = await fs.readFile(trackingFilePath)
        const trackingData = JSON.parse(data)
        const index = trackingData.findIndex(item => item.id === parseInt(id))
        console.log(index)
        if (index === -1) {
            res.status(404).send({ success: false, message: "Tracking data not found!" })
        } else {
            trackingData[index] = { ...trackingData[index], ...updatedData };
            fs.writeFile(trackingFilePath, JSON.stringify(trackingData))
            res.status(200).send(trackingData[index])
        }
    } catch (error) {
        res.status(500).send({ success: false, message: 'Error updating tracking data' })
    }
})


// API for fetching individual tracking details by id
app.get(`/:id`, async (req, res) => {
    const id = req.params.id

    try {
        const data = await fs.readFile(trackingFilePath)
        const trackingData = JSON.parse(data)
        const index = trackingData.findIndex(item => item.id === parseInt(id))
        console.log(index)
        if (index === -1) {
            res.status(404).send({ success: false, message: "Tracking data not found!" })
        } else {

            res.status(200).send(trackingData[index])
        }
    } catch (error) {
        res.status(500).send({ success: false, message: 'Error fetching tracking data' })
    }
})

// API for fetching tracking details by tracking number
app.post(`/details/:trackingNumber`, async (req, res) => {
    const {trackingNumber} = req.params
    try {
        const data = await fs.readFile(trackingFilePath)
        const trackingData = JSON.parse(data)
        const details = trackingData.find(item => item.trackingNumber === trackingNumber)
        if (!details) {
            res.status(404).send({ success: false, message: "Tracking details not found!" })
        } else {
            res.status(200).send(details)
        }
    } catch (error) {
        res.status(500).send({ success: false, message: 'Error fetching tracking data' })
    }
})


// API for deleting individual tracking details
app.delete('/delete/:id', async (req, res) => {
    const id = parseInt(req.params.id)
    const data = await fs.readFile(trackingFilePath)
    const trackingData = JSON.parse(data)

    const index = trackingData.findIndex(item => item.id === id)

    if (index === -1) {
        res.status(404).send({ success: false, message: "Tracking data not found!" })
    } else {
        trackingData.splice(index, 1);
        fs.writeFile(trackingFilePath, JSON.stringify(trackingData));
        res.send({ success: true, message: 'Tracking data deleted successfully!' })
    }
})


//API for admin login
app.post('/login', async (req, res) => {
    try {
       const {email, password} = req.body
 
       if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
 
          const token = jwt.sign(email + password, process.env.JWT_SECRET)
          res.json({ success: true, token})
 
       } else {
          res.json({ success: false, message: 'Invalid Credentials'})
       }
    } catch (error) {
       console.log(error)
       res.json({succes: false, message: error.message})
    }
 })




app.listen(port, () => console.log(`server running on port ${port}`))
