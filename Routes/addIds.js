
const { sheets } = require('../firestore')
async function setFormulaInEmptyCells(spreadsheetId, sheetName,cells) {
   

    
    const range = `${sheetName}!J:J`;

    try {
        const range = `${sheetName}!J:J`;
        const response = await sheets.spreadsheets.values.get({
          spreadsheetId,
          range,
          valueRenderOption: 'FORMULA',
        });
    
        const lastRow = response.data.values ? response.data.values.length : 0;
    
        const newRange = `${sheetName}!J${lastRow + 1}:J${lastRow + 2}`;
        const values = [] ;
        for(i =0; i<cells ;i ++){
            values.push(['=INDIRECT("J" & ROW()-1) + 1']);
        }
        const updateResponse = await sheets.spreadsheets.values.update({
          spreadsheetId,
          range: newRange,
          valueInputOption: 'USER_ENTERED',
          resource: {
            values: values
          },
        });
    
        return updateResponse 
    } catch (err) {
        console.error('Error:', err);
        throw new Error ('Failed')
    }
}

module.exports = setFormulaInEmptyCells
