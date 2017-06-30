import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

import { Tasks } from '../../api/sentences.js';

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
    'click .tag .tag-remove' (event, instance) {
        const index = event.target.dataset.index;
        instance.data.tags.splice(index, 1);
        Meteor.call("tasks.updateTags", instance.data._id, instance.data.tags);
        // tags.splice(index, 1);
        // instance.state.set("tags", tags);
    },
    'change input[name="tag"]'(event, instance) {
        if (!event.target.value.trim()) {
            return;
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

        const newComment = {
            username: currentUser.username,
            comment: inputElment.value
        };

        Meteor.call('tasks.updateComments', this._id, newComment);
        inputElment.value = "";
    }
});