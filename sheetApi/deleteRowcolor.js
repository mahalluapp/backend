const express = require('express');
require('dotenv').config()
const sheetPath = process.env.NODE_ENV === 'production'
? '/etc/secrets/sheet.json'
: './etc/secrets/sheet.json';
const fs = require('fs'); // File system module in Node.js
// const spreadsheetId =  process.env.SPREAD_ID;
// Read the JSON file



async function setColorToRow(id,name,spreadsheetId,sheetId) {
    const sheetName = name;
    // const data = fs.readFileSync(sheetPath,'utf8')
    // const sheetData = JSON.parse(data)

    // const sheetId = sheetData[`${sheetName}`]
    const request = {
      spreadsheetId: spreadsheetId,
      resource: {
        requests: [
          {
            addConditionalFormatRule: {
              rule: {
                ranges: [
                  {
                    sheetId: sheetId,
                    startRowIndex: id, // The row index you want to format
                    endRowIndex: id + 1, // End row index (exclusive) for a single row
                    startColumnIndex: 0, // Start column index (0-based)
                    endColumnIndex: 10 // Adjust as per the number of columns in your sheet
                  }
                ],
                booleanRule: {
                  condition: {
                    type: 'TEXT_EQ',
                    values: [
                      {
                        userEnteredValue: 'Deleted'
                      }
                    ]
                  },
                  format: {
                    backgroundColor: {
                      red: 1.0, // RGB values for the color (0.0 - 1.0)
                      green: 0.7,
                      blue: 0.7
                    }
                  }
                }
              }
            }
          }
        ]
      }
    };

    return request;
}  

module.exports = setColorToRow;