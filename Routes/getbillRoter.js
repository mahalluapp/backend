const express = require('express')
const router = express.Router()
const axios = require('axios')
require('dotenv').config()
router.get('/', async (req, res) => {
   
    const arr = req?.roles
    // console.log('admin present',arr.includes(process.env.ADMIN_ROLE))
    if (arr.includes(process.env.ADMIN_ROLE)) {
        
        try {
            const resp = await axios.get(`${process.env.BASE_URL}`, {
                params: req.query
            })
            res.json(resp.data).status(200)
        } catch (err) {
            res.sendStatus(500)
        }
    } else {
        res.json("Not Authorized").status(403)
    }
})
router.get('/updatedbill', async (req, res) => {
   
    const arr = req?.roles
    // console.log('admin present',arr.includes(process.env.ADMIN_ROLE))
    if (arr.includes(process.env.ADMIN_ROLE)) {
        
        try {
            const resp = await axios.get(`${process.env.BASE_URL}`, {
                params: req.query
            })
            res.json(resp.data).status(200)
        } catch (err) {
            res.sendStatus(500)
        }
    } else {
        res.json("Not Authorized").status(403)
    }
})


module.exports = router