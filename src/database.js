import _ from 'lodash';
import mongoose from 'mongoose';
import promise from 'promise';

// database types
export const INTEGER = 'INTEGER';
export const DECIMAL = 'DECIMAL';
export const DOUBLE = 'DOUBLE';
export const FLOAT = 'FLOAT';
export const UUID = 'UUID';

const map = {
  INTEGER: Number,
  DECIMAL: Number,
  DOUBLE: Number,
  FLOAT: Number,
  UUID: String,
};

const mapField = (value, key) => {
  console.log(key, value, _.isObject(value));
  if (_.isFunction(value)) {
    return value;
  }

  if (_.isArray(value)) {
    return value;
  }

  if (value.type) {
    return map[value.type] || value.type;
  }

  return undefined;
};

const mapSchema = (schema) => _.mapValues(schema, mapField);

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

    const test = mapSchema(schema);
    console.log(test);

    this.models[name] = mongoose.model(name, test);
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
