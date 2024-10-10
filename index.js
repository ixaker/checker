require('dotenv').config();
const express = require('express');
const axios = require('axios');
const app = express();
const port = 3000;

const token = '7898080039:AAG2H-NisHJFQt2eLrNR6s0vwCo0pDlWj44';
const chatId = '-1002437955649';
const interval = process.env.INTERVAL || 10000;
const source = process.env.SOURCE || 'Unknown Source';
let message = '';
let oldMessage = '';

let initialMessageId;
let servicesState = {}

const services = [
    { name: 'Monitoring Service', url: 'https://monitoring.qpart.com.ua/' },
    { name: 'Qpart client', url: 'https://wss.qpart.com.ua' },
    { name: 'Test Qpart client', url: 'https://test.qpart.com.ua' },
];

const sendTelegramMessage = async (message) => {
    const url = `https://api.telegram.org/bot${token}/sendMessage`;
    const response = await axios.post(url, {
        chat_id: chatId,
        text: message,
    });
    return response.data.result.message_id;
};

const editTelegramMessage = async (message, messageId) => {
    const url = `https://api.telegram.org/bot${token}/editMessageText`;
    await axios.post(url, {
        chat_id: chatId,
        message_id: messageId,
        text: message,
    });
};

const checkServices = async () => {
    const results = await Promise.all(
        services.map(async (service) => {
            try {
                const response = await axios.get(service.url);
                if (response.status === 200) {
                    return { name: service.name, available: true };
                } else {
                    return { name: service.name, available: false };
                }
            } catch (error) {
                return { name: service.name, available: false };
                console.log('виникла помилка не було відповідід сервера')
            }
        })
    );
    return results;
};


const checkResult = async (results) => {
    let hasError = false;
    for (const result of results) {
        if (!result.available) {
            hasError = true;

            message = `⚠️ Сервіс "${result.name}" не працює.`;
            if (servicesState[result.name]) {
                await sendTelegramMessage(message);
            }
            servicesState[result.name] = result.available;
        }
    }
    if (hasError) {
        message = createMessage(results);
        initialMessageId = await sendTelegramMessage(message);
    }
};

const createMessage = (results) => {
    const currentTime = new Date().toLocaleString('uk-UA', { hour12: false });
    let message = `Остання перевірка від ${source} ${currentTime}\n`;

    results.forEach(result => {
        const status = result.available ? 'працює' : 'не працює';
        const icon = result.available ? '✅' : '⚠️';
        message += `${icon} ${result.name} - ${status}\n`;
    });

    return message;
};

const initialMessage = async () => {
    initialMessageId = await sendTelegramMessage(`Чекер на комп'ютері ${source} запущений`);
    console.log('initialMessageId:', initialMessageId);

    const results = await checkServices();
    await checkResult(results);
    oldMessage = message;
    message = createMessage(results);
    if (message !== oldMessage) {
        await editTelegramMessage(message, initialMessageId);
    }
    setInterval(async () => {
        const results = await checkServices();
        await checkResult(results);
        oldMessage = message;
        message = createMessage(results);
        if (message !== oldMessage) {
            await editTelegramMessage(message, initialMessageId);
        }
        console.log(message)
    }, interval);
};

initialMessage()
    .catch((err) => {
        // console.error('Error in initialMessage:', err);
    });

app.listen(port, () => {
    // console.log(`Monitoring service running at http://localhost:${port}`);
});
