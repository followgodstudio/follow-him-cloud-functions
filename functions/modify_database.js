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
