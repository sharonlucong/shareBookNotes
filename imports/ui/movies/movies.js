import { Meteor } from "meteor/meteor";
// import { HTTP } from 'meteor/http';
import { ReactiveDict } from "meteor/reactive-dict";
import { Template } from "meteor/templating";

import { Movies } from "../../api/movies.js";

import "./movies.html";

import './movie.js';

Template.movies.onCreated(function bodyOnCreated() {
  this.state = new ReactiveDict();
  Meteor.subscribe("movies");
});

Template.movies.helpers({
  movies() {
    return Movies.find({});
  },
  isLoading() {
    const instance = Template.instance();
    return instance.state.get("loadingStatus") === "loading";
  },
  movieImages() {
    const instance = Template.instance();

    if (!instance.state.get("movieImages")) {
      instance.state.set("movieImages", []);
    }
    return instance.state.get("movieImages");
  }
});

Template.movies.events({
  'change .new-movie input[name="movieTitle"]'(event, instance) {
    instance.state.set("loadingStatus", "loading");
    instance.state.set("movieTitle", event.target.value);

    if (Meteor.isClient) {
      Meteor.call("getImagesFromDouban", event.target.value, function(
        error,
        results
      ) {
        console.log(results); //results.data should be a JSON object
        instance.state.set("loadingStatus", "done");
        const candidates = results && results.data.subjects;
        const movieImages =
          candidates &&
          candidates.slice(0,8).map(candidate => {
            return candidate.images.medium;
          });

        instance.state.set("movieImages", movieImages);
      });
    }
  },
  'click a.thumbnail' (event, instance) {
    console.log(event);
    instance.state.set("imageUrl", event.target.src);
  },
  'change textarea[name="movieNote"]' (event, instance) {
    instance.state.set("movieNote", event.target.value);
  },
  "submit .new-movie"(event, instance) {
    event.preventDefault();

    instance.state.set("movieImages", []);

    const movie = {
      title: instance.state.get("movieTitle"),
      imageUrl: instance.state.get("imageUrl"),
      note: instance.state.get("movieNote")
    };

    Meteor.call("movies.insert", movie);
  }
});
