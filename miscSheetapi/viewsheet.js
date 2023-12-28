const express = require('express')
const router = express.Router()
require('dotenv').config()
const { sheets } = require('../firestore');
const dayjs = require('dayjs');
const spreadsheetId = process.env.MISC_ID;

router.get('/',async(req,res)=>{
    // console.log(req.query)
    const range = `${req.query.sheetName}!A:J`
    try{
        const sheetData = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range,
        });
        const data = sheetData.data.values;
        // console.log(data)
        let rowData = [];
        const index = [];
        data.forEach((row,i) => {
            
            if(i>1){
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
          
        })
        const opclbal = {};
        if(index){
            opclbal['openbal'] = parseInt (data[index[0]-1][8]);
            opclbal['closebal'] = parseInt (data[index[index.length-1]][8]);
        }
        return res.status(200).json({items : rowData,balance : opclbal})
    }catch(err){
        console.log(err);
        return res.status(500).json('Failed')
    }

});
module.exports = router;