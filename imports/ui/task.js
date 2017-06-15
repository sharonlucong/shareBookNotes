import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

import { Tasks } from '../api/tasks.js';

import './task.html';

Template.task.helpers({
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
    }
})


Template.task.events({
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

        const newComment = {
            username: this.username,
            comment: inputElment.value
        };

        Meteor.call('tasks.updateComments', this._id, newComment);
        inputElment.value = "";
    }
});