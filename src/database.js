import _ from 'lodash';
import mongoose from 'mongoose';
import promise from 'promise';
import { Database } from 'node-bits-internal-database';

import { mapComplexType } from './map_complex_type';

// set up mongoose promise
mongoose.Promise = promise;

// helpers
const mapSchema = (schema) => {
  const mapped = _.mapValues(schema, (value) => {
    if (_.isArray(value)) {
      return value.map(item => mapSchema(item));
    }

    return mapComplexType(value);
  });

  return _.omitBy(mapped, _.isNull);
};

// configure the mongoose specific logic
const implementation = {
  connect(connection) {
    mongoose.connect(connection);
  },

  afterSynchronizeSchema() {},

  updateSchema(name, schema) {
    return mongoose.model(name, mapSchema(schema));
  },

  removeSchema(name) {
    delete mongoose.connection.models[name];
  },

  // CRUD
  findById(model, args) {
    return model.findById(args.id);
  },

  find (model, args) {
    return model.find(args.query);
  },

  create(model, args) {
    return model.create(args.data);
  },

  update(model, args) {
    return model.findByIdAndUpdate(args.id, args.data, { new: true });
  },

  delete(model, args) {
    return model.findByIdAndRemove(args.id);
  }
};

// export the database
export default (config) => {
  return new Database(config, implementation);
};
