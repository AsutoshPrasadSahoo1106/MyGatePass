// utils/generateToken.js
const jwt = require('jsonwebtoken');

const generateToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
        expiresIn: '1d', // Token expires in 1 day
    });
};

module.exports = generateToken;
