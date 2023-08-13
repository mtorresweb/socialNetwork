const User = require('../models/User.js');
const followService = require('../services/followService.js');
const Follow = require('../models/Follow.js');
const Publication = require('../models/Publication.js');
const bcrypt = require('bcrypt');
const { asyncErrorHandler } = require('../helpers/asyncErrorHandler.js');
const pagination = require('mongoose-pagination');
const fs = require('fs');
const path = require('path');
const jwt = require('../services/jwt.js');
const { matchedData } = require('express-validator');

// user register
const register = async (req, res, next) => {
  let userData = matchedData(req);

  // validating user object
  let userExists = await User.findOne({
    $or: [{ email: userData.email }, { nickname: userData.nickname }],
  });

  if (userExists) {
    return res.status(400).send({
      status: 'error',
      message: 'user already exists',
    });
  }

  //encrypt password, 'pwd' is a name I chose for the encrypted password
  let pwd = await bcrypt.hash(userData.password, 10);

  //creating user object
  userData.password = pwd;
  let user = new User(userData);

  //saving user
  let savedUser = await user.save();
  userData = savedUser.toObject();
  delete userData.password;

  return res.status(200).send({
    status: 'success',
    message: 'user registered successfully',
    user: userData,
  });
};

// autenticaion
const login = async (req, res, next) => {
  //getting request
  let data = matchedData(req);

  let user = await User.findOne({ email: data.email });

  let pwdMatches = false;
  if (user) {
    pwdMatches = bcrypt.compareSync(data.password, user.password);
  }

  if (!user || !pwdMatches) {
    return res.status(400).send({
      status: 'error',
      message: 'wrong password',
    });
  }

  let token = jwt.createToken(user);
  data = user.toObject();
  delete data.password;

  return res.status(200).send({
    status: 'success',
    message: 'User logged in successfully',
    user: data,
    token,
  });
};

//get a profile
const profile = async (req, res, next) => {
  //get the id parameter
  const { id } = matchedData(req, { locations: ['params'] });
  // get the user data
  let user = await User.findById(id).select({
    password: 0,
    _id: 0,
    email: 0,
  });

  // following info
  const followInfo = await followService.followThisUser(req.user.id, id);

  //return the response
  return res.status(200).send({
    status: 'success',
    user,
    following: followInfo.following,
    follower: followInfo.follower,
  });
};

//list users by page
const list = async (req, res, next) => {
  // Select the page
  let { page } = matchedData(req, { locations: ['params'] });

  page = page || 1;

  // Define the number of items per page
  let itemsPerPage = 2;

  // Query the database for users and get the total count
  let users = await User.find()
    .select('-password -role -email -__v')
    .sort('_id')
    .paginate(page, itemsPerPage);
  let total = await User.countDocuments();

  //list of users i follow and list of users following me
  let followUserIds = await followService.followUserIds(req.user.id);

  // Return the response
  return res.status(200).send({
    status: 'success',
    page,
    pages: Math.ceil(total / itemsPerPage),
    itemsPerPage,
    total,
    users,
    following: followUserIds.following,
    users_following_me: followUserIds.followers,
  });
};

//update user
const update = async (req, res, next) => {
  //get user info
  let user = req.user;
  let userToUpdate = matchedData(req, { locations: ['body'] });

  //check if the user already exists
  let userExists = await User.findOne({
    $or: [{ email: userToUpdate.email }, { nickname: userToUpdate.nickname }],
  });

  if (userExists) {
    return res.status(400).send({
      status: 'error',
      message: 'user already exists',
    });
  }

  //encrypt password, 'pwd' is a name I chose for the encrypted password
  if (userToUpdate.password) {
    let pwd = await bcrypt.hash(userToUpdate.password, 10);
    userToUpdate.password = pwd;
  } else {
    delete userToUpdate.password;
  }

  //search and update the user
  let updatedUser = await User.findByIdAndUpdate(
    { _id: user.id },
    userToUpdate,
    { new: true }
  ).select('-password -role -__v');

  return res.status(200).json({
    status: 'success',
    message: 'User updated successfull',
    updatedUser,
  });
};

// upload an avatar image
const upload = async (req, res, next) => {
  //get file
  if (!req.file) {
    return res
      .status(404)
      .send({ status: 'error', message: 'could not get the file' });
  }

  //get file name
  let image = req.file.originalname;

  //get file extension
  let imageSplit = image.split('.');
  let extension = imageSplit[1];

  //check file extension
  //if the file extension is not correct, delete the file
  if (
    extension != 'png' &&
    extension != 'jpg' &&
    extension != 'jpeg' &&
    extension != 'gif'
  ) {
    //delete file
    const filePath = req.file.path;
    fs.unlinkSync(filePath);

    //return answer
    return res.status(400).send({
      status: 'error',
      message: 'only images can be uploaded',
    });
  }

  //if everything is correct then save the file
  const updatedUser = await User.findOneAndUpdate(
    { _id: req.user.id },
    {
      image: req.file.filename,
    },
    { new: true }
  );
  //return an answer
  return res.status(200).send({
    status: 'success',
    message: 'file uploaded successfully',
    user: updatedUser,
    file: req.file,
  });
};

//get the avatar image
const avatar = (req, res) => {
  //get the param
  const { image } = matchedData(req, { locations: ['params'] });

  //get the real image's path
  const filePath = './uploads/avatars/' + image;

  console.log(filePath);
  //check if the image exists
  fs.stat(filePath, (error, exists) => {
    if (error) {
      return res.status(404).send({
        status: 'error',
        message: 'there was an error getting the file',
      });
    }

    if (!exists) {
      return res
        .status(404)
        .send({ status: 'error', message: 'image not found' });
    }
  });

  //return the image
  return res.status(200).sendFile(path.resolve(filePath));
};

//count followers , people i follow and my publications
const counters = async (req, res, next) => {
  let { id } = matchedData(req, { locations: ['params'] });
  id = id || req.user.id;

  const following = await Follow.count({ user: id });
  const followers = await Follow.count({ followed: id });
  const publications = await Publication.count({ user: id });

  return res.status(200).send({
    userId: id,
    following,
    followers,
    publications,
  });
};

module.exports = {
  register: asyncErrorHandler(register),
  login: asyncErrorHandler(login),
  profile: asyncErrorHandler(profile),
  list: asyncErrorHandler(list),
  update: asyncErrorHandler(update),
  upload: asyncErrorHandler(upload),
  avatar,
  counters: asyncErrorHandler(counters),
};
