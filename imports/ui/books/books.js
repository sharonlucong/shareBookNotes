import { Meteor } from "meteor/meteor";
import { Template } from "meteor/templating";
import { ReactiveDict } from "meteor/reactive-dict";
import { Books } from "../../api/books.js";

import "./books.html";

import "./book.js";

Template.books.onCreated(function bodyOnCreated() {
  this.state = new ReactiveDict();
  Meteor.subscribe("books");
});

Template.books.helpers({
  books() {
    return Books.find({});
  },
  chapters() {
    const instance = Template.instance();

    if (!instance.state.get("chapters")) {
      instance.state.set("chapters", [
        {
          title: "",
          content: "",
          note: ""
        }
      ]);
    }

    return instance.state.get("chapters");
  }
});

Template.books.events({
  "click .chapter-btn"(event, instance) {
    const chapter = {
      title: "",
      content: "",
      note: ""
    };

    const chapters = instance.state.get("chapters");
    chapters.push(chapter);

    instance.state.set("chapters", chapters);
  },

  "change input.chapter-input, change textarea.chapter-input"(event, instance) {
    const target = event.target;
    const index = parseInt(target.dataset.index);
    const chapters = instance.state.get("chapters");
    const prop = target.name;
    chapters[index][prop] = target.value;
    instance.state.set("chapters", chapters);
  },
  "change input.book-input"(event, instance) {
    const target = event.target;
    const prop = target.name;

    instance.state.set(prop, target.value);
  },
  "submit .books-form"(event, instance) {
    event.preventDefault();

    const chapters = instance.state.get("chapters");
    const bookTitle = instance.state.get("title");
    const bookAuthor = instance.state.get("author");

    const isChaptersValid =
      chapters.length === 1 && chapters[0].content && chapters[0].title;

    if (!bookTitle || !isChaptersValid) {
      return;
    }

    const bookInfo = {
      contents: chapters,
      title: bookTitle,
      author: bookAuthor
    };

    Meteor.call("books.insert", bookInfo);

    //clean up
    instance.state.set("chapters", null);
    instance.state.set("title", null);
    instance.state.set("author", null);

    event.target.title.forEach(function(input) {
      input.value = "";
    });
    event.target.author.value = "";
    event.target.content.value = "";
    event.target.note.value = "";
  }
});
