#!/bin/bash

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

# Проверка наличия Git
if command -v git &> /dev/null; then
    echo "Git уже установлен."
else
    echo "Git не установлен. Начинаем установку..."

    # Обновление списка пакетов и установка Git
    $SUDO apt install -y git > /dev/null 2>&1

    # Проверка успешной установки
    if command -v git &> /dev/null; then
        echo "Git успешно установлен."
        git --version
    else
        echo "Не удалось установить Git. Пожалуйста, установите его вручную."
    fi
fi

# installs fnm (Fast Node Manager)
wget -qO- https://fnm.vercel.app/install | bash
# activate fnm
source ~/.bashrc
# download and install Node.js
fnm use --install-if-missing 18

if command -v node &> /dev/null; then
    echo "Node.js встановлено. Версія: $(node -v)"
else
    echo "Node.js не встановлено."
fi

echo "Скрипт завершен."
