const express = require('express')
const router = express.Router()
require('dotenv').config()
const { sheets } = require('../firestore')
const sheetPath = process.env.NODE_ENV === 'production'
    ? '/etc/secrets/sheet.json'
    : '../etc/secrets/sheet.json';

router.get('/', async (req, res) => {
    console.log(req.query)
    const ledgerName = req.query.ledgerName;
    const ipdate1 = req.query.etBilFromDate;
    const tpdate2 = req.query.etBilToDate;
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

    const t1 = ipdate1.split('/');
    const t2 = tpdate2.split('/');
    //if(i>1) return {date:item[4],type:item[1],particulars:item[2],amount:item[3],id:item[9]}
    const startDate = new Date(`${t1[1]}/${t1[0]}/${t1[2]}`);
    startDate.setHours(0, 0, 0, 0); // Set the time to 00:00:00.000
    const endDate = new Date(`${t2[1]}/${t2[0]}/${t2[2]}`);
    endDate.setHours(23, 59, 59, 999);
    console.log(startDate, endDate)
    const spreadsheetId = process.env.SPREAD_ID
    try {

        const range = `${sheetName}!A3:J`; // Adjust the range as needed
        const sheetData = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range,
        });

        const arrObj = sheetData.data.values; // Contains the filtered data based on the date range
        // const rowData = arrObj.map((item)=>{
        //     if(item[4]>=startDate & item[4]<=startDate){
        //         return {date:item[4],type:item[1],particulars:item[2],amount:item[3],id:item[9]}
        //     }
        // })
        const index = [];
        const transactions= [];
        const records={};
       
         for(var i = 0;i<arrObj.length; i++){
            const d = arrObj[i][4].split('/');
            const datein = new Date(`${d[1]}/${d[0]}/${d[2]}`);;
         if((datein >= startDate) & (datein <= endDate)){
           index.push(i);
           const row = arrObj[i];
           const record  = {};
           
           record['type'] = row[1];
           record['particulars'] = row[2];
           record['amount'] = row[3];
           record['date'] = row[4];
           record['id'] = row[9];
           transactions.push(record);
       
           }
         }
         const opclbal = {};
         opclbal['openbal'] = arrObj[index[0]-1][8];
         opclbal['closebal'] = arrObj[index[index.length-1]][8];
         records.items = transactions;
         records.balance = [opclbal];
        res.json(records).status(200);
    } catch (err) {
        console.error('Error:', err.message);
        res.json('Error').status(500)
    }


})
module.exports = router