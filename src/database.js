import _ from 'lodash';
import mongoose from 'mongoose';
import promise from 'promise';

export default class Mongo {
  constructor(config) {
    mongoose.Promise = promise;

    this.config = config;
    this.models = [];
  }

  // connection
  connect() {
    mongoose.connect(this.config.connection);
  }

  // schema management
  synchronizeSchema(schema) {
    const keys = _.keys(schema);

    _.forEach(keys, (key) => {
      this.updateSchema(key, schema[key]);
    });
  }

  updateSchema(name, schema) {
    this.removeSchema(name);

    this.models[name] = mongoose.model(name, schema);
  }

  removeSchema(name) {
    delete mongoose.connection.models[name];
  }

  model(name) {
    return this.models[name];
  }

  // crud
  findById(name, id) {
    return this.model(name).findById(id);
  }

  find(name, query) {
    return this.model(name).find(query);
  }

  create(name, data) {
    return this.model(name).create(data);
  }

  update(name, id, data) {
    return this.model(name).findByIdAndUpdate(id, data, { new: true });
  }

  delete(name, id) {
    return this.model(name).findByIdAndRemove(id);
  }
}
