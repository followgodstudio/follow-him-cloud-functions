const admin = require("firebase-admin");
admin.initializeApp();

// exports.modify_database = require("./modify_database");
exports.user_notifications = require("./user_notifications");
exports.user_messages = require("./user_messages");
exports.user_general_count = require("./user_general_count");
exports.article_comment_count = require("./article_comment_count");
exports.user_friends = require("./user_friends");
// exports.unit_test = require("./unit_test");
//TODO: move codes below to different js file

const functions = require("firebase-functions");
const db = admin.firestore();
// [START_EXCLUDE]
const settings = { timestampsInSnapshots: true };
db.settings(settings);
// [END_EXCLUDE]

// [START aggregate_function]
exports.articleWriteListener = functions.firestore
  .document("articles/{articleId}")
  .onWrite(async (change, context) => {
    const statisticRef = db.collection("statistics").doc("articles");

    // New document Created : add one to count
    if (!change.before.exists) {
      statisticRef.update({
        articles_count: admin.firestore.FieldValue.increment(+1),
      });
    } else if (change.before.exists && change.after.exists) {
      // Updating existing document : Do nothing
    } else if (!change.after.exists) {
      // Deleting document : subtract one from count

      statisticRef.update({
        articles_count: admin.firestore.FieldValue.increment(-1),
      });
    }
  });

exports.organizationsWriteListener = functions.firestore
  .document("organizations/{organizationId}")
  .onWrite(async (change, context) => {
    const statisticRef = db.collection("statistics").doc("organizations");

    // New document Created : add one to count
    if (!change.before.exists) {
      statisticRef.update({
        organizations_count: admin.firestore.FieldValue.increment(+1),
      });
    } else if (change.before.exists && change.after.exists) {
      // Updating existing document : Do nothing
    } else if (!change.after.exists) {
      // Deleting document : subtract one from count

      statisticRef.update({
        organizations_count: admin.firestore.FieldValue.increment(-1),
      });
    }
  });

exports.userUpdateListener = functions.firestore
  .document("user/{userId}")
  .onWrite(async (change, context) => {
    const userStatisticRef = db.collection("statistics").doc("users");

    // New document Created : add one to count
    if (!change.before.exists) {
      userStatisticRef.update({
        users_count: admin.firestore.FieldValue.increment(+1),
      });
    } else if (change.before.exists && change.after.exists) {
      // Updating existing document : Do nothing
    } else if (!change.after.exists) {
      // Deleting document : subtract one from count

      userStatisticRef.update({
        users_count: admin.firestore.FieldValue.increment(-1),
      });
    }
  });
