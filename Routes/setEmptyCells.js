const express = require('express')
const router = express.Router()
const axios = require('axios')
require('dotenv').config()
const setFormulaInEmptyCells = require('./addIds')
const spreadsheetId = process.env.SPREAD_ID;

const setEmptyCellId = async (req, res) => {
    console.log('request')

    try {
        const promises = [
            setFormulaInEmptyCells(spreadsheetId, 'CashBook', 1),
            setFormulaInEmptyCells(spreadsheetId, 'CashRegister', 2),
            setFormulaInEmptyCells(spreadsheetId, 'CashBook', 1)
          ];
        
          // Wait for all promises to resolve
          await Promise.all(promises);
        
          console.log('All formulas set successfully');
        return res.status(200).json("Updated id  with Payment")
    } catch (err) {
        return res.status(500).json("id updation failed")
    }



}
module.exports = setEmptyCellId;