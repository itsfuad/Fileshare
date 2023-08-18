const { readdir, rm } = require('fs/promises');
const { fileStore } = require('./cred');

function deleteFiles(){
    for (let [key, value] of fileStore){
        //30 mins
        const time = 10 * 60 * 1000;
        if ( Date.now() - time >= value.createdAt){
            console.log(`Deleting ${key}`);
            rm(`uploads/${key}`);
            fileStore.delete(key);
        }
    }
}


function clean(){
    console.log('Running cleaner...');
    readdir('uploads').then(files => {
        files.map( file => {
            if (!fileStore.has(file) && file != 'dummy.txt'){
                console.log('Deleting file ' + file);
                rm(`uploads/${file}`);
            }
        });
    }).catch(err => {
        console.log(err);
    });
    setInterval(deleteFiles, 1000);
}

module.exports = { clean };