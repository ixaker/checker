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
            $package_name --version
        else
            echo "Не удалось установить $package_name. Пожалуйста, установите его вручную."
        fi
    fi
}

# Установка curl и git, если они отсутствуют
install_package_if_missing curl
install_package_if_missing git

# installs fnm (Fast Node Manager)
curl -fsSL https://fnm.vercel.app/install | bash
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
