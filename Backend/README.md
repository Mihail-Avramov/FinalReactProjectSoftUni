# Документация на Backend API: Auth и User

## 1. Автентикация (Auth API)

### Описание
API за автентикация предоставя функционалност за регистрация и вход на потребители в платформата за рецепти. Всички методи са публични и не изискват автентикация.

### Крайни точки

#### Регистрация
```
POST /api/auth/register
```

**Описание**: Създава нов потребителски акаунт и връща JWT токен.

**Тяло на заявката**:
```json
{
  "email": "user@example.com",
  "password": "password123",
  "username": "culinary_pro",
  "firstName": "Иван",
  "lastName": "Петров"
}
```

**Профилна снимка**: Опционално може да се качи чрез `multipart/form-data` с ключ `image`

**Отговор**:
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "67d42d17266b86d549e102bb",
      "email": "user@example.com",
      "username": "culinary_pro",
      "firstName": "Иван",
      "lastName": "Петров",
      "profilePicture": "https://res.cloudinary.com/.../default.png",
      "bio": ""
    },
    "token": "eyJhbGciOiJIUzI1..."
  }
}
```

**Валидации**:
- Email трябва да е валиден и уникален
- Username: минимум 3 символа, само букви, цифри и долна черта, уникален
- Password: минимум 6 символа
- FirstName, LastName: не могат да са празни

#### Вход
```
POST /api/auth/login
```

**Описание**: Автентикира потребител и връща JWT токен.

**Тяло на заявката**:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Отговор**:
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "67d42d17266b86d549e102bb",
      "email": "user@example.com",
      "username": "culinary_pro",
      "firstName": "Иван",
      "lastName": "Петров",
      "profilePicture": "https://res.cloudinary.com/.../profile.png",
      "bio": "Passionate about cooking Italian cuisine"
    },
    "token": "eyJhbGciOiJIUzI1..."
  }
}
```

## 2. Потребителски профили (User API)

### Описание
API за управление на потребителски профили, включително достъп до публични профили, редактиране на лична информация, смяна на профилни снимки и статистика.

### Автентикация
Повечето методи изискват валиден JWT токен, който да се предаде в хедъра на заявката:
```
Authorization: Bearer eyJhbGciOiJIUzI1...
```

### Крайни точки

#### 1. Достъп до публичен профил
```
GET /api/users/profile/:id
```

**Описание**: Връща публична информация за потребител. Достъпен за всички, включително неавтентикирани потребители.

**Параметри**:
- `id`: MongoDB ID на потребителя

**Отговор**:
```json
{
  "success": true,
  "data": {
    "_id": "67d42d17266b86d549e102bb",
    "username": "culinary_pro",
    "firstName": "Иван",
    "lastName": "Петров",
    "profilePicture": "https://res.cloudinary.com/.../profile.png",
    "bio": "Passionate about cooking Italian cuisine",
    "recipeCount": 5
  }
}
```

#### 2. Достъп до собствен профил
```
GET /api/users/profile
```

**Описание**: Връща пълната информация за текущо логнатия потребител.

**Изисква**: JWT автентикация

**Отговор**:
```json
{
  "success": true,
  "data": {
    "_id": "67d42d17266b86d549e102bb",
    "email": "user@example.com",
    "username": "culinary_pro",
    "firstName": "Иван",
    "lastName": "Петров",
    "profilePicture": "https://res.cloudinary.com/.../profile.png",
    "bio": "Passionate about cooking Italian cuisine",
    "favoriteRecipes": ["67e42d17266b86d549e10123", "67e42d17266b86d549e10456"],
    "createdAt": "2025-03-14T13:20:23.874Z",
    "updatedAt": "2025-03-14T15:41:34.101Z",
    "recipeCount": 5
  }
}
```

#### 3. Обновяване на профил
```
PUT /api/users/profile
```

**Описание**: Актуализира данните на текущо логнатия потребител.

**Изисква**: JWT автентикация

**Тяло на заявката**:
```json
{
  "username": "new_username",
  "firstName": "Нов",
  "lastName": "Потребител",
  "bio": "Обновена биография"
}
```

**Забележка**: Всички полета са опционални. Изпращат се само полетата, които се променят.

**Отговор**:
```json
{
  "success": true,
  "data": {
    "_id": "67d42d17266b86d549e102bb",
    "email": "user@example.com",
    "username": "new_username",
    "firstName": "Нов",
    "lastName": "Потребител",
    "profilePicture": "https://res.cloudinary.com/.../profile.png",
    "bio": "Обновена биография"
  }
}
```

**Валидации**:
- Username: минимум 3 символа, само букви, цифри и долна черта, уникален
- FirstName, LastName: не могат да са празни
- Bio: максимум 200 символа

#### 4. Смяна на профилна снимка
```
PUT /api/users/profile-picture
```

**Описание**: Променя профилната снимка на потребителя.

**Изисква**: JWT автентикация

**Формат**: multipart/form-data с ключ "image"

**Отговор**:
```json
{
  "success": true,
  "data": {
    "id": "67d42d17266b86d549e102bb",
    "profilePicture": "https://res.cloudinary.com/.../new_profile.png"
  }
}
```

#### 5. Връщане към стандартна профилна снимка
```
DELETE /api/users/profile-picture
```

**Описание**: Връща профилната снимка към стандартната по подразбиране.

**Изисква**: JWT автентикация

**Отговор**:
```json
{
  "success": true,
  "data": {
    "id": "67d42d17266b86d549e102bb",
    "profilePicture": "https://res.cloudinary.com/.../default.png"
  }
}
```

#### 6. Смяна на парола
```
PUT /api/users/change-password
```

**Описание**: Променя паролата на текущо логнатия потребител.

**Изисква**: JWT автентикация

**Тяло на заявката**:
```json
{
  "currentPassword": "старата-парола",
  "newPassword": "новата-парола"
}
```

**Отговор**:
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

**Валидации**:
- currentPassword: трябва да съвпада с текущата парола
- newPassword: минимум 6 символа, различна от текущата

#### 7. Изтриване на акаунт
```
DELETE /api/users/account
```

**Описание**: Изтрива профила на текущо логнатия потребител заедно с всички негови рецепти и коментари.

**Изисква**: JWT автентикация

**Тяло на заявката**:
```json
{
  "password": "парола-за-потвърждение"
}
```

**Отговор**:
```json
{
  "success": true,
  "message": "Account deleted successfully"
}
```

#### 8. Публични потребителски статистики
```
GET /api/users/stats/:id
```

**Описание**: Връща публични статистики за даден потребител.

**Параметри**:
- `id`: MongoDB ID на потребителя

**Отговор**:
```json
{
  "success": true,
  "data": {
    "recipesCount": 5,
    "totalLikes": 12,
    "averageLikesPerRecipe": "2.4"
  }
}
```

#### 9. Лични потребителски статистики
```
GET /api/users/stats
```

**Описание**: Връща разширени статистики за текущо логнатия потребител.

**Изисква**: JWT автентикация

**Отговор**:
```json
{
  "success": true,
  "data": {
    "recipesCount": 5,
    "totalLikes": 12,
    "averageLikesPerRecipe": "2.4",
    "commentsCount": 8,
    "favoriteRecipesCount": 15,
    "mostPopularCategory": "dinner",
    "mostLikedRecipe": {
      "_id": "67d42d17266b86d549e10abc",
      "title": "Домашна пица",
      "likes": 7
    },
    "activity": {
      "lastRecipe": "2025-03-10T13:20:23.874Z",
      "lastComment": "2025-03-14T10:12:46.659Z",
      "memberSince": "2025-01-14T13:51:35.627Z",
      "daysActive": 60
    }
  }
}
```

## 3. Обработка на грешки

API връща консистентен формат на грешки:

```json
{
  "success": false,
  "error": {
    "code": 400,
    "message": "The email or password you entered is incorrect"
  }
}
```

При валидационни грешки се връщат и конкретните полета с проблеми:

```json
{
  "success": false,
  "error": {
    "code": 422,
    "message": "Please correct the errors in the form",
    "fields": {
      "username": "This username is already taken, please choose another one",
      "password": "Your password must be at least 6 characters long"
    }
  }
}
```

## 4. JWT Автентикация

### Срок на валидност на токена
JWT токенът е валиден за 7 дни от издаването му. След изтичане на този период, системата връща код 401 и съобщение за изтекла сесия.

### Формат на авторизационния хедър
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Обработка на изтекли токени
Когато JWT токенът изтече, API връща грешка с код 401:
```json
{
  "success": false,
  "error": {
    "code": 401,
    "message": "Your login session has expired. Please sign in again"
  }
}
```

## 5. Спецификации за качване на изображения

### Поддържани формати
- JPEG/JPG
- PNG
- WebP

### Ограничения
- Максимален размер: 5MB

### Грешки при качване
```json
{
  "success": false,
  "error": {
    "code": 400,
    "message": "Your image is too large. Maximum size is 5MB"
  }
}
```
или
```json
{
  "success": false,
  "error": {
    "code": 400,
    "message": "Please upload an image in JPG, PNG or WebP format"
  }
}
```

## 6. Кодове на грешки

| Код | Грешка | Описание |
|-----|--------|----------|
| 400 | Bad Request | Невалидни входни данни |
| 401 | Unauthorized | Необходима е автентикация |
| 403 | Forbidden | Липсват права за операцията |
| 404 | Not Found | Ресурсът не е намерен |
| 409 | Conflict | Данните противоречат на съществуващи |
| 422 | Validation Error | Грешка във валидацията |
| 429 | Too Many Requests | Лимит на заявките |
| 500 | Server Error | Грешка в сървъра |