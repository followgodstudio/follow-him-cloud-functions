const functions = require("firebase-functions");
const admin = require("firebase-admin");
const constants = require("./constants");
const utils = require("./utils");

const db = admin.firestore();

exports.l1CommentChildCount = functions.firestore
  .document(
    "/" +
      constants.cArticles +
      "/{articleId}/" +
      constants.cArticleComments +
      "/{l1CommentId}/" +
      constants.cArticleCommentReplies +
      "/{l2CommentId}"
  )
  .onWrite(async (change, context) => {
    const docRef = db
      .collection(constants.cArticles)
      .doc(context.params.articleId)
      .collection(constants.cArticleComments)
      .doc(context.params.l1CommentId);
    const fieldName = constants.fCommentChildrenCount;
    const collectionRef = db
      .collection(constants.cArticles)
      .doc(context.params.articleId)
      .collection(constants.cArticleComments)
      .doc(context.params.l1CommentId)
      .collection(constants.cArticleCommentReplies);
    await utils.updateCount(change, docRef, fieldName, collectionRef);
  });

exports.l1CommentLikeCount = functions.firestore
  .document(
    "/" +
      constants.cArticles +
      "/{articleId}/" +
      constants.cArticleComments +
      "/{l1CommentId}/" +
      constants.cArticleCommentLikes +
      "/{userId}"
  )
  .onWrite(async (change, context) => {
    const docRef = db
      .collection(constants.cArticles)
      .doc(context.params.articleId)
      .collection(constants.cArticleComments)
      .doc(context.params.l1CommentId);
    const fieldName = constants.fCommentLikesCount;
    const collectionRef = db
      .collection(constants.cArticles)
      .doc(context.params.articleId)
      .collection(constants.cArticleComments)
      .doc(context.params.l1CommentId)
      .collection(constants.cArticleCommentLikes);
    await utils.updateCount(change, docRef, fieldName, collectionRef);
  });
