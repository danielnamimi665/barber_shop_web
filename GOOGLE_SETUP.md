# הגדרת התחברות עם Google

כדי שהתחברות עם Google תעבוד, עליך להגדיר את משתני הסביבה הבאים:

## שלב 1: יצירת פרויקט ב-Google Cloud Console

1. היכנס ל-[Google Cloud Console](https://console.cloud.google.com/)
2. צור פרויקט חדש או בחר פרויקט קיים
3. הפעל את Google+ API

## שלב 2: יצירת OAuth 2.0 Client ID

1. לך ל-"APIs & Services" > "Credentials"
2. לחץ על "Create Credentials" > "OAuth 2.0 Client IDs"
3. בחר "Web application"
4. הוסף את ה-URIs הבאים:
   - Authorized JavaScript origins: `http://localhost:3000`
   - Authorized redirect URIs: `http://localhost:3000/api/auth/callback/google`

## שלב 3: הגדרת משתני הסביבה

צור קובץ `.env.local` בתיקיית הפרויקט עם התוכן הבא:

```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# NextAuth Configuration
NEXTAUTH_SECRET=your_random_secret_here
NEXTAUTH_URL=http://localhost:3000
```

## שלב 4: הפעלת הפרויקט

1. התקן את התלויות: `npm install`
2. הפעל את השרת: `npm run dev`
3. פתח את הדפדפן בכתובת: `http://localhost:3000`

## פתרון בעיות

אם התחברות עם Google לא עובדת:

1. ודא שמשתני הסביבה מוגדרים נכון
2. ודא שה-URIs מוגדרים נכון ב-Google Cloud Console
3. בדוק את הקונסול בדפדפן לשגיאות
4. ודא שהפרויקט רץ על `http://localhost:3000` 