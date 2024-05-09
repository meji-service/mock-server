# mock-server
mock 服务器, 开箱即用，无需重启,自动代理远程服务、提供静态web服务入口、零接入成本
零接入成本、一秒启动服务、
在非prod阶段减轻运维部署成本、
去除对后端服务依赖性
前端、测试可自定义伪接口，http请求或配合postman 等工具可以直接调试伪接口

### 启动
```shell
npm run @service/mock-server
```
### 开发环境
-  node

### 启动
```json
{
    "scripts": {
        "mock": "enhances-mock start",
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

module.exports = {
    timeout: 0, // 延迟
    print_req: true, // 是否在控制台打印参数
    fileWithEnd: '.js', // mock 的文件
    mockSrc: '__mock__', // 读取mock的目录
    logDir: '__mock__', // 打印日志保存的目录
    logFileName: 'log', // 日志文件名称
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
    // 响应拦截
    interceptors: {
        response(data) {
            return data;
        }
    }
}
```

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

- 被动修改方
```js
// mockjs template

exports.enabled = false;
exports.config = {}

exports.mock = () => ({
    "name": "updaet 21233",
}); 

/** 上一个模板：
exports.enabled = false;
exports.config = {}

exports.mock = () => ({
    "name": "default data",
}); 

 */
```

- 通过 `exports.mockUtil.update`修改指定文件
```ts

declare class MockUtil {
    update(data: any, force = false): boolean;
};
```

- 主动发起修改方
```js
// getoken.ts
exports.enabled = true;
exports.config = {
    targetId: 'edit.js', 
    // targetId: './edit.js', // 相对自身的文件路径
}
exports.mock = (req) => {
    // req.body 如等等 { name: 'updaet 21233' }
    const isUpdateSuccess = exports.mockUtil.update(req.body); // 通过update 函数修改改文件名称为{targetId 的mock函数中内容}
    return {
        success: isUpdateSuccess,
        message: 'mock'
    }
}
```