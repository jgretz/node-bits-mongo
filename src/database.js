import _ from 'lodash';
import mongoose from 'mongoose';
import promise from 'promise';
import { logWarning } from 'node-bits';
import { Database } from 'node-bits-internal-database';

import { mapComplexType } from './map_complex_type';
import { runSeeds } from './run_seeds';

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
  // connection
  connect(config) {
    mongoose.connect(config.connection, config.mongoConfig);
  },

  rawConnection() {
    return mongoose;
  },

  // schema
  beforeSynchronizeSchema() {},

  updateSchema(name, schema) {
    return mongoose.model(name, mapSchema(schema));
  },

  removeSchema(name) {
    delete mongoose.connection.models[name];
  },

  defineRelationships(config, models, db) {
    if (db.relationships && db.relationships.length > 0) {
      logWarning(`Since MongoDB is a document db relationships don't really make sense.
                  Thus node-bits-mongo ignores them`);
    }
  },

  defineIndexes(config, models, db) {
    _.forEach(db.indexes, (index) => {
      const model = models[index.model];
      const { fields, unique = false } = index;

      if (!model || !fields) {
        logWarning(`This index has not been added due to a misconfiguration
          ${JSON.stringify(index)}`);
        return;
      }

      const mappedFields = fields.map(field => {
        if (_.isString(field)){
          return { [field]: 1 };
        }

        return { [field.field]: field.desc ? -1 : 1 };
      });

      model.index(mappedFields, { unique });
    });
  },

  afterSynchronizeSchema(config, models, db) {
    if (config.runSeeds) {
      runSeeds(models, db);
    }
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
