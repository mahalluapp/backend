const express = require('express')
const router = express.Router()
require('dotenv').config()
const { sheets } = require('../firestore')
const spreadsheetId = process.env.SPREAD_ID;

router.get('/', async (req, res) => {
    const etCreditPart = req.query.etCreditPart;
    const etCreditAmount = parseInt(req.query.etCreditAmount);
    const etCreditBill = req.query.etCreditBill;
    const etCreditDate = req.query.etCreditDate;
    const ledgerName = req.query.ledgerName;

    let promises = [];
    let sheetsToUpdate = [];
    let particulars = [];
    // console.log(req.query)
    if (ledgerName == 'Masjid' && etCreditAmount > 0) {
        sheetsToUpdate = [
            {name : 'CashRegister', range: 'CashRegister!A:J' }, // Update for the first sheet (adjust range)
            { range: 'MasjidCashBook!A:J' }, // Update for the second sheet (adjust range)
            { range: 'MasjidCreditTransctions!A:J' }, // Update for the second sheet (adjust range)
            // Add more sheets as needed...
        ];
        particulars = ['On Credit entry of ', etCreditPart, ' in the Ledger of Madrasa'];

    } else if (ledgerName == 'Madrasa' && etCreditAmount > 0) {
         sheetsToUpdate = [
            {name : 'CashRegister', range: 'CashRegister!A:J' }, // Update for the first sheet (adjust range)
            { range: 'MadrasaCashBook!A:J' }, // Update for the second sheet (adjust range)
            { range: 'MadrasaCreditTransctions!A:J' }, // Update for the second sheet (adjust range)
            // Add more sheets as needed...
        ];
        particulars = ['On Credit entry of ', etCreditPart, ' in the Ledger of Masjid'];
    } else if (ledgerName == 'Dars' && etCreditAmount > 0){
        sheetsToUpdate = [
            {name : 'CashRegister', range: 'CashRegister!A:J' }, // Update for the first sheet (adjust range)
            { range: 'DarsCashBook!A:J' }, // Update for the second sheet (adjust range)
        ];
            
        particulars = ['On Credit entry of ', etCreditPart, ' in the Ledger of Dars'];
    } else if (ledgerName == 'Complex' && etCreditAmount > 0){
        sheetsToUpdate = [
            {name : 'CashRegister', range: 'CashRegister!A:J' }, // Update for the first sheet (adjust range)
            { range: 'ComplexCashBook!A:J' }, // Update for the second sheet (adjust range)
        ];
        particulars = ['On Credit entry of ', etCreditPart, ' in the Ledger of Complex'];

    }else if (!!ledgerName || !!etCreditAmount ){
        return res.status(500).json('Invalid Input')
    }

    if(sheetsToUpdate && particulars && etCreditPart){
        const promise2 = sheetsToUpdate.map(async (sheet) => {
            let values = [] ;
            if( sheet.name == 'CashRegister'){
                values = [
                    [, "Credit", `=SUBSTITUTE(SUBSTITUTE(SUBSTITUTE(SUBSTITUTE(INDIRECT("G" & ROW()), ",", ""), """", ""), "[", ""), "]", "")`, etCreditAmount, etCreditDate, etCreditBill, JSON.stringify(particulars), 'Entry',
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
              )`, `=ROW()-1`] // Add rows based on your data
                ];
            }else {
                values = [
                    [, "Credit", `=SUBSTITUTE(SUBSTITUTE(SUBSTITUTE(SUBSTITUTE(INDIRECT("G" & ROW()), ",", ""), """", ""), "[", ""), "]", "")`, etCreditAmount, etCreditDate, etCreditBill, etCreditPart, 'Entry',
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
              )`, `=ROW()-1`] // Add rows based on your data
                ];
            }
           
            try {
                const response = await sheets.spreadsheets.values.append({
                    spreadsheetId: spreadsheetId,
                    range: sheet.range,
                    valueInputOption: 'USER_ENTERED',
                    insertDataOption: 'INSERT_ROWS',
                    resource: { values: values },
                });
    
                // console.log(`Rows appended to Sheet :`, response.data);
                return { status: 'success' };
            } catch (error) {
                console.error('Error appending rows:', error);
                return { status: 'failed' };
            }
        });
        promises = promises.concat(promise2);

        Promise.all(promises)
            .then((results) => {
              const allSuccess = results.every((result) => result.status === 'success');
              if (allSuccess) {
                return res.status(200).json({ status: 'success',data : 'Payment Successfull' });
              } else {
                return res.status(500).json({ status: 'failed',data : 'Payment Failed' });
              }
            })
            .catch((error) => {
              console.error('Error:', error);
              return res.status(500).json({ status: 'failed' });
            });
   }else {
    return res.status(500).json("Network Error!!")
   }
   




})
module.exports = router