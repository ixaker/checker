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
let hasStateChanged;
let initialMessageId;


const services = [
    { name: 'Monitoring Service', url: 'https://monitoring.qpart.com.ua/' },
    { name: 'Qpart client', url: 'https://wss.qpart.com.ua' },
    { name: 'Test Qpart client', url: 'https://test.qpart.com.ua' },
];

function initialServicesState(services) {
    const state = {};
    services.forEach(service => {
        state[service.name] = true;
    });
    return state;
}

let servicesState = initialServicesState(services);

const updateServicesState = (results) => {
    oldServicesState = { ...servicesState };
    results.forEach(result => {
        servicesState[result.name] = result.available;
    });
};

const sendTelegramMessage = async (message) => {
    const url = `https://api.telegram.org/bot${token}/sendMessage`;
    try {
        const response = await axios.post(url, {
            chat_id: chatId,
            text: message,
        });
        return response.data.result.message_id;
    } catch (error) {
        if (error.response && error.response.data.error_code === 429) {
            const retryAfter = error.response.data.parameters.retry_after;
            console.log(`Помилка 429: Затримка на ${retryAfter} секунд перед повтором...`);
            await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
            return sendTelegramMessage(message);
        } else {
            console.error('Помилка при відправці повідомлення:', error);
            throw error;
        }
    }
};

const editTelegramMessage = async (message, messageId) => {
    const url = `https://api.telegram.org/bot${token}/editMessageText`;
    try {
        await axios.post(url, {
            chat_id: chatId,
            message_id: messageId,
            text: message,
        });
    } catch (error) {
        if (error.response && error.response.data.error_code === 429) {
            const retryAfter = error.response.data.parameters.retry_after;
            console.log(`Помилка 429: Затримка на ${retryAfter} секунд перед повтором...`);
            await new Promise(resolve => setTimeout(resolve, retryAfter * 1000)); // Затримка
            // Повторний запит
            return editTelegramMessage(message, messageId);
        } else {
            console.error('Помилка при редагуванні повідомлення:', error);
            throw error; // Пробросити інші помилки
        }
    }
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

let oldServicesState = { ...servicesState };

const isServiceChanged = (name) => {
    return oldServicesState[name] !== servicesState[name];
};
const checkResult = async (results) => {

    let hasError = false;
    for (const result of results) {
        console.log('перевіряємо сервіс', result.name);
        if (isServiceChanged(result.name)) {
            message = result.available ? `✅ Сервіс "${result.name}" відновився.` : `⚠️ Сервіс "${result.name}" не працює. 🔴❗❌`;
            await sendTelegramMessage(message);
        }

    }
    if (hasStateChanged) {
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
    console.log('ініціалізуємо перше повідомлення')
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
        console.log('перевіряємо сервіси новий цикл')
        const results = await checkServices();
        updateServicesState(results);
        hasStateChanged = JSON.stringify(oldServicesState) !== JSON.stringify(servicesState);
        await checkResult(results);
        oldMessage = message;
        message = createMessage(results);
        if (message !== oldMessage) {
            console.log('оновлюємо повідомлення періодичного сканування')
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
