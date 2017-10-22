let express = require('express')
let bodyParser = require('body-parser')
let request = require('request')
let app = express()

const FACEBOOK_ACCESS_TOKEN = 'EAAUlOzuCwJEBAMCw4Nhj600tM5T2nnorbG2dRWcjoz7ZAHPx5osps8HmlY7c2bPk5w1BpQT9RjpB9Q5lRa2uYREbkuiUgyiEVz1jsl131jRdWS32m93OvfhFgstqW0kcSSNZCnUAqFoNahxQN44rcbhMbaatfemtfVxOoG4JKDZA2ASCGWzF3FJ7qWyyB8ZD' //置換自己的ＦＢ授權
const PORT = process.env.PORT || 3000
const VERIFY_TOKEN = 'chatbot-class-1021' //置換自己的token , 可自定義

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.listen(PORT, function () {
    console.log(`App listening on port ${PORT}!`)
})

// Facebook Webhook
app.get('/', function (req, res) {   // facebook 才需要get / 因為授權
    if (req.query['hub.verify_token'] === VERIFY_TOKEN) {
        //facebook find "/" and find line 8 verify token > https://fb-chatbotclass.herokuapp.com/?hub.verify_token=chatbot-class-1021
        res.send(req.query['hub.challenge']) 
        //https://fb-chatbotclass.herokuapp.com/?hub.verify_token=chatbot-class-1021&hub.challenge=123 如此網頁就會顯示123
    } else {
        res.send('Invalid verify token')
    }
})

// handler receiving messages
app.post('/', function (req, res) {
    let events = req.body.entry[0].messaging // 取得entry 第0項
    for (i = 0; i < events.length; i++) {
        let event = events[i]
        if (event.message) { // event 裡有message & texts 回傳
            if (event.message.text) {
                sendMessage(event.sender.id, { text: event.message.text }) // 執行send message  sender.id > 寄送人id 此處由ＦＢ取得的編號為亂數非使用者真正id
            }
        }
    }
    res.sendStatus(200)
})

// generic function sending messages
function sendMessage(recipientId, message) {
    let options = {
        url: 'https://graph.facebook.com/v2.6/me/messages',  //facebook graph api 回訊息的流程 我方>FB >對方
        // graph api 內驗證網址取得的資料
        qs: { access_token: FACEBOOK_ACCESS_TOKEN }, //line 6 token
        method: 'POST',
        json: { //回傳的訊息
            recipient: { id: recipientId },
            message: message,
        }
    }
    request(options, function (error, response, body) {  //此處是使用request 套件
        if (error) {
            console.log('Error sending message: ', error);
        }
        else if (response.body.error) {
            console.log('Error: ', response.body.error);
        }
    })
}
