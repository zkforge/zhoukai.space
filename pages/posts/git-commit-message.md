---
title: "Git Commit Message 开发规范"
date: 2025-06-14T20:20:00.00+08:00
lang: zh
draft: false
description: "本文为 AngularJS Git Commit Message 规范的中文翻译"
---

[[toc]]

> AngularJS Git Commit Message 规范

## **目标**

- 允许通过脚本生成 CHANGELOG.md
- 允许在 git bisect 时忽略某些提交（如格式化等不重要的提交）
- 在浏览历史时提供更好的信息

## **生成 CHANGELOG.md**

我们在 changelog 中使用这三个部分：**Features**、**Bug Fixes**、**BREAKING CHANGES**。  
这个列表可以在发布时通过脚本生成，同时包含相关提交的链接。  
当然，你可以在实际发布前编辑这个变更日志，但它可以生成基本框架。

自上次发布以来的所有变动（提交信息的第一行）列表：

```
git log \<last tag\> HEAD \--pretty=format:%s
```

本次发布的新功能：

```
git log \<last release\> HEAD \--grep feature
```

## **识别不重要的提交**

这些是格式化更改（添加/删除空格/空行、缩进）、缺少分号、注释等。所以当你在寻找某些更改时，可以忽略这些提交 - 这些提交中没有逻辑更改。

在 bisect 时，你可以通过以下方式忽略这些提交：

```
git bisect skip $(git rev-list \--grep irrelevant \<good place\> HEAD)
```

## **在浏览历史时提供更多信息**

这将添加某种"上下文"信息。  
看看这些消息（取自最近几个 angular 的提交）：

- [Fix small typo in docs widget (tutorial instructions)](https://github.com/angular/angular.js/commit/f370be85cb680a7cac7a23999a865b9c9e731238)
- [Fix test for scenario.Application \- should remove old iframe](https://github.com/angular/angular.js/commit/7460a7ef618a274607ea99aecae99fb158115c36)
- [docs \- various doc fixes](https://github.com/angular/angular.js/commit/3c87611188fc1612fe5d07e245a992b25146f2bf)
- [docs \- stripping extra new lines](https://github.com/angular/angular.js/commit/b842642b574a2b95c53b791308ed1bf8ff9d304d)
- [Replaced double line break with single when text is fetched from Google](https://github.com/angular/angular.js/commit/d428c9910e66246c2af46602499acaeaf187d75b)
- [Added support for properties in documentation](https://github.com/angular/angular.js/commit/f9f95879f08073ce1170a471a925541324a0ff23)

所有这些消息都试图指定更改的位置。但它们没有遵循任何约定...

看看这些消息：

- [fix comment stripping](https://github.com/angular/angular.js/commit/a4dd9ca769c62cf5f65fadc8da0d23d865116046)
- [fixing broken links](https://github.com/angular/angular.js/commit/924ffafc51cf53ddf97f13ad748bbbf6d80caf13)
- [Bit of refactoring](https://github.com/angular/angular.js/commit/7fe46e8d7e35c21167932c57b4ed53171164d1e2)
- [Check whether links do exist and throw exception](https://github.com/angular/angular.js/commit/2e0e732cadd86846b57b7b02b3303a2e0e3b842a)
- [Fix sitemap include (to work on case sensitive linux)](https://github.com/angular/angular.js/commit/22f9354c211b032c3da3c8e1320a3fa1106e3ffd)

你能猜到里面是什么吗？这些消息缺少位置说明...  
所以也许应该像代码的部分：**docs**、**docs-parser**、**compiler**、**scenario-runner** 等...

我知道，你可以通过检查哪些文件被更改来找到这些信息，但那很慢。当查看 git 历史时，我看到我们都在试图指定位置，只是缺少约定。

## **提交信息的格式**

**\<type\>(\<scope\>): \<subject\>**  
**\<空一行\>**  
**\<body\>**  
**\<空一行\>**  
**\<footer\>**

提交信息的任何一行都不能超过 **100 个字符**！这使得消息在 github 和各种 git 工具中更容易阅读。

提交信息由头部、正文和页脚组成，用空行分隔。

## **回退提交**

如果提交回退了之前的提交，其头部应该以 `revert:` 开头，后跟被回退提交的头部。在正文中应该说明：`This reverts commit <hash>.`，其中 hash 是被回退提交的 SHA。

## **消息头部**

消息头部是包含更改的简洁描述的单行，包含 **type**、可选的 **scope** 和 **subject**。

### **允许的 type**

这描述了此提交提供的更改类型。

- **feat** (feature：新功能)
- **fix** (bug fix：修补bug)
- **docs** (documentation：文档)
- **style** (formatting, missing semi colons, …：格式)
- **refactor** (重构：既不是新增功能，也不是修改bug的代码变动)
- **test** (when adding missing tests：增加测试)
- **chore** (maintain：构建过程或辅助工具的变动)

### **允许的 scope**

Scope 可以是任何指定提交更改位置的标识。例如 **$location**、**$browser**、**$compile**、**$rootScope**、**ngHref**、**ngClick**、**ngView** 等...

如果没有更合适的 scope，可以使用 `*`。

### **subject 文本**

这是对更改的简短描述。

- 使用祈使句，现在时态："change" 而不是 "changed" 或 "changes"
- 不要大写第一个字母
- 结尾不要加句点 (.)

## **消息正文**

- 与 subject 一样使用祈使句，现在时态："change" 而不是 "changed" 或 "changes"
- 包括更改的动机和与之前行为的对比

[http://365git.tumblr.com/post/3308646748/writing-git-commit-messages](http://365git.tumblr.com/post/3308646748/writing-git-commit-messages)  
[http://tbaggery.com/2008/04/19/a-note-about-git-commit-messages.html](http://tbaggery.com/2008/04/19/a-note-about-git-commit-messages.html)

## **消息页脚**

### **破坏性更改**

所有破坏性更改都必须在页脚中作为破坏性更改块提及，该块应以单词 BREAKING CHANGE: 开头，后跟空格或两个换行符。然后提交消息的其余部分是更改的描述、理由和迁移说明。

```
BREAKING CHANGE: isolate scope bindings definition has changed and
    the inject option for the directive controller injection was removed.

    To migrate the code follow the example below:

    Before:

    scope: {
      myAttr: 'attribute',
      myBind: 'bind',
      myExpression: 'expression',
      myEval: 'evaluate',
      myAccessor: 'accessor'
    }

    After:

    scope: {
      myAttr: '@',
      myBind: '@',
      myExpression: '&',
      // myEval \- usually not useful, but in cases where the expression is assignable, you can use '='
      myAccessor: '=' // in directive's template change myAccessor() to myAccessor
    }

    The removed \`inject\` wasn't generaly useful for directives so there should be no code using it.
```

### **引用问题**

已关闭的 bug 应该在页脚中单独一行列出，以 "Closes" 关键字为前缀，如下所示：

Closes \#234

或者在多个问题的情况下：

Closes \#123, \#245, \#992

## **示例**

---

```
feat($browser): onUrlChange event (popstate/hashchange/polling)

Added new event to $browser:
\- forward popstate event if available
\- forward hashchange event if popstate not available
\- do polling when neither popstate nor hashchange available

Breaks $browser.onHashChange, which was removed (use onUrlChange instead)
```

---

```
fix($compile): couple of unit tests for IE9

Older IEs serialize html uppercased, but IE9 does not...
Would be better to expect case insensitive, unfortunately jasmine does
not allow to user regexps for throw expectations.

Closes \#392
Breaks foo.bar api, foo.baz should be used instead
```

---

```
feat(directive): ng:disabled, ng:checked, ng:multiple, ng:readonly, ng:selected

New directives for proper binding these attributes in older browsers (IE).
Added coresponding description, live examples and e2e tests.

Closes \#351
```

---

```
style($location): add couple of missing semi colons
```

---

```
docs(guide): updated fixed docs from Google Docs

Couple of typos fixed:
\- indentation
\- batchLogbatchLog \-\> batchLog
\- start periodic checking
\- missing brace
```

---

```
feat($compile): simplify isolate scope bindings

Changed the isolate scope binding options to:
  \- @attr \- attribute binding (including interpolation)
  \- \=model \- by-directional model binding
  \- \&expr \- expression execution binding

This change simplifies the terminology as well as
number of choices available to the developer. It
also supports local name aliasing from the parent.

BREAKING CHANGE: isolate scope bindings definition has changed and
the inject option for the directive controller injection was removed.

To migrate the code follow the example below:

Before:

scope: {
  myAttr: 'attribute',
  myBind: 'bind',
  myExpression: 'expression',
  myEval: 'evaluate',
  myAccessor: 'accessor'
}

After:

scope: {
  myAttr: '@',
  myBind: '@',
  myExpression: '&',
  // myEval \- usually not useful, but in cases where the expression is assignable, you can use '='
  myAccessor: '=' // in directive's template change myAccessor() to myAccessor
}

The removed \`inject\` wasn't generaly useful for directives so there should be no code using it.
```
