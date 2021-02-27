# mrpaschenko-bot

[Простой телеграм бот](https://t.me/MrPaschenko_bot)  
[English version is available](https://github.com/MrPaschenko/mrpaschenko-bot/blob/master/README.md)

# Установка

### 1. Установи все нужные модули с помощью npm:
```bash
$ npm install package-lock.json
```
### 2. Настрой конфигурационный файл
Конфигурационный файл должен называться `.env`, пример называется `.env.example`
### 3. Запускай:
```bash
$ node bot.js
```
или
```bash
$ npm start
```

# Команды:

### Запрос в Wolfram|Alpha с простым ответом
```
/wa <request>
```

### То же самое, но с полным ответом картинкой
```
/wa_full <request>
```

### Определение слова от Urban Dictionary
```
/ud <request>
```
### Определение слова от Oxford Dictionary
```
/od <request>
```
### Произношение от Oxford Dictionary
```
/od_audio <request>
```

_Ты так же можешь выполнить запрос, отвечая командой на другое сообщениеe_
