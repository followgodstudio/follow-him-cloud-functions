const functions = require("firebase-functions");
const constants = require("./constants");

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
    return await utils.pushNotification(context.params.userId, payload);
  });
