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
    const formattedDate = dayjs(new Date()).format('DD/MM/YYYY');
        const range = `${sheetName}!A:J`
        const values = [[slNo,houseNo,name,address,region,whatsApp,rate1,rate2,etDueDateRate1,formattedDate,etDueDateRate2,formattedDate,
            `=IFERROR(INDIRECT("Y" & ROW()), 0) `,`=IFERROR(INDIRECT("Z" & ROW()), 0)`,`=(INDIRECT("M" & ROW())) * (INDIRECT("G" & ROW()))`,
            `=(INDIRECT("N" & ROW())) * (INDIRECT("H" & ROW()))`,`=(INDIRECT("O" & ROW())) + (INDIRECT("P" & ROW()))`,,,,,,,,`=MAX((YEAR(INDIRECT("J" & ROW())) - YEAR(INDIRECT("I" & ROW()))) * 12 + MONTH(INDIRECT("J" & ROW())) - MONTH(INDIRECT("I" & ROW())),0)`,
            `=MAX((YEAR(INDIRECT("L" & ROW())) - YEAR(INDIRECT("K" & ROW()))) * 12 + MONTH(INDIRECT("L" & ROW())) - MONTH(INDIRECT("K" & ROW())),0)`]]
    try {
        const response = await sheets.spreadsheets.values.append({
            spreadsheetId: spreadsheetId,
            range: range,
            valueInputOption: 'USER_ENTERED',
            resource: { values: values },
        });

        // console.log(`Rows appended to Sheet :`, response.data);
        return res.status(200).json({ status: 'success' });
    } catch (error) {
        console.error('Error appending rows:', error);
        return res.status(500).json({ status: 'failed' });
    }

})
module.exports = router