const express = require('express')
const router = express.Router()
require('dotenv').config()
const { sheets } = require('../firestore')
const spreadsheetId = process.env.SPREAD_ID;
const setColorToRow = require('../sheetApi/deleteRowcolor');

router.get('/', async (req, res) => {
    const { ledgerName } = req.query
    const { particulars, billno } = req.query
    const debit = parseInt(req.query.debit)
    const credit = parseInt(req.query.credit)
    const id = parseInt(req.query.id)
    console.log(req.query)
    let dDate = req.query.date;
    let sheetName;
    switch (ledgerName) {
        case 'Masjid and Madrasa': {
            sheetName = 'CashRegister';
            break;
        }
        case 'Masjid': {
            sheetName = 'MasjidCashBook';
            break;
        }
        case 'Madrasa': {
            sheetName = 'MadrasaCashBook';
            break;
        }
        case 'Complex': {
            sheetName = 'ComplexCashBook';
            break;
        }
        case 'Dars': {
            sheetName = 'DarsCashBook';
            break;
        }
        default: {
            break;
        }
    }
    if (ledgerName == null) res.sendStatus(500);
    let type;
    let amount;
    switch (true) {
        case debit === 0 && credit !== 0:
            type = 'Credit';
            amount = credit;

            break;
        case debit !== 0 && credit === 0:
            type = 'Debit';
            amount = debit;
            break;
        case debit == 0 && credit === 0:
            type = 'Deleted';
            amount = 0;
            break;

        default:
            break;
    }

    const newValues = [
        null, `${type}`,
        `=SUBSTITUTE(SUBSTITUTE(SUBSTITUTE(SUBSTITUTE(INDIRECT("G" & ROW()), ",", ""), """", ""), "[", ""), "]", "")`,
        `${amount}`, `${dDate}`, `${billno}`, `${particulars}`,null,  `=IF(
            INDIRECT("B" & ROW()) = "Debit",
            SUM(
              INDIRECT("I" & (ROW()-1)),
              INDIRECT("D" & ROW())
            ),
            MINUS(
              INDIRECT("I" & (ROW()-1)),
              INDIRECT("D" & ROW())
            )
          )`, `=ROW()-1`
    ];

    try {
        const response = await sheets.spreadsheets.values.update({
            spreadsheetId,
            range: `${sheetName}!A${id + 1}:J${id + 1}`, // Update the specific row
            valueInputOption: 'USER_ENTERED',
            resource: { values: [newValues] },
        });

        // console.log(response.data)
        if (debit == 0 && credit == 0) {
            try {
                const response = await sheets.spreadsheets.get({
                    spreadsheetId: spreadsheetId,
                });
               const sheetsData = response.data.sheets || [];
               let sheetFound = false;
               let sheetId = '';
               for (const sheet of sheetsData) {
                if (sheet.properties.title === sheetName) {
                  sheetFound = true;
                  sheetId = sheet.properties.sheetId;
                  break;
                }
              };
              if (sheetFound) {
                const request = await setColorToRow(id, sheetName, spreadsheetId, sheetId);
                try {
                  await sheets.spreadsheets.batchUpdate(request);
                  return res.status(200).json('Deleted');
                } catch (err) {
                  console.error('Error:', err.message);
                  return res.status(500).json('Failed');
                }
              } else {
                return res.status(500).json('No Sheet Found');
              }

            } catch (err) {
                console.log(err);
                return res.status(500).json('Failed')
            }
        }
        // console.log(response.data)
        return res.status(200).json("Updated")
    } catch (err) {

        console.error('Error:', err.message);
        return res.status(500).json({ error: 'Network Error' })


    }

})
module.exports = router