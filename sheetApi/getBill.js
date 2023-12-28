const express = require('express')
const router = express.Router()
require('dotenv').config()
const { sheets } = require('../firestore');
const dayjs = require('dayjs');
var isSameOrBefore = require('dayjs/plugin/isSameOrBefore')
dayjs.extend(isSameOrBefore)
var isSameOrAfter = require('dayjs/plugin/isSameOrAfter')
dayjs.extend(isSameOrAfter)
const spreadsheetId = process.env.SPREAD_ID

router.get('/', async (req, res) => {
    const ledgerName = req.query.ledgerName;
    const date1 = req.query.etBilFromDate;
    const date2 = req.query.etBilToDate;
    let sheetName;
    if (ledgerName == 'Masjid and Madrasa') {
        sheetName = 'CashRegister';
    } else if (ledgerName == 'Masjid') {
        sheetName = 'MasjidCashBook';
    } else if (ledgerName == 'Madrasa') {
        sheetName = 'MadrasaCashBook';
    } else if (ledgerName == 'Complex') {
        sheetName = 'ComplexCashBook';
    } else {
        sheetName = 'DarsCashBook';
    }
    if (ledgerName == null) res.sendStatus(500);

    // console.log(fromDate, toDate)
    try {
        const start = dayjs(date1, 'DD/MM/YYYY')
        const end = dayjs(date2, 'DD/MM/YYYY')
        const range = `${sheetName}!A2:J`; // Adjust the range as needed
        const sheetData = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range,
        });
        const data = sheetData.data.values;
        let rowData = [];
        const index = [];
        data.forEach((row,i) => {
            const rowDate = dayjs(row[4],'DD/MM/YYYY HH:mm:ss');
            if (rowDate.isValid() ) {
                if(start.isSameOrBefore(rowDate, 'day') && end.isSameOrAfter(rowDate, 'day')){
                    index.push(i)
                    rowData.push({
                        date : row[4],
                        particulars : row[2],
                        type : row[1],
                        amount : parseInt(row[3]),
                        billno : row[5],
                        id : parseInt(row[9]),
                    })
                }
            }
        })
        const opclbal = {};
        if(index){
            opclbal['openbal'] = parseInt (data[index[0]-1][8]);
            opclbal['closebal'] = parseInt (data[index[index.length-1]][8]);
        }
       
        // console.log(rowData)
        return res.status(200).json({items : rowData,balance : opclbal})
    } catch (err) {
        console.log(err)
        return res.status(500).json('Failed')
    }

});
module.exports = router;