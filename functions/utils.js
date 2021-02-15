const functions = require("firebase-functions");
const constants = require("./constants");
const admin = require("firebase-admin");
const fcm = admin.messaging();
const db = admin.firestore();

exports.updateCount = async function updateCount(
  change,
  docRef,
  fieldName,
  collectionRef
) {
  const querySnapshot = await docRef.get();
  let count, accurateCount;
  if (querySnapshot.data() && querySnapshot.data().hasOwnProperty(fieldName)) {
    count = querySnapshot.data()[fieldName];
  } else {
    if (collectionRef) {
      await collectionRef.get().then((snapShot) => {
        accurateCount = snapShot.size;
        return 0;
      });
    } else {
      count = 0;
    }
  }
  let newCount = {};
  if (!change.before.exists) {
    newCount[fieldName] = accurateCount ? accurateCount : count + 1;
  } else if (!change.after.exists) {
    newCount[fieldName] = accurateCount ? accurateCount : count - 1;
  }
  await docRef.set(newCount, { merge: true });
};

exports.pushNotification = async function pushNotification(userId, payload) {
  const receiverTokensList = await db
    .collection(constants.cUsers)
    .doc(userId)
    .collection(constants.cUserProfile)
    .doc(constants.dUserProfileFbMsgToken)
    .get();
  tokens = [];
  for (const token in receiverTokensList._fieldsProto) {
    tokens.push(token);
  }
  functions.logger.log("tokens: ", tokens, ". payload: ", payload);
  if (tokens.length > 0) {
    return fcm.sendToDevice(tokens, payload);
  } else {
    return 0;
  }
};
