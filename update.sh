#!/bin/bash

# Змінна з ім'ям служби
SERVICE_NAME="checkApp"

# Оновлення репозиторію
echo "Виконую git pull в $PROJECT_DIR..."
git -C "$PROJECT_DIR" pull origin main

# Встановлення нових залежностей
echo "Виконую npm install в $PROJECT_DIR..."
npm --prefix "$PROJECT_DIR" install

# Перезапуск служби
echo "Перезапускаю службу $SERVICE_NAME..."
sudo systemctl restart "$SERVICE_NAME"

echo "Скрипт завершено."
