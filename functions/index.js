const admin = require('firebase-admin');
admin.initializeApp();

exports.user_notifications = require("./user_notifications");
//TODO: move codes below to different js file

const functions = require('firebase-functions');
const db = admin.firestore();
// [START_EXCLUDE]
const settings = {timestampsInSnapshots: true};
db.settings(settings);
// [END_EXCLUDE]

// [START aggregate_function]
exports.commentWriteListener = functions.firestore
    .document('articles/{articleId}/comments/{commentId}')
    .onWrite(async (change, context) => {
      const articleRef = db.collection('articles').doc(context.params.articleId);
      const commentsRef = db.collection('articles').doc(context.params.articleId).collection('comments');

      let commentsCount = 0;
      await commentsRef.get()
      .then(snapShot => {
        commentsCount = snapShot.size;
        return commentsCount;
      })
      .catch(err => {
          console.log(err);
      })

      // New document Created : add one to count
      if (!change.before.exists) {
        await db.runTransaction(async (transaction) => {
            const articleDoc = await transaction.get(articleRef);
            const newNumComments = articleDoc.data().comments_count ? articleDoc.data().comments_count + 1 : commentsCount + 1;

            transaction.update(articleRef, {
                comments_count: newNumComments
            });
        }); 
      }
      else if (change.before.exists && change.after.exists) {
        // Updating existing document : Do nothing

      } 
      else if (!change.after.exists) {
        // Deleting document : subtract one from count

        // db.doc(docRef).update({numberOfDocs: FieldValue.increment(-1)});
        await db.runTransaction(async (transaction) => {
            const articleDoc = await transaction.get(articleRef);
            const newNumComments = articleDoc.data().comments_count ? articleDoc.data().comments_count - 1 : commentsCount - 1;

            transaction.update(articleRef, {
                comments_count: newNumComments
            });
        }); 
      }

    });


exports.articleWriteListener = functions.firestore
    .document('articles/{articleId}')
    .onWrite(async (change, context) => {
      const statisticRef = db.collection('statistics').doc('articles');

      // New document Created : add one to count
      if (!change.before.exists) {

        statisticRef.update({
            articles_count: admin.firestore.FieldValue.increment(+1)
        })
      }

      else if (change.before.exists && change.after.exists) {
        // Updating existing document : Do nothing

      } 

      else if (!change.after.exists) {
        // Deleting document : subtract one from count

        statisticRef.update({
            articles_count: admin.firestore.FieldValue.increment(-1)
        })
      }

    });

exports.organizationsWriteListener = functions.firestore
    .document('organizations/{organizationId}')
    .onWrite(async (change, context) => {
      const statisticRef = db.collection('statistics').doc('organizations');

      // New document Created : add one to count
      if (!change.before.exists) {

        statisticRef.update({
            organizations_count: admin.firestore.FieldValue.increment(+1)
        })
      }

      else if (change.before.exists && change.after.exists) {
        // Updating existing document : Do nothing

      }

      else if (!change.after.exists) {
        // Deleting document : subtract one from count

        statisticRef.update({
            organizations_count: admin.firestore.FieldValue.increment(-1)
        })
      }
    });


exports.userUpdateListener = functions.firestore
    .document('user/{userId}')
    .onWrite(async (change, context) => {
      const userStatisticRef = db.collection('statistics').doc('users');

      // New document Created : add one to count
      if (!change.before.exists) {

        userStatisticRef.update({
            users_count: admin.firestore.FieldValue.increment(+1)
        })
      }

      else if (change.before.exists && change.after.exists) {
        // Updating existing document : Do nothing

      }

      else if (!change.after.exists) {
        // Deleting document : subtract one from count

        userStatisticRef.update({
            users_count: admin.firestore.FieldValue.increment(-1)
        })
      }

    });