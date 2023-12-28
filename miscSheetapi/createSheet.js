const express = require('express')
const router = express.Router()
require('dotenv').config()
const { sheets } = require('../firestore')
const spreadsheetId = process.env.MISC_ID;

router.get('/', async(req, res) => {
    const headers = ['SL No', 'Debit/Credit', 'Particulars', 'Amount', 'Date and Time', 'Bill No', 'Opening Balance', 'Id'];

    const rowValues = [['SL No', 'Debit/Credit', 'Particulars', 'Amount', 'Date and Time', 'Bill No', 'Partiiculars','Entry/None', 'Opening Balance', 'Id'],
    [null,null,null,null,null,null,null,null,`${req.query.opBalance}`,'=ROW()-1']]

    const values = [
        headers, // First row with headers
        Array(headers.length).fill(null), // Second row initially filled with empty strings
      ];
      values[1][8] = req.query.opBalance;
      values[1][9] = '=ROW()-1';
      const request = {
        spreadsheetId: spreadsheetId,
        resource: {
          requests: [{
            addSheet: {
              properties: {
                title: req.query.sheetName
              }
            }
          }]
        }
      };
    
    sheets.spreadsheets.batchUpdate(request, async function (err, response) {
        if (err) {
          console.error(err);
          return res.status(500).json('Failed')
        }
        // console.log(response.data)
        try{
            const range = `${req.query.sheetName}!A1:J2`;
            const response = await sheets.spreadsheets.values.append({
                spreadsheetId: spreadsheetId,
                range: range,
                valueInputOption: 'USER_ENTERED',
                insertDataOption: 'OVERWRITE',
                resource: { values: rowValues },
            });

            // console.log(`Rows appended to Sheet`, response.data);
            return res.status(200).json({status:'success'})
        }catch(err){
            return res.status(500).json({status:'failed'})

        }

        
      });


})
module.exports = router;