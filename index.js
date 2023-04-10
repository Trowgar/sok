const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const cors = require('cors');

const token = '';
const clientUrl = ''

const bot = new TelegramBot(token, {polling: true});
const app = express();

app.use(express.json());
app.use(cors());

bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    if(text === '/start') {
        await bot.sendMessage(chatId, 'Please fill the form bellow', {
            reply_markup: {
                keyboard: [
                    [{text: 'Fill the form', web_app: {url: clientUrl + '/form'}}]
                ]
            }
        })

        await bot.sendMessage(chatId, 'Click the button to visit our store', {
            reply_markup: {
                inline_keyboard: [
                    [{text: 'Make Order', web_app: {url: clientUrl}}]
                ]
            }
        })
    }

    if(msg?.web_app_data?.data) {
        try {
            const data = JSON.parse(msg?.web_app_data?.data)
            console.log(data)
            await bot.sendMessage(chatId, 'Thank you!')
            await bot.sendMessage(chatId, 'You Country: ' + data?.country);
            await bot.sendMessage(chatId, 'Your Address: ' + data?.street);

            setTimeout(async () => {
                await bot.sendMessage(chatId, 'All Information you will get in this chat');
            }, 3000)
        } catch (e) {
            console.log(e);
        }
    }
});

app.post('/web-data', async (req, res) => {
    const {queryId, products = [], totalPrice} = req.body;
    try {
        await bot.answerWebAppQuery(queryId, {
            type: 'article',
            id: queryId,
            title: 'Successful Purchase',
            input_message_content: {
                message_text: ` Thank you for order, price is ${totalPrice}, ${products.map(item => item.title).join(', ')}`
            }
        })
        return res.status(200).json({});
    } catch (e) {
        return res.status(500).json({})
    }
})

const PORT = 8000;

app.listen(PORT, () => console.log('server started on PORT ' + PORT))
