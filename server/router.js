const router = require('express').Router();
const multer = require('multer');
const { access } = require('fs/promises');
const { store, fileStore } = require('./cred');

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
        if (file.size >= 15728640){
            cb(new Error("File size more than 15mb"), "");
        }else{
            const fileId = makeId(12);
            const filename =  `${fileId}.${file.originalname.split('.').pop()}`;
            store(fileId, { filename: filename, fileSize: undefined, createdAt: Date.now() });
            cb(null, filename);
        }
    },
});

let upload = multer({ 
    storage: storage,
    limits: { fileSize: 15728640 },
}).single('file'); //name field name

router.post('/', async (req, res) => {
    //validate
    //store
    
    upload(req, res, (err) => {
        if (err) {
            console.log('File cannot be stored:', err.message);
            res.send({ success: false, error: err.message });
        } else {
            //fileStore[req.file.filename] = {filename: req.file.filename, downloaded: 0, key: req.body.key};
            const fileId = req.file.filename.replace(`.${req.file.filename.split('.').pop()}`, '');
            fileStore.get(fileId).fileSize = req.file.size;
            res.send({ success: true, file: fileId});
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