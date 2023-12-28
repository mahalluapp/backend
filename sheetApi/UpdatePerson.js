const express = require('express')
const router = express.Router()
require('dotenv').config()
const { sheets } = require('../firestore')
const spreadsheetId = process.env.SPREAD_ID;
const dayjs = require('dayjs');

router.get('/', async (req, res) => {
    const sheetName = req.query.search_reg ;
    const slNo = req.query.SlNo;
    const name = req.query.Name;
    const houseNo = req.query.HouseNo;
    const address = req.query.Address;
    const region = req.query.Region;
    const whatsApp = req.query.WhatsApp;
    const rate1 = req.query.Rate1;
    const rate2 = req.query.Rate2;
    const etDueDateRate1 = req.query.etDueDateRate1;
    const etDueDateRate2 = req.query.etDueDateRate2;
    const etURemarks = req.query.etURemarks;
    const rowIndex = parseInt(req.query.id) + 1;
    const formattedDate = dayjs(new Date()).format('MM/DD/YYYY HH:mm:ss');

    const values = [[slNo,houseNo,name,address,region,whatsApp,rate1,rate2,etDueDateRate1,formattedDate,etDueDateRate2,formattedDate,
        `=IFERROR(INDIRECT("Y" & ROW()), 0) `,`=IFERROR(INDIRECT("Z" & ROW()), 0)`,`=(INDIRECT("M" & ROW())) * (INDIRECT("G" & ROW()))`,
        `=(INDIRECT("N" & ROW())) * (INDIRECT("H" & ROW()))`,`=(INDIRECT("O" & ROW())) + (INDIRECT("P" & ROW()))`,,,,,,,etURemarks,`=DATEDIF(INDIRECT("I" & ROW()), INDIRECT("J" & ROW()), "M")`,`=DATEDIF(INDIRECT("K" & ROW()), INDIRECT("L" & ROW()), "M")`,`=ROW()-1`]]


    try {
        const response = await sheets.spreadsheets.values.update({
            spreadsheetId,
            range: `${sheetName}!A${rowIndex}:AA${rowIndex}`, // Update the specific row
            valueInputOption: 'USER_ENTERED',
            resource: { values: values },
        });
        // console.log(response.data)
        return res.status(200).json({ status : 'success' })
    } catch (err) {

        console.error('Error:', err.message);
        return res.status(500).json({ error: 'Network Error' })


    }

});
module.exports = router;