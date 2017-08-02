import { Meteor } from "meteor/meteor";
import { Template } from "meteor/templating";
import { ReactiveDict } from "meteor/reactive-dict";
import { Comments } from "../../api/comments.js";
import { Tasks } from "../../api/sentences.js";
import { Movies } from "../../api/movies.js";

import "./messages.html";

Template.messages.onCreated(function bodyOnCreated() {
  this.state = new ReactiveDict();
  Meteor.subscribe("comments");
});

Template.messages.helpers({
  movieMessages() {
    const currentUser = Meteor.user();

    if (currentUser) {
       const target = Comments.findOne({
         username: currentUser.username,
        });
       const tasks = target && target.taskIds;
       if (tasks) {

        return tasks.map(task => {
            return task.type === "movie" && Movies.findOne(task.taskId);
         }).filter(task => {
           return !!task;
         });
       }
    }

    return;
  },
  messages() {
    const currentUser = Meteor.user();

    if (currentUser) {
       const target = Comments.findOne({username: currentUser.username});
       const tasks = target && target.taskIds;
       if (tasks) {
         return tasks.filter(task => {
            return task.type=== "sentence" && Tasks.findOne(task.taskId);
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
