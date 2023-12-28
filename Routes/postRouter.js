const express = require('express')
const router = express.Router()
const axios = require('axios')
require('dotenv').config()
router.get('/',async(req,res)=>{
        const arr = req?.roles
    if (arr.includes(process.env.ADMIN_ROLE)) {
        try{
            const resp = await axios.post(`${process.env.BASE_URL}`,{},{
                params : req.query
            })

            console.log(resp.data)
            return res.status(200).json(resp.data)
           
            
        }catch(err){
            console.log(err)
            return res.sendStatus(500)
        }
  }else{
    return res.sendStatus(403)
  }


})









module.exports = router