import { Router } from 'express';
import { access } from 'fs/promises';
import { store } from './cred.js'
import crypto from 'crypto';
import fs from 'fs';

import { parse } from '@itsfuad/multipart-form-reader';

export const router = Router();

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
       
      chunks.length = 0;
    })
  
    req.on('end', () => {
      const data = Buffer.concat(chunks);
  
      const formData = parse(data, boundary);
  
      if (!formData.length) {
        res.status(400).send({ error: 'Invalid form' });
        return;
      }
  
      const file = formData[0];
  
      const fileId = crypto.randomBytes(6).toString('hex');

      console.log(fileId);
  
      fs.writeFile(`uploads/${fileId}`, file.data, (err) => {
        if (err) {
           
          res.status(500).send({ error: 'Internal server error' });
          return;
        }
         
        store(fileId, { filename: file.filename, type: file.type, createdAt: Date.now(), fileSize: fileSize});

        res.status(200).send({ success: true, file: fileId });
             
      });
    });
});  

router.get('/:id', (req, res) => {
     
     
    access(`uploads/${req.params.id}`)
    .then(() => {
        res.sendFile(`uploads/${req.params.id}`, { root: __dirname + '/..' });
    }).catch(err => {
        console.log(`Error file access: ${err}`);
        res.status(404).send('Not found');
    });
});