'use strict';

const device = require('../../controllers/public/device'),
  signedRequest = require('../../middleware/signed-request');

module.exports = (app) => {

  /**
   * @FWTV-APP
   **/
  app.route('/devices')
    .get(signedRequest.check, device.byProfile)
    .post(signedRequest.check, device.addOrReturnExisting);
  /**
   * @FWTV-APP
   **/
  app.route('/devices/:deviceId')
    .get(signedRequest.check, device.read);
  /**
   * @FWTV-APP
   **/
  app.route('/devices/fingerprint/:fingerprint')
    .get(signedRequest.check, device.byFingerprint);

};