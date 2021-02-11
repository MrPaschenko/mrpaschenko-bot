# MrPaschenko bot
[Simple telegram bot](https://t.me/MrPaschenko_bot).
***
## Setup
### Install all necessary modules via npm: 
```bash
$ npm install package-lock.json
```
###Making a configuration file
Configuration file should be located at `config` folder and named as `default.json`:
```
{
  "token" : "<telegram-bot>",
  "wolfram" : "<wolfram-api>"
}

```
### Starting script: 
```bash
$ node bot.js
```
***
## Commands:
### Request to Wolfram|Alpha with simple answer
```
/wa <request>
```
***
### Same but full answer with picture
```
/wa_full <request>
```
***
### Word definition from Urban Dictionary
```
/ud <request>
```
_You can also reply to message to make a request with its content_
