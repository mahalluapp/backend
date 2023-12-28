const express = require('express')
const router = express.Router()
require('dotenv').config()
const { sheets } = require('../firestore')
const spreadsheetId = process.env.SPREAD_ID;
router.get('/', async (req, res) => {

    // console.log('req coming')
    const sheetName = req.query.search_reg || 'Vettukalam'
    const range1 = `${sheetName}!C:E`; // Range for columns C to E
    const range2 = `${sheetName}!AA:AA`; // Range for column AC

    try {
        const response1 = await sheets.spreadsheets.values.get({
            spreadsheetId: spreadsheetId,
            range: range1,
        });

        const response2 = await sheets.spreadsheets.values.get({
            spreadsheetId: spreadsheetId,
            range: range2,
        });

        const values1 = response1.data.values;
        const values2 = response2.data.values;
        // console.log(values2)

        if (values1 && values1.length && values2 && values2.length) {
            // Column C, D, E values retrieved successfully
            // console.log('Column C, D, E Values:');
            let data = [];
            values1.forEach((row, i) => {

                if (i>0){
                    let record = {};
                    // console.log(`${row[0]}, ${row[1]}, ${row[2]}`);
                    record['Name'] = row[0];
                    record['Address'] = row[1];
                    record['Region'] = row[2];
                    data.push(record)

                }
           });
            // console.log(data)
            const newData = data.map((item, i) => {

                 return { ...item, id: values2[i+1][0] }
            })
            if (newData && newData.length) {
                // console.log('People Data sending')
                return res.status(200).json(newData)
            }else {
                throw new Error("Error Data")
            }


        } else {
            console.log('No data found.');
            return res.status(500).json('Data Not found')

        }
    } catch (err) {
        console.log(err)
        return res.status(500).json(err)
    }

})

module.exports = router;