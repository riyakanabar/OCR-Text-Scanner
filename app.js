// imports
const express = require('express');
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const app = express();


const fs = require("fs");
const multer = require('multer');
const {TesseractWorker} = require('tesseract.js');
const worker = new TesseractWorker();

//storage
const storage = multer.diskStorage({
    destination: (req,file,cb) => {
        cb(null, "./uploads")
    },
    filename: (req,file,cb) =>{
        cb(null, file.originalname);
    }
});

const upload = multer({storage: storage}).single('avatar');

app.set("view engine", "ejs");
app.set("views",__dirname + "/views")
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

//routes
app.get('/', (req,res) => {
    res.render('index');
});
app.get('/choosefile', (req, res) => {
    res.render('choosefile');
   });
app.get('/templatechoose', (req, res) => {
    res.render('templatechoose');
   });
app.get('/convertBlank', (req, res) => {
    res.render('convertBlank');
});
app.post('/upload', (req,res) => {
    upload(req,res, err => {
        fs.readFile(`./uploads/${req.file.originalname}`, (err,data) => {
            if(err) return console.log('An error occured', err);

            worker
            .recognize(data, "eng", {tessjs_create_pdf: '1'})
            .progress(progress => {
                console.log(progress);
            })
            .then(result => {
                res.send(result.text);
                //res.redirect('/download');
            })
            .finally(() => worker.terminate());
        });
        //console.log(req.file);
    });
});

app.get("/download", (req,res) => {
    const file = `${__dirname}/tesseract.js-ocr-result.pdf`;
    res.download(file);
});

//start up our server
const PORT = 5000 || process.env.PORT;
app.listen(PORT, () => console.log(`Hey Im running on port ${PORT}`));
