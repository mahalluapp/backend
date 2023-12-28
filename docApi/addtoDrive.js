const express = require('express')
const router = express.Router()
const fs = require('fs');
const { drive, docs } = require('../firestore')
const path = require('path')

router.get('/', (req, res) => {
    const fileMetadata = {
        name: 'Template_Doc.docx', // Replace with your file name
        // Add any other metadata you need (e.g., parents, mimeType, etc.)
    };
    const filePath = './file.docx'; // Replace with the path to your file
    const media = {
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        body: fs.createReadStream(filePath),
    };
    drive.files.create({
        resource: fileMetadata,
        media: media,
        fields: 'id', // You can request more fields if needed
    }, (err, file) => {
        if (err) {
            console.error('Error uploading file:', err);
            return;
        }
        console.log('File uploaded. File ID:', file.data.id);
    });
});

router.get('/createcopy', (req, res) => {

    const fileId = '16STUgjtIM6G4fl83P2-CN0_Kp2Y-w10k'; // Replace with the ID of the file you want to copy
    const copyName = 'Copy of Template_Doc'; // Replace with your desired name for the copy
    drive.files.copy(
        {
            fileId: fileId,
            resource: { name: copyName },
        },
        (err, copiedFile) => {
            if (err) {
                console.error('Error copying file:', err);
                return;
            }
            console.log('File copied. Copied File ID:', copiedFile.data.id);
        }
    );
})

router.get('/insert', async (req, res) => {

    requests = [
        {
            'replaceAllText': {
                'containsText': {
                    'text': '{{slno}}',
                    'matchCase': 'true'
                },
                'replaceText': '24/2023',
            }
        }, {
            'replaceAllText': {
                'containsText': {
                    'text': '{{date}}',
                    'matchCase': 'true'
                },
                'replaceText': '24/12/2023',
            }
        }
    ]
    try {
        const response = await docs.documents.batchUpdate({
            documentId: '16STUgjtIM6G4fl83P2-CN0_Kp2Y-w10k',
            resource: { requests },
        });
        console.log('Updated document:', response.data);
        res.status(200).json("Success"); // Consider using 200 for successful operations
    } catch (err) {
        console.error('Error updating document:', err.response ? err.response.data : err);
        res.status(500).json("Failed");
    }
})

router.get('/convert', (req, res) => {
    drive.files.copy(
        {
            fileId: '1oU5UcpjSHuj6lSbJ7GhcDeDhF01HgMSR',
            requestBody: {
                mimeType: 'application/vnd.google-apps.document', // Convert to Google Docs format
                name: 'Converted_Google_Doc',
            },
        },
        (copyErr, copiedFile) => {
            if (copyErr) {
                console.error('Error converting file to Google Docs format:', copyErr);
                return;
            }
            console.log('File converted to Google Docs format:', copiedFile.data);
        }
    );
}
);

router.get('/download', async (req, res) => {
    try {
        // Get the file ID from the request
        // Use the Drive API to fetch file metadata
        const response = await drive.files.export({
            fileId: '1dfaWa_1K4j9fhYbfXNjAllHyfNObVybMVvqmpfL4UOo',
            mimeType: 'application/pdf', // Specify the export format
        }, { responseType: 'stream' });

        // Set appropriate headers for a PDF file
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="certificate.pdf"');
        res.setHeader('Content-Transfer-Encoding', 'Binary');

        // Pipe the exported file stream to the response to send it to the client
        response.data.pipe(res);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Error exporting file');
    }
})

router.get('/save', async (req, res) => {

    try {
        const fileId = '1dfaWa_1K4j9fhYbfXNjAllHyfNObVybMVvqmpfL4UOo'; // Get the file ID from the request

        // Use the Drive API to export the Google Doc as a PDF
        const response = await drive.files.export({
            fileId: fileId,
            mimeType: 'application/pdf', // Specify the export format
        }, { responseType: 'stream' });

        const filePath = './sample.pdf';

        // Pipe the exported file stream to a file on your server
        const dest = fs.createWriteStream(filePath);
        response.data.pipe(dest);

        dest.on('finish', () => {
            console.log('File downloaded and saved:', filePath);
        })
        dest.on('error', (err) => {
            console.error('Error downloading file:', err);
            res.status(500).send('Error downloading file');
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Error downloading file');
    }
})

router.get('/delete', async (req, res) => {
    try {
        const resp = await drive.files.delete({
            fileId: req.query.fileId,
        });
        console.log('File deleted successfully');
        res.status(200).send(resp.data)
    } catch (error) {
        console.error('Error deleting file:', error);
        res.status(500).send(error.message)
    }
})

router.get('/list', async (req, res) => {

    try {
        const response = await drive.files.list({
            pageSize: 10, // Specify the number of files to retrieve per page
            fields: 'files(id, name)', // Specify the fields to retrieve
        });

        const files = response.data.files;
        if (files.length) {
            console.log('Files:');
            files.forEach((file) => {
                console.log(`${file.name} (${file.id})`);
            });
        } else {
            console.log('No files found.');
        }
    } catch (error) {
        console.error('Error listing files:', error);
    }
})

router.get('/getfile', (req, res) => {
    const fileId = req.query.fileId;
    const filePath = './file.docx'
    const dest = fs.createWriteStream(filePath);
    drive.files.get({ fileId, alt: 'media' }, { responseType: 'stream' }, (err, res) => {
        if (err) {
            console.error('Error:', err);
            return;
        }

        res.data
            .on('end', () => {
                console.log('File downloaded successfully');
            })
            .on('error', (err) => {
                console.error('Error downloading:', err);
            })
            .pipe(dest);
    });
})
module.exports = router;