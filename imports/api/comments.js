import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';

export const Comments = new Mongo.Collection('comments');

if (Meteor.isServer) {
    Meteor.publish('comments', function commentsPublication() {
        return Comments.find({
            // $or: [
            //     { private: { $ne: true } },
            //     { owner: this.userId }
            // ]
        });
    });
}

Meteor.methods({
    'messages.insert' (users, taskId, type) {
        if (!Meteor.userId()) {
            throw new Meteor.Error('not-authorized');
        }

        users.forEach(function(userId) {
            if (!Comments.findOne({username: userId})) {
                Comments.insert({
                    username: userId,
                    taskIds: [{
                        taskId,
                        type
                    }]
                });
            }
            else {
                if (!Comments.findOne({
                    username: userId,
                    "taskIds.type": type,
                    "taskIds.taskId": taskId})) {
                        Comments.update({username: userId}, { $push: { taskIds: {
                            taskId,
                            type
                        } } });
                    }
            }
        });

    },
    'messages.remove' (username, type) {
        check(username, String);

        const message = Comments.findOne(username);
        // if (message.owner !== Meteor.userId()) {
        //     throw new Meteor.Error('not-authorized');
        // }

        Comments.remove({
           username
        });
    }
});
