const express = require('express')
const router = express.Router()
require('dotenv').config()
const { sheets } = require('../firestore')
const spreadsheetId = process.env.SPREAD_ID;
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
dayjs.extend(utc);
dayjs.extend(timezone);
router.get('/', async (req, res) => {
    const TotalAmountPayable = req.query.TotalAmountPayable;
    const NewFromDueDate1 = req.query.NewFromDueDate1;
    const NewFromDueDate2 = req.query.NewFromDueDate2;
    const BillNo = req.query.BillNo;
    const PaidMonthsRate1 = req.query.PaidMonthsRate1;
    const PaidMonthsRate2 = req.query.PaidMonthsRate2;
    const TotalMahallPayable = req.query.TotalMahallPayable;
    const TotalMadrassaPayable = req.query.TotalMadrassaPayable;
    const oldDueDate1 = req.query.oldDueDate1;
    const oldDueDate2 = req.query.oldDueDate2;
    const Name = req.query.Name;
    const Region = req.query.Region;
    

    const sheetName = req.query.Region ;
    // console.log(req.query)
    const idToFind = req.query.id ;
    const rowIndex = parseInt(idToFind) + 1;
    const formattedDate = dayjs(new Date()).tz('Asia/Kolkata').format('DD/MM/YYYY HH:mm:ss'); // od MM/DD
    const newValues = [
        [`${NewFromDueDate1}`, null, `${NewFromDueDate2}`,
            null, null, null, null, null, null, `${PaidMonthsRate1}`,
        `${PaidMonthsRate2}`, `${formattedDate}`, `${TotalAmountPayable}`, `${BillNo}`],
    ];
    const range = `${sheetName}!I${rowIndex}:V${rowIndex}`;

    const request = {
        spreadsheetId: spreadsheetId,
        resource: {
            valueInputOption: 'USER_ENTERED',
            data: [
                {
                    range: range,
                    values: newValues,
                },
            ],
        },
    };
    sheets.spreadsheets.values.batchUpdate(request, (err, response) => {
        if (err) {
            console.error('Error updating cells:', err);
            return res.json({ status: 'failed' }).status(500);
        } else {
            let promises = [];
            if (parseInt(TotalMadrassaPayable) > 0) {
                const particulars1 = ['Payment recieved from ', Name, ' ', Region, ' ', 'on Due Payment of Madrassa Fee from ', oldDueDate2, ' to ',
                    NewFromDueDate2];
                const madrasaRows = [
                    [, "Debit", `=SUBSTITUTE(SUBSTITUTE(SUBSTITUTE(SUBSTITUTE(INDIRECT("G" & ROW()), ",", ""), """", ""), "[", ""), "]", "")`, TotalMadrassaPayable, formattedDate, BillNo, JSON.stringify(particulars1), ,
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
                const sheetsToUpdate = [
                    { sheetId: 2100961456, range: 'CashRegister!A:J' }, // Update for the first sheet (adjust range)
                    { sheetId: 114821808, range: 'MadrasaCashBook!A:J' }, // Update for the second sheet (adjust range)
                    { sheetId: 1372295373, range: 'MadrasaDebitTransctions!A:J' }, // Update for the second sheet (adjust range)
                    // Add more sheets as needed...
                ];

                const promise1 = sheetsToUpdate.map(async (sheet) => {
                    try {
                        const response = await sheets.spreadsheets.values.append({
                            spreadsheetId: spreadsheetId,
                            range: sheet.range,
                            valueInputOption: 'USER_ENTERED',
                            insertDataOption: 'INSERT_ROWS',
                            resource: { values: madrasaRows },
                        });

                        // console.log(`Rows appended to Sheet ${sheet.sheetId}:`, response.data);
                        return { status: 'success', info: 'madrasa' };
                    } catch (error) {
                        console.error('Error appending rows:', error);
                        return { status: 'failed', info: 'madrasa' };
                    }
                });
                promises = promises.concat(promise1);

           }
            if (parseInt(TotalMahallPayable) > 0) {
                const particulars2 = ['Payment recieved from ', Name, ' ', Region, ' ', 'on Due Payment of Masjid Fee from ', oldDueDate1, ' to ',
                    NewFromDueDate1];
                const masjidRows = [
                    [, "Debit", `=SUBSTITUTE(SUBSTITUTE(SUBSTITUTE(SUBSTITUTE(INDIRECT("G" & ROW()), ",", ""), """", ""), "[", ""), "]", "")`, TotalMahallPayable, formattedDate, BillNo, JSON.stringify(particulars2), ,
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
                const sheetsToUpdate = [
                    { sheetId: 2100961456, range: 'CashRegister!A:J' }, // Update for the first sheet (adjust range)
                    { sheetId: 1462418611, range: 'MasjidCashBook!A:J' }, // Update for the second sheet (adjust range)
                    { sheetId: 362511997, range: 'MasjidDebitTransctions!A:J' }, // Update for the second sheet (adjust range)
                    // Add more sheets as needed...
                ];

                const promise2 = sheetsToUpdate.map(async (sheet) => {
                    try {
                        const response = await sheets.spreadsheets.values.append({
                            spreadsheetId: spreadsheetId,
                            range: sheet.range,
                            valueInputOption: 'USER_ENTERED',
                            insertDataOption: 'INSERT_ROWS',
                            resource: { values: masjidRows },
                        });

                        // console.log(`Rows appended to Sheet ${sheet.sheetId}:`, response.data);
                        return { status: 'success', info: 'masjid' };
                    } catch (error) {
                        console.error('Error appending rows:', error);
                        return { status: 'failed', info: 'masjid' };
                    }
                });
                promises = promises.concat(promise2);
            }
            
            Promise.all(promises)
            .then((results) => {
              // Handle the results after all promises are resolved
              // results will contain an array of resolved values or errors for each promise
              // Send response based on the completion of promises
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
        }


    });


})

module.exports = router;