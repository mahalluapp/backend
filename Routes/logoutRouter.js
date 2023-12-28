const express = require('express')
const router = express.Router()
router.get('/',(req,res)=>{
    res.setHeader('Set-Cookie',
    `SIDLDGR=''; HttpOnly; Max-Age=${24 * 60 * 60}; Path=/;SameSite=None; Secure`).json("Token Removed").status(200)
})
module.exports = router