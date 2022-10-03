const path = require('path');
const http = require('http');
const compression = require('compression');
const cors = require('cors');
const express = require('express');
const { clean } = require('./cleaner');
const { fileStore } = require('./cred');

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
    res.render('login', {action: "/p", title: "Login"});
})

app.post('/p', (req, res) => {
    const regex = /22([\d]{5})3/g;
    const uid = req.body.studentID;
    //console.log(uid);
    if (regex.test(uid)){
        res.render('index', {title: "Upload"});
    }else{
        res.render('errorRes', {title: "Access Denied", errorCode: "401", errorMessage: "Unauthorised", buttonText: "Suicide"});
    }
});

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
        res.render('download', {link: `/api/d/${filename}`, filename: filename, filesize: size, title: "Download"});
    }else{
        res.render('errorRes', {title: "Empty", errorCode: "404", errorMessage: "Not found", buttonText: "Home"});
    }
});

app.get('*', (_, res) => {
    res.redirect('/');
});


server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
})