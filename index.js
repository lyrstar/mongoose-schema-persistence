const mongoose = require('mongoose');
const {schema2json, json2schema} = require('mongoose-schema-json-parse');

module.exports = function (connection) {
    const models = {};
    if (!connection) connection = mongoose.connection;
    const SchemaModel = connection.model('_schema', new mongoose.Schema({
        name: {type: String, required: true, unique: true},
        data: String,
    }, {timestamps: true}));

    function wait(name) {
        const queue = [];
        const mock = function (model) {
            queue.forEach(item => item(model));
            models[name] = model;
        };

        for (let attr in SchemaModel) {
            if (typeof SchemaModel[attr] === 'function') {
                mock[attr] = function (...args) {
                    return new Promise(resolve => {
                        queue.push(model => resolve(model[attr](...args)));
                    });
                }
            }
        }
        return mock;
    }

    return {
        saveSchema: function (name, schema) {
            try {
                if (schema instanceof mongoose.Schema) {
                    let data = schema2json(schema);
                    let update = {$set: {name, data}}
                    SchemaModel.updateOne({name}, update, {upsert: true}).then();
                }
            } catch (e) {
                console.error('mongoose-schema-persistence:error:saveSchema:', e);
            }

        },
        getModel: function (name) {
            if (!models[name]) {
                models[name] = wait(name);
                SchemaModel.findOne({name})
                    .then(_schema => {
                        if (_schema) {
                            let schema = json2schema(_schema.data);
                            let model;
                            try {
                                model = connection.model(name);
                            } catch (e) {
                                model = connection.model(name, schema);
                            }
                            return models[name](model);
                        }
                        delete models[name];
                    })
                    .catch(e => {
                        delete models[name];
                        console.error('mongoose-schema-persistence:getModel:error:', e);
                    });
            }
            return models[name];
        },
        loadSchemas: function () {
            return SchemaModel.find()
                .then(_schemaList => {
                    for (let _schema of _schemaList) {
                        if (models[_schema.name] && models[_schema.name].name === 'mock') continue;
                        try {
                            models[_schema.name] = connection.model(_schema.name);
                        } catch (e) {
                            models[_schema.name] = connection.model(_schema.name, json2schema(_schema.data));
                        }
                    }
                })
                .catch(e => {
                    console.error('mongoose-schema-persistence:loadSchemas:error:', e);
                });

        },
    };
}
