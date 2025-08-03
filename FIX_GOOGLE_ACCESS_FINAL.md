# פתרון בעיות Google OAuth - הוראות מפורטות

## הבעיות:
1. **danielnamimi5@gmail.com עדיין חסום**
2. **משתמשים אחרים חוזרים לדף התחברות**

## פתרון:

### שלב 1: היכנס ל-Google Cloud Console
1. **לחץ כאן**: [Google Cloud Console](https://console.cloud.google.com/)
2. בחר את הפרויקט שלך
3. לך ל-"APIs & Services" > "OAuth consent screen"

### שלב 2: הוסף את האימייל שלך כ-Test User
1. **לחץ על "Edit App"**
2. לך לטאב **"Test users"**
3. **לחץ על "Add Users"**
4. הוסף את האימייל: `danielnamimi5@gmail.com`
5. **לחץ על "Save"**

### שלב 3: עדכן את ה-URIs ב-Credentials
1. **לחץ על "APIs & Services"** בתפריט הצד
2. **לחץ על "Credentials"**
3. **לחץ על השם "barber"** בטבלה
4. **לחץ על אייקון העיפרון** (עריכה)
5. **מחק את כל ה-URIs הקיימים**
6. הוסף את ה-URIs החדשים:

#### Authorized JavaScript origins:
```
http://localhost:3002
```

#### Authorized redirect URIs:
```
http://localhost:3002/api/auth/callback/google
```

7. **לחץ על "Save"**

### שלב 4: הפעל מחדש את השרת
1. **עצור את השרת** (Ctrl+C)
2. **הרץ מחדש**:
   ```bash
   npm run dev
   ```

### שלב 5: בדוק שהכל עובד
1. פתח http://localhost:3002
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