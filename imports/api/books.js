import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';

export const Books = new Mongo.Collection('books');
if (Meteor.isServer) {
    Meteor.publish('books', function booksPublication() {
        return Books.find({
            // $or: [
                // { private: { $ne: true } },
                // { owner: this.userId }
            // ]
        });
    });
}

Meteor.methods({
    'books.insert' (book) {
        if (!Meteor.userId()) {
            throw new Meteor.Error('not-authorized');
        }

        Books.insert({
            contents: book.contents || [],
            author: book.author || '',
            title: book.title || '',
            createdAt: new Date(),
            owner: Meteor.userId(),
            username: Meteor.user().username,
            comments: []
        });
    },
    'books.remove' (bookId) {
        check(bookId, String);

        const book = Books.findOne(bookId);
        if (book.private && book.owner !== Meteor.userId()) {
            throw new Meteor.Error('not-authorized');
        }

        Books.remove(bookId);
    },
    'books.addChapter' (bookId, chapter) {
        const book = Books.findOne({"_id": bookId});

        if (book.private && book.owner !== Meteor.userId()) {
            throw new Meteor.Error('not-authorized');
        }

        Books.update(bookId, { $push: { contents: chapter } });
    },
    'books.updateChapterTitle' (bookId, chapterIndex, value) {
        const book = Books.findOne(bookId);
        if (book.private && book.owner !== Meteor.userId()) {
            throw new Meteor.Error('not-authorized');
        }

        Books.update(bookId, { $set: { [`contents.${chapterIndex}.title`]: value } });
    },
    'books.updateChapterNote' (bookId, chapterIndex, value) {
        const book = Books.findOne(bookId);
        if (book.private && book.owner !== Meteor.userId()) {
            throw new Meteor.Error('not-authorized');
        }

        Books.update(bookId, { $set: { [`contents.${chapterIndex}.note`]: value } });
    },
    'books.updateChapterContent' (bookId, chapterIndex, value) {
        const book = Books.findOne(bookId);
        if (book.private && book.owner !== Meteor.userId()) {
            throw new Meteor.Error('not-authorized');
        }

        Books.update(bookId, { $set: { [`contents.${chapterIndex}.content`]: value } });
    },
    'books.updateBookTitle' (bookId, value) {
        const book = Books.findOne(bookId);
        if (book.private && book.owner !== Meteor.userId()) {
            throw new Meteor.Error('not-authorized');
        }

        Books.update(bookId, { $set: { title: value } });
    },
    'books.updateBookAuthor' (bookId, value) {
        const book = Books.findOne(bookId);
        if (book.private && book.owner !== Meteor.userId()) {
            throw new Meteor.Error('not-authorized');
        }

        Books.update(bookId, { $set: { author: value } });
    },
    // 'books.updateComments' (bookId, value) {
    //     const book = Books.findOne(bookId);
    //     if (book.private && book.owner !== Meteor.userId()) {
    //         throw new Meteor.Error('not-authorized');
    //     }

    //     Books.update(bookId, { $push: { comments: value } });
    // },
    'books.setState' (state) {
        if (!Meteor.userId()) {
            throw new Meteor.Error('not-authorized');
        }
        const books = Books.find();
        books.forEach(function(book) {
            Books.update(book._id, { $set: { isPrivate: state } });
        });
    }
});