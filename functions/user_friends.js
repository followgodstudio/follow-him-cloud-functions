const functions = require("firebase-functions");
const admin = require("firebase-admin");
const constants = require("./constants");
const utils = require("./utils");
const { user } = require("firebase-functions/lib/providers/auth");

const db = admin.firestore();

exports.newFollowing = functions.firestore
  .document(
    "/" +
      constants.cUsers +
      "/{userId}/" +
      constants.cUserFollowings +
      "/{friendsId}"
  )
  .onCreate(async (snap, context) => {
    functions.logger.log(
      "UserId: ",
      context.params.userId,
      ". FriendsId: ",
      context.params.friendsId
    );
    const newFollowing = snap.data();
    const followerUserId = snap.id;
    const followingUserId = context.params.userId;
    //Find this user's name
    const userProfile = await db
      .collection(constants.cUsers)
      .doc(followingUserId)
      .get();
    //Update friends's follower list
    let followerObject = Object.assign({}, newFollowing);
    const profile = userProfile.data();
    followerObject[constants.fUserName] = profile[constants.fUserName];
    if (followerObject[constants.fFriendStatus] === "following")
      followerObject[constants.fFriendStatus] = "follower";
    if (profile.hasOwnProperty(constants.fUserImageUrl))
      followerObject[constants.fUserImageUrl] =
        profile[constants.fUserImageUrl];
    await db
      .collection(constants.cUsers)
      .doc(followerUserId)
      .collection(constants.cUserFollowers)
      .doc(followingUserId)
      .set(followerObject);

    const followerSetting = await db
      .collection(constants.cUsers)
      .doc(followerUserId)
      .collection(constants.cUserProfile)
      .doc(constants.dUserProfileSettings)
      .get();
    //TODO: add default setting in constants
    if (
      !followerSetting.exists ||
      !followerSetting
        .data()
        .hasOwnProperty(constants.fSettingFollowingNotification) ||
      followerSetting.data()[constants.fSettingFollowingNotification]
    ) {
      //Send a message to follower
      const payload = {
        notification: {
          title: followerObject[constants.fUserName] + "关注了你",
          click_action: "FLUTTER_NOTIFICATION_CLICK",
        },
      };
      await utils.pushNotification(followerUserId, payload);
    }

    if (newFollowing[constants.fFriendStatus] === "following") return;
    //If become friend, update friend status in follower/following list
    const batch = db.batch();
    batch.set(
      db
        .collection(constants.cUsers)
        .doc(followingUserId)
        .collection(constants.cUserFollowers)
        .doc(followerUserId),
      {
        [constants.fFriendStatus]: newFollowing[constants.fFriendStatus],
      },
      { merge: true }
    );
    batch.set(
      db
        .collection(constants.cUsers)
        .doc(followerUserId)
        .collection(constants.cUserFollowings)
        .doc(followingUserId),
      {
        [constants.fFriendStatus]: newFollowing[constants.fFriendStatus],
      },
      { merge: true }
    );
    await batch.commit();
  });

exports.removeFollowing = functions.firestore
  .document(
    "/" +
      constants.cUsers +
      "/{userId}/" +
      constants.cUserFollowings +
      "/{friendsId}"
  )
  .onDelete(async (snap, context) => {
    functions.logger.log(
      "UserId: ",
      context.params.userId,
      ". FriendsId: ",
      context.params.friendsId
    );
    const newFollowing = snap.data();
    const followerUserId = snap.id;
    const followingUserId = context.params.userId;
    //Delete friends's follower list
    await db
      .collection(constants.cUsers)
      .doc(followerUserId)
      .collection(constants.cUserFollowers)
      .doc(followingUserId)
      .delete();
    if (newFollowing[constants.fFriendStatus] === "following") return;
    //If become friend, update friend status in follower/following list
    const batch = db.batch();
    batch.update(
      db
        .collection(constants.cUsers)
        .doc(followingUserId)
        .collection(constants.cUserFollowers)
        .doc(followerUserId),
      {
        [constants.fFriendStatus]: "follower",
      }
    );
    batch.update(
      db
        .collection(constants.cUsers)
        .doc(followerUserId)
        .collection(constants.cUserFollowings)
        .doc(followingUserId),
      {
        [constants.fFriendStatus]: "following",
      }
    );
    await batch.commit();
  });
