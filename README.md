# Тестовое задание – Middle NestJS Developer

## [Описание тестового задания](https://wild-bean-19b.notion.site/Middle-NestJS-824b413a224f490cb75bd6329888f99c)

---

## Стек технологий

- Node.js 20+
- NestJS 10+
- TypeScript
- TypeORM + PostgreSQL
- Redis (кэширование)
- Docker + Docker Compose
- Jest (unit-тесты)

---

## Быстрый старт (Docker)

### 1. Клонирование и подготовка

```bash
git clone <repository>
cd project-name
cp .env.example .env
```
### 2. Запуск

```bash
# Первый запуск (сборка)
docker-compose up --build

# Последующие запуски (hot-reload)
docker-compose down
docker-compose up
```
### API доступно: http://localhost:5000

### 3. Миграции

```bash
npm run migration:run #запуск миграции
npm run migration:generate #генерация миграции
npm run migration:create #создание миграции
npm run migration:revert #откат миграции
```

### 4. Unit-Тесты

```bash
npm run test #запуск тестов
```

---

## Авторизация и работа с пользователем
### 1. Регистрация

```bash
POST /authentication/registration

{
  "email": "user@example.com",
  "password": "Password123",
  "lastName": "Петров",
  "middleName": "Петрович",
  "firstName": "Петр"
}
```

#### Ответ
```bash
{
  "createdAt": "2026-03-16T06:42:50.861Z",
  "updatedAt": "2026-03-16T06:42:50.861Z",
  "id": 1,
  "active": true,
  "email": "user@example.com",
  "lastName": "Петров",
  "middleName": "Петрович",
  "firstName": "Петр"
}
```

### 2. Логин
```bash
POST /authentication/sign-in
{
  "email": "user@example.com", 
  "password": "password123"
}
```
#### Ответ
```bash
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
}
```

### 3. Обновление данных пользователя
```bash
PATCH /user/update
{
  "id": 1,
  "lastName": "Сидоров"
}
```

#### Ответ
```bash 
{
  "createdAt": "2026-03-16T06:42:50.861Z",
  "updatedAt": "2026-03-16T06:44:50.861Z",
  "id": 1,
  "active": true,
  "email": "user@example.com",
  "lastName": "Сидоров",
  "middleName": "Петрович",
  "firstName": "Петр"
}
```

### 4. Смена пароля
```bash
PATCH /user/change-password
{
  "id": 1,
  "password": "Password123",
  "oldPassword": "password123"
}
```

### 5. Удаление пользователя
```bash
DELETE /user/1
```

### 6. Мягкое удаление пользователя
```bash
DELETE /user/1/soft
```
### 7. Получить пользователя по id с опциональной связью со статьями
```bash
GET /user/1
```
#### Ответ
```bash 
{
  "createdAt": "2026-03-16T06:42:50.861Z",
  "updatedAt": "2026-03-16T06:44:50.861Z",
  "id": 1,
  "active": true,
  "email": "user@example.com",
  "lastName": "Сидоров",
  "middleName": "Петрович",
  "firstName": "Петр"
}
```
### 8. Получить пользователей по ids с опциональной связью со статьями
```bash
GET /user/?ids=1,2,3
```
#### Ответ
```bash 
[
  {
  "createdAt": "2026-03-16T06:42:50.861Z",
  "updatedAt": "2026-03-16T06:44:50.861Z",
  "id": 1,
  "active": true,
  "email": "user@example.com",
  "lastName": "Сидоров",
  "middleName": "Петрович",
  "firstName": "Петр"
  }
]
```
### 9. Получить пользователей с пагинацией
```bash
GET /user/paginated
```
#### Ответ
```bash 
{
	"items": [],
	"paginationInfo": {
		"totalItems": 0,
		"totalPages": 0,
		"page": 1,
		"perPage": 0,
		"hasNextPage": false,
		"hasPreviousPage": false
	}
}
```


---

## CRUD Статьи
### 1. Создание

```bash
POST /article/create

{
  "title": "Статья про уток",
  "description": "Какое нибудь описание",
  "authorId": 1,
  "active": false
}
```

#### Ответ
```bash
{
	"createdAt": "2026-03-16T06:43:13.168Z",
	"updatedAt": "2026-03-16T06:46:35.194Z",
	"id": 1,
	"active": true,
	"title": "Статья про уток",
	"description": "Какое нибудь описание",
	"publicDate": null
}
```

### 2. Обновление

```bash
PATCH /article/update

{
  "id": 1,
  "publicArticle": true
}
```

#### Ответ
```bash
{
	"createdAt": "2026-03-16T06:43:13.168Z",
	"updatedAt": "2026-03-16T06:46:35.194Z",
	"id": 1,
	"active": true,
	"title": "Статья про уток",
	"description": "Какое нибудь описание",
	"publicDate": "2026-03-16T06:46:35.194Z"
}
```

### 3. Удаление

```bash
GET /article/1
```

### 4. Мягкое удаление

```bash
GET /article/1/soft
```

### 5. Получить статью по id с опциональной связью с автором
```bash
GET /article/1
```
#### Ответ
```bash 
{
	"createdAt": "2026-03-16T06:43:13.168Z",
	"updatedAt": "2026-03-16T06:46:35.194Z",
	"id": 8,
	"active": true,
	"title": "test_TITLE_1234_6",
	"description": "description",
	"publicDate": null
}
```
### 6. Получить статьи по ids с опциональной связью с автором
```bash
GET /article/?ids=1,2,3?author=true
```
#### Ответ
```bash 
[
{
	"createdAt": "2026-03-16T06:43:13.168Z",
	"updatedAt": "2026-03-16T06:46:35.194Z",
	"id": 8,
	"active": true,
	"title": "test_TITLE_1234_6",
	"description": "description",
	"publicDate": null,
	"author": {
		"createdAt": "2026-03-16T06:42:50.861Z",
		"updatedAt": "2026-03-16T06:42:50.861Z",
		"id": 2,
		"active": true,
		"email": "test1@mail.ru",
		"lastName": "any",
		"firstName": "any",
		"middleName": "any12"
	}
}
]
```
### 7. Получить пользователей с пагинацией
```bash
GET /article/paginated
```
#### Ответ
```bash 
{
	"items": [],
	"paginationInfo": {
		"totalItems": 0,
		"totalPages": 0,
		"page": 1,
		"perPage": 0,
		"hasNextPage": false,
		"hasPreviousPage": false
	}
}
```

