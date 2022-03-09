const express = require('express');
const tweetsRouter = express.Router();

tweetsRouter.get('/tweets', (req, res) => {
    res.json({message: 'test tweets index'});
})

module.exports = {
    tweetsRouter
}
