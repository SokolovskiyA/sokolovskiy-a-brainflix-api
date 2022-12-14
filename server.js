const express = require('express');
const app = express();
const port = 5000;
const fs = require ('fs-extra');
const {v4: uuid} = require('uuid');
const cors = require("cors");
const multer = require('multer')

app.use(cors());
app.use(express.static('public'));
app.use(express.json());
///MULTER MIDDLEWEAR TO STORE UPLOADED THUMBNAIL
const storage = multer.diskStorage ({
    destination: function (req, file, cb) {
        cb(null, 'public/images') ///Storage PATH
    },
    filename: function (req, file, cb) {
        cb(null, uuid() + "_" + file.originalname) //UNIQUIE FILE NAME CONSTRUCTION
    }
})
const upload = multer({ storage: storage }) ///SET STORAGE 
///FUNCTIONS////
function loadVideos() {
    const videos = fs.readFileSync('./data/video-details.json', 'utf8');
    return JSON.parse(videos);
}
function addNewVideo(newVideo) {
    const videos = loadVideos();
    videos.push(newVideo);
    fs.writeFileSync('./data/video-details.json', JSON.stringify(videos));
    return 'file written successfully';
}
function deleteComment(videoId, commentId) {
    const videos = loadVideos()
    const video = videos.find(video => video.id === videoId);
    const commentIndex = video.comments.findIndex(comment => comment.id === commentId);
    video.comments.splice(commentIndex, 1)
    fs.writeFile('./data/video-details.json', JSON.stringify(videos))
}
function addComment(videoId, newComment) {
    const videos = loadVideos()
    const video = videos.find(video => video.id === videoId);
    video.comments.push(newComment)
    fs.writeFile('./data/video-details.json', JSON.stringify(videos))
    return(video.comments)
}
app.get('/', (req, res) => {
    res.status(200).send("Hello. And  welcome  to  BrainFlix  API. ")
});
////getting video list ****WORKS****
app.get('/videos', (req, res) => {
    fs.readFile(`./data/video-details.json`, (err, videos)=>{
        if (err) {
            res.status(500).json({message: "something went wrong", error: err})
        }
        else {
            res.status(200).json(JSON.parse(videos));
        }
    })
});
////Posting new video ****WORKS****
app.post('/videos', upload.single('image') , (req,res) => {
    if (req.body.title && req.body.description) {
        let newVideo = {
            title: req.body.title,
            channel: 'User channel name', 
            image: `http://localhost:5000/images/${req.file.filename}`,  //PATH TO UNIQUE FILENAME
            video: "http://localhost:5000/videos/BrainStation.mp4",
            description: req.body.description, 
            timestamp: Date.now(),
            likes: 0, 
            views: 0, 
            id: uuid(),
            comments: [],
        }
        res.status(201).send(addNewVideo(newVideo));
    } else {
        res.status(400).send('Please provide video title and video description');
    }
})
/////getting video by id  *** WORKS ***
app.get('/videos/:videoId', (req, res) => {
    fs.readFile(`./data/video-details.json`, (err, videosInfo)=>{
        if (err) {
            res.status(500).json({message: "something went wrong", error: err})
        }
        else {
            res.json(JSON.parse(videosInfo).find(video => video.id === req.params.videoId)
            );
        }
    });
});
///POSTING COMMENTS ***WORKS***
app.post('/videos/:videoId/comments', (req, res) => {
    if(req.params.videoId && req.body.comment && req.body.name) {
        let newComment = {
            name: req.body.name, 
            comment: req.body.comment, 
            timestamp: Date.now(),
            likes: 0, 
            id: uuid(),
        }
        res.status(201).send(addComment(req.params.videoId, newComment))
    }
    else {
        res.send('Please provide comment');
    }
})
////DELETE COMMENT *** WORKS *** 
app.delete('/videos/:videoId/comments/:commentId', (req, res) => {
    if (req.params.videoId && req.params.commentId) {
        res.status(201).send(deleteComment(req.params.videoId, req.params.commentId))
    }
    else {
        res.status(404).send("comment not found");
    }
});
/*
app.put('/videos/:videoId/comments/:commentId', (req, res) => {
    console.log(req.body)
});
*/


app.listen(port, () => {
    console.log(`App listening on port ${port}`)
})

