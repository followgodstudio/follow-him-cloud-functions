const functions = require("firebase-functions");
const admin = require("firebase-admin");
const constants = require("./constants");

const db = admin.firestore();

exports.messagesCount = functions.firestore
  .document(
    "/" +
      constants.cUsers +
      "/{userId}/" +
      constants.cUserMessages +
      "/{messageId}"
  )
  .onWrite(async (change, context) => {
    const querySnapshot = await db
      .collection(constants.cUsers)
      .doc(context.params.userId)
      .collection(constants.cUserProfile)
      .doc(constants.dUserProfileStatistics)
      .get();
    let messagesCount, accurateMsgCount;
    if (querySnapshot.data().hasOwnProperty(constants.fUserMessagesCount)) {
      messagesCount = querySnapshot.data()[constants.fUserMessagesCount];
    } else {
      const messagesRef = db
        .collection(constants.cUsers)
        .doc(context.params.userId)
        .collection(constants.cUserMessages);
      await messagesRef.get().then((snapShot) => {
        accurateMsgCount = snapShot.size;
      });
    }
    let unreadMessagesCount = 0;
    if (querySnapshot.data().hasOwnProperty(constants.fUserUnreadMsgCount)) {
      unreadMessagesCount = querySnapshot.data()[constants.fUserUnreadMsgCount];
    }
    let newCount = {};
    if (!change.before.exists) {
      newCount[constants.fUserMessagesCount] = accurateMsgCount
        ? accurateMsgCount
        : messagesCount + 1;
      if (!change.after.data()[constants.fMessageIsRead]) {
        newCount[constants.fUserUnreadMsgCount] = unreadMessagesCount + 1;
      }
    } else if (!change.after.exists) {
      newCount[constants.fUserMessagesCount] = accurateMsgCount
        ? accurateMsgCount
        : messagesCount - 1;
      if (!change.before.data()[constants.fMessageIsRead]) {
        newCount[constants.fUserUnreadMsgCount] = unreadMessagesCount - 1;
      }
    } else if (change.before.exists && change.after.exists) {
      const unreadChange =
        change.before.data()[constants.fMessageIsRead] -
        change.after.data()[constants.fMessageIsRead];
      if (unreadChange != 0) {
        newCount[constants.fUserUnreadMsgCount] =
          unreadMessagesCount + unreadChange;
      }
    }
    functions.logger.log(newCount);
    if (Object.keys(newCount).length > 0)
      await db
        .collection(constants.cUsers)
        .doc(context.params.userId)
        .collection(constants.cUserProfile)
        .doc(constants.dUserProfileStatistics)
        .set(newCount, { merge: true });
  });

//http://localhost:5001/walkwithgod-dev/us-central1/user_messages-messagesCountTest
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
    .then(function (docRef) {
      userId = docRef.id;
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
    .then(function (docRef) {
      newMessageId = docRef.id;
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
      field[constants.fUserUnreadMsgCount] === unreadCount,
      "Unread message count error"
    );
    assert(field[constants.fUserMessagesCount] === 0, "Message count error");
  } catch (err) {
    message += err.stack;
  }
  res.json({ result: `Done: ${message} ` });
});
