exports.updateCount = async function updateCount(
  change,
  docRef,
  fieldName,
  collectionRef
) {
  const querySnapshot = await docRef.get();
  let count, accurateCount;
  if (querySnapshot.data() && querySnapshot.data().hasOwnProperty(fieldName)) {
    count = querySnapshot.data()[fieldName];
  } else {
    if (collectionRef) {
      await collectionRef.get().then((snapShot) => {
        accurateCount = snapShot.size;
      });
    } else {
      count = 0;
    }
  }
  let newCount = {};
  if (!change.before.exists) {
    newCount[fieldName] = accurateCount ? accurateCount : count + 1;
  } else if (!change.after.exists) {
    newCount[fieldName] = accurateCount ? accurateCount : count - 1;
  }
  await docRef.set(newCount, { merge: true });
};
