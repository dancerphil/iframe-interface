# iframe-interface

[![version](https://img.shields.io/npm/v/iframe-interface.svg?style=flat-square)](http://npm.im/iframe-interface)
[![npm downloads](https://img.shields.io/npm/dm/iframe-interface.svg?style=flat-square)](https://www.npmjs.com/package/iframe-interface)
[![MIT License](https://img.shields.io/npm/l/iframe-interface.svg?style=flat-square)](http://opensource.org/licenses/MIT)

`iframe-interface` helps you to register and call api between `iframe`. Support async.

English | [中文](https://github.com/dancerphil/iframe-interface/blob/master/docs/README-zh_CN.md)

## GetStarted

```
yarn add iframe-interface
```

### Basic Usage

`iframe-interface` separate api into 3 stage: factory => interface => call. Which is inherited from [`axios-interface`](https://github.com/dancerphil/axios-interface) (Another helpful api tool widely used by our team).

```typescript jsx
import {createFactory} from 'iframe-interface';

const {setIframe, createCall} = createFactory({side: 'host'});

const Component = () => <iframe src="https://example.com" ref={setIframe} />;

// define api
const getUsersFromIframe = createCall<Params, Result>('getUsers');

// call
const result = await getUsers({companyId: '1', keyword: 'jack'});
```

- guest side

```typescript jsx
import {useCallback, useEffect} from 'react';
import {createFactory} from 'iframe-interface';

const {registerCallHandler} = createFactory({side: 'guest'});

// register api at global
registerCallHandler('getUsers', handle);

// or register api at component
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

> `registerCallHandler` at host side and `createCall` at guest side is also allowed. Put them at the opposite sides and it will work.

### Further

Lifecycles like `onResolve` are not implemented yet since I think it may not be necessary. If you have some common issue and you want it be implemented in `iframe-interface`, please open an issue.
