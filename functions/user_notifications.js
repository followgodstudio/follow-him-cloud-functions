const functions = require("firebase-functions");
const admin = require("firebase-admin");

const db = admin.firestore();
const fcm = admin.messaging();

// when a new message comes, push notification to the corresponding user
exports.sendMessagePushNotification = functions.firestore
  .document("/users/{userId}/{messages}/{messageId}")
  .onCreate((snap, context) => {
    const comment = snap.data();
    functions.logger.log(
      "UserId: ",
      context.params.userId,
      ". MessageId: ",
      context.params.messageId,
      ". CommentId: ",
      comment.comment_id
    );
    const action = comment.type === "like" ? "点赞" : "留言";
    const payload = {
      notification: {
        title: "您有新" + action,
        body: comment.sender_name + action + "了你",
      },
    };
    return 0;
    return fcm.sendToDevice(
      "fDTnV1QOSCSzRwgblejKpY:APA91bFIY0L0354ISxJg5CkicviY_luBkvAtwPVOGr7jTCIpmW1ZYtWqwVhVc6UjWLicePowpPsKuTfXjE3h1uduselSRhBwyzoUbNJvYr7LerBBRUTU4YiOJx4uqSH5uAa2ZEDwWQTJ",
      payload
    );
  });
