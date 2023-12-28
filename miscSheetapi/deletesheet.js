const express = require('express')
const router = express.Router()
require('dotenv').config()
const { sheets } = require('../firestore');
const spreadsheetId = process.env.MISC_ID;
router.get('/',async(req,res)=>{

    try{
        const response = await sheets.spreadsheets.get({
            spreadsheetId: spreadsheetId,
          });
      
          const sheetsData = response.data.sheets || [];
      
          for (const sheet of sheetsData) {
            if (sheet.properties.title == req.query.sheetName) {
                const sheetId = sheet.properties.sheetId;
              console.log(`Sheet '${req.query.sheetName}' found with ID: ${sheet.properties.sheetId}`);
              const request = {
                spreadsheetId: spreadsheetId, // Replace with your spreadsheet ID
                resource: {
                  requests: [
                    {
                      deleteSheet: {
                        sheetId: sheetId, // Specify the ID of the sheet to delete
                      },
                    },
                  ],
                },
              };
                    try{
                       await sheets.spreadsheets.batchUpdate(request);
                        return res.status(200).json({status:'success'})
                    }catch(err){
                        console.log(err)
                        return res.status(500).json({status:'failed'})

                    }
            }
          }
    }catch(err){
        console.log(err)
        return res.status(500).json({status:'failed'})

    }
});
module.exports = router;