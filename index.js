const mongoose = require('mongoose');
const {schema2json, json2schema} = require('mongoose-schema-json-parse');

module.exports = function (connection) {
    const models = {};
    const queue = [];
    let loadSchemasStarted = false;
    let loadSchemasFinish = false;
    if (!connection) connection = mongoose.connection;
    const SchemaModel = connection.model('_schema', new mongoose.Schema({
        name: {type: String, required: true, unique: true},
        data: String,
    }, {timestamps: true}));

    return {
        saveSchema: function (name, schema) {
            try {
                if (schema instanceof mongoose.Schema) {
                    let data = schema2json(schema);
                    let update = {$set: {name, data}}
                    return SchemaModel.findOneAndUpdate({name}, update, {upsert: true, new: true});
                }
            } catch (e) {
                console.error('mongoose-schema-persistence:error:saveSchema:', e);
                return Promise.reject(e);
            }
        },
        getModel: function (name) {
            if (!loadSchemasStarted) throw Error('请先使用\"loadSchemasStarted()\"方法加载数据模型')
            if (!loadSchemasFinish) throw Error('请等待数据模型加载完成')
            if (models[name]) return models[name];
            throw Error('为定义的数据模型: ' + name);
        },
        loadSchemas: function () {
            loadSchemasStarted = true;
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
                    loadSchemasFinish = true;
                    queue.forEach(cb => cb());
                })
                .catch(e => {
                    console.error('mongoose-schema-persistence:loadSchemas:error:', e);
                });

        },
        onLoadSchemas: function (cb) {
            if (typeof cb === 'function') queue.push(cb);
        }
    };
}
