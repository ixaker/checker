const axios = require('axios');

let servicesState = {};

const checkServices = async (services) => {
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

module.exports = { checkServices, checkResult };
