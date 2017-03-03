// map to get the js type definition
const map = {
  INTEGER: Number,
  DECIMAL: Number,
  DOUBLE: Number,
  FLOAT: Number,

  UUID: String,
  STRING: String,
  PASSWORD: String,
  DATE: Date,
  BOOLEAN: Boolean,
};

export const mapComplexType = definition => {
  const {type} = definition;
  const resolved = map[type];

  return resolved || undefined; // eslint-disable-line
};
