module.exports = (mongo) => {
  return new TokenService(mongo);
};

const logger = require('winston-proxy')('TokenService');

class TokenService {

  constructor(mongo) {
    this.mongo = mongo;
  }

  setApnNoToken(pushId) {
    this.mongo.device.update({
      _id: pushId,
      type: null
    }, {
      _id: pushId,
      type: 'apnNoToken',
      updateTime: Date.now()
    }, {
      upsert: true
    }, (err, doc) => {
      logger.debug('setApnNoToken ', err, doc);
    });
  }

  delApnToken(type, token, bundleId) {
    if (type && token) {
      this.mongo.device.update({
        token,
        type,
        package_name: bundleId
      }, {
        $unset: {
          token: 1,
          package_name: 1
        },
        $set: {
          type: 'apnNoToken'
        }
      }, (err, doc) => {
        logger.debug('delete errorToken', err, doc, token);
      });
    }
  }

  setToken(data) {
    this.mongo.device.update({
      _id: data.pushId
    }, {
      type: data.type,
      token: data.token,
      package_name: data.package_name || data.bundleId,
      updateTime: Date.now()
    }, {
      upsert: true
    }, (err, doc) => {
      logger.debug("setToken mongo ", doc, err);
    });
  }
}
