const express = require('express')
const router = express.Router()
require('dotenv').config()
const { sheets } = require('../firestore')
const spreadsheetId = process.env.SPREAD_ID;
const dayjs = require('dayjs');

// dayjs.extend(customParseFormat);
router.get('/', async (req, res) => {

    const sheetName = req.query.search_reg || 'Vettukalam'; // Replace with your sheet name
    const idToFind = req.query.id || '100'
    const rowIndex = parseInt(idToFind) + 1;

    if (rowIndex) {
        const range = `${sheetName}!A${rowIndex}:AA${rowIndex}`; // Fetch entire row
        try {
            const rowDataResponse = await sheets.spreadsheets.values.get({
                spreadsheetId,
                range,
            });

            const rowData = rowDataResponse.data.values[0]; // Extracting values of the row
            
            let data = [];
            if (rowData && rowData.length) {
                
                
                    let record = {};
                    // console.log(`${row[0]}, ${row[1]}, ${row[2]}`);
                    record['SlNo'] = rowData[0];
                    record['HouseNo'] = rowData[1];
                    record['Name'] = rowData[2];
                    record['Address'] = rowData[3];
                    record['Region'] = rowData[4];
                    record['WhatsApp'] = rowData[5];
                    record['Rate1rate'] = rowData[6];
                    record['Rate2rate'] = rowData[7];
                    record['DueDate1'] = dayjs(rowData[8],'DD/MM/YYYY').format('DD/MM/YYYY, HH:mm:ss');
                    record['DueDate2'] = dayjs(rowData[10],'DD/MM/YYYY').format('DD/MM/YYYY, HH:mm:ss');
                    record['MonthRate1'] = rowData[12];
                    record['MonthRate2'] = rowData[13];
                    record['Rate1'] = rowData[14];
                    record['Rate2'] = rowData[15];
                    record['Total'] = rowData[16];
                    record['payindate'] =  dayjs(rowData[19],'DD/MM/YYYY HH:mm:ss').format('DD/MM/YYYY');
                    record['payinrate'] = rowData[20];
                    record['payinbill'] = rowData[21];
                    record['Remarks'] = rowData[23];
                    record['id'] = rowData[26];

                    data.push(record)
               
               
            }
            if(data && data.length > 0){
                // console.log('Row Values:', data);
                return res.status(200).json(data);
            }
       } catch (err) {
            console.log(err);
            return res.status(500).json("Network Error");

        }




    }

    console.log('ID not found.');
    return res.status(500).json("ID not found");



})

module.exports = router;