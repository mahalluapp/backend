const express = require('express')
const router = express.Router()
const fs = require('fs');
const { drive, docs } = require('../firestore')
const dayjs = require('dayjs');
const path = require('path')
const customParseFormat = require('dayjs/plugin/customParseFormat');
dayjs.extend(customParseFormat);

router.get ('/',(req,res)=>{


    console.log(req.query)
    const { brideName, brideFather, brideHouse, groomName, groomFather,
        groomHouse, place, post, district, pin, weddate, wedresidence } = req.query;
    const { date, slno } = req.query;
    const parsedDate = dayjs(weddate, 'DD/MM/YYYY');
    const formattedDate = parsedDate.format('D MMMM YYYY');
    drive.files.copy(
        {
            fileId: '1QdBnyvRSbJLxCTplr4maMuFhTZa5bmgu',
            requestBody: {
                mimeType: 'application/vnd.google-apps.document', // Convert to Google Docs format
                name: 'Converted_Google_Doc',
            },
        },
        async(copyErr, copiedFile) => {
            if (copyErr) {
                // console.error('Error converting file to Google Docs format:', copyErr);
                res.status(500).send('Error converting file to Google Docs format:');
            }
            // console.log('File converted to Google Docs format:', copiedFile.data);
            const copyfileId = copiedFile.data.id;
            requests = [
                {
                    'replaceAllText': {
                        'containsText': {
                            'text': '{{slno}}',
                            'matchCase': 'true'
                        },
                        'replaceText': `${slno}`,
                    }
                }, {
                    'replaceAllText': {
                        'containsText': {
                            'text': '{{date}}',
                            'matchCase': 'true'
                        },
                        'replaceText': `${date}`,
                    }
                }, {
                    'replaceAllText': {
                        'containsText': {
                            'text': '{{brideName}}',
                            'matchCase': 'true'
                        },
                        'replaceText': `${brideName.toUpperCase()}`,
                    }
                }, {
                    'replaceAllText': {
                        'containsText': {
                            'text': '{{brideFather}}',
                            'matchCase': 'true'
                        },
                        'replaceText': `${brideFather.toUpperCase()}`,
                    }
                }, {
                    'replaceAllText': {
                        'containsText': {
                            'text': '{{brideHouse}}',
                            'matchCase': 'true'
                        },
                        'replaceText': `${brideHouse.toUpperCase()}`,
                    }
                }, {
                    'replaceAllText': {
                        'containsText': {
                            'text': '{{groomName}}',
                            'matchCase': 'true'
                        },
                        'replaceText': `${groomName.toUpperCase()}`,
                    }
                }, {
                    'replaceAllText': {
                        'containsText': {
                            'text': '{{groomFather}}',
                            'matchCase': 'true'
                        },
                        'replaceText': `${groomFather.toUpperCase()}`,
                    }
                }, {
                    'replaceAllText': {
                        'containsText': {
                            'text': '{{groomHouse}}',
                            'matchCase': 'true'
                        },
                        'replaceText': `${groomHouse.toUpperCase()}`,
                    }
                }, {
                    'replaceAllText': {
                        'containsText': {
                            'text': '{{place}}',
                            'matchCase': 'true'
                        },
                        'replaceText': `${place.toUpperCase()}`,
                    }
                }, {
                    'replaceAllText': {
                        'containsText': {
                            'text': '{{post}}',
                            'matchCase': 'true'
                        },
                        'replaceText': `${post.toUpperCase()}`,
                    }
                }, {
                    'replaceAllText': {
                        'containsText': {
                            'text': '{{district}}',
                            'matchCase': 'true'
                        },
                        'replaceText': `${district.toUpperCase()}`,
                    }
                }, {
                    'replaceAllText': {
                        'containsText': {
                            'text': '{{pin}}',
                            'matchCase': 'true'
                        },
                        'replaceText': `${pin.toUpperCase()}`,
                    }
                }, {
                    'replaceAllText': {
                        'containsText': {
                            'text': '{{wedresidence}}',
                            'matchCase': 'true'
                        },
                        'replaceText': `${wedresidence}`,
                    }
                }, {
                    'replaceAllText': {
                        'containsText': {
                            'text': '{{weddate}}',
                            'matchCase': 'true'
                        },
                        'replaceText': `${formattedDate}`,
                    }
                }
            ]
            try {
                const response = await docs.documents.batchUpdate({
                    documentId: copyfileId,
                    resource: { requests },
                });
                console.log('Updated document:', response.data);
                try {
                    const response = await drive.files.export({
                        fileId: copyfileId,
                        mimeType: 'application/pdf', // Specify the export format
                    }, { responseType: 'stream' });
                    res.setHeader('Content-Type', 'application/pdf');
                    res.setHeader('Content-Disposition', 'attachment; filename="certificate.pdf"');
                    res.setHeader('Content-Transfer-Encoding', 'Binary');
                    try {
                        await drive.files.delete({
                           fileId: copyfileId,
                         });
                         console.log('File deleted successfully');
                         
                       } catch (error) {
                         console.error('Error deleting file:', error);
                         
                       }
                    response.data.pipe(res);
                } catch (error) {
                    console.error('Error:', error);
                    res.status(500).send('Error exporting file');
                }
            } catch (err) {
                console.error('Error updating document:', err.response ? err.response.data : err);
                res.status(500).json("Failed");
            }
        }
    );
})
module.exports = router;