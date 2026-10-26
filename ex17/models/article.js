const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const articleSchema = new Schema({
  title: {
    type: String,
    required: [true, 'Article title is required.'], // Value-level validation
    minlength: [5, 'Title must be at least 5 characters.'], // String-level validation
    trim: true
  },
  date: {
    type: Date,
    default: Date.now,
    required: [true, 'Article date is required.']
  },
  text: {
    type: String,
    required: [true, 'Article text is required.'],
    validate: {
      validator: function(v) {
        return v.length > 10; // Custom validator
      },
      message: 'Article text must be longer than 10 characters.'
    }
  },
  tags: {
    type: [String],
    validate: {
      validator: function(v) {
        return v && v.length > 0; // The tags array must not be empty
      },
      message: 'There should be at least 1 tag.'
    }
  }
}, {
  strict: false
});

const Articles = mongoose.models.Articles || mongoose.model('Articles', articleSchema);
if (!mongoose.models.Article) {
  mongoose.model('Article', articleSchema);
}

module.exports = Articles;
