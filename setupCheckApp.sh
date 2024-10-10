#!/bin/bash

# Перезавантаження конфігурації systemd
sudo systemctl daemon-reload

# Увімкнення служби для автоматичного запуску при завантаженні системи
sudo systemctl enable checkApp

# Запуск служби
sudo systemctl start checkApp

echo "Служба checkApp успішно налаштована та запущена."
echo "Ви можете використовувати наступні команди для керування службою:"
echo "1. Для перевірки статусу служби: sudo systemctl status checkApp"
echo "2. Для зупинки служби: sudo systemctl stop checkApp"
echo "3. Для перезапуску служби: sudo systemctl restart checkApp"
echo "4. Для відключення служби від автозапуску: sudo systemctl disable checkApp"
echo "5. Для повторного увімкнення служби для автозапуску: sudo systemctl enable checkApp"