import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveDict } from 'meteor/reactive-dict';
import { Books } from '../../api/books.js';

import './book.html';

Template.book.onCreated(function bodyOnCreated() {
    this.state = new ReactiveDict();
    Meteor.subscribe('books');
});

Template.book.helpers({
    // books() {
    //   console.log("in");
    //   return Books.find({});
    // },
    chapters() {
        const instance = Template.instance();

        if (!instance.state.get("chapters")){
            instance.state.set("chapters", []);
        }

        return instance.state.get("chapters");
    },

    getId() {
        return this._id;
    },

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

Template.book.events({
    'change .edit' (event) {
        switch (event.target.name) {
            case "content":
                Meteor.call('books.updateContent', this._id, event.target.value);
                break;
            case "note":
                Meteor.call('books.updateNote', this._id, event.target.value);
                break;
            case "source":
                Meteor.call('books.updateSource', this._id, event.target.value);
                break;
            default:
                break;
        }

    },
    'click button.edit' (event, instance) {
        const chapters = instance.state.get("chapters");
        const newChapter = {
            content: "",
            note: "",
            title: ""
        };

        chapters.push(newChapter);
        instance.state.set("chapters", chapters);
    },
    'submit .new-chapter' (event, instance) {
        event.preventDefault();
        const chapters = instance.state.get("chapters");
        const form = event.target;
        const index = form.dataset.index;
        const bookId = instance.data._id;

        if (!form["chapter-content"] || !form["chapter-title"]) {
            return;
        }

        const newChapter = {
            content: form["chapter-content"].value,
            note: form["chapter-note"].value,
            title: form["chapter-title"].value
        };

        Meteor.call('books.addChapter', bookId, newChapter);

        chapters.splice(index, 1);
        instance.state.set("chapters", chapters);

        //remove it from instance.state.chapters
    },
    'click .toggle-checked' () {
        Meteor.call('books.setChecked', this._id, !this.checked);
    },
    'click .delete' () {
        Meteor.call('books.remove', this._id);
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

        Meteor.call('books.updateComments', this._id, newComment);
        inputElment.value = "";
    }
});