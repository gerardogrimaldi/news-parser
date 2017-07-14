'use strict';

const crypto = require('crypto'),
  Profile = require('../models/profile').model,
  User = require('../models/user').model,
  Vendor = require('../models/vendor').model,
  AuthNonce = require('../models/auth-nonce').model;

module.exports = class SignedRequest {

  static calculateHash(id, secret, nonce, ts) {
    let sigString = id + secret + nonce + ts,
      hash = crypto.createHash('sha512').update(sigString).digest('hex');

    return hash;
  }

  static validateSignature(sig, id, secret, nonce, ts, req, cb) {
    let hash = SignedRequest.calculateHash(id, secret, nonce, ts);
    let tsDiff = Math.abs(Date.now() - ts);

    if (sig === hash && sig && id && nonce && tsDiff < 300000) {
      AuthNonce.findOne({
        nonce: nonce
      }).lean().exec((err, authNonce) => {
        if (!err && !authNonce) {
          let ipAddr = req.headers['x-forwarded-for'];
          if (ipAddr) {
            let list = ipAddr.split(',');
            ipAddr = list[list.length - 1];
          } else {
            ipAddr = req.connection.remoteAddress;
          }

          AuthNonce.create({
            nonce: nonce,
            remote: ipAddr,
            url: req.url,
            date: new Date()
          }, (err) => {
            if (!err) {
              cb(true);
            } else {
              cb(false);
            }
          });
        } else {
          cb(false);
        }
      });
    } else {
      cb(false);
    }
  }

  static check(req, res, next) {
    let body = req.body,
      headers = req.headers,
      sig = body.sig || headers['x-sig'],
      profileId = body.profileId || req.params.profileId || headers['x-profileid'],
      nonce = body.nonce || headers['x-nonce'],
      ts = parseInt(body.ts || headers['x-ts'], 10);

    Profile.findById(profileId).lean().exec((err, profile) => {
      if (!err) {
        if (profile && !profile.banned) {
          SignedRequest.validateSignature(sig, profile._id, profile.secret, nonce, ts, req, (auth) => {
            if (auth) {
              req.currentProfile = profile;
              next();
            } else {
              res.status(401).send('Profile is not authorized');
            }
          });
        } else {
          res.status(401).send('Profile is not authorized');
        }
      } else {
        res.status(500).send('Error retrieving profile');
      }
    });
  }

  static optional(req, res, next) {
    let body = req.body,
      headers = req.headers,
      sig = body.sig || headers['x-sig'],
      profileId = body.profileId || req.params.profileId || headers['x-profileid'],
      nonce = body.nonce || headers['x-nonce'],
      ts = parseInt(body.ts || headers['x-ts'], 10);

    if (profileId) {
      Profile.findById(profileId).lean().exec((err, profile) => {
        if (!err) {
          if (profile && !profile.banned) {
            SignedRequest.validateSignature(sig, profile._id, profile.secret, nonce, ts, req, (auth) => {
              if (auth) {
                req.currentProfile = profile;
                next();
              } else {
                res.status(401).send('Profile is not authorized');
              }
            });
          } else {
            res.status(401).send('Profile is not authorized');
          }
        } else {
          res.status(500).send('Error retrieving profile');
        }
      });
    } else {
      next();
    }
  }

  static adminCheck(req, res, next) {
    let body = req.body,
      headers = req.headers,
      sig = body.sig || headers['x-sig'],
      userId = body.userId || req.params.userId || headers['x-userid'],
      nonce = body.nonce || headers['x-nonce'],
      ts = parseInt(body.ts || headers['x-ts'], 10);

    return User.findById(userId).lean().exec((err, user) => {
      if (!err) {
        if (user && !user.banned) {
          SignedRequest.validateSignature(sig, user._id, user.secret, nonce, ts, req, (auth) => {
            if (auth) {
              req.currentProfile = user;
              next();
            } else {
              res.status(401).send('User is not authorized');
            }
          });
        } else {
          res.status(401).send('User is not authorized');
        }
      } else {
        res.status(500).send('Error retrieving user');
      }
    });
  }

  static vendorCheck(req, res, next) {
    let body = req.body,
      headers = req.headers,
      sig = body.sig || headers['x-vendor-sig'],
      vendorKey = body.apikey || headers['x-vendor-apikey'],
      nonce = body.nonce || headers['x-vendor-nonce'],
      ts = parseInt(body.ts || headers['x-vendor-ts'], 10);

    Vendor.findOne({
      key: vendorKey
    }).lean().exec((err, vendor) => {
      if (!err) {
        if (vendor) {
          SignedRequest.validateSignature(sig, vendor.key, vendor.secret, nonce, ts, req, (auth) => {
            if (auth) {
              req.currentVendor = vendor;
              next();
            } else {
              res.status(401).send('Vendor not authorized');
            }
          });
        } else {
          res.status(401).send('No vendor found');
        }
      } else {
        res.status(500).send('Error retrieving vendor');
      }
    });
  }
};
