import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';

export const Tasks = new Mongo.Collection('tasks');

if (Meteor.isServer) {
    Meteor.publish('tasks', function tasksPublication() {
        return Tasks.find({
            $or: [
                { private: { $ne: true } },
                { owner: this.userId }
            ]
        });
    });
}

Meteor.methods({
    'tasks.insert' (task) {
        if (!Meteor.userId()) {
            throw new Meteor.Error('not-authorized');
        }

        Tasks.insert({
            content: task.content || '',
            note: task.note || '',
            tags: task.tags,
            source: task.source || '',
            createdAt: new Date(),
            owner: Meteor.userId(),
            username: Meteor.user().username,
            comments: []
        });
    },
    'tasks.remove' (taskId) {
        check(taskId, String);

        const task = Tasks.findOne(taskId);
        if (task.private && task.owner !== Meteor.userId()) {
            throw new Meteor.Error('not-authorized');
        }

        Tasks.remove(taskId);
    },
    'tasks.updateTags' (taskId, value) {
        const task = Tasks.findOne(taskId);
        if (task.private && task.owner !== Meteor.userId()) {
            throw new Meteor.Error('not-authorized');
        }

        Tasks.update(taskId, { $set: { tags: value } });
    },
    'tasks.updateNote' (taskId, value) {
        const task = Tasks.findOne(taskId);
        if (task.private && task.owner !== Meteor.userId()) {
            throw new Meteor.Error('not-authorized');
        }

        Tasks.update(taskId, { $set: { note: value } });
    },

    'tasks.updateContent' (taskId, value) {
        const task = Tasks.findOne(taskId);
        if (task.private && task.owner !== Meteor.userId()) {
            throw new Meteor.Error('not-authorized');
        }

        Tasks.update(taskId, { $set: { content: value } });
    },
    'tasks.updateSource' (taskId, value) {
        const task = Tasks.findOne(taskId);
        if (task.private && task.owner !== Meteor.userId()) {
            throw new Meteor.Error('not-authorized');
        }

        Tasks.update(taskId, { $set: { source: value } });
    },
    'tasks.updateComments' (taskId, value) {
        const task = Tasks.findOne(taskId);
        if (task.private && task.owner !== Meteor.userId()) {
            throw new Meteor.Error('not-authorized');
        }

        Tasks.update(taskId, { $push: { comments: value } });
    },
    'tasks.setState' (state) {
        if (!Meteor.userId()) {
            throw new Meteor.Error('not-authorized');
        }
        const tasks = Tasks.find();
        tasks.forEach(function(task) {
            Tasks.update(task._id, { $set: { isPrivate: state } });
        });
    }
});