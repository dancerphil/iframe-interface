# iframe-interface

[![version](https://img.shields.io/npm/v/iframe-interface.svg?style=flat-square)](http://npm.im/iframe-interface)
[![npm downloads](https://img.shields.io/npm/dm/iframe-interface.svg?style=flat-square)](https://www.npmjs.com/package/iframe-interface)
[![MIT License](https://img.shields.io/npm/l/iframe-interface.svg?style=flat-square)](http://opensource.org/licenses/MIT)

`iframe-interface` 将帮助你在 `iframe` 窗口之间注册和调用 api。支持异步。

[English](https://github.com/dancerphil/iframe-interface/blob/master/README.md) | 中文

## GetStarted

```
yarn add iframe-interface
```

### Basic Usage

`iframe-interface` 分为三个阶段：接口工厂 => 接口定义 => 接口调用。这是从 [`axios-interface`](https://github.com/dancerphil/axios-interface) 继承来的。（我们团队在用的另一个非常好用的库）。

- host 侧

```typescript jsx
import {createFactory} from 'iframe-interface';

const {setIframe, createCall} = createFactory({side: 'host'});

const Component = () => <iframe src="https://example.com" ref={setIframe} />;

// 定义接口
const getUsersFromIframe = createCall<Params, Result>('getUsers');

// 调用接口
const result = await getUsers({companyId: '1', keyword: 'jack'});
```

- guest 侧

```typescript jsx
import {useCallback, useEffect} from 'react';
import {createFactory} from 'iframe-interface';

const {registerCallHandler} = createFactory({side: 'guest'});

// 全局注册 api
registerCallHandler('getUsers', handle);

// 或者在组件中注册 api
const Component = () => {
    const handle = useCallback(
        async (params: Params) => {
            const result = await something();
            return result;
        },
        [],
    )
    useEffect(
        () => {
            registerCallHandler('getUsers', handle);
        },
        [],
    );
    return null;
}
```

> 在 host 侧 `registerCallHandler` 并在 guest 侧 `createCall` 也是可以的。只要把它们放在两侧即可。

### 额外的话题

当前没有实现生命周期，比如 onResolve，看上去没有必要。如果你在使用过程中有什么通用的需求，并且适合在 `iframe-interface` 中实现，欢迎提出 issue 讨论。
