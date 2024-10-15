const createMessage = (results, source) => {
    const currentTime = new Date().toLocaleString('uk-UA', { hour12: false });
    let message = `${source}.\nЧас останньої перевірки ${currentTime}\n`;

    results.forEach(result => {
        const status = result.available ? 'працює' : 'не працює';
        const icon = result.available ? '✅' : '⚠️';
        message += `${icon} ${result.name} - ${status}\n`;
    });

    return message;
};

module.exports = { createMessage };
