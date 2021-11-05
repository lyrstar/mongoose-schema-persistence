# mongoose-schema-persistence
mongoose schema persistence mongodb

- 将mongoose schema 序列化为json后, 存储到mongodb
- 从mongodb获取schema, 生成model对象

### Install 安装
```
npm install mongoose-schema-persistence
```

### Use 使用

##### 初始化

```
const mongoose = require('mongoose');
const connection = mongoose.createConnection('mongodb://localhost:27017/om');
const mongooseSchemaPersistence = require('mongoose-schema-persistence')
// 初始化时需要传入 mongodb connection
const {saveSchema, getModel, loadSchemas} = mongooseSchemaPersistence(connection);
```

##### saveSchema 保存schema到mongodb

```
const LogSchema = new mongoose.Schema({
    accountId: String,
    type: String,
    data: {},
}, {timestamps: true});
saveSchema('log', LogSchema)
```

##### loadSchemas 加载数据库中已保存的schema, 并创建model实例

```
loadSchemas().then(() => {
    console.log(connection.models)
    let model = connection.model('log')
    model.findOne()
});
```

##### getModel 获取单个model实例

```
let model = getModel('log')
model.findOne()
```
