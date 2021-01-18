const functions = require("firebase-functions");
const admin = require("firebase-admin");
const constants = require("./constants");

const db = admin.firestore();

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
      var doc = await db
        .collection(constants.cUsers)
        .doc(data.id)
        .collection(constants.cUserProfile)
        .doc("statistics")
        .set(fields, { merge: true });

      querySnapshot = await db
        .collection(constants.cUsers)
        .doc(data.id)
        .collection(constants.cUserProfile)
        .doc("static")
        .get();
      fields = querySnapshot.data();
      doc = await db
        .collection(constants.cUsers)
        .doc(data.id)
        .collection(constants.cUserProfile)
        .doc("statistics")
        .set(fields, { merge: true });
    });
    return 0;
  });
