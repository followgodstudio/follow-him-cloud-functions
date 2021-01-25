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

//http://localhost:5001/walkwithgod-dev/us-central1/user_general_count-readsCountTest
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
    .then(function (docRef) {
      userId = docRef.id;
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
