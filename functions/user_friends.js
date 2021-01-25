const functions = require("firebase-functions");
const admin = require("firebase-admin");
const constants = require("./constants");

const db = admin.firestore();

exports.newFollower = functions.firestore
  .document(
    "/" +
      constants.cUsers +
      "/{userId}/" +
      constants.cUserFriends +
      "/{friendsId}"
  )
  .onWrite(async (change, context) => {
    functions.logger.log(change.before.data());
    // const collectionRef = db
    //   .collection(constants.cUsers)
    //   .doc(context.params.articleId)
    //   .collection(constants.cUserFriends);
    const beforeExist = change.before.exists;
    if (beforeExist) var before = change.before.data();
    const afterExist = change.after.exists;
    if (afterExist) var after = change.after.data();
    // New friends: add one to count: TODO
  });

exports.addFollower = functions.https.onRequest(async (req, res) => {
  // // Grab the text parameter.
  // const original = req.query.text;
  // Push the new message into Firestore using the Firebase Admin SDK.
  const user = await db.collection(constants.cUsers).add({ user: "user" });
  const friend = await db
    .collection(constants.cUsers)
    .doc(user.id)
    .collection(constants.cUserFriends)
    .add({ status: "follower" });
  // Send back a message that we've successfully written the message
  res.json({ result: `Friend with ID: ${friend.id} added.` });
});

//http://localhost:5001/walkwithgod-dev/us-central1/modify_database-UnitTest
exports.UnitTest = functions.https.onRequest(async (req, res) => {
  await db
    .collection(constants.cUsers)
    .doc("userid001")
    .set({ test: "Test" }, { merge: true });
  await db
    .collection(constants.cUsers)
    .doc("userid001")
    .collection(constants.cUserProfile)
    .doc("dynamic")
    .set({ testD: "TestD" }, { merge: true });
  await db
    .collection(constants.cUsers)
    .doc("userid001")
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
    .doc("userid001")
    .collection(constants.cUserProfile)
    .doc("statistics")
    .get();
  var field = querySnapshot.data();
  var assert = require("assert");
  functions.logger.log("statistics", field);
  assert(field.testD === "TestD", "testD should equal to TestD");
  assert(field.testS === "TestS", "testS should equal to TestS");
  res.json({ result: `Unit test finished.` });
});
