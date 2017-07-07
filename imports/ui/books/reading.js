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
    },
    tagInputs() {
        const instance = Template.instance();

        if (!instance.state.get('tags')) {
            instance.state.set('tags', []);
        }
        return instance.state.get('tags');
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
        let len = 0;

        if (!Session.get('isPrivate') || !Meteor.userId()) {
            len = Tasks.find({}, { sort: { createdAt: -1 } }).count();
        } else {
            len = Tasks.find({ owner: Meteor.userId() }).count();
        }

        if (currentPage < Math.floor(len / 3)) {
            Session.set('currentPage', currentPage + 1);
        }
    },
    'click form div div .tag .tag-remove' (event, instance) {
        const index = event.target.dataset.index;
        const tags = instance.state.get("tags");
        tags.splice(index, 1);
        instance.state.set("tags", tags);
    },
    'change form div input[name="tag"]'(event, instance) {
        if (!event.target.value.trim()) {
            event.target.value = "";
            return;
        }
        const tags = instance.state.get("tags");
        tags.push(event.target.value);
        instance.state.set("tags", tags);
        event.target.value = "";
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
            source: target.source.value,
            tags: instance.state.get("tags")
        };

        Meteor.call('tasks.insert', task);

        target.content.value = '';
        target.note.value = '';
        target.source.value = '';
        instance.state.set("tags", []);
    }
})