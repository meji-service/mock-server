# mock-server
mock 服务器, 开箱即用，无需重启,自动代理远程服务、提供静态web服务入口、零接入成本
零接入成本、一秒启动服务、
在非prod阶段减轻运维部署成本、
去除对后端服务依赖性
前端、测试可自定义伪接口，http请求或配合postman 等工具可以直接调试伪接口

## 功能总览
1. mock 服务器, 开箱即用，读取本地mock文件、自动代理远程服务，本地直接返回mock服务的ip即可， 查询不到mock文件会自动代理请求proxyURL配置的线上(ip/域名)
2. 提供对mock文件 增 、删、改、查功能
3. 提供js、json mock 文件互相转换功能 (可以通过**命令**、已可以使用文档中的**函数**形式自定义转换)
4. 启动命令时候添加配置 --scan 经过本mock服务器的接口都可以扫描接口的数据生成到本地

- tip 已经兼容已测试过 node v14.21.3可以正常运行， 库开发使用 node v18.19.0 推荐 node >= 18.19.0

### 下载
-  node
```shell
$ npm i @enhances/mock-server -D 或者 pnpm add @enhances/mock-server -D
```

### 命令
1. `mock`   启动服务
2. `mock:5300` 启动服务自定义服务端口
3. `jsToJson`  js文件转json文件
3. `jsonToJs`  json文件转js文件
4. `mock:scan` 扫描接口的数据生成到本地 具体配置看 `mock-config.js scan字段`
```json
{
    "scripts": {
        "mock": "enhances-mock start",
        "mock:scan": "enhances-mock start --scan true",
        "mock:5300": "enhances-mock start -p 5300",
        "jsToJson": " enhances-mock jsToJson -c 来源文件夹路径 -o 输出的文件夹路径",
        "jsonToJs": " enhances-mock jsonToJs -c 来源文件夹路径 -o 输出的文件夹路径"
    }
}
```

### 配置
- mock-config.js
```js
module.exports = {
// 覆盖默认配置
}
```

### 默认配置
```js
const { MockServerJs } = require('@enhances/mock-server');
module.exports = {
    timeout: 300, // 延迟
    model: 'auto', // remote | local 强制使用本地（local）或者远程代理模式（remote）默认 auto
    print_req: true, // 是否在控制台打印参数
    fileWithEnd: '.js', // mock 的文件 目前只兼容 js 文件， json 文件可以通过 jsonToJs 命令转换为 js
    mockSrc: '__mock__', // 读取mock的目录
     /**
     * @desc 启动命令时候添加配置 --scan 可以启动扫描线上接口生成到本地
     * @example 
     * enhances-mock start --scan true 
     */
    scan: {
        /**
         * @desc 最终输出的路径
         * @param {string} path 扫描的路径
         * @returns {string} 最终的输出路径
         * @default __mock__/.remotes/{扫描的路径}
         */
        outputChunk: function (url) {
            return path.join('__mock__', '.remotes', url)
        },
        /**
         * @desc 输出的文件格式 '.json' | '.js'
         * @default js
         */
        format: '.js',
    },
    logDir: '__mock__', // 打印日志保存的目录
    logFileName: 'log', // 日志文件名称
    logReplaceMaxSize: 1024 * 1024, // 日志最大的覆盖内容大小， 大于这个大小(Bytes)内容将会被覆盖
    staticServic: ['public'], // 在cwd下开放为静态服务目录
    proxyURL: {
        origin: 'https://xxxx/xxx.com', // 通过配置 proxyURL 代理请求线上
          async format(api) {
            return MockServerJs.utils.defineProxy({
                '^/api': {
                    target: this.origin,
                    pathRewrite: {
                        "/api": "/"
                    }
                },
                '^/service/api': {
                    target: 'http://localhost:21412',
                    pathRewrite: {}
                }
            }, api);
        }
    },
    formatHeaders(headers) {
        // 0.2.14版本后 后自动处理host
        delete headers.host; // 代理请求 https 可以自行去掉host
        return headers;
    },
  
    interceptors: {
        // 请求拦截
        async request(data) {
            // 0.2.14版本后会有自动处理host delete data.headers.host; 操作
            return data;
        },
         // 响应拦截
        async response(data) {
            return data;
        }
    }
}
```

### staticServic
- 配置访问链接为例：`http://localhost:60363/custom-public/index.js`
- 目录结构
```md
    - mock-config.js
    - public
        -index.js
```
- 配置文件
```js
// `mock-config.js`
module.exports = {
     staticServic: [{
        suffix: '/custom-public',
        dir: 'public',
    }]
}
```


### 动态接口
- 需要动态的文件固定写法： `${id}.js`
- 例如创建 __mock__ 目录 `__mock__/xxx/xxxx/${id}.js`

### 例子
- 接口： `/education/getToken`
- 根据 mockSrc为 __mock__
- 在运行根目录创建 __mock__ 目录 `__mock__/education/getToken.js`
```js
// getToken.js
exports.enabled = true; // true 代表使用本地mock false 使用代理
exports.print_req = true; // 是否在控制台打印参数
/**
 * @params {{ 'query': object, 'body': object, 'headers': object, '_parsedUrl': object }} req
 * @params {object} res
 */
exports.mock = (req, res) => {
    return {
        status: 200,
        message: 'mock'
    }
}
```
- mock 提供的参数如下
```ts
/**
 * @params {{ 'query': object, 'body': object, 'headers': object, '_parsedUrl': object }} req exporess request
 * @params {object} res exporess response
 */
exports.mock(req, res): boolean;
```

### 编辑mock接口文件内容
#### 目录结构
```md
- __mock__
    - list.js
    - add.js
    - update.js
    - delete
        - ${id}.js

```

- `list.js`
```js
exports.enabled = true;
exports.mock = () => ({
    "errcode": 0,
    "errmsg": "ok",
    "data": {
        "records": [
            {
                id: '123',
                name: 'name123',
            }
        ],
    },
});

```
### 修改 list.js 为例
#### 假如你要删除一个数据

- 文件 `delete/${id}.js`
```js
const { MockServerJs } = require('@enhances/mock-server');

exports.enabled = true;
exports.mock = async (req) => {
    const result = await MockServerJs.share.update(
        __dirname,
        '../list.js', // 现对路径
        (source) => {
            // source 这个是 list.js 页面 mock 函数返回的数据
            source.data.records = source.data.records.filter(record => record.id != req.query.id);
            // 返回数据会写入 list.js 的mock 函数里面
            return Promise.resolve(source)
        });
    return {
        errcode: 0,
        errmsg: 'ok',
        data: result,
    }
}
```


####  假如你要新增一条数据
- 文件 `add.js`
```js
const { MockServerJs } = require('@enhances/mock-server');

exports.enabled = true;
exports.mock = async (req) => {
    const result = await MockServerJs.share.update(
        __dirname,
        './list.js',  // 现对路径
        (source) => {
            // source 这个是 list.js 页面 mock 函数返回的数据
            source.data.records.push({
                id: Math.random() * 1000, // 随机生成一个id
                ...req.body, // 接口新增的参数
            });
            // 返回数据会写入 list.js 的mock 函数里面
            return Promise.resolve(source)
        });
    return {
        errcode: 0,
        errmsg: 'ok',
        data: result,
    }
}
```

#### 假如你要编辑一条数据
- 文件 `update.js`
```js
const { MockServerJs } = require('@enhances/mock-server');

exports.enabled = true;
exports.mock = async (req) => {
    const result = await MockServerJs.share.update(
        __dirname,
        './list.js',  // 现对路径
        (source) => {
            // source 这个是 list.js 页面 mock 函数返回的数据
            source.data.records = source.data.records.map((record) => {
                if(req.body.id === record.id) {
                    return {
                        ...record,
                        ...req.body,
                    }
                }
                return record;
            })
            // 返回数据会写入 list.js 的mock 函数里面
            return Promise.resolve(source)
        });
    return {
        errcode: 0,
        errmsg: 'ok',
        data: result,
    }
}
```

### 通过函数对`js`和`json`相互转换
- `js` 转 `json`
```js
const { MockServerJs } = require('@enhances/mock-server');
MockServerJs.utils.jsToJson('来源文件夹路径', '输出的文件夹路径');
```
- `json` 转 `js`
```js
const { MockServerJs } = require('@enhances/mock-server');
MockServerJs.utils.jsonToJs('来源文件夹路径', '输出的文件夹路径');
```
- `jsonToJs` 和 `jsToJson` 第三个参数

```js
const { MockServerJs } = require('@enhances/mock-server');
console.log(MockServerJs.utils.transformTemplates); // 默认的过滤模板。 通过对应类型的函数进行换行

MockServerJs.utils.jsonToJs('来源文件夹路径', '输出的文件夹路径', (data) => {
    // 自定义数据格式
    return data;
});
```


### 暴露的函数

1. 获取本机ip `getLocalIP`
```js
const { MockServerJs } = require('@enhances/mock-server');

MockServerJs.utils.getLocalIP(); // get local IP

```
2. 打印彩色文本的函数 `printInColor`
```js
const { MockServerJs } = require('@enhances/mock-server');
// color 可选：reset red green yellow blue magenta cyan white
MockServerJs.utils.printInColor([{ color: 'green', text: 'text' } ]);
```

3. 编辑mock文件 `MockServerJs.share.update`
- 看上面编辑mock文件的例子


### 维护它
- 联系邮箱@840719708@qq.com