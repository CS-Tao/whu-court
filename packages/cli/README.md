[![CD for whu-court](https://github.com/CS-Tao/whu-court/actions/workflows/cd.yml/badge.svg)](https://github.com/CS-Tao/whu-court/actions/workflows/cd.yml)
[![Join the chat at github discussion](https://img.shields.io/badge/💬-github-%23016bb6.svg)](https://github.com/CS-Tao/whu-court/discussions/18)
[![Open the announcement](https://img.shields.io/badge/📢-github-%2300a851.svg)](https://github.com/CS-Tao/whu-court/discussions/categories/announcements)
[![oclif](https://img.shields.io/badge/🚀-oclif-%23016bb6.svg)](https://oclif.io)
[![license](https://img.shields.io/badge/⚖️-none-%2300a851.svg)](#-版权声明)

🏸 场地预约助手 CLI
=================

![logo.png](https://github.com/CS-Tao/github-content/raw/master/contents/github/whu-court/logo1.png)

# 📗 使用方法

```sh-session
$ npm install -g @whu-court/cli

$ wcr COMMAND
run a command...

$ wcr -v
show version info...

$ wcr -h
show help...
```

# ⌨️ 命令集
* [`wcr run`](#wcr-run)
* [`wcr setup`](#wcr-setup)
* [`wcr login`](#wcr-login)
* [`wcr logout`](#wcr-logout)
* [`wcr check`](#wcr-check)
* [`wcr config [CONFIGNAME] [CONFIGVALUE]`](#wcr-config-configname-configvalue)
* [`wcr reset`](#wcr-reset)
* [`wcr announcement`](#wcr-announcement)
* [`wcr feedback`](#wcr-feedback)
* [`wcr help [COMMAND]`](#wcr-help-command)

## `wcr run`

Run app to reserve.

```
USAGE
  $ wcr run [-y] [-o <value>] [--today]

FLAGS
  -o, --open-time=<value>  Court system open time. e.g. "18:00:00" | "now"
  --today                  Reserve for today

DESCRIPTION
  Run app to reserve.

EXAMPLES
  $ wcr run
```

## `wcr setup`

Setup app.

```
USAGE
  $ wcr setup [-t <value>] [-c]

FLAGS
  -c, --clear-token           clear github auth
  -t, --github-token=<value>  GitHub token

DESCRIPTION
  Setup app.

EXAMPLES
  $ wcr setup

  $ wcr setup --github-token=<value>

  $ wcr setup --clear-token
```

## `wcr login`

Login to court.

```
USAGE
  $ wcr login [-t <value>] [-s <value>] [-u <value>]

FLAGS
  -s, --sid=<value>         Court session id
  -t, --token=<value>       Court token
  -u, --user-agent=<value>  Court user agent

DESCRIPTION
  Login to court.

EXAMPLES
  $ wcr login

  $ wcr login --token=<value> --sid=<value>
```

## `wcr logout`

Logout from court.

```
USAGE
  $ wcr logout

DESCRIPTION
  Logout from court.

EXAMPLES
  $ wcr logout
```

## `wcr check`

Check login status.

```
USAGE
  $ wcr check [-s]

FLAGS
  -s, --show  show current token and session id in plain text

DESCRIPTION
  Check login status.

EXAMPLES
  $ wcr check
```

## `wcr config [CONFIGNAME] [CONFIGVALUE]`

Manage court configs.

```
USAGE
  $ wcr config [CONFIGNAME] [CONFIGVALUE] [-l] [-r]

ARGUMENTS
  CONFIGNAME   config name
  CONFIGVALUE  config value

FLAGS
  -l, --list   show list
  -r, --reset  reset configs

DESCRIPTION
  Manage court configs.

EXAMPLES
  $ wcr config -l

  $ wcr config time

  $ wcr config time 15-17,18-21,!8-12
```

## `wcr reset`

Reset app.

```
USAGE
  $ wcr reset

DESCRIPTION
  Reset app.

EXAMPLES
  $ wcr reset
```

## `wcr announcement`

Open app announcements.

```
USAGE
  $ wcr announcement [-n]

FLAGS
  -n, --no-open  Do not open the announcements page

DESCRIPTION
  Open app announcements.

EXAMPLES
  $ wcr announcement
```

## `wcr feedback`

Feedback for wcr.

```
USAGE
  $ wcr feedback [-n]

FLAGS
  -n, --no-open  Do not open the feedback page

DESCRIPTION
  Feedback for wcr.

EXAMPLES
  $ wcr feedback
```

## `wcr help [COMMAND]`

Display help for wcr.

```
USAGE
  $ wcr help [COMMAND] [-n]

ARGUMENTS
  COMMAND  Command to show help for.

FLAGS
  -n, --nested-commands  Include all nested commands in the output.

DESCRIPTION
  Display help for wcr.
```

# 📑 版权声明

本软件开源，但没有向开发者提供任何源码`许可证`，作者本人保留源代码的所有权利，任何组织和个人不得将本软件或源码用于商业活动

# ⚖️ 免责声明

本软件和软件源代码仅用于学习研究和技术交流，使用本软件或软件源代码造成的任何不良影响由使用者自行承担，与软件开发人员无关
