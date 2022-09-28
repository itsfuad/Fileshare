const path = require('path');
const http = require('http');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const express = require('express');
const { clean } = require('./cleaner');

const app = express();


const server = http.createServer(app);

const publicPath = path.join(__dirname, '../public');
const PORT = process.env.PORT || 3000;

const devMode = false;

clean();

const apiRequestLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minute
    max: 100, // limit each IP to 100 requests per windowMs
    message: "Too many requests. Temporarily blocked from PokeTab server. Please try again later",
    standardHeaders: false, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false // Disable the `X-RateLimit-*` headers
});


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

app.use('/api/files', require('./router'));
app.use('/api/download', require('./router'));

app.get('/', (req, res) => {
    res.render('login', {action: "/portal"});
})

app.post('/portal', (req, res) => {
    const regex = /22-([\d]{5})-3/g;
    const uid = req.body.studentID;
    console.log(uid);
    if (regex.test(uid)){
        res.render('index');
    }else{
        res.statusCode(403).send("Access denied!");
    }
});

app.get('/download/:id/:size', (req, res) => {
    const filename = req.params.id;
    let size = req.params.size;
    if (size < 1024){
        size = size + 'b';
    }else if (size < 1048576){
        size = (size/1024).toFixed(1) + 'kb';
    }else{
        size = (size/1048576).toFixed(1) + 'mb';
    }
    res.render('download', {link: `/api/download/${filename}`, filename: filename, filesize: size});
});

app.get('*', (_, res) => {
    res.redirect('/');
});


app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
})