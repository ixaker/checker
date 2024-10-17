require('dotenv').config();
const express = require('express');
const { sendTelegramMessage, editTelegramMessage } = require('./telegram');
const { checkServices } = require('./services');
const { loadConfig, saveConfig } = require('./config');
const { createMessage } = require('./utils');

const axios = require('axios');
const fs = require('fs');
const path = require('path');
const app = express();
const port = 3000;

app.use(express.json());

const source = process.env.SOURCE || 'Unknown Source';
let message = '';
let oldMessage = '';
let hasStateChanged;
let initialMessageId;
let serviceCheckInterval = null;
let config;
let interval;
let services;
let servicesState;
let oldServicesState = { ...servicesState };

const configFilePath = path.join(__dirname, 'config.json');

const initializeConfig = async () => {
    try {
        console.log('initializing config...');
        config = await loadConfig();
        console.log('config', config);
        interval = config.interval || 10000;
        services = config.services || [];
        console.log('interval, services:', interval, services);
    } catch (error) {
        console.error('Failed to load config:', error);
        process.exit(1);
    }
};

app.post('/setconfig', async (req, res) => {
    const newConfig = req.body;

    if (!newConfig) {
        return res.status(400).json({ message: 'Configuration must be provided in JSON format.' });
    }

    try {
        await saveConfig(newConfig);

        config = newConfig;
        interval = config.interval || 10000;
        services = config.services || [];

        if (serviceCheckInterval) {
            clearInterval(serviceCheckInterval);
        }

        serviceCheckInterval = setInterval(checkAndEditMessage, interval);

        console.log('Configuration successfully updated and applied.');
        res.status(200).json({ message: 'Configuration successfully updated and applied.' });

        const newConfigMessage = `Отримано нову конфігурацію:\n${JSON.stringify(newConfig, null, 2)}`;
        sendTelegramMessage(newConfigMessage);
    } catch (err) {
        console.error('Error writing to config.json file:', err);
        return res.status(500).json({ message: 'An error occurred while saving the configuration.' });
    }
});

function initialServicesState(services) {
    const state = {};
    services.forEach(service => {
        state[service.name] = true;
    });
    return state;
}



const updateServicesState = (results) => {
    oldServicesState = { ...servicesState };
    results.forEach(result => {
        servicesState[result.name] = result.available;
    });
};

const isServiceChanged = (name) => {
    return oldServicesState[name] !== servicesState[name];
};
const checkResult = async (results) => {
    for (const result of results) {
        console.log('перевіряємо сервіс', result.name);
        if (isServiceChanged(result.name)) {
            message = result.available ? `✅ Сервіс "${result.name}" відновився.` : `⚠️ Сервіс "${result.name}" не працює. 🔴❗❌`;
            await sendTelegramMessage(message);
        }
    }

    if (hasStateChanged) {
        message = createMessage(results, source);
        initialMessageId = await sendTelegramMessage(message);
    }
};

const checkAndEditMessage = async () => {
    const results = await checkServices(services);
    updateServicesState(results);
    hasStateChanged = JSON.stringify(oldServicesState) !== JSON.stringify(servicesState);
    await checkResult(results);
    oldMessage = message;
    message = createMessage(results, source);

    if (message !== oldMessage) {
        await editTelegramMessage(message, initialMessageId);
    }
};

const initialMessage = async () => {
    console.log('ініціалізуємо перше повідомлення');
    initialMessageId = await sendTelegramMessage(`Чекер на комп'ютері ${source} запущений`);
    console.log('initialMessageId:', initialMessageId);

    const results = await checkServices(services);
    await checkResult(results);
    oldMessage = message;
    message = createMessage(results, source);
    if (message !== oldMessage) {
        await editTelegramMessage(message, initialMessageId);
    }
    setInterval(checkAndEditMessage, interval);
};

initializeConfig()
    .then(() => {
        console.log('Config loaded successfully:', config);
        servicesState = initialServicesState(services);
        initialMessage();
    })
    .catch((error) => {
        console.error('Error during initialization:', error);
    });

app.listen(port, () => {
    console.log(`Monitoring service running at http://localhost:${port}`);
});