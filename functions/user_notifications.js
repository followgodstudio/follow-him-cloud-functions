const functions = require("firebase-functions");
const admin = require("firebase-admin");
const constants = require("./constants");

const db = admin.firestore();
const fcm = admin.messaging();

// when a new message comes, push notification to the corresponding user
exports.pushMessage = functions.firestore
  .document(
    "/" +
      constants.cUsers +
      "/{userId}/" +
      constants.cUserMessages +
      "/{messageId}"
  )
  .onCreate(async (snap, context) => {
    const comment = snap.data();
    functions.logger.log(
      "UserId: ",
      context.params.userId,
      ". MessageId: ",
      context.params.messageId,
      ". CommentId: ",
      comment.comment_id,
      ". Content: ",
      comment.content
    );
    const action = comment.type === "like" ? "点赞" : "回复";
    const payload = {
      notification: {
        title: comment.sender_name + action + "了你",
        body: comment.content,
        click_action: "FLUTTER_NOTIFICATION_CLICK",
      },
      data: {
        article_id: comment.article_id,
        comment_id: comment.comment_id,
        message_id: context.params.messageId,
        user_id: context.params.userId,
      },
    };
    const receiverTokensList = await db
      .collection(constants.cUsers)
      .doc(context.params.userId)
      .collection(constants.cUserProfile)
      .doc(constants.dUserProfileFbMsgToken)
      .get();
    tokens = [];
    for (const token in receiverTokensList._fieldsProto) {
      tokens.push(token);
    }
    functions.logger.log("tokens: ", tokens, ". payload: ", payload);
    // Send back a message that we've successfully written the message
    if (tokens.length > 0) {
      return fcm.sendToDevice(tokens, payload);
    } else {
      return 0;
    }
  });
