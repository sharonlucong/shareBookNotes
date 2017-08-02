import { Meteor } from "meteor/meteor";
import { HTTP } from "meteor/http";
import { Mongo } from "meteor/mongo";
import { check } from "meteor/check";

export const Movies = new Mongo.Collection("movies");

if (Meteor.isServer) {
  Meteor.publish("movies", function moviesPublication() {
    return Movies.find(
      {
        // $or: [
        // { private: { $ne: true } },
        // { owner: this.userId }
        // ]
      }
    );
  });

  Meteor.methods({
    getImagesFromDouban(movieName) {
      this.unblock();
      const url = "http://api.douban.com/v2/movie/search?q=" + movieName;
      const encodedUrl = encodeURI(url);
      // TODO: limit request per minute or second
      return HTTP.call("GET", encodedUrl);
      // return HTTP.get('http://api.douban.com/v2/movie/search?q=' + movieName);
    }
  });
}

Meteor.methods({
  "movies.insert"(movie) {
    if (!Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    }

    Movies.insert({
      title: movie.title || "",
      note: movie.note || "",
      imageUrl: movie.imageUrl || "",
      createdAt: new Date(),
      owner: Meteor.userId(),
      username: Meteor.user().username
    });
  },

  "movies.updateContent"(movieId, prop, value) {
    const movie = Movies.findOne(movieId);
    if (movie.private && movie.owner !== Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    }

    Movies.update(movieId, {
      $set: { [`${prop}`]: value }
    });
  },

  "movies.remove"(movieId) {
    check(movieId, String);

    const movie = Movies.findOne(movieId);
    if (movie.private && movie.owner !== Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    }

    Movies.remove(movieId);
  },

  "movies.updateComments"(movieId, value) {
    const movie = Movies.findOne(movieId);
    if (movie.private && movie.owner !== Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    }

    Movies.update(movieId, { $push: { comments: value } });
  }
});
