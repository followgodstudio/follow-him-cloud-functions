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
        return 0;
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
      if (unreadChange !== 0) {
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
