const Follow = require('../models/Follow.js');
const pagination = require('mongoose-pagination');
const { asyncErrorHandler } = require('../helpers/asyncErrorHandler.js');
const followService = require('../services/followService.js');
const { matchedData } = require('express-validator');

//follow
const save = async (req, res, next) => {
  //get user to follow info
  const { followed } = matchedData(req, { locations: ['body'] });

  //get current user id
  const user = req.user;

  //create follow object
  let userToFollow = new Follow({
    user: user.id,
    followed,
  });

  //save new follow
  let savedFollow = await userToFollow.save();

  return res.status(200).send({
    status: 'success',
    message: 'followed successfully',
    follow: savedFollow,
  });
};

//stop following
const unfollow = async (req, res, next) => {
  // get the user id
  const userId = req.user.id;

  //get the user id to unfollow
  const followedId = matchedData(req, { locations: ['params'] }).id;

  //find the follow object y remove it
  await Follow.findOneAndRemove({
    user: userId,
    followed: followedId,
  });

  return res.status(200).send({
    status: 'success',
    message: 'Successfully unfollowed',
  });
};

//list of users i follow or someone follows
const following = async (req, res, next) => {
  // get identified user id or get the user id from params if it is present
  let { id, page } = matchedData(req, { locations: ['params'] });

  let userId = id || req.user.id;

  //get the page if it is gotten, otherwise assign 1
  page = page || 1;

  //users per page to show
  const itemsPerPage = 5;
  //find a follow, populate users data and paginate
  const following = await Follow.find({
    user: userId,
  })
    .select('followed')
    .populate('followed', '-password -role -email -__v -createdAt')
    .paginate(page, itemsPerPage);

  const total = await Follow.countDocuments({ user: userId });

  //list of users i follow and list of users following me
  let followUserIds = await followService.getFollowers(userId);

  return res.send({
    page,
    itemsPerPage,
    pages: Math.ceil(total / itemsPerPage),
    total_matches: total,
    following,
    followers: followUserIds.followers,
  });
};

module.exports = {
  save: asyncErrorHandler(save),
  unfollow: asyncErrorHandler(unfollow),
  following: asyncErrorHandler(following),
};
