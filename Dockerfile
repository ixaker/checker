# Використовуємо офіційний образ Node.js
FROM node:20

# Створюємо робочу директорію
WORKDIR /usr/src/app

# Копіюємо файли package.json і package-lock.json
COPY package*.json ./

# Встановлюємо залежності
RUN npm install

# Копіюємо вихідний код додатку
COPY . .

# Відкриваємо порт 3000
EXPOSE 3000

# Команда для запуску додатку
CMD [ "node", "index.js" ]
