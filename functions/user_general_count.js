const functions = require("firebase-functions");
const admin = require("firebase-admin");
const constants = require("./constants");
const utils = require("./utils");

const db = admin.firestore();

exports.readsCount = functions.firestore
  .document(
    "/" +
      constants.cUsers +
      "/{userId}/" +
      constants.cUserReadHistory +
      "/{articleId}"
  )
  .onWrite(async (change, context) => {
    const docRef = db
      .collection(constants.cUsers)
      .doc(context.params.userId)
      .collection(constants.cUserProfile)
      .doc(constants.dUserProfileStatistics);
    const fieldName = constants.fUserReadsCount;
    const collectionRef = db
      .collection(constants.cUsers)
      .doc(context.params.userId)
      .collection(constants.cUserReadHistory);
    await utils.updateCount(change, docRef, fieldName, collectionRef);
  });

exports.savedArticlesCount = functions.firestore
  .document(
    "/" +
      constants.cUsers +
      "/{userId}/" +
      constants.cUserSavedarticles +
      "/{articleId}"
  )
  .onWrite(async (change, context) => {
    const docRef = db
      .collection(constants.cUsers)
      .doc(context.params.userId)
      .collection(constants.cUserProfile)
      .doc(constants.dUserProfileStatistics);
    const fieldName = constants.fUserSavedArticlesCount;
    const collectionRef = db
      .collection(constants.cUsers)
      .doc(context.params.userId)
      .collection(constants.cUserSavedarticles);
    await utils.updateCount(change, docRef, fieldName, collectionRef);
  });

exports.followingCount = functions.firestore
  .document(
    "/" +
      constants.cUsers +
      "/{userId}/" +
      constants.cUserFollowings +
      "/{friendsId}"
  )
  .onWrite(async (change, context) => {
    const docRef = db
      .collection(constants.cUsers)
      .doc(context.params.userId)
      .collection(constants.cUserProfile)
      .doc(constants.dUserProfileStatistics);
    const fieldName = constants.fUserFollowingsCount;
    const collectionRef = db
      .collection(constants.cUsers)
      .doc(context.params.userId)
      .collection(constants.cUserFollowings);
    await utils.updateCount(change, docRef, fieldName, collectionRef);
  });

exports.followerCount = functions.firestore
  .document(
    "/" +
      constants.cUsers +
      "/{userId}/" +
      constants.cUserFollowers +
      "/{friendsId}"
  )
  .onWrite(async (change, context) => {
    const docRef = db
      .collection(constants.cUsers)
      .doc(context.params.userId)
      .collection(constants.cUserProfile)
      .doc(constants.dUserProfileStatistics);
    const fieldName = constants.fUserFollowersCount;
    const collectionRef = db
      .collection(constants.cUsers)
      .doc(context.params.userId)
      .collection(constants.cUserFollowers);
    await utils.updateCount(change, docRef, fieldName, collectionRef);
  });
