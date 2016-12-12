import _ from 'lodash';
import mongoose from 'mongoose';
import promise from 'promise';
import moment from 'moment';

export default class Mongo {
  constructor(config) {
    mongoose.Promise = promise;
    this.config = config;
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
    mongoose.model(name, schema);
  }

  removeSchema(name) {
    delete mongoose.connection.models[name];
  }

  // crud
  findById(model, id) {
    return model.findById(id);
  }

  find(model, query) {
    return model.find(query);
  }

  create(model, data) {
    return model.create(data);
  }

  update(model, id, data) {
    return model.findByIdAndUpdate(id, data, { new: true });
  }

  delete(model, id) {
    return model.findByIdAndRemove(id);
  }
}
