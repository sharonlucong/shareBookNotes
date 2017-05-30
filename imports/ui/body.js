import { Mongo } from 'meteor/mongo';
import { Template } from 'meteor/templating';
import { ReactiveDict } from 'meteor/reactive-dict';
import { Session } from 'meteor/session';

import { Tasks } from '../api/tasks.js';

import './task.js';
import './body.html';

Template.body.onCreated(function bodyOnCreated() {
    this.state = new ReactiveDict();
    Session.set('currentPage', 0);
    Meteor.subscribe('tasks');
});

Template.body.helpers({
    tasks() {
        const instance = Template.instance();
        const currentPage = Session.get('currentPage');
        Session.set('isPrivate', !!instance.state.get('isPrivate'));
        let collection;
        if (!instance.state.get('isPrivate') || !Meteor.userId()) {
            collection = Tasks.find({}, { sort: { createdAt: -1 } });
        } else {
            collection = Tasks.find({ owner: Meteor.userId() }, { sort: { createdAt: -1 } });
        }

        collection = collection.map(function(element) {
            return element;
        });

        collection = collection.filter(function(element, index) {
            if (index >= currentPage * 3 && index < currentPage * 3 + 3) {
                return element;
            }
        });
        return collection;

    },
    incompleteCount() {
        return Tasks.find({ checked: { $ne: true } }).count();
    }
});

Template.body.events({
    'click .prev' (event, instance) {
        const currentPage = Session.get('currentPage');
        if (currentPage > 0) {
            Session.set('currentPage', currentPage - 1);
        }
    },
    'click .next' (event, instance) {
        const currentPage = Session.get('currentPage');
        if (currentPage < Math.floor(Tasks.find().count() / 3)) {
            Session.set('currentPage', currentPage + 1);
        }
    },
    'click .link input' (event, instance) {
        instance.state.set('isPrivate', event.target.value === "private");
        Meteor.call('tasks.setState', event.target.value === "private");
    },
    'submit .new-task' (event, instance) {
        event.preventDefault();

        const target = event.target;
        const task = {
            content: target.content.value,
            note: target.note.value,
            source: target.source.value
        };

        Meteor.call('tasks.insert', task);

        target.content.value = '';
        target.note.value = '';
        target.source.value = '';
    }
})