import { SignOptions } from 'jsonwebtoken';
import JWT = require('jsonwebtoken');
import ms = require('ms');

module.exports = {
  signAccessToken: (userId: number) => {
    return new Promise((resolve, reject) => {
      console.log(userId);
      const payload = {};
      const secret = process.env.ACCESS_TOKEN_SECRET;
      if (secret) {
        const options: SignOptions = {
          expiresIn: ms('1m'),
          issuer: 'AAOKay.com',
          audience: String(userId),
        };
        JWT.sign(payload, secret, options, (err, token) => {
          if (err) return reject(err);
          resolve(token);
        });
      }
      resolve(null);
    });
  },
};
