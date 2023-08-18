const router = require('express').Router();
const { access } = require('fs/promises');
const { store } = require('./cred');
const { parse } = require('./../dist/formParser');
const crypto = require('crypto');
const fs = require('fs');


router.post('/', (req, res) => {
  
    const boundary = req.headers['content-type']?.split('; boundary=')[1];
  
    if (!boundary) {
      res.status(400).send({ error: 'Invalid form' });
      return;
    }
  
    //get the file size
    const fileSize = parseInt(req.headers['content-length']);
    
    const maxFileSize = 1024 * 1024 * 100; //100MB
  
    if (fileSize > maxFileSize) {
      res.status(400).send({ error: 'File size too large' });
      return;
    }
    
    const chunks = [];
    req.on('data', (chunk) => {
      chunks.push(chunk);
    });
  
    req.on('aborted', () => {
      req.destroy();
      console.log(`Upload aborted`);
      //console.log(chunks);
      chunks.length = 0;
    })
  
    req.on('end', () => {
      const data = Buffer.concat(chunks);
  
      const formData = parse(data, boundary);
  
      if (!formData) {
        res.status(400).send({ error: 'Invalid form' });
        return;
      }
  
      const file = formData[0];
  
      const fileId = crypto.randomBytes(16).toString('hex');
  
      fs.writeFile(`uploads/${fileId}`, file.data, (err) => {
        if (err) {
          //console.log(err);
          res.status(500).send({ error: 'Internal server error' });
          return;
        }
        //console.log(`File ${file.filename} saved as ${fileId}. Size: ${fileSize}`);
        store(fileId, { filename: file.filename, type: file.type, createdAt: Date.now(), fileSize: fileSize});

        res.status(200).send({ success: true, file: fileId });
            //console.log(`${filename} recieved to be relayed`);
      });
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