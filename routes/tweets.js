const express = require('express');
const tweetsRouter = express.Router();
const db = require("../db/models");
const { check, validationResult } = require('express-validator');
const { Tweet } = db;

const asyncHandler = (handler) => (req, res, next) => handler(req, res, next).catch(next)

const tweetNotFoundError = (id) => {
    const error = new Error(`Tweet with id ${id} could not be found.`);
    error.title = "Tweet not found.";
    error.status = 404;
    return error;
}

const validateTweet = [
    check("message")
        .exists({checkFalsy: true })
        .withMessage("Tweet message can't be empty"),
    check("message")
        .isLength({ max: 280 })
        .withMessage("Task name can't be longer than 280 characters."),
];

const handleValidationErrors = (req, res, next) => {
    const validationErrors = validationResult(req);

    if (!validationErrors.isEmpty()) {
      const errors = validationErrors.array().map((error) => error.msg);

      const err = Error("Bad request.");
      err.status = 400;
      err.title = "Bad request.";
      err.errors = errors;
      return next(err);
    }
    next();
  }

tweetsRouter.get('/', asyncHandler(async (req, res) => {
    const tweets = await Tweet.findAll();
    res.json({ tweets })
}))

tweetsRouter.get('/tweets/:id(\\d+)', asyncHandler(async (req, res, next) => {
    const tweetId = parseInt(req.params.id, 10);
    const tweet = await Tweet.findByPk(tweetId)
    if (tweet) {
        res.json({ tweet });
    } else {
        next(tweetNotFoundError(tweetId));
    }
}))

tweetsRouter.post('/tweets', validateTweet, handleValidationErrors, asyncHandler(async (req, res) => {
    const { message } = req.body;
    const tweet = await Tweet.create( { message } );
    res.status(201).json({ tweet });
}));

tweetsRouter.put('/tweets/:id(\\d+)', validateTweet, handleValidationErrors, asyncHandler(async (req, res) => {
    const tweetId = parseInt(req.params.id, 10);
    const tweet = await Tweet.findByPk(tweetId)
    if (tweet) {
       await tweet.update({ message: req.body.message })
       res.json({ tweet })
    } else {
        next(tweetNotFoundError(tweetId));
    }
}))

tweetsRouter.delete('/tweets/:id(\\d+)', asyncHandler(async (req, res) => {
    const tweetId = parseInt(req.params.id, 10);
    const tweet = await Tweet.findByPk(tweetId);
    if (tweet) {
        await tweet.destroy();
        res.status(204).end()
     } else {
         next(tweetNotFoundError(tweetId));
     }

}))


module.exports = {
    tweetsRouter
}
