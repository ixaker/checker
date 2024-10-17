Для установки на лінукс запустіть

bash <(wget -qO- https://raw.githubusercontent.com/ixaker/checker/main/install.sh) -i

Для оновлення запустіть

bash <(wget -qO- https://raw.githubusercontent.com/ixaker/checker/main/instal.sh) -u

Команди для роботи зі службою:

1. Для перевірки статусу служби: sudo systemctl status checkApp"
2. Для зупинки служби: sudo systemctl stop checkApp"
3. Для перезапуску служби: sudo systemctl restart checkApp"
4. Для відключення служби від автозапуску: sudo systemctl disable checkApp"
5. Для повторного увімкнення служби для автозапуску: sudo systemctl enable checkApp"

bash <(curl -sL https://raw.githubusercontent.com/ixaker/checker/refs/heads/main/instal-checker.sh)

$SUDO apt install -y package_name > /dev/null 2>&1

https://raw.githubusercontent.com/ixaker/checker/main/instal-checker.sh
https://raw.githubusercontent.com/ixaker/checker/refs/heads/main/instal-checker.sh

Зупинити контейнер
docker stop checker

Видалити контейнер
docker rm checker

Створити новий контейнер
docker build -t xakerdnepr/checker:3.0.0 .

Запустити новий контейнер
docker run -d -p 3000:3000 --name checker \
 --restart unless-stopped \
 -e TZ="Europe/Kiev" \
 -e SOURCE="Test VPN" \
 -e INTERVAL=600000 \
 xakerdnepr/checker:3.0.0

Пуш на DockerHub
docker push xakerdnepr/checker:3.0.0
