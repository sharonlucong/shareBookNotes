import './movie.html';
import { Template } from 'meteor/templating';

Template.movie.helpers({
  isPrivate() {
      return Session.get('isPrivate') && Meteor.userId();
  },

  isOwner() {
        return this.owner === Meteor.userId();
  }
});

Template.movie.events({
  'click .delete' () {
    Meteor.call('movies.remove', this._id);
  },
  'change .edit' (event) {
    const movieId = this._id;
    Meteor.call('movies.updateContent', movieId, event.target.name, event.target.value);
  },
  'click .add' (event, template) {
      event.preventDefault();
      const form = event.target && event.target.form;
      const inputElment = form.children && form.children[1];
      if (!inputElment.value) {
          return;
      }

      const currentUser = Meteor.user();

      const date = new Date();
      const day = date.getDate();
      const month = date.getMonth() + 1;
      const year = date.getFullYear();
      const hour = date.getHours();
      const minute = date.getMinutes();

      const commentDate = month + '/' + day + '/' + year + ' ' + hour + ':' + minute;

      const newComment = {
          username: currentUser.username,
          comment: inputElment.value,
          date: commentDate
      };


      Meteor.call('movies.updateComments', this._id, newComment);

      const users = this.comments.map(comment => comment.username).filter( function( item, index, inputArray ) {
          return inputArray.indexOf(item) == index && item !== currentUser.username;
      });

      if (users.indexOf(this.username) === -1) {
          users.push(this.username);
      }

      Meteor.call('messages.insert', users, this._id, "movie");

      inputElment.value = "";
  }

});
