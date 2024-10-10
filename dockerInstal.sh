sudo apt install ntp -y && sudo systemctl start ntp && sudo systemctl enable ntp && \
sudo apt update && sudo apt install -y ca-certificates curl && sudo install -m 0755 -d /etc/apt/keyrings && \
curl -fsSL https://download.docker.com/linux/debian/gpg | sudo tee /etc/apt/keyrings/docker.asc > /dev/null && \
sudo chmod a+r /etc/apt/keyrings/docker.asc && curl -fsSL https://deb.nodesource.com/setup_20.x | sudo bash - && \
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.do \
cker.com/linux/debian $(. /etc/os-release && echo $VERSION_CODENAME) stable" | \
sudo tee /etc/apt/sources.list.d/docker.list > /dev/null && sudo apt update && \
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin nodejs \
sudo systemctl start docker && sudo systemctl enable docker

mkdir webapp
cd webapp
npm init -y
npm install express

nano index.js

const express = require('express');
const app = express();
const port = 3000;

app.get('/', (req, res) => {
  res.send('Привет из Docker!');
});

app.listen(port, () => {
  console.log(`Приложение запущено на http://localhost:${port}`);
});


touch Dockerfile
nano Dockerfile

# Используем официальный образ Node.js
FROM node:20

# Создаем рабочую директорию
WORKDIR /usr/src/app

# Копируем файлы package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем исходный код приложения
COPY . .

# Открываем порт 3000
EXPOSE 3000

# Команда для запуска приложения
CMD [ "node", "index.js" ]



touch .dockerignore
nano .dockerignore

node_modules
npm-debug.log


docker build -t webapp .

sudo docker run -p 3000:3000 webapp
sudo docker stop webapp

sudo docker save -o webapp.tar webapp
sudo chown pi:pi webapp.tar

sudo docker images

sudo docker run -d --restart unless-stopped -p 3000:3000 webapp





/////////////////////////////////////////////////////////////
Запуск на другом компьютере

// синхронизация времени
sudo apt install ntp -y && sudo systemctl start ntp && sudo systemctl enable ntp
date

// установка докера
sudo apt update && sudo apt install -y ca-certificates curl && sudo install -m 0755 -d /etc/apt/keyrings && \
curl -fsSL https://download.docker.com/linux/debian/gpg | sudo tee /etc/apt/keyrings/docker.asc > /dev/null && \
sudo chmod a+r /etc/apt/keyrings/docker.asc && \
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/debian $(. /etc/os-release && echo $VERSION_CODENAME) stable" | \
sudo tee /etc/apt/sources.list.d/docker.list > /dev/null && \
sudo apt update && \
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

sudo systemctl start docker && sudo systemctl enable docker

// надо сначала скачать контейнер и потом загрузить в докер
sudo docker load -i webapp.tar

// запуск контейнера
sudo docker run -d --restart unless-stopped -p 3000:3000 --name webapp-container webapp

// остановка контейнера
sudo docker stop webapp-container


///////////////////////////////////////////////////////////////////////
sudo docker ps -a
sudo docker run -d --restart unless-stopped -p 3000:3000 webapp

sudo docker run -d -p 3000:3000 --name webapp-container webapp

sudo docker stop webapp-container
sudo docker start webapp-container
sudo docker run -d --restart unless-stopped -p 3000:3000 --name webapp-container webapp
