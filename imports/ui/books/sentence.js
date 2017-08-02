import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

import { Tasks } from '../../api/sentences.js';
import  '../../api/comments.js';

import './sentence.html';

Template.sentence.helpers({
    isPrivate() {
        return Session.get('isPrivate') && Meteor.userId();
    },
    isOwner() {
        return this.owner === Meteor.userId();
    },
    formatDate() {
        const day = this.createdAt.getDate();
        const month = this.createdAt.getMonth() + 1;
        const year = this.createdAt.getFullYear();

        return month + '/' + day + ', ' + year;
    },
    commentDate() {
        const date = new Date();
        const day = date.getDate();
        const month = date.getMonth() + 1;
        const year = date.getFullYear();
        const hour = date.getHours();
        const minute = date.getMinutes();

        return month + '/' + day + '/' + year + ' ' + hour + ': ' + minute;
    }
});

Template.sentence.events({
    'change .edit' (event) {
        switch (event.target.name) {
            case "content":
                Meteor.call('tasks.updateContent', this._id, event.target.value);
                break;
            case "note":
                Meteor.call('tasks.updateNote', this._id, event.target.value);
                break;
            case "source":
                Meteor.call('tasks.updateSource', this._id, event.target.value);
                break;
            default:
                break;
        }

    },
    'click .tag .edit' (event, instance) {
        const index = event.target.dataset.index;
        instance.data.tags.splice(index, 1);
        Meteor.call("tasks.updateTags", instance.data._id, instance.data.tags);
        // tags.splice(index, 1);
        // instance.state.set("tags", tags);
    },
    'change input[name="tag"]' (event, instance) {
        if (!event.target.value.trim()) {
            return;
        }
        if (!this.tags) {
            this.tags  = [];
        }
        this.tags.push(event.target.value);
        Meteor.call("tasks.updateTags", this._id, this.tags);
        // const tags = instance.state.get("tags");
        // tags.push(event.target.value);
        // instance.state.set("tags", tags);
        // event.target.value = "";
    },
    'click .toggle-checked' () {
        Meteor.call('tasks.setChecked', this._id, !this.checked);
    },
    'click .delete' () {
        Meteor.call('tasks.remove', this._id);
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


        Meteor.call('tasks.updateComments', this._id, newComment);

        const users = this.comments.map(comment => comment.username).filter( function( item, index, inputArray ) {
           return inputArray.indexOf(item) == index && item !== currentUser.username;
        });

        if (users.indexOf(this.username) === -1) {
            users.push(this.username);
        }

        Meteor.call('messages.insert', users, this._id, "sentence");

        inputElment.value = "";
    }
});