import _ from 'lodash';
import mongoose from 'mongoose';
import promise from 'promise';

import {
  mapComplexType,
  QUERY, INSERT, UPDATE, DELETE,
  BEFORE, AFTER,
} from './util';

// helpers
const mapField = (value) => {
  if (_.isFunction(value)) {
    return value;
  }

  if (_.isArray(value)) {
    return value;
  }

  if (value.type) {
    return mapComplexType(value);
  }

  return undefined;
};

const mapSchema = (schema) => _.mapValues(schema, mapField);

// database class
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
    this.definedSchema = schema;

    const keys = _.keys(schema);

    _.forEach(keys, (key) => {
      this.updateSchema(key, schema[key]);
    });
  }

  updateSchema(name, schema) {
    this.removeSchema(name);

    const mapped = mapSchema(schema);
    this.models[name] = mongoose.model(name, mapped);
  }

  removeSchema(name) {
    delete mongoose.connection.models[name];
  }

  model(name) {
    return this.models[name];
  }

  // crud
  execute(name, action, args, logic) {
    const hooks = this.config.hooks || [];
    const meta = { name, action, schema: this.definedSchema[name] };

    // this will call the hooks with the situation, allowing it to change the args or result
    // based on the stage
    const callHooks = (stage, changeable) => {
      return _.reduce(hooks, (inbound, hook) => {
        const result = hook({ ...meta, stage, ...inbound });
        return result ? result : inbound;
      }, changeable);
    };

    // It goes logically :) - BEFORE hooks, call, AFTER hooks
    return new Promise((resolve, reject) => {
      try {
        const resolvedArgs = callHooks(BEFORE, args);

        logic(this.model(name), resolvedArgs)
          .then((result) => {
            const resolvedResponse = callHooks(AFTER, { result });

            resolve(resolvedResponse.result);
          })
          .catch(reject);
      } catch (err) {
        console.log(err);
        reject(err);
      }
    });
  }

  findById(name, id) {
    const logic = (model, args) => model.findById(args.id);

    return this.execute(name, QUERY, { id }, logic);
  }

  find(name, query) {
    const logic = (model, args) => model.find(args.query);

    return this.execute(name, QUERY, { query }, logic);
  }

  create(name, data) {
    const logic = (model, args) => model.create(args.data);

    return this.execute(name, INSERT, { data }, logic);
  }

  update(name, id, data) {
    const logic = (model, args) => model.findByIdAndUpdate(args.id, args.data, { new: true });

    return this.execute(name, UPDATE, { id, data }, logic);
  }

  delete(name, id) {
    const logic = (model, args) => model.findByIdAndRemove(args.id);

    return this.execute(name, DELETE, { id }, logic);
  }
}
