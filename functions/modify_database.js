const functions = require("firebase-functions");
const admin = require("firebase-admin");
const constants = require("./constants");

const db = admin.firestore();
const fakeUserId = "userid001";

//move static and dynamic to statistics
exports.statistics = functions.firestore
  .document("/modify/{someID}")
  .onCreate(async (snap, context) => {
    const users = await db.collection(constants.cUsers).get();
    users.forEach(async (data) => {
      var querySnapshot = await db
        .collection(constants.cUsers)
        .doc(data.id)
        .collection(constants.cUserProfile)
        .doc("dynamic")
        .get();
      var fields = querySnapshot.data();
      await db
        .collection(constants.cUsers)
        .doc(data.id)
        .collection(constants.cUserProfile)
        .doc(constants.dUserProfileStatistics)
        .set(fields, { merge: true });
      functions.logger.log("dynamic", fields);
      querySnapshot = await db
        .collection(constants.cUsers)
        .doc(data.id)
        .collection(constants.cUserProfile)
        .doc("static")
        .get();
      fields = querySnapshot.data();
      functions.logger.log("static", fields);
      await db
        .collection(constants.cUsers)
        .doc(data.id)
        .collection(constants.cUserProfile)
        .doc(constants.dUserProfileStatistics)
        .set(fields, { merge: true });
    });
    return 0;
  });

//http://localhost:5001/walkwithgod-dev/us-central1/modify_database-UnitTest
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
