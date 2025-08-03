# תיקון הגדרות Google OAuth

## הבעיה
השגיאה "The OAuth client was not found" מופיעה כי ה-URIs לא מוגדרים נכון ב-Google Cloud Console.

## פתרון

### שלב 1: היכנס ל-Google Cloud Console
1. לך ל-[Google Cloud Console](https://console.cloud.google.com/)
2. בחר את הפרויקט שלך
3. לך ל-"APIs & Services" > "Credentials"

### שלב 2: ערוך את ה-OAuth Client
1. לחץ על ה-OAuth 2.0 Client ID שיצרת
2. לחץ על "Edit" (עיפרון)
3. תחת "Authorized JavaScript origins" הוסף:
   ```
   http://localhost:3002
   ```
4. תחת "Authorized redirect URIs" הוסף:
   ```
   http://localhost:3002/api/auth/callback/google
   ```
5. לחץ על "Save"

### שלב 3: בדוק את OAuth Consent Screen
1. לך ל-"APIs & Services" > "OAuth consent screen"
2. ודא שהאפליקציה מוגדרת כ-"External"
3. הוסף את האימייל שלך כ-"Test user":
   - לחץ על "Add Users"
   - הוסף את האימייל: danielnamimi5@gmail.com
   - לחץ על "Save"

### שלב 4: הפעל מחדש את השרת
1. עצור את השרת (Ctrl+C)
2. הרץ מחדש:
   ```bash
   npm run dev
   ```

### שלב 5: בדוק שהכל עובד
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