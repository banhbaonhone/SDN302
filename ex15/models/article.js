const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const commentSchema = new Schema({
    commenter: {
        type: String
    },
    date: {
        type: Date,
        default: Date.now
    },
    body: {
        type: String
    }
}, {
    timestamps: true
});

const articleSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    text: {
        type: String
    },
    content: {
        type: String
    },
    author: {
        type: String
    },
    tags: {
        type: [String],
        default: []
    },
    date: {
        type: Date,
        default: Date.now
    },
    comments: [commentSchema]
}, {
    timestamps: true,
    strict: false
});

const Article = mongoose.model('Article', articleSchema);

module.exports = Article;
