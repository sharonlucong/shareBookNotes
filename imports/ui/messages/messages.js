import { Meteor } from "meteor/meteor";
import { Template } from "meteor/templating";
import { ReactiveDict } from "meteor/reactive-dict";
import { Comments } from "../../api/comments.js";
import { Tasks } from "../../api/sentences.js";

import "./messages.html";

Template.messages.onCreated(function bodyOnCreated() {
  this.state = new ReactiveDict();
  Meteor.subscribe("comments");
});

Template.messages.helpers({
  messages() {
    const currentUser = Meteor.user();

    if (currentUser) {
       const target = Comments.findOne({username: currentUser.username});
       const taskIds = target && target.taskIds;
       if (taskIds) {
         return taskIds.map(taskId => {
            return Tasks.findOne(taskId);
         });
       }
    }

    return;
  },
});

Template.messages.events({
  'click .modal-header button, click .modal-footer button' (event, instance) {
      const currentUser = Meteor.user();
      Meteor.call('messages.remove', currentUser.username);
  },
});
