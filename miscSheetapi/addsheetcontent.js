const express = require('express')
const router = express.Router()
require('dotenv').config()
const { sheets } = require('../firestore')
const spreadsheetId = process.env.MISC_ID;

router.get('/',async(req,res)=>{
    console.log(req.query)
    const amount = req.query.amount;

   const values = [
        [`${req.query.slno}`, `${req.query.type}`, 
        `${req.query.statement}`, 
        `${amount}`, `${req.query.date}`, `${req.query.billNo}`, `${req.query.statement}`, 'Entry',
            `=IF(
    INDIRECT("B" & ROW()) = "Debit",
    SUM(
      INDIRECT("I" & (ROW()-1)),
      INDIRECT("D" & ROW())
    ),
    MINUS(
      INDIRECT("I" & (ROW()-1)),
      INDIRECT("D" & ROW())
    )
  )`,`=ROW()-1`] // Add rows based on your data
    ];
    try {
        const range = `${req.query.sheetName}!A1:J`;
        var resource = {
            "majorDimension": "ROWS",
            "values": values
          }
        const response = await sheets.spreadsheets.values.append({
            spreadsheetId: spreadsheetId,
            range: range,
            valueInputOption: 'USER_ENTERED',
            resource: resource,
        });

        console.log(`Rows appended to Sheet :`, response.data);
        return res.status(200).json({ status: 'success' });
    } catch (error) {
        console.error('Error appending rows:', error);
        return res.status(500).json({ status: 'failed' });
    }

});
module.exports = router;