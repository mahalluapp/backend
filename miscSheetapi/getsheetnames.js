const express = require('express')
const router = express.Router()
require('dotenv').config()
const { sheets } = require('../firestore')
const spreadsheetId = process.env.MISC_ID;

router.get('/', async(req, res) => {
    try {
        const response = await sheets.spreadsheets.get({
          spreadsheetId: spreadsheetId,
        });
    
        // Extract sheet names from the response
        const sheetProperties = response.data.sheets.map(sheet => {
          return sheet.properties.title;
        });
    
        // console.log('Sheet names:', sheetProperties);
        return res.status(200).json({sheets :[...sheetProperties]})
      } catch (error) {
        console.error('The API returned an error:', error.message);
        return res.status(500).json({status:'failed'})

      }
})
module.exports = router;