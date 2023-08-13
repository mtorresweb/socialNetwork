const Follow = require('../models/Follow.js');

//get the list of users i follow and the list of users following me
const getFollowers = async (UserId) => {
  try {
    let followers = await Follow.find({ followed: UserId })
      .select('user')
      .populate('user', '-password -role -email -__v -createdAt');

    return {
      followers,
    };
  } catch {
    return {};
  }
};

//see if a specific user is following me
const followThisUser = async (identifiedUserId, profileUserId) => {
  //getting data
  let following = await Follow.findOne({
    user: identifiedUserId,
    followed: profileUserId,
  });
  let follower = await Follow.findOne({
    followed: identifiedUserId,
    user: profileUserId,
  });

  return {
    following,
    follower,
  };
};

module.exports = {
  getFollowers,
  followThisUser,
};
