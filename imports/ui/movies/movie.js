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
  }
});
