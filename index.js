const token = '5998330146:AAHx-agp1PAkYJtHTZmijjsrhnOeMPWg0e4'
var TelegramBot = require('node-telegram-bot-api');
const express = require('express')
const cors = require('cors');
const { json } = require('express');
const wepAppUrl = 'https://master--ubiquitous-pony-af278a.netlify.app' 

var bot = new TelegramBot(token, {polling: true});
const app = express()

app.use(cors())
app.use(express.json())

 
bot.on('message', async (msg) =>  {
  var chatId = msg.chat.id;
  const text = msg.text
  let isKeyboard = false
  if(text === '/menuKFC'){
    await bot.sendMessage(chatId, 'Ниже появится кнопка, заполни форму', {
        reply_markup: {
            inline_keyboard: [ 
                [{text: 'Заполните форму', web_app: {url: wepAppUrl}}]
            ]
        }
    })
    return 0
  }
  if(text === '/formForInfo'){
    await bot.sendMessage(chatId, 'Ниже появится кнопка, заполни форму', {
        reply_markup: {
            keyboard: [
                [{text: 'Заполните форму', web_app: {url: wepAppUrl + '/form'}}]
            ]
        }
    })
    return 0
  }
  if(msg?.web_app_data?.data){
    try {
      const data = JSON.parse(msg?.web_app_data?.data)
      await bot.sendMessage(chatId, 'Спасибо за обратную связь!')
      await bot.sendMessage(chatId, `Ваша страна: ${data?.country}`)
      await bot.sendMessage(chatId, `Ваша улица: ${data?.street}`)
      setTimeout(async ()=>{
        await bot.sendMessage(chatId, `Все ваши данные, с любовью, КФС`)
      }, 3000)
    } catch (error) {
      console.log(error)
    }
    return 0
  }
  else bot.sendMessage(chatId, 'Я тебя не понимаю');
});

const PORT = 8000

app.listen(PORT, ()=> {
  console.log(`server started ${PORT}`)
})

app.post('/web-data',async (req, res) => {
  const {queryId, products, totalPrice} = req.body
  try {
    await bot.answerWebAppQuery(queryId, {
      type: 'article',
      id: queryId, 
      title: 'Успешная покупка ожидайте кассу',
      input_message_content: {message_text: 'Поздравляю, вы совершили покупку на чек' + totalPrice + 'руб.'}
    })
    res.status(200).json({})
  } catch (error) { 
    console.log(error)
    await bot.answerWebAppQuery(queryId, {
      type: 'article',
      id: queryId, 
      title: 'Не удалось приобрести товар',
      input_message_content: {message_text: 'Не удалось приобрести товар'}
    })
    res.status(500).json({})
  }
})