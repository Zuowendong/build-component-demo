# rollup 插件开发记录

全文涉及到的知识点：

1. rollup的基础配置
2. 如何打包库
3. 打包ts类型文件
4. 联调本地开发的插件
5. 编写单元测试

## 初始化文件

初始化项目, 生成package.json

```shell
pnpm init
```

初始化ts配置文件, 生成tsconfig.json

```shell
npx tsc --init
```

新建src/index.ts，编写alias插件

安装 rollup `pnpm add rollup -D`

新建 rollup.config.js 配置文件, 使用`defineConfig`会有类型提示

## 打包ts

安装ts相关依赖

```shell
pnpm add @rollup/plugin-typescript typescript tslib -D
```

rollup.config.js中引入 @rollup/plugin-typescript 插件

package.json中添加打包指令

```json
"build": "rollup -c rollup.config.js"
```

## alias 插件

```js
import { Plugin } from "rollup";
interface AliasOptions {
 entries: {
  [k: string]: string;
 };
}
export function alias(options: AliasOptions): Plugin {
 const { entries } = options;
 return {
  name: "alias",
  resolveId(source: string, importer: string | undefined) {
   const key = Object.keys(entries).find((e) => {
    return source.startsWith(e);
   });
   if (!key) return;
   return source.replace(key, entries[key]) + ".js";
  },
 };
}
```

## 使用插件

新建一个example项目来测试插件

```shell
mkdir example
cd example
pnpm init
```

按照example中目录新建文件

还是基于rollup打包，安装rollup，配置rollup.config.js

## 联动调试插件

在example中使用外层项目中编写的插件，pnpm 可以轻松的实现

example下执行

```shell
pnpm add ../ -D
```

## 测试

插件项目下执行 pnpm build, example依赖的插件会自动更新。

example下执行 pnpm build，正常打包输出说明插件实现逻辑正确。

## 单元测试如何提高效率

alias插件需要满足的需求测试有以下几点：

1. alias 支持 对象格式配置，数组格式配置
2. 对象格式配置 正确错误两种 情况
3. 数组格式配置 正确错误两种 情况

想要验证这个alias插件是否满足需求，需要两边都要进行pnpm build，再查看执行结果

目前只是实现了对象格式配置正确情况的验证，想要满足所有测试，还需要至少三次的修改再打包

## 使用单元测试vitest

安装 `pnpm add vitest -D`, 新建 index.spec.ts

修改package.json中test指令，`"test": "vitest"`

单测中只关注逻辑，不在乎类型

```js
import { describe, it, expect } from "vitest";
import { alias } from ".";

describe("alias", () => {
  it("匹配成功时候应该被替换", () => {
   const aliasObj: any = alias({
    entries: {
     "@": "./utils",
     utils: "./utils",
    },
   });
   expect(aliasObj.resolveId("@/sum")).toBe("./utils/sum.js");
   expect(aliasObj.resolveId("utils/sum")).toBe("./utils/sum.js");
  });
})
```

## entries数组类型

简单的写法，就是判断 entries 的类型，对象和数组分别处理

但是两种类型的处理，都是处理匹配和替换，这一个逻辑是一样的，这里可以考虑重构，优化代码

**先统一传入过来参数的数据结构**：

```js
function normalizeEntries(entries: AliasOptions["entries"]) {
 if (Array.isArray(entries)) {
  return entries.map(({ find, replacement }) => {
   return new Entry(find, replacement);
  });
 } else {
  return Object.keys(entries).map((key) => {
   return new Entry(key, entries[key]);
  });
 }
}
```

抽离逻辑

```js
class Entry {
 constructor(private find: string, private replacement: string) {}
 match(filePath: string) {
  return filePath.startsWith(this.find);
 }
 replace(filePath: string) {
  return filePath.replace(this.find, this.replacement) + ".js";
 }
}
```

重构

```js
const entries = normalizeEntries(options.entries);
return {
  name: "alias",
  resolveId(source: string, importer: string | undefined) {
    const entry = entries.find((e) => {
    return e.match(source);
    });
    if (!entry) return source;
    return entry.replace(source);
  },
};
```

## 数组类型单测

```js
 describe("entries is array", () => {
  it("匹配成功时候应该被替换", () => {
   const aliasObj: any = alias({
    entries: [
     { find: "@", replacement: "./utils" },
     { find: "utils", replacement: "./utils" },
    ],
   });
   expect(aliasObj.resolveId("@/sum")).toBe("./utils/sum.js");
   expect(aliasObj.resolveId("utils/sum")).toBe("./utils/sum.js");
  });
  it("匹配失败时候应该直接返回source", () => {
   const aliasObj: any = alias({
    entries: [
     {
      find: "@",
      replacement: "./utils",
     },
    ],
   });
   expect(aliasObj.resolveId("!/sum")).toBe("!/sum");
  });
 });
  ```
