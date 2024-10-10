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

# Функция для проверки наличия пакета и его установки
install_package_if_missing() {
    package_name=$1
    if command -v $package_name &> /dev/null; then
        echo "$package_name уже установлен."
    else
        echo "$package_name не установлен. Начинаем установку..."
        $SUDO apt update -y > /dev/null 2>&1
        $SUDO apt install -y $package_name > /dev/null 2>&1

        # Проверка успешной установки
        if command -v $package_name &> /dev/null; then
            echo "$package_name успешно установлен."
        else
            echo "Не удалось установить $package_name. Пожалуйста, установите его вручную."
        fi
    fi
}

# Установка curl и git, если они отсутствуют
install_package_if_missing curl
install_package_if_missing git
install_package_if_missing nodejs
install_package_if_missing npm

# Клонування репозиторію
REPO_URL="https://github.com/ixaker/checker.git"
TARGET_DIR="$HOME/Projects/checker"

if [ -d "$TARGET_DIR" ]; then
    echo "Каталог $TARGET_DIR вже існує. Очищую його..."
    rm -rf "$TARGET_DIR"  # Видаляємо каталог і весь його вміст
fi

echo "Клоную репозиторій у $TARGET_DIR..."
git clone $REPO_URL $TARGET_DIR
echo "Репозиторій успішно клонувався."

cd $TARGET_DIR
npm install -y


echo "Скрипт завершен."
