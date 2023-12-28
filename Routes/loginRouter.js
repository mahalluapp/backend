const express = require('express')
const router = express.Router()
const axios = require('axios')
const jwt = require('jsonwebtoken')
const {db} = require('../firestore')

require('dotenv').config()
router.get('/', async (req, res) => {
    const token = req.headers['authorization'] || req.headers['Authorization']

    if (!token) res.sendStatus(403)
    try {
        const response = await axios.post(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${process.env.API_KEY}`, {
            idToken: token,
            headers: { 'Content-Type': 'application/json' },
        })
        const user = response.data
        // console.log(user)
        const id = user?.users[0]?.localId
        if (id) {
            try {
                const cityRef = db.collection('users').doc(id);
                try {
                    const doc = await cityRef.get();
                    if (!doc.exists) {
                        res.sendStatus(403)
                    } else {
                        // console.log('Document data:', doc.data());
                        const JWT = jwt.sign({ "roles": doc.data().roles, id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '86400s' })
                        // console.log(JWT)
                        if (JWT) {
                            res.setHeader(
                                'Set-Cookie',
                                `SIDLDGR=${JWT}; HttpOnly; Max-Age=${24 * 60 * 60 }; Path=/;SameSite=None; Secure`
                            ).json("Token Created").status(200)

                        } else {
                            res.sendStatus(500)
                        }
                    }

                } catch (err) {

                    console.log(err)
                    res.sendStatus(500)

                }



            } catch (err) {
                console.log(err)
                res.sendStatus(403)
            }

        }
    } catch (err) {
        // console.log(err)
        res.sendStatus(500)
    }

})
module.exports = router