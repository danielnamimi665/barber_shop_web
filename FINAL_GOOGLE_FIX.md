# הוראות סופיות לפתרון Google OAuth

## הבעיה:
השרת רץ עכשיו על פורט 3000, אבל ה-URIs ב-Google Cloud Console מוגדרים לפורט 3002.

## פתרון מהיר:

### שלב 1: עדכן את ה-URIs ב-Google Cloud Console
1. **לחץ כאן**: [Google Cloud Console](https://console.cloud.google.com/)
2. לך ל-"APIs & Services" > "Credentials"
3. **לחץ על השם "barber"** בטבלה
4. **לחץ על אייקון העיפרון** (עריכה)
5. **מחק את כל ה-URIs הקיימים**
6. הוסף את ה-URIs החדשים:

#### Authorized JavaScript origins:
```
http://localhost:3000
```

#### Authorized redirect URIs:
```
http://localhost:3000/api/auth/callback/google
```

7. **לחץ על "Save"**

### שלב 2: הוסף את האימייל שלך כ-Test User
1. לך ל-"APIs & Services" > "OAuth consent screen"
2. **לחץ על "Edit App"**
3. לך לטאב **"Test users"**
4. **לחץ על "Add Users"**
5. הוסף את האימייל: `danielnamimi5@gmail.com`
6. **לחץ על "Save"**

### שלב 3: בדוק שהכל עובד
1. פתח http://localhost:3000
2. לך לדף התחברות
3. לחץ על "התחבר עם Google"
4. התחבר עם החשבון שלך
5. תועבר לדף הבית

## אם עדיין יש בעיה:

### בדוק את הקונסול בדפדפן
1. פתח Developer Tools (F12)
2. לך לטאב Console
3. חפש שגיאות הקשורות ל-OAuth

### בדוק את הלוגים של השרת
בטרמינל תראה הודעות debug אם יש בעיה.

## קישורים שימושיים
- [Google Cloud Console](https://console.cloud.google.com/)
- [OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2) 