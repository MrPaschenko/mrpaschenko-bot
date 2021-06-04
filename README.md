# mrpaschenko-bot

[Simple telegram bot](https://t.me/MrPaschenko_bot)  
[Доступна русская версия](https://github.com/MrPaschenko/mrpaschenko-bot/blob/master/README-RU.md)

## Setup

### 1. Install all necessary modules via npm:
```bash
$ npm install
```

### 2. Set up a configuration file
Configuration file should be named as `.env`, example is named as `.env.example`

### 3. Start: 
```bash
$ node bot.js
```
or
```bash
$ npm start
```

## Commands:

### Request to [Wolfram|Alpha](https://www.wolframalpha.com/) with simple answer
```
/wa <request>
```

### Same but full answer with picture
```
/wa_full <request>
```

### Word definition from [Urban Dictionary](https://www.urbandictionary.com/)
```
/ud <request>
```

### Word definition from [Oxford Dictionary](https://www.oxfordlearnersdictionaries.com/)
```
/od <request>
```

### Pronunciation from [Oxford Dictionary](https://www.oxfordlearnersdictionaries.com/
```
/od_audio <request>
```

_You can also make a request by replying to other message_
