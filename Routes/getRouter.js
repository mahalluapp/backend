const express = require('express')
const router = express.Router()
const axios = require('axios')
require('dotenv').config()
router.get('/', async (req, res) => {
        
        try {
            const resp = await axios.get(`${process.env.BASE_URL}`, {
                params: req.query
            })
            console.log('RESPONSE SENT')
            res.json(resp.data).status(200)
        } catch (err) {
            res.sendStatus(500)
        }
    
})
module.exports = router