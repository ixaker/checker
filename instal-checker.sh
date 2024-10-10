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

# Функция для проверки наличия пакета
check_command() {
    command_name=$1
    if ! command -v $command_name &> /dev/null; then
        echo "$command_name не найден! Пожалуйста, установите его."
        MISSING_PACKAGES+=($command_name)
    else
        echo "$command_name установлен."
    fi
}

# Проверка наличия необходимых пакетов
MISSING_PACKAGES=()
check_command nodejs
check_command npm
check_command curl
check_command git

# Установка недостающих пакетов
if [ ${#MISSING_PACKAGES[@]} -ne 0 ]; then
    echo "Некоторые пакеты отсутствуют: ${MISSING_PACKAGES[@]}"
    echo "Попытка установить отсутствующие пакеты..."
    
    $SUDO apt update

    echo "Install missing packages..."
    
    for package in "${MISSING_PACKAGES[@]}"; do
        echo "          "
        echo "${package} installing..." # Print the name of the package
        
        $SUDO apt install -y $package > /dev/null 2>&1
    done
else
    echo "Все необходимые пакеты установлены."
fi

echo "Скрипт завершен."
