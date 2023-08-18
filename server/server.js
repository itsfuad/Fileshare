const path = require('path');
const http = require('http');
const compression = require('compression');
const cors = require('cors');
const express = require('express');
const { clean } = require('./cleaner');
const { fileStore } = require('./cred');
const os = require('os');

const app = express();

const server = http.createServer(app);

const publicPath = path.join(__dirname, '../public');
const PORT = process.env.PORT || 3000;

clean();

app.disable('x-powered-by');

//view engine setup
app.set('views', path.join(__dirname, '../public/views'));
app.set('view engine', 'ejs');
app.set('trust proxy', 1);

app.use(cors());
app.use(compression());
app.use(express.static(publicPath));
app.use(express.json());
app.use(express.urlencoded({
  extended: false
}));
//app.use(apiRequestLimiter);

app.use('/api/f', require('./router'));
app.use('/api/d', require('./router'));

app.get('/', (req, res) => {
    res.render('index', {title: "Upload"});
})

app.get('/d/:id', (req, res) => {
    if (fileStore.has(req.params.id)){
        const filename = fileStore.get(req.params.id).filename;
        let size = fileStore.get(req.params.id).fileSize;
        if (size < 1024){
            size = size + 'b';
        }else if (size < 1048576){
            size = (size/1024).toFixed(1) + 'kb';
        }else{
            size = (size/1048576).toFixed(1) + 'mb';
        }
        res.render('download', {link: `/api/d/${req.params.id}`, filename: filename, filesize: size, title: "Download"});
    }else{
        res.render('errorRes', {title: "Empty", errorCode: "404", errorMessage: "Not found", buttonText: "Home"});
    }
});

app.get('*', (_, res) => {
    res.redirect('/');
});


server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`System: ${os.type()} ${os.release()} ${os.arch()}`);
    console.log(`CPU: ${os.cpus()[0].model}`);
    console.log(`CPU Cores: ${os.cpus().length}`);
    console.log(`Memory: ${Math.round(os.totalmem()/1048576)}MB`);
    console.log(`Free Memory: ${Math.round(os.freemem()/1048576)}MB`);
    console.log(`Uptime: ${Math.round(os.uptime()/3600)} hours`);
    console.log(`Hostname: ${os.hostname()}`);
    console.log(`Home Directory: ${os.homedir()}`);
})