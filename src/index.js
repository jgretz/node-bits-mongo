import Mongo from './database';

export * from './util/constants';

// compile
const compileConfiguration = (options = {}, bitsConfig) => {
  return {
    ...options,
    ...bitsConfig,
  };
};

export default (options) =>
({
  initializeDatabase: (bitsConfig) =>  {
    const config = compileConfiguration(options, bitsConfig);
    const database = new Mongo(config);

    database.connect();

    return database;
  }
});
