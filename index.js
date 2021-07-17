const express = require('express');
const app = express();
const ObjectId = require('mongodb').ObjectID;
const { MongoClient } = require('mongodb');
const cors = require('cors');
require('dotenv').config();

const port = 5000

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.mtqgx.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
    console.log('err', err)
    const adminsCollection = client.db("pad-blogs").collection("admin");
    const blogsCollection = client.db("pad-blogs").collection("blogs");
    const commentsCollection = client.db("pad-blogs").collection("comments");
    const repliesCollection = client.db("pad-blogs").collection("replies");

    //admin related code
    app.post('/makeAdmin', (req, res) => {
        const newAdmin = req.body;
        adminsCollection.insertOne(newAdmin)
            .then(result => {
                res.send(result.insertedCount > 0)
            });
    });

    app.post('/isAdmin', (req, res) => {
        const email = req.body.email;
        adminsCollection.find({ email: email })
            .toArray((err, admins) => {
                res.send(admins.length > 0)
            });
    });

    app.get('/admins', (req, res) => {
        adminsCollection.find({})
            .toArray((err, items) => {
                res.send(items)
            });
    });

    // blogs related code
    app.post('/postBlog', (req, res) => {
        const newBlog = req.body;
        blogsCollection.insertOne(newBlog)
            .then(result => {
                console.log(result);
                res.send(result.insertedCount > 0);
            });
    });

    app.get('/blogs', (req, res) => {
        blogsCollection.find({})
            .toArray((err, items) => {
                // console.log(items);
                res.send(items)
            });
    });

    app.get('/searchBlogs', (req, res) => {
        const search = req.query.search;
        blogsCollection.find({ title: { $regex: new RegExp(search, 'i') } })
            .toArray((err, items) => {
                console.log(items)
                res.send(items)
            });
    });

    app.get('/blog/:id', (req, res) => {
        blogsCollection.find({ _id: ObjectId(req.params.id) })
            .toArray((err, documents) => {
                res.send(documents);
            });
    });

    app.delete('/delete/:id', (req, res) => {
        blogsCollection.deleteOne({ _id: ObjectId(req.params.id) })
            .then(result => {
                console.log(result)
                res.send('success')
            })
            .catch(err => res.send('failed'))
    });

    // comment related code
    app.post('/postComment', (req, res) => {
        const newComment = req.body;
        commentsCollection.insertOne(newComment)
            .then(result => {
                res.send(result.insertedCount > 0)
            });
    });

    app.get('/comments', (req, res) => {
        commentsCollection.find()
            .toArray((err, items) => {
                // console.log(items)
                res.send(items)
            });
    });

    app.delete('/deleteComment/:id', (req, res) => {
        commentsCollection.deleteOne({ _id: ObjectId(req.params.id) })
            .then(result => {
                // console.log(result)
                res.send('success')
            })
            .catch(err => res.send('failed'))
    });

    app.delete('/deletePostComment/:id', (req, res) => {
        commentsCollection.deleteMany({ blogId: req.params.id })
            .then(result => {
                // console.log(result)
                res.send('success')
            })
            .catch((err) => res.send('failed'))
    });

    // reply-related-code
    app.post('/postReply', (req, res) => {
        const newReply = req.body;
        repliesCollection.insertOne(newReply)
            .then(result => {
                // console.log(result)
                res.send(result.insertedCount > 0)
            });
    });

    app.get('/allReplies', (req, res) => {
        repliesCollection.find()
            .toArray((err, items) => {
                // console.log(items)
                res.send(items)
            });
    });

    app.delete('/deleteReply/:id', (req, res) => {
        repliesCollection.deleteOne({ _id: ObjectId(req.params.id) })
            .then(result => {
                // console.log(result)
                res.send('success')
            })
            .catch((err) => res.send('failed'))
    });

    app.delete('/deleteCommentWithReplies/:id', (req, res) => {
        repliesCollection.deleteMany({ commentId: req.params.id })
            .then(result => {
                console.log(result)
                res.send('success')
            })
            .catch((err) => res.send('failed'))
    });

    app.delete('/deletePostCommentReply/:id', (req, res) => {
        repliesCollection.deleteMany({ commentId: req.params.id })
            .then(result => {
                // console.log(result)
                res.send('success')
            })
            .catch((err) => res.send('failed'))
    });

    app.get('/', (req, res) => {
        res.send('pad blogs!')
    })

});

app.listen(process.env.PORT || port)

