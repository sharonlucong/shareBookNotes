import './header.html';
import './home.html';

import '../books/reading.html';
// import '../books/article.html';
import '../books/books.html';

import '../movies/movies.html';

import '../books/reading.js';
import '../books/books.js';

import '../movies/movies.js';
// import '../books/book.js';

Router.configure({
    layoutTemplate: 'home'
});

Router.route('/', {
    name: 'reading'
});

// Router.route('/article', {
//     name: 'article'
// });

Router.route('/book', {
    name: 'books'
});

Router.route('/movie', {
    name: 'movies'
});