const express = require('express')
const router = express.Router()
require('dotenv').config()
router.post('/', async (req,res,next) => {
   //triggerBody.incident.threshold_value === '0.85'
    if (req.body?.incident  ) {
      res.status(403).send('Trigger condition met. Writing to Google Sheet blocked.');
    } else {
        next(); 
    }
});

module.exports = router;

