import _ from 'lodash';
import mongoose from 'mongoose';
import {log, logWarning, logError, executeSeries} from 'node-bits';

const NO_SEEDS = 'Database ready ... No seeds to run.';
const SEEDS_RUN = 'Database ready ... Seeds planted.';

const plantSeeds = (seedModel, models, db, seedsHistory) => {
  // determine which seeds to run
  const toRun = _.reject(db.seeds, seed => seedsHistory.includes(seed.name));

  if (_.isEmpty(toRun)) {
    log(NO_SEEDS);
    return Promise.resolve();
  }

  const tasks = toRun.map(seed => () => {
    log(`Running seed ${seed.name}`);

    const model = models[seed.name];
    if (!model) {
      logWarning(`No schema model found to match seed data '${seed.name}'`);
      return Promise.resolve();
    }

    return model.collection.insert(seed.seeds)
      .then(() => seedModel.create({name: seed.name, runOn: new Date()}))
      .catch(err => {
        log(`Seed ${seed.name} Failed:`);
        logError(err);

        throw err;
      });
  });

  return executeSeries(tasks).then(() => {
    log(SEEDS_RUN);
  });
};

export const runSeeds = (models, db) => {
  const seedModel = mongoose.model('seed', {name: String, runOn: Date});

  return seedModel.find().then(seedsHistory =>
    plantSeeds(seedModel, models, db, seedsHistory.map(s => s.name)));
};
