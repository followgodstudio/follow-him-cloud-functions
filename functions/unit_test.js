const functions = require("firebase-functions");
const admin = require("firebase-admin");
const constants = require("./constants");

const db = admin.firestore();
const fcm = admin.messaging();

//http://localhost:5001/walkwithgod-dev/us-central1/unit_test-readsCountTest
exports.readsCountTest = functions.https.onRequest(async (req, res) => {
  // Init database
  const userCollection = await db.collection(constants.cUsers).get();
  const batch = db.batch();
  userCollection.docs.forEach((doc) => {
    batch.delete(doc.ref);
  });
  await batch.commit();
  let userId;
  let message = "";
  await db
    .collection(constants.cUsers)
    .add({ test: true })
    .then((docRef) => {
      userId = docRef.id;
      return 0;
    });

  // Add a read history
  await db
    .collection(constants.cUsers)
    .doc(userId)
    .collection(constants.cUserReadHistory)
    .add({ test: false });

  await new Promise((resolve) => setTimeout(resolve, 1000));
  var querySnapshot = await db
    .collection(constants.cUsers)
    .doc(userId)
    .collection(constants.cUserProfile)
    .doc(constants.dUserProfileStatistics)
    .get();
  var field = querySnapshot.data();

  functions.logger.log(constants.dUserProfileStatistics, field);
  var assert = require("assert");
  try {
    assert(field[constants.fUserReadsCount] === 1, "Read count error");
  } catch (err) {
    message += err.stack;
  }

  res.json({ result: `Done: ${message} ` });
});

//http://localhost:5001/walkwithgod-dev/us-central1/unit_test-savedArticlesCountTest
exports.savedArticlesCountTest = functions.https.onRequest(async (req, res) => {
  // Init database
  const userCollection = await db.collection(constants.cUsers).get();
  const batch = db.batch();
  userCollection.docs.forEach((doc) => {
    batch.delete(doc.ref);
  });
  await batch.commit();
  let userId;
  let message = "";
  await db
    .collection(constants.cUsers)
    .add({ test: true })
    .then((docRef) => {
      userId = docRef.id;
      return 0;
    });

  // Saved a article
  let articleId;
  await db
    .collection(constants.cUsers)
    .doc(userId)
    .collection(constants.cUserSavedarticles)
    .add({ test: false })
    .then((docRef) => {
      articleId = docRef.id;
      return 0;
    });

  await new Promise((resolve) => setTimeout(resolve, 1000));
  var querySnapshot = await db
    .collection(constants.cUsers)
    .doc(userId)
    .collection(constants.cUserProfile)
    .doc(constants.dUserProfileStatistics)
    .get();
  var field = querySnapshot.data();

  functions.logger.log(constants.dUserProfileStatistics, field);
  var assert = require("assert");
  try {
    assert(field[constants.fUserSavedArticlesCount] === 1, "Read count error");
  } catch (err) {
    message += err.stack;
  }

  // Remove a saved article
  await db
    .collection(constants.cUsers)
    .doc(userId)
    .collection(constants.cUserSavedarticles)
    .doc(articleId)
    .delete();

  await new Promise((resolve) => setTimeout(resolve, 1000));
  querySnapshot = await db
    .collection(constants.cUsers)
    .doc(userId)
    .collection(constants.cUserProfile)
    .doc(constants.dUserProfileStatistics)
    .get();
  field = querySnapshot.data();

  functions.logger.log(constants.dUserProfileStatistics, field);
  assert = require("assert");
  try {
    assert(field[constants.fUserSavedArticlesCount] === 0, "Read count error");
  } catch (err) {
    message += err.stack;
  }

  res.json({ result: `Done: ${message} ` });
});

//http://localhost:5001/walkwithgod-dev/us-central1/unit_test-l1CommentCountTest
exports.l1CommentCountTest = functions.https.onRequest(async (req, res) => {
  // Init database
  const articleCollection = await db.collection(constants.cArticles).get();
  const batch = db.batch();
  articleCollection.docs.forEach((doc) => {
    batch.delete(doc.ref);
  });
  await batch.commit();
  let articleId, commentId;
  let message = "";
  await db
    .collection(constants.cArticles)
    .add({ test: true })
    .then((docRef) => {
      articleId = docRef.id;
      return 0;
    });

  // Add a l1 comment's child and like
  await db
    .collection(constants.cArticles)
    .doc(articleId)
    .collection(constants.cArticleComments)
    .add({ test: false })
    .then((docRef) => {
      commentId = docRef.id;
      return 0;
    });
  await db
    .collection(constants.cArticles)
    .doc(articleId)
    .collection(constants.cArticleComments)
    .doc(commentId)
    .collection(constants.cArticleCommentReplies)
    .add({ test: false });
  await db
    .collection(constants.cArticles)
    .doc(articleId)
    .collection(constants.cArticleComments)
    .doc(commentId)
    .collection(constants.cArticleCommentLikes)
    .add({ test: false });

  await new Promise((resolve) => setTimeout(resolve, 1000));
  var querySnapshot = await db
    .collection(constants.cArticles)
    .doc(articleId)
    .collection(constants.cArticleComments)
    .doc(commentId)
    .get();
  var field = querySnapshot.data();

  functions.logger.log("l1 comment", field);
  var assert = require("assert");
  try {
    assert(field[constants.fCommentLikesCount] === 1, "Like count error");
    assert(
      field[constants.fCommentChildrenCount] === 1,
      "Children count error"
    );
  } catch (err) {
    message += err.stack;
  }

  res.json({ result: `Done: ${message} ` });
});

//http://localhost:5001/walkwithgod-dev/us-central1/unit_test-statisticsTest
exports.statisticsTest = functions.https.onRequest(async (req, res) => {
  await db
    .collection(constants.cUsers)
    .doc(fakeUserId)
    .set({ test: "Test" }, { merge: true });
  await db
    .collection(constants.cUsers)
    .doc(fakeUserId)
    .collection(constants.cUserProfile)
    .doc("dynamic")
    .set({ testD: "TestD" }, { merge: true });
  await db
    .collection(constants.cUsers)
    .doc(fakeUserId)
    .collection(constants.cUserProfile)
    .doc("static")
    .set({ testS: "TestS" }, { merge: true });
  await db
    .collection("modify")
    .doc("test")
    .set({ test: "TestS" }, { merge: true });
  await new Promise((resolve) => setTimeout(resolve, 1000));
  var querySnapshot = await db
    .collection(constants.cUsers)
    .doc(fakeUserId)
    .collection(constants.cUserProfile)
    .doc(constants.dUserProfileStatistics)
    .get();
  var field = querySnapshot.data();
  var assert = require("assert");
  functions.logger.log(constants.dUserProfileStatistics, field);
  assert(field.testD === "TestD", "testD should equal to TestD");
  assert(field.testS === "TestS", "testS should equal to TestS");
  res.json({ result: `Test succeeded.` });
});

//http://localhost:5001/walkwithgod-dev/us-central1/unit_test-messagesCountTest
exports.messagesCountTest = functions.https.onRequest(async (req, res) => {
  // Init database
  const userCollection = await db.collection(constants.cUsers).get();
  const batch = db.batch();
  userCollection.docs.forEach((doc) => {
    batch.delete(doc.ref);
  });
  await batch.commit();
  let userId;
  let message = "";
  await db
    .collection(constants.cUsers)
    .add({ test: true })
    .then((docRef) => {
      userId = docRef.id;
      return 0;
    });
  const unreadCount = 3;
  await db
    .collection(constants.cUsers)
    .doc(userId)
    .collection(constants.cUserProfile)
    .doc(constants.dUserProfileStatistics)
    .set({ [constants.fUserUnreadMsgCount]: unreadCount }, { merge: true });

  // Add a message
  let newMessageId;
  await db
    .collection(constants.cUsers)
    .doc(userId)
    .collection(constants.cUserMessages)
    .add({ [constants.fMessageIsRead]: false })
    .then((docRef) => {
      newMessageId = docRef.id;
      return 0;
    });

  await new Promise((resolve) => setTimeout(resolve, 1000));
  var querySnapshot = await db
    .collection(constants.cUsers)
    .doc(userId)
    .collection(constants.cUserProfile)
    .doc(constants.dUserProfileStatistics)
    .get();
  var field = querySnapshot.data();

  functions.logger.log(constants.dUserProfileStatistics, field);
  var assert = require("assert");
  try {
    assert(
      field[constants.fUserUnreadMsgCount] === unreadCount + 1,
      "Unread message count error"
    );
    assert(field[constants.fUserMessagesCount] === 1, "Message count error");
  } catch (err) {
    message += err.stack;
  }

  // Mark message as read
  await db
    .collection(constants.cUsers)
    .doc(userId)
    .collection(constants.cUserMessages)
    .doc(newMessageId)
    .set({ [constants.fMessageIsRead]: true });

  await new Promise((resolve) => setTimeout(resolve, 1000));
  querySnapshot = await db
    .collection(constants.cUsers)
    .doc(userId)
    .collection(constants.cUserProfile)
    .doc(constants.dUserProfileStatistics)
    .get();
  field = querySnapshot.data();
  functions.logger.log(constants.dUserProfileStatistics, field);
  try {
    assert(
      field[constants.fUserUnreadMsgCount] === unreadCount,
      "Unread message count error"
    );
    assert(field[constants.fUserMessagesCount] === 1, "Message count error");
  } catch (err) {
    message += err.stack;
  }

  // Delete a message
  await db
    .collection(constants.cUsers)
    .doc(userId)
    .collection(constants.cUserMessages)
    .doc(newMessageId)
    .delete();

  await new Promise((resolve) => setTimeout(resolve, 1000));
  querySnapshot = await db
    .collection(constants.cUsers)
    .doc(userId)
    .collection(constants.cUserProfile)
    .doc(constants.dUserProfileStatistics)
    .get();
  field = querySnapshot.data();
  functions.logger.log(constants.dUserProfileStatistics, field);
  try {
    assert(
      field[constants.fUserUnreadMsgCount] === unreadCount,
      "Unread message count error"
    );
    assert(field[constants.fUserMessagesCount] === 0, "Message count error");
  } catch (err) {
    message += err.stack;
  }
  res.json({ result: `Done: ${message} ` });
});
