# הוראות להגדרת התחברות עם Google

## הבעיה שתוקנה

הקוד תוקן כדי שהתחברות עם Google תעבוד כראוי. השינויים שבוצעו:

1. **תיקון הפונקציה `handleGoogleSignIn`** - הוספת טיפול בשגיאות וניהול מצב טעינה
2. **שיפור קובץ NextAuth** - הוספת logging ו-debugging
3. **הוספת אנימציית טעינה** - כפתור Google מציג אנימציה בזמן טעינה
4. **שיפור UX** - הודעות שגיאה ברורות יותר

## הגדרת משתני הסביבה

צור קובץ `.env.local` בתיקיית הפרויקט עם התוכן הבא:

```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# NextAuth Configuration
NEXTAUTH_SECRET=your_random_secret_here
NEXTAUTH_URL=http://localhost:3000
```

## יצירת Google OAuth Credentials

### שלב 1: Google Cloud Console
1. היכנס ל-[Google Cloud Console](https://console.cloud.google.com/)
2. צור פרויקט חדש או בחר פרויקט קיים
3. הפעל את Google+ API

### שלב 2: יצירת OAuth 2.0 Client ID
1. לך ל-"APIs & Services" > "Credentials"
2. לחץ על "Create Credentials" > "OAuth 2.0 Client IDs"
3. בחר "Web application"
4. הוסף את ה-URIs הבאים:
   - **Authorized JavaScript origins**: `http://localhost:3000`
   - **Authorized redirect URIs**: `http://localhost:3000/api/auth/callback/google`

### שלב 3: העתקת Credentials
1. העתק את ה-Client ID וה-Client Secret
2. הדבק אותם בקובץ `.env.local`

## הפעלת הפרויקט

1. התקן את התלויות:
   ```bash
   npm install
   ```

2. הפעל את השרת:
   ```bash
   npm run dev
   ```

3. פתח את הדפדפן בכתובת: `http://localhost:3000`

## בדיקת התחברות

1. לחץ על כפתור "התחבר עם Google"
2. אם הכל מוגדר נכון, תועבר לדף התחברות של Google
3. לאחר התחברות מוצלחת, תועבר לדף הבית

## פתרון בעיות

### בעיה: "שגיאה בהתחברות עם גוגל"
**פתרון:**
1. ודא שמשתני הסביבה מוגדרים נכון
2. בדוק שה-URIs מוגדרים נכון ב-Google Cloud Console
3. ודא שהפרויקט רץ על `http://localhost:3000`

### בעיה: "Invalid redirect URI"
**פתרון:**
1. ודא שה-redirect URI מוגדר נכון: `http://localhost:3000/api/auth/callback/google`
2. ודא שה-JavaScript origin מוגדר: `http://localhost:3000`

### בעיה: "Client ID not found"
**פתרון:**
1. ודא שה-GOOGLE_CLIENT_ID מוגדר נכון ב-.env.local
2. ודא שה-GOOGLE_CLIENT_SECRET מוגדר נכון

## תכונות חדשות

- **אנימציית טעינה** - כפתור Google מציג אנימציה בזמן טעינה
- **הודעות שגיאה ברורות** - הודעות שגיאה מפורטות יותר
- **מניעת לחיצות כפולות** - כפתור מושבת בזמן טעינה
- **Logging משופר** - הודעות debug בקונסול לפתרון בעיות 