# mock-server
mock 服务器, 开箱即用，无需重启,自动代理远程服务、提供静态web服务入口、零接入成本
零接入成本、一秒启动服务、
在非prod阶段减轻运维部署成本、
去除对后端服务依赖性
前端、测试可自定义伪接口，http请求或配合postman 等工具可以直接调试伪接口

## 功能总览
1. mock 服务器, 开箱即用，读取本地mock文件、自动代理远程服务
2. 提供对mock文件 增 、删、改、查功能

### 下载
-  node
```shell
$ npm i @enhances/mock-server 或者 pnpm i @enhances/mock-server
```

### 启动
```json
{
    "scripts": {
        "mock": "enhances-mock start",
        "mock:5300": "enhances-mock start -p 5300",
    }
}
```
```shell
npm run mock;
# or
npm run mock -p 5300 # 可以之定义端口
```

### 配置

```js
// mock-config.js

module.exports = {
// 覆盖默认配置
}

```


### 默认配置
```ts
 // express.static;
type StaticServic = string[] | { suffix: string; dir: string }[];
```
```js

/**
 * 如果配置
 * staticServic: [{
        suffix: '/public',
        dir: 'public',
    }]
    访问链接为：http://localhost:60363/public/index.js
 */

/**
 *  remote: 'remote',
    local: 'local',
 */
module.exports = {
    timeout: 0, // 延迟
    model: 'auto', // remote | local 强制使用本地（local）或者远程代理模式（remote）默认 auto
    print_req: true, // 是否在控制台打印参数
    fileWithEnd: '.js', // mock 的文件
    mockSrc: '__mock__', // 读取mock的目录
    logDir: '__mock__', // 打印日志保存的目录
    logFileName: 'log', // 日志文件名称
    logReplaceMaxSize: 1024 * 1024, // 日志最大的覆盖内容大小， 大于这个大小(Bytes)内容将会被覆盖
    staticServic: ['public'], // 在cwd下开放为静态服务目录
    // 写法一
    proxyURL(url) {
        // 自定义代理的服务
        return 'http://xxxxx' + url;
    },
    // 写法二 0.2.14 后默认写法，0.2.14推荐使用这个写法
    proxyURL: {
        origin: 'https://xxxxxxx',
          async format(api) {
            // URL 
              return this.origin + api;
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
            return data;
        },
         // 响应拦截
        async response(data) {
            return data;
        }
    }
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
exports.mock = (req) => {
    return {
        status: 200,
        message: 'mock'
    }
}
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

- list.js 
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

- 文件 delete/${id}.js
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
- 文件 add.js
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
- 文件 update.js
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