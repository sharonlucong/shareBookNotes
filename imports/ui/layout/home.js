import './header.html';
import './home.html';

import '../books/reading.html';
import '../books/article.html';
import '../books/book.html';

import '../movies/movie.html';

import '../books/reading.js';

Router.configure({
    layoutTemplate: 'home'
});

Router.route('/', {
    name: 'reading'
});

Router.route('/article', {
    name: 'article'
});

Router.route('/book', {
    name: 'book'
});

Router.route('/movie', {
    name: 'movie'
});