# node-bits-mongo
node-bits-mongo allows a node-bits app access to a mongo database. node-bits-mongo will use the schema defined by other bits in the loadSchema step as its schema definition.

## Install
```
npm install node-bits-mongo --save
```

or

```
yarn add node-bits-mongo
```

## Configuration
```
nodeBitsMongo({
  connection: 'connection-string',
  hooks: [
    nodeBitsPassword(),
  ],
}),
```

### connection
This is the connection string to the mongo database.

### hooks
hooks is an array of functions that accepts a single args parameter. The property values  passed to args and optional actions varys by operation and are described below:

##### Before execution
* name: the name of the model
* schema: the defined schema object for this model
* action: QUERY, INSERT, UPDATE, DELETE
* stage: BEFORE, AFTER
* options: these are the options passed to the database on the query

Any value returned will be used as the options forward. If you do not want this effect, return null.

##### After Execution
* name: the name of the model
* schema: the defined schema object for this model
* action: QUERY, INSERT, UPDATE, DELETE
* stage: BEFORE, AFTER
* options: these are the options passed to the database on the query
* results: the results returned by the database

#### node-bits-password
[node-bits-password](https://github.com/jgretz/node-bits-password) implements the logic for the PASSWORD type fields and is a common hook. See the bit's documentation for more information.

## Methods

### connect
This will open a connection to the database.

### rawConnection
Sometimes you need the raw mongo connection to do something that node-bits-mongo hasn't exposed. This method will return the [mongoosejs](http://mongoosejs.com/) connection to you.

### getModel
```
getModel(name)
```

This will return to you the mongoosejs model.

### findById
```
findById(name, id)
```

The name of the model, the id to search for.

Will return an object if found, if not will return null.

### find
```
find(name, query)
```

The name of the model, the id to search for.

Will return an object if found, if not will return null.

### create
```
create(name, data)
```

The name of the model, the data to insert.

Will return the object inserted with all autogenerated fields

### update
```
update(name, id, data)
```

The name of the model, the id of the record to update, the data to use as the new version of the object.

Will return the object updated with all autogenerated fields

### delete
```
delete(name, id)
```

The name of the model, the id of the object to delete.
