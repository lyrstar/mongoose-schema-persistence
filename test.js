const mongoose = require('mongoose');

const connection = mongoose.createConnection('mongodb://localhost:27017/om');
const {saveSchema, getModel, loadSchemas} = require('./index')(connection);

const LogSchema = new mongoose.Schema({
    accountId: String,
    type: String,
    data: {},
}, {timestamps: true});


saveSchema('log', LogSchema);
saveSchema('log2', LogSchema);

loadSchemas();

let model = getModel('log')
let model2 = getModel('log2')

model.find({accountId: '1'}).then(list => console.log('test:model:log:list:', list)).catch(e => console.error(e));
model2.find({accountId: '1'}).then(list => console.log('test:model2:log:list:', list)).catch(e => console.error(e));