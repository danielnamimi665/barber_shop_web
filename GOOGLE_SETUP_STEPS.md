# הוראות מפורטות להגדרת Google OAuth

## שלב 1: יצירת פרויקט ב-Google Cloud Console

1. **לחץ כאן**: [Google Cloud Console](https://console.cloud.google.com/)
2. התחבר עם חשבון Google שלך
3. לחץ על "Select a project" בחלק העליון
4. לחץ על "New Project"
5. תן שם לפרויקט (למשל: "Barber Shop Web")
6. לחץ על "Create"

## שלב 2: הפעלת Google+ API

1. בפרויקט החדש, לחץ על "APIs & Services" בתפריט הצד
2. לחץ על "Library"
3. חפש "Google+ API" או "Google Identity"
4. לחץ על "Google+ API"
5. לחץ על "Enable"

## שלב 3: יצירת OAuth 2.0 Credentials

1. לך ל-"APIs & Services" > "Credentials"
2. לחץ על "Create Credentials" בחלק העליון
3. בחר "OAuth 2.0 Client IDs"
4. אם זה הפעם הראשונה, תצטרך להגדיר OAuth consent screen:
   - בחר "External" ולחץ "Create"
   - מלא את השדות הבאים:
     - App name: "Barber Shop Web"
     - User support email: האימייל שלך
     - Developer contact information: האימייל שלך
   - לחץ "Save and Continue" בכל השלבים
   - בסוף לחץ "Back to Dashboard"

5. עכשיו חזור ל-"Credentials" ולחץ "Create Credentials" > "OAuth 2.0 Client IDs"
6. בחר "Web application"
7. תן שם: "Barber Shop Web Client"
8. הוסף את ה-URIs הבאים:

### Authorized JavaScript origins:
```
http://localhost:3000
```

### Authorized redirect URIs:
```
http://localhost:3000/api/auth/callback/google
```

9. לחץ על "Create"

## שלב 4: העתקת Credentials

1. לאחר יצירת ה-Client ID, תראה חלון עם הפרטים
2. העתק את ה-Client ID (מחרוזת ארוכה שמתחילה ב-...apps.googleusercontent.com)
3. לחץ על "Download JSON" או העתק את ה-Client Secret
4. פתח את קובץ `.env.local` בפרויקט
5. החלף את הערכים הבאים:

```env
GOOGLE_CLIENT_ID=הערך שהעתקת
GOOGLE_CLIENT_SECRET=הערך שהעתקת
NEXTAUTH_SECRET=כל מחרוזת אקראית (למשל: my-secret-key-123)
```

## שלב 5: הפעלת הפרויקט

1. פתח Terminal/Command Prompt
2. נווט לתיקיית הפרויקט
3. הרץ את הפקודות הבאות:

```bash
npm install
npm run dev
```

4. פתח דפדפן וכתובת: `http://localhost:3000`
5. לך לדף התחברות ולחץ על "התחבר עם Google"

## פתרון בעיות נפוצות

### בעיה: "Invalid redirect URI"
**פתרון**: ודא שה-redirect URI מוגדר בדיוק: `http://localhost:3000/api/auth/callback/google`

### בעיה: "Client ID not found"
**פתרון**: ודא שקובץ `.env.local` נמצא בתיקיית הפרויקט והערכים נכונים

### בעיה: "OAuth consent screen not configured"
**פתרון**: חזור לשלב 3 והגדר את ה-OAuth consent screen

## בדיקה שהכל עובד

1. לחץ על "התחבר עם Google"
2. אם הכל מוגדר נכון, תועבר לדף התחברות של Google
3. התחבר עם חשבון Google שלך
4. תועבר חזרה לאתר ותראה שאתה מחובר

## קישורים שימושיים

- [Google Cloud Console](https://console.cloud.google.com/)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [NextAuth.js Documentation](https://next-auth.js.org/) 