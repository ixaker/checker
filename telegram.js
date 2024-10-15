const axios = require('axios');

// const token = '7898080039:AAG2H-NisHJFQt2eLrNR6s0vwCo0pDlWj44';
// const chatId = '-1002437955649';
const token = process.env.BOTTOKEN || '';
const chatId = process.env.CHATID || '';

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

module.exports = { sendTelegramMessage, editTelegramMessage };
