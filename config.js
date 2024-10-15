const fs = require('fs');
const path = require('path');

console.log('dirname: ', __dirname);
const configFilePath = path.join(__dirname, './config.json');

const loadConfig = async () => {
    try {
        const rawConfig = fs.readFileSync(configFilePath, 'utf8');
        console.log('rawConfig: ', rawConfig);
        return JSON.parse(rawConfig);
    } catch (error) {
        console.error('Помилка при читанні config.json:', error);
        process.exit(1);
    }
};

const saveConfig = async (newConfig) => {
    fs.writeFileSync(configFilePath, JSON.stringify(newConfig, null, 2), 'utf8');
};

module.exports = { loadConfig, saveConfig };
