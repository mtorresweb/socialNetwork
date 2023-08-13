const Publication = require('../models/Publication.js');
const fs = require('fs');
const path = require('path');
const pagination = require('mongoose-pagination');
const followService = require('../services/followService.js');
const { asyncErrorHandler } = require('../helpers/asyncErrorHandler.js');
const { matchedData } = require('express-validator');

//save a publication
const save = async (req, res, next) => {
  //get data
  const data = matchedData(req);

  //create and fill a new object to save
  let newPublication = new Publication(data);
  newPublication.user = req.user.id;

  //save the publication
  let publication = await newPublication.save();

  return res.status(200).send({
    status: 'success',
    message: 'publication saved successfully',
    publication,
  });
};

//get a publication
const detail = async (req, res, next) => {
  //get the publication id
  const publicationId = matchedData(req, { locations: ['params'] }).id;
  let thisPublication = await Publication.findById(publicationId);

  return res.status(200).send({
    status: 'success',
    thisPublication,
  });
};

//delete a publication
const remove = async (req, res, next) => {
  //get the publication id
  const publicationId = matchedData(req, { locations: ['params'] }).id;

  //find and remove the publication
  await Publication.findOneAndDelete({
    user: req.user.id,
    _id: publicationId,
  });

  return res.status(200).send({
    status: 'success',
    message: 'publication deleted successfully',
  });
};

//list publications
const userPublications = async (req, res, next) => {
  //get user id
  let { id, page } = matchedData(req, { locations: ['params'] });
  // control page
  page = page || 1;
  const itemsPerPage = 2;

  let responses = await Promise.all([
    Publication.find({
      user: id,
    })
      .sort({ created_at: 'desc' })
      .populate('user', '-password -__v -role -email')
      .paginate(page, itemsPerPage),
    Publication.count({ user: id }),
  ]);

  const publications = responses[0];
  const totalPublications = responses[1];

  return res.status(200).send({
    status: 'success',
    page,
    itemsPerPage,
    totalPublications,
    pages: Math.ceil(totalPublications / itemsPerPage),
    publications,
  });
};

//upload file
const upload = async (req, res, next) => {
  //get publication id
  const publicationId = matchedData(req, { locations: ['params'] }).id;
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
  const updatedPublication = await Publication.findOneAndUpdate(
    { user: req.user.id, _id: publicationId },
    {
      file: req.file.filename,
    },
    { new: true }
  );

  return res.status(200).send({
    status: 'success',
    message: 'file uploaded successfully',
    publication: updatedPublication,
    file: req.file,
  });
};

// get a file
const media = (req, res) => {
  //get the param
  const file = req.params.file;

  //get the real image's path
  const filePath = './uploads/publications/' + file;

  //check if the image exists
  fs.stat(filePath, (error, exists) => {
    if (error) {
      return res.status(500).send({
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
  return res.sendFile(path.resolve(filePath));
};

//list all publications (FEED)
const feed = async (req, res, next) => {
  //get the current page
  let { page } = matchedData(req, { locations: ['params'] });
  page = page || 1;

  //set items per page
  let itemsPerPage = 2;

  //get an id array of followed users
  const myFollows = await followService.followUserIds(req.user.id);

  const publications = await Publication.find({
    user: { $in: myFollows.following },
  })
    .populate('user', '-password -role -__v -email')
    .sort('-created_at')
    .paginate(page, itemsPerPage);

  const totalPublications = await Publication.count({
    user: { $in: myFollows.following },
  });

  return res.status(200).send({
    page,
    itemsPerPage,
    totalPublications,
    pages: Math.ceil(totalPublications / itemsPerPage),
    myFollows: myFollows.following,
    publications,
  });
};

module.exports = {
  save: asyncErrorHandler(save),
  detail: asyncErrorHandler(detail),
  remove: asyncErrorHandler(remove),
  userPublications: asyncErrorHandler(userPublications),
  upload: asyncErrorHandler(upload),
  media,
  feed: asyncErrorHandler(feed),
};
