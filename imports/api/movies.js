import { Meteor } from "meteor/meteor";
import { HTTP } from "meteor/http";
import { Mongo } from 'meteor/mongo';
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
    'movies.insert' (movie) {
        if (!Meteor.userId()) {
            throw new Meteor.Error('not-authorized');
        }

        Movies.insert({
            title: movie.title || '',
            note: movie.note || '',
            imageUrl: movie.imageUrl || '',
            createdAt: new Date(),
            owner: Meteor.userId(),
            username: Meteor.user().username
        });
    }
});