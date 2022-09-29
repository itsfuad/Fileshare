const router = require('express').Router();
const multer = require('multer');
const { access } = require('fs/promises');
const uuid = require('uuid').v4;
const { store } = require('./cred');

function makeId(length = 10){
    let result = '';
    let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let charactersLength = characters.length;
    for (let i = 0; i < length; i++){
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

let storage = multer.diskStorage({
    destination: (_, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => {
        if (file.size >= 15000000){
            cb(new Error("File size more than 15mb"), filename);
        }else{
            const filename = `aiub-${makeId(6)}.${file.originalname.split('.').pop()}`;
            store(filename, { filename: filename, createdAt: Date.now() });
            cb(null, filename);
        }
    },
});

let upload = multer({ 
    storage: storage,
    limits: { fileSize: 15000000 },
}).single('file'); //name field name

router.post('/', async (req, res) => {
    //validate
    //store
    
    upload(req, res, (err) => {
        if (err) {
            console.log('File cannot be stored:', err.message);
            res.send({ error: err.message });
        } else {
            //fileStore[req.file.filename] = {filename: req.file.filename, downloaded: 0, key: req.body.key};
            res.send({ success: true, file: req.file.filename, metadata: {filename: req.file.filename, filesize: req.file.size } });
            console.log('Temporary file stored.');
        }
    });

});

router.get('/:id', (req, res) => {
    //console.log(req.params);
    //console.log(fileStore);
    access(`uploads/${req.params.id}`)
    .then(() => {
        res.sendFile(`uploads/${req.params.id}`, { root: __dirname + '/..' });
    }).catch(err => {
        console.log(`Error file access: ${err}`);
        res.status(404).send('Not found');
    });
});

module.exports = router;