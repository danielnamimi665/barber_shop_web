# פתרון בעיית "הגישה חסומה" ב-Google OAuth

## הבעיה
השגיאה "redirect_uri_mismatch" מופיעה כי ה-URIs ב-Google Cloud Console לא תואמים לפורט החדש (3002).

## פתרון מהיר

### שלב 1: היכנס ל-Google Cloud Console
1. **לחץ כאן**: [Google Cloud Console](https://console.cloud.google.com/)
2. בחר את הפרויקט שלך
3. לך ל-"APIs & Services" > "Credentials"

### שלב 2: עדכן את ה-URIs
1. לחץ על ה-OAuth 2.0 Client ID שלך
2. לחץ על "Edit" (עיפרון)
3. **מחק את כל ה-URIs הקיימים**
4. הוסף את ה-URIs החדשים:

#### Authorized JavaScript origins:
```
http://localhost:3002
```

#### Authorized redirect URIs:
```
http://localhost:3002/api/auth/callback/google
```

5. לחץ על "Save"

### שלב 3: הוסף את האימייל שלך כ-Test User
1. לך ל-"APIs & Services" > "OAuth consent screen"
2. לחץ על "Edit App"
3. לך לטאב "Test users"
4. לחץ על "Add Users"
5. הוסף את האימייל: `danielnamimi5@gmail.com`
6. לחץ על "Save"

### שלב 4: בדוק שהכל עובד
1. פתח http://localhost:3002
2. לך לדף התחברות
3. לחץ על "התחבר עם Google"
4. תועבר לדף התחברות של Google
5. התחבר עם החשבון שלך
6. תועבר חזרה לאתר

## אם עדיין יש בעיה

### בדוק את הקונסול בדפדפן
1. פתח Developer Tools (F12)
2. לך לטאב Console
3. חפש שגיאות הקשורות ל-OAuth

### בדוק את הלוגים של השרת
בטרמינל תראה הודעות debug אם יש בעיה.

## קישורים שימושיים
- [Google Cloud Console](https://console.cloud.google.com/)
- [OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2) 