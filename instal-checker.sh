#!/bin/bash

# Назва служби
SERVICE_NAME="checkApp"

# URL репозиторія
REPO_URL="https://github.com/ixaker/checker.git"

# Директорія для клонування
TARGET_DIR="$HOME/Projects/$SERVICE_NAME"

# Проверка, запущен ли скрипт под root
if [ "$(id -u)" -eq 0 ]; then
    # Скрипт запущен под root
    SUDO=""
    echo "Скрипт запущен под root."
else
    # Скрипт запущен под другим пользователем
    SUDO="sudo"
    echo "Скрипт запущен не под root. Будет использоваться sudo."
fi

echo "Updating apt..."
$SUDO apt update -y > /dev/null 2>&1

$SUDO apt install -y nodejs npm git

# Клонування репозиторію
if [ -d "$TARGET_DIR" ]; then
    echo "Каталог $TARGET_DIR вже існує. Очищую його..."
    rm -rf "$TARGET_DIR"  # Видаляємо каталог і весь його вміст
fi

echo "Клоную репозиторій у $TARGET_DIR..."
git clone $REPO_URL $TARGET_DIR
echo "Репозиторій успішно клонувався."

cd $TARGET_DIR
npm install

# Створення файлу служби
SERVICE_FILE="/etc/systemd/system/$SERVICE_NAME.service"

cat <<EOF | $SUDO tee $SERVICE_FILE
[Unit]
Description=$SERVICE_NAME

[Service]
ExecStart=/usr/bin/node $TARGET_DIR/index.js
WorkingDirectory=$TARGET_DIR
Restart=always

[Install]
WantedBy=multi-user.target
EOF

# Активування та запуск служби
$SUDO systemctl daemon-reload
$SUDO systemctl enable $SERVICE_NAME
$SUDO systemctl start $SERVICE_NAME

echo "Служба $SERVICE_NAME успішно налаштована та запущена."

echo "Скрипт завершен."