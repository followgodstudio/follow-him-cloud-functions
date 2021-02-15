const functions = require("firebase-functions");
const admin = require("firebase-admin");
const assert = require("assert");
const constants = require("./constants");

const db = admin.firestore();

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

//http://localhost:5001/walkwithgod-dev/us-central1/unit_test-newFollowingTest
exports.newFollowingTest = functions.https.onRequest(async (req, res) => {
  // Clear database
  const userCollection = await db.collection(constants.cUsers).get();
  const batch = db.batch();
  userCollection.docs.forEach((doc) => {
    batch.delete(doc.ref);
  });
  await batch.commit();

  // create following, follower user
  let followingUserId, followerUserId;
  await db
    .collection(constants.cUsers)
    .add({
      [constants.fUserName]: "I will follow",
      [constants.fUserImageUrl]: "http://i-will-follow",
    })
    .then((docRef) => {
      followingUserId = docRef.id;
      return 0;
    });
  await db
    .collection(constants.cUsers)
    .add({
      [constants.fUserName]: "I am followed",
      [constants.fUserImageUrl]: "http://i-am-followed",
    })
    .then((docRef) => {
      followerUserId = docRef.id;
      return 0;
    });
  // Init following count
  await db
    .collection(constants.cUsers)
    .doc(followingUserId)
    .collection(constants.cUserProfile)
    .doc(constants.dUserProfileStatistics)
    .set({ [constants.fUserFollowingsCount]: 1 });
  // Add follow
  let followingObj = {
    [constants.fCreatedDate]: Date.now(),
    [constants.fUserImageUrl]: "http://i-am-followed",
    [constants.fUserName]: "I am followed",
    [constants.fFriendStatus]: "following",
  };
  const followingDocRef = db
    .collection(constants.cUsers)
    .doc(followingUserId)
    .collection(constants.cUserFollowings)
    .doc(followerUserId);
  await followingDocRef.set(followingObj);
  await new Promise((resolve) => setTimeout(resolve, 2000));
  let message = "";

  const followerDocRef = db
    .collection(constants.cUsers)
    .doc(followerUserId)
    .collection(constants.cUserFollowers)
    .doc(followingUserId);
  let followerDocSnap = await followerDocRef.get();
  let followerDoc = followerDocSnap.data();

  const followingCountRef = db
    .collection(constants.cUsers)
    .doc(followingUserId)
    .collection(constants.cUserProfile)
    .doc(constants.dUserProfileStatistics);
  let followingCountSnap = await followingCountRef.get();
  let followingCount = followingCountSnap.data();

  const followerCountRef = db
    .collection(constants.cUsers)
    .doc(followerUserId)
    .collection(constants.cUserProfile)
    .doc(constants.dUserProfileStatistics);
  let followerCountSnap = await followerCountRef.get();
  let followerCount = followerCountSnap.data();
  try {
    assert(
      followerDoc[constants.fUserName] === "I will follow",
      "Follower list error"
    );
    assert(
      followingCount[constants.fUserFollowingsCount] === 2,
      `Followings count error, ${
        followingCount[constants.fUserFollowingsCount]
      }`
    );
    assert(
      followerCount[constants.fUserFollowersCount] === 1,
      `Followers count error, ${followerCount[constants.fUserFollowersCount]}`
    );
  } catch (err) {
    message += err.stack;
  }

  //Remove follow
  await followingDocRef.delete();
  await new Promise((resolve) => setTimeout(resolve, 2000));

  followerDocSnap = await followerDocRef.get();

  followingCountSnap = await followingCountRef.get();
  followingCount = followingCountSnap.data();

  followerCountSnap = await followerCountRef.get();
  followerCount = followerCountSnap.data();

  try {
    assert(!followerDocSnap.exists, "Follower list error");
    assert(
      followingCount[constants.fUserFollowingsCount] === 1,
      `Followings count error, ${
        followingCount[constants.fUserFollowingsCount]
      }`
    );
    assert(
      followerCount[constants.fUserFollowersCount] === 0,
      `Followers count error, ${followerCount[constants.fUserFollowersCount]}`
    );
  } catch (err) {
    message += err.stack;
  }

  res.json({ result: `Done: ${message} ` });
});
