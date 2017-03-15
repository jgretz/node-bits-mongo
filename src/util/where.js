import _ from 'lodash';

const operatorMap = {
  ne: '$ne',
  gt: '$ge',
  ge: '$gte',
  gte: '$gte',
  lt: '$lt',
  le: '$lte',
  lte: '$lte',
  and: '$and',
  or: '$or',
};

const literalMap = {
  like: value => new RegExp(value, 'i'),
  startsWith: value => new RegExp(`^${value}`, 'i'),
  endsWith: value => new RegExp(`${value}$`, 'i'),
};

const mapKey = key => {
  const operator = operatorMap[key];
  return operator || key;
};

const mapNode = node => {
  if (_.isArray(node)) {
    return node.map(inner => mapNode(inner));
  }

  if (_.isObject(node)) {
    return _.reduce(node, (result, value, key) => {
      const translate = literalMap[key];
      if (translate) {
        return translate(value);
      }

      const mapped = {[mapKey(key)]: mapNode(value)};
      return {...result, ...mapped};
    }, {});
  }

  return node;
};

export const buildWhere = args => {
  if (!args.where) {
    return undefined; // eslint-disable-line
  }

  return mapNode(args.where);
};
