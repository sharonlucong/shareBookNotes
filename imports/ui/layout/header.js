import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';

import './header.html';

Template.header.onCreated(function bodyOnCreated() {
    this.state = new ReactiveDict();
    Session.set('isPrivate', false);
});

Template.header.events({
    'click .link input' (event, instance) {
        Session.set('currentPage', 0);

        Session.set('isPrivate', event.target.value === "private");
        Meteor.call('tasks.setState', event.target.value === "private");
    }
});