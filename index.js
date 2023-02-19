const token = '5998330146:AAHx-agp1PAkYJtHTZmijjsrhnOeMPWg0e4'
const db = require('./db')
var TelegramBot = require('node-telegram-bot-api');
const multer = require('multer');
const express = require('express')
const cors = require('cors');
const { json } = require('express');
const imageRoutes = require('./routes/images')
const prodRoutes = require('./routes/prod');
const controllerImages = require('./controllers/controller.images');

const wepAppUrl = 'https://master--ubiquitous-pony-af278a.netlify.app'
var bot = new TelegramBot(token, {polling: true});

bot.setMyCommands([
  {command: '/start', description: "Начать работу с ботом"},
  {command: '/menu_kfc', description: "Заказать блюдо из меню 1 этап"},
  {command: '/form_for_order', description: "Заказать блюдо из меню 2 этап"},
  {command: '/admin_roots', description: "Тс-с-с тут можно попробовать себя в роли админа"}
])

const cbQuery = async msg =>{
  var chatId = msg.message.chat.id;
  if(msg.data == 'makeProd'){
    await bot.sendMessage(chatId, `Перейдите по форме и пройдите 1 этап создания вашего неповторимого Знаменского бургера`, {
      reply_markup: {
          keyboard: [ 
              [{text: 'Создание бургера 1 шаг', web_app: {url: wepAppUrl + '/makeBurg'}}]
          ]
      } 
  }).then(data=>{
      bot.on('web_app_data', data => {
        if(data?.web_app_data?.data){
          const inf = JSON.parse(data?.web_app_data?.data)
          bot.sendMessage(chatId, `Название вашего бургера: ${inf.data.title}, ваша цена: ${inf.data.price}`)
          setTimeout(()=>{
            bot.sendMessage(chatId, 'Теперь 2 шаг. Если мы оставим ваше блюдо в меню, как вас подписать?').then(data => {
              bot.on('message',data=> {
                db.query('update products set description = $1 where prod_id = $2 returning *', [data.text, inf.data.prod_id]).then(data => {
                  bot.sendMessage(chatId, 
`Закончили! Ваш личный бургер отправлен на верификацию администрации ресторана!
<b>Бургер:</b>
<b>Личный индетификтатор</b>: ${data.rows[0].prod_id}
<b>Название</b>: ${data.rows[0].title}
<b>Цена</b>: ${data.rows[0].price}
<b>Автор</b>: ${data.rows[0].description}`, {parse_mode: 'HTML'})
                  bot.removeAllListeners('message')
                  bot.removeAllListeners('web_app_data')
                })
              })
            })
          }, 2000)
        }
      })
    })

  }
  if(msg.data == 'deleteProd'){
    await bot.sendMessage(chatId, 'Введите название продукта для удаления. P.S. Сначала ваша заявку будет передана администрации на рассмотрение').then(data=> {
      bot.on('message', data => {
        const title = data.text
        db.query('delete from products where title = $1 returning *', [title]).then(async data=>{
          db.query('select * from products').then(data=>console.log(data.rows))
          if(!data.rows[0]){ 
            await bot.sendMessage(chatId, 'Такого блюда нет:(')
            bot.removeAllListeners('message')
          }
          else {
            await bot.sendMessage(chatId, `<b>Вы удалили блюдо</b>: 
<b>Личный индетификтатор</b>: ${data.rows[0].prod_id}
<b>Название</b>: ${data.rows[0].title}
<b>Цена</b>: ${data.rows[0].price}
<b>Автор</b>: ${data.rows[0].description}`, {parse_mode: 'HTML'})
bot.removeAllListeners('message')
          }
        }).catch(e => console.log(e))
      })
    })
  }
  if(msg.data == 'getProd'){
    bot.sendMessage(chatId, 'Введите название блюда, характеристику, которого вы хотите увидеть').then(data=>{
      bot.on('message', data=>{
        const title = data.text
        db.query('select * from products where title = $1', [title]).then(data=>{
          if(data.rows[0]){
            bot.sendMessage(chatId, `<b>Ваше Блюдо</b>: 
<b>Личный индетификтатор</b>: ${data.rows[0].prod_id}
<b>Название</b>: ${data.rows[0].title}
<b>Цена</b>: ${data.rows[0].price}
<b>Автор</b>: ${data.rows[0].description}`, {parse_mode: 'HTML'})
            bot.removeAllListeners('message')
          }
          else {
            bot.sendMessage(chatId, 'Такого не существует:(')
            bot.removeAllListeners('message')
          }
        })
      })
    })
  }
}

bot.on('callback_query', cbQuery)
 
bot.on('message', async (msg) =>  {
  var chatId = msg.chat.id;
  const text = msg.text
  let isKeyboard = false
  if(text ==='/start'){
    await bot.sendMessage(chatId, `Здравствуйте, вы в официальном телеграм-боте <b>KFC Знаменска!</b> Здесь вы можете сделать заказ и кое-что еще (загляни в меню хи-хи)`, {parse_mode: 'HTML'})
    await bot.sendMessage(chatId, `<b>Список комманд:</b> 
/start - начни работу со мной и узнай, что я умею
/menu_kfc - 1 этап для совершения заказа. Здесь можно выбрать блюда в меню
/form_for_order - 2 этап для совершения заказа. Тут я определяю твой столик и получаю всю нужную информацию о госте
/admin_roots - хи-хи
`, {parse_mode: 'HTML'})
  }
  if(text === '/menu_kfc'){
    await bot.sendMessage(chatId, 'Ниже появится кнопка, заполни форму', {
        reply_markup: {
            inline_keyboard: [ 
                [{text: 'Заполните форму', web_app: {url: wepAppUrl}}]
            ]
        }
    })
    return 0
  }
  if(text === '/form_for_order'){
    await bot.sendMessage(chatId, 'Ниже появится кнопка, заполни форму', {
        reply_markup: {
            keyboard: [
                [{text: 'Заполните форму', web_app: {url: wepAppUrl + '/form'}}]
            ]
        }
    })
    return 0
  }
  if(text === '/admin_roots'){
    await bot.sendMessage(chatId, 'Вы можете опробовать эти комманды:', {
      reply_markup: {
          inline_keyboard: [ 
                [{text: 'Создание товара', callback_data: 'makeProd'}],
                [{text: 'Удаление товара', callback_data: 'deleteProd'}],
                [{text: `Получение в текстовом виде нашего продукта по его наименованию`, callback_data: 'getProd'}]
          ]  
        }
      }
    )
    return 0
  }
  if(msg?.web_app_data?.data.includes('country')){
    try {
      const data = JSON.parse(msg?.web_app_data?.data)
      await bot.sendMessage(chatId, 'Спасибо за заказ!')
      await bot.sendMessage(chatId, `Ваша фамилия: ${data?.last_name}`)
      await bot.sendMessage(chatId, `Ваш столик: ${data?.table}`)
      await bot.sendMessage(chatId, `Номер ресторана: ${data?.restourant}`)
      await bot.sendMessage(chatId, `Страна: ${data?.country}`)
      await bot.sendMessage(chatId, `Улица и дом: ${data?.street} д. ${data?.num_house}`)
      setTimeout(async ()=>{
        await bot.sendMessage(chatId, `Ожидайте ваш заказ, с любовью, КФС`)
      }, 3000)
    } catch (error) {
      console.log(error)
    }
  }
});



/////// server, i dont want to decompose bot and server to different
////// files. but optimization is dead


const PORT = 8000



const app = express()
app.use(cors())
app.use(express.json())
app.use('/images', imageRoutes)
app.use('/prod', prodRoutes)


// idk where this route must be, to do single
// contr and route for - kill my time

app.post('/web-data', async (req, res) => {
  const {queryId, products, totalPrice} = req.body
  try {
    await bot.answerWebAppQuery(queryId, {
      type: 'article',
      id: queryId,
      title: 'Успешная покупка',
      input_message_content: {
          message_text: ` Поздравляю с покупкой, вы приобрели товар на сумму ${totalPrice}, ${products.map(item => item.title).join(', ')}`
      }
  })
    res.status(200).json({})
  } catch (error) { 
    console.log(error)
    res.status(500).json({})
  }
})

app.listen(PORT, ()=> {
  console.log(`server started ${PORT}`)
})