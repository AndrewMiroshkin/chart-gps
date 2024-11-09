#### Для того, щоб запустити веб-додаток необхідно:

1. Скачати образ сервера який надсилає дані

```
   docker pull iperekrestov/university:gps-emulation-service
```

2. Запустити образ та створити контейнер

```
   docker run --name gps-emulator -p 4001:4000 iperekrestov/university:gps-emulation-service
   
   docker start gps-emulator
   
   docker stop gps-emulator
```

3. Створюємо перевірочне підключення до WebSocket сервера для перевірки працездатності

```
   wscat -c ws://localhost:4001
```

Як видно на зображенні - підключення встановлено коректно, і ми отримуємо дані.
![input_values](/screenshots/input_values.jpg)

4. Далі прописуємо формули та створюємо інтерфейс для відображення даних. Ось результати обчислень на графіку:

![res_1](/screenshots/res_1.jpg)

![res_2](/screenshots/res_2.jpg)

![res_3](/screenshots/res_3.jpg)