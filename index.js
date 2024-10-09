require('dotenv').config();
const express = require('express');
const axios = require('axios');
const app = express();
const port = 3000;

const token = '7898080039:AAG2H-NisHJFQt2eLrNR6s0vwCo0pDlWj44';
const chatId = '-1002437955649';
const interval = process.env.INTERVAL || 6000;
const source = process.env.SOURCE || 'Unknown Source';


const services = [
    { name: 'Monitoring Service', url: 'https://monitoring.qpart.com.ua/' },
    { name: 'Qpart client', url: 'https://wss.qpart.com.ua' },
];

const sendTelegramMessage = async (message) => {
    const url = `https://api.telegram.org/bot${token}/sendMessage`;
    await axios.post(url, {
        chat_id: chatId,
        text: message,
    });
};

const checkService = async (service) => {
    try {
        const response = await axios.get(service.url);
        if (response.status === 200) {
            const successMessage = `✅ Сервіс "${service.name}" доступний: ${service.url}\nДжерело: ${source}`;
            console.log(successMessage);
            await sendTelegramMessage(successMessage);
        } else {
            const errorMessage = `⚠️ Сервіс "${service.name}" недоступний: ${service.url}\nДжерело: ${source}`;
            console.log(errorMessage);
            await sendTelegramMessage(errorMessage);
        }
    } catch (error) {
        const errorMessage = `⚠️ Сервіс "${service.name}" недоступний: ${service.url}\nПричина: ${error.message}\nДжерело: ${source}`;
        console.log(errorMessage);
        await sendTelegramMessage(errorMessage);
    }
};

const monitorServices = () => {
    services.forEach((service) => {
        checkService(service);
    });
};

setInterval(monitorServices, interval);

app.listen(port, () => {
    console.log(`Monitoring service running at http://localhost:${port}`);
});
