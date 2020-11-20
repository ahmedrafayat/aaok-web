import { SignOptions } from 'jsonwebtoken';
import JWT = require('jsonwebtoken');
import ms = require('ms');
import { compare } from 'bcrypt';

type userData = {
  firstName: string;
  lastName: string;
  isManagement: number;
  email: string;
};

module.exports = {
  signAccessToken: async (userData: userData) => {
    return new Promise((resolve, reject) => {
      console.log(userData);
      const payload = userData;
      const secret = process.env.ACCESS_TOKEN_SECRET;
      if (secret) {
        const options: SignOptions = {
          expiresIn: ms('1m'),
          issuer: 'AAOKay.com',
        };
        JWT.sign(payload, secret, options, (err, token) => {
          if (err) return reject(err);
          resolve(token);
        });
      } else {
        resolve(null);
      }
    });
  },

  isValidPassword: async (password: string, userPassword: string) => {
    try {
      return await compare(password, userPassword);
    } catch (error) {
      throw error;
    }
  },
};
