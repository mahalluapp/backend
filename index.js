const express = require('express')
const app = express()
const cors = require('cors')
const jwt = require('jsonwebtoken')
var cookieParser = require('cookie-parser')
const {db} = require('./firestore')
app.use(cookieParser())
require('dotenv').config()
app.use(express.json());

// app.use('/addtodrive',require('./docApi/addtoDrive'))

app.use(cors({
    origin: ['http://localhost:3000', 'https://community-ledger.web.app'],
    optionsSuccessStatus: 200,
    credentials: true,
    methods: "GET,POST,OPTIONS",
}))
const userAuth = async (req, res, next) => {
    const cookies = req.cookies;
    if (!cookies?.SIDLDGR) {
        return res.sendStatus(403);
    } else {
        try {
            const decoded = await jwt.verify(req.cookies.SIDLDGR, process.env.ACCESS_TOKEN_SECRET);
            const arr = [];
            decoded.roles.forEach(element => {
                arr.push(element)
            });
            req.roles = arr ;
            next()
        } catch (err) {
            res.sendStatus(401);
        }

    }
};

const adminAuth = async (req, res,next) => {
    const cookies = req.cookies;
    if (!cookies?.SIDLDGR) {
        return res.sendStatus(403);
    } else {
        try {
            const decoded = await jwt.verify(req.cookies.SIDLDGR, process.env.ACCESS_TOKEN_SECRET);
            
            const id = decoded.id
        
            try {
                const cityRef = db.collection('admins').doc('admins');
                const docs = await cityRef.get()
                const admins = docs.data().admins
                if (admins.includes(`${id}`)) {
                    const arr = [];
                    decoded.roles.forEach(element => {
                        arr.push(element)
                    });
                    req.roles = arr;
                    next()
                } else {
                    res.sendStatus(401)
                    return
                }

            } catch (err) {
                res.sendStatus(401)
                console.log(err)
            }


        } catch (err) {
            res.sendStatus(401);
        }

    }


}

app.use('/login', require('./Routes/loginRouter'));
app.use('/logout', require('./Routes/logoutRouter'));
app.use('/getpeople',userAuth,require('./sheetApi/getPeople'));
app.use('/getperson',userAuth,require('./sheetApi/getPerson'));
app.use('/webhook',require('./Routes/webhook'))
app.use('/updatesheet',adminAuth, require('./sheetApi/updateSheet'))
app.use('/paynow',adminAuth,require('./sheetApi/paynow'))
app.use('/addperson',adminAuth,require('./sheetApi/Addperson'))
app.use('/updateperson',adminAuth,require('./sheetApi/UpdatePerson'))
app.use('/debit',adminAuth,require('./sheetApi/debit'))
app.use('/credit',adminAuth,require('./sheetApi/credit'))
app.use('/getbilldata',adminAuth,require('./sheetApi/getBill'))
app.use('/createSheet',adminAuth,require('./miscSheetapi/createSheet'))
app.use('/getsheetlist',adminAuth,require('./miscSheetapi/getsheetnames'))
app.use('/addsheetcontent',adminAuth,require('./miscSheetapi/addsheetcontent'))
app.use('/viewsheet',adminAuth,require('./miscSheetapi/viewsheet'))
app.use('/updatemisc',adminAuth,require('./miscSheetapi/updatemisc'))
app.use('/deletesheet',adminAuth,require('./miscSheetapi/deletesheet'))
app.use('/processdoc',adminAuth,require('./docApi/processDoc'))
app.get('/',(req,res)=>{
    res.status(200).json({status:'success'})
})
app.listen(8000, () => {
    console.log('server running at port 8000')
})
