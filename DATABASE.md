# База данных AlcoCalendar

**СУБД:** PostgreSQL 16  
**ORM:** Entity Framework Core (Code First)  
**Миграции:** `InitialCreate`, `AddCalendarTables`

---

## Схема таблиц

### `users`
Зарегистрированные пользователи.

| Колонка        | Тип           | Ограничения               | Описание                    |
|----------------|---------------|---------------------------|-----------------------------|
| `id`           | `uuid`        | PK                        | Уникальный ID пользователя  |
| `email`        | `varchar(320)`| NOT NULL, UNIQUE          | Email (value object)        |
| `password_hash`| `varchar(1024)`| NOT NULL                 | BCrypt-хэш пароля           |
| `created_at_utc`| `timestamp` | NOT NULL                  | Дата регистрации (UTC)      |
| `updated_at_utc`| `timestamp` | NOT NULL                  | Дата последнего обновления  |

---

### `refresh_tokens`
Refresh-токены для JWT-аутентификации.

| Колонка          | Тип        | Ограничения               | Описание                        |
|------------------|------------|---------------------------|---------------------------------|
| `id`             | `uuid`     | PK                        | Уникальный ID токена            |
| `user_id`        | `uuid`     | NOT NULL, FK → users.id   | Владелец токена                 |
| `token_hash`     | `varchar(128)`| NOT NULL, UNIQUE        | SHA-256 хэш токена              |
| `created_at_utc` | `timestamp`| NOT NULL                  | Дата создания (UTC)             |
| `expires_at_utc` | `timestamp`| NOT NULL                  | Дата истечения (UTC)            |
| `revoked_at_utc` | `timestamp`| NULL                      | Дата отзыва (NULL = активен)    |

**Каскад:** удаление пользователя → удаление всех его токенов.

---

### `drink_types`
Справочник типов напитков (seed-данные).

| Колонка | Тип           | Ограничения      | Описание           |
|---------|---------------|------------------|--------------------|
| `id`    | `integer`     | PK, auto-increment| ID типа напитка   |
| `name`  | `varchar(100)`| NOT NULL, UNIQUE | Название напитка   |

**Seed-данные (начальные значения):**

| id | name              |
|----|-------------------|
| 1  | Пиво              |
| 2  | Вино              |
| 3  | Крепкий алкоголь  |
| 4  | Сидр              |
| 5  | Коктейль          |

---

### `day_summaries`
Статус дня для каждого пользователя.

| Колонка   | Тип    | Ограничения                        | Описание                        |
|-----------|--------|------------------------------------|---------------------------------|
| `id`      | `uuid` | PK                                 | Уникальный ID записи            |
| `user_id` | `uuid` | NOT NULL                           | Владелец                        |
| `date`    | `date` | NOT NULL                           | Дата (без времени)              |
| `status`  | `integer`| NOT NULL                         | Статус дня (enum, см. ниже)     |

**Индекс:** `UNIQUE (user_id, date)` — один статус на пользователя в день.

**Enum `DayStatus`:**
| Значение | Число | Описание         |
|----------|-------|------------------|
| Unknown  | 0     | Не задано        |
| Sober    | 1     | Не пил           |
| Drank    | 2     | Пил              |

---

### `consumption_events`
Записи о конкретных выпивках в течение дня.

| Колонка        | Тип           | Ограничения       | Описание                         |
|----------------|---------------|-------------------|----------------------------------|
| `id`           | `uuid`        | PK                | Уникальный ID события            |
| `user_id`      | `uuid`        | NOT NULL          | Владелец                         |
| `date`         | `date`        | NOT NULL          | Дата события                     |
| `drink_type_id`| `integer`     | NOT NULL          | Тип напитка → drink_types.id     |
| `volume_ml`    | `integer`     | NOT NULL          | Объём в миллилитрах              |
| `notes`        | `varchar(500)`| NULL              | Заметка (необязательно)          |
| `time`         | `time`        | NULL              | Время суток (необязательно)      |

**Индекс:** `(user_id, date)` — быстрая выборка событий за день/месяц.

---

## Диаграмма связей

```
users (1) ──────── (N) refresh_tokens
  │ id                      user_id → users.id  [CASCADE DELETE]

users (1) ──────── (N) day_summaries
  │ id                      user_id (без FK в миграции, логическая связь)

users (1) ──────── (N) consumption_events
  │ id                      user_id (без FK в миграции, логическая связь)

drink_types (1) ── (N) consumption_events
  id                        drink_type_id (без FK в миграции, логическая связь)
```

> **Примечание:** FK от `day_summaries` и `consumption_events` к `users` и `drink_types`
> не объявлены явно в миграциях (нет `REFERENCES`), связи поддерживаются на уровне
> application-логики в `CalendarService`.

---

## Конфигурация подключения (Docker)

```
Host=db
Port=5432
Database=alco_db
Username=alco_user
Password=alco_password
```

Данные хранятся в Docker volume **`alco_pgdata`** и переживают пересборку контейнеров.  
Для полного сброса БД: `docker compose down -v`.
