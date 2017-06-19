import { Mongo } from 'meteor/mongo';
import { Template } from 'meteor/templating';
import { ReactiveDict } from 'meteor/reactive-dict';
import { Session } from 'meteor/session';

import { Tasks } from '../../api/sentences.js';

import './reading.html';

import '../layout/header.js';
import './sentence.js';

Template.reading.onCreated(function bodyOnCreated() {
    this.state = new ReactiveDict();
    Session.set('currentPage', 0);
    Meteor.subscribe('tasks');
});

Template.reading.helpers({
    tasks() {
        const currentPage = Session.get('currentPage');
        let collection;
        if (!Session.get('isPrivate') || !Meteor.userId()) {
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

Template.reading.events({
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
    'submit .new-task' (event, instance) {
        event.preventDefault();

        const target = event.target;

        if (!target.content.value) {
            return;
        }

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