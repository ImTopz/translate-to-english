# translate-to-english

A Claude Code mod: before your message reaches Opus or Fable, Haiku translates it into English. When you wrote in Chinese, Claude is also asked to reply in Simplified Chinese, so you still read the answer in your own language.

## Install

At the prompt of a Claude Code terminal session:

```
/plugin install translate-to-english --marketplace ImTopz/translate-to-english
```

Answer `y` to add the marketplace, then choose a scope (Enter picks the user scope).

From a shell:

```
claude plugin install translate-to-english --marketplace ImTopz/translate-to-english
```

In the desktop app, where `/plugin` does not run: click + next to the prompt box, then Plugins, Add marketplace with `ImTopz/translate-to-english`, then Add plugin.

## What it does

- When the main model is Opus or Fable, a message with non-Latin text (Chinese, Japanese, Korean, ...) is translated into English by Haiku before it is sent. Plain English messages, Sonnet and Haiku sessions, slash commands and background notifications are left alone.
- Code, file paths, commands, logs and quoted literal values (search keywords, UI strings) are kept as written.
- A Chinese message also carries a hidden note asking for the reply in Simplified Chinese.
- If Haiku fails, times out or returns something odd, or the message is longer than 4,000 characters, the original is sent and a notice says why.
- `/translate off` sends messages as typed, `/translate on` turns translation back on, and `/translate` toggles it. Each new session starts with it on.

Its notices and the `/translate` output are in Chinese.

## 中文说明

Claude Code mod：消息发给 Opus / Fable 之前，先由 Haiku 翻译成英文。如果你用中文写，还会附带一句隐藏说明，让 Claude 用简体中文回复。

- 主模型是 Opus 或 Fable、并且消息里有中文（或日文、韩文等非拉丁文字）时才翻译；纯英文消息、Sonnet / Haiku 会话、斜杠命令、后台通知都不翻译。
- 代码、文件路径、命令、日志，以及引号里的固定内容（搜索关键词、界面文字）保持原样。
- 翻译失败、超时、结果异常，或消息超过 4000 字时，按原文发送，并提示原因。
- `/translate off` 关闭，`/translate on` 打开，只输 `/translate` 就是切换；每个新会话默认开启。

安装：在 Claude Code 终端会话里输入

```
/plugin install translate-to-english --marketplace ImTopz/translate-to-english
```

## Requirements

A Claude Code build with mods (function hooks), an early-access API that may change between releases. Built and tested on Claude Code 2.1.316 and 2.1.319.

Run the tests with `claude plugin test .` in this folder.
