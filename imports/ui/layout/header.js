import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';
import { Comments } from "../../api/comments.js";

import './header.html';

Template.header.onCreated(function bodyOnCreated() {
    this.state = new ReactiveDict();
    Session.set('isPrivate', false);
});

Template.header.helpers({
  hasMessages: function() {
    const currentUser = Meteor.user();

    return currentUser && Comments.findOne({username: currentUser.username});
  },

  isTargetLink: function(category) {
    const instance = Template.instance();

    if (!instance.state.get("category")) {
        instance.state.set("category", "paragraph");
    }

    return category === instance.state.get("category");
  }
});

Template.header.events({
    'click .link input' (event, instance) {
        Session.set('currentPage', 0);

        Session.set('isPrivate', event.target.value === "private");
        Meteor.call('tasks.setState', event.target.value === "private");
    },
    'click .sub-menu li' (event, instance) {
        instance.state.set("category", event.currentTarget.dataset.name);
    }
});