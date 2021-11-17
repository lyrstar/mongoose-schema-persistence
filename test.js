const mongoose = require('mongoose');

const connection = mongoose.createConnection('mongodb://localhost:27017/om');
const {saveSchema, getModel, loadSchemas, onLoadSchemas} = require('./index')(connection);

const LogSchema = new mongoose.Schema({
    accountId: String,
    type: String,
    data: {},
}, {timestamps: true});


saveSchema('log', LogSchema);

loadSchemas().then(() => {
    console.log('load success')
})

onLoadSchemas(() => {
    let model = getModel('log')
    model.find({accountId: '1'}).then(list => console.log('test:model:log:list:', list)).catch(e => console.error(e));
});

