import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const USERS_FILE = path.join(process.cwd(), 'data', 'users.json');

// פונקציה לקריאת משתמשים מהקובץ
function readUsers() {
  try {
    if (!fs.existsSync(USERS_FILE)) {
      return [];
    }
    const data = fs.readFileSync(USERS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading users file:', error);
    return [];
  }
}

// פונקציה לשמירת משתמשים לקובץ
function saveUsers(users: any[]) {
  try {
    // וידוא שהתיקייה קיימת
    const dir = path.dirname(USERS_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
  } catch (error) {
    console.error('Error saving users file:', error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber, password } = await request.json();

    if (!phoneNumber || !password) {
      return NextResponse.json(
        { error: 'מספר טלפון וסיסמה נדרשים' },
        { status: 400 }
      );
    }

    const users = readUsers();
    
    // חיפוש משתמש קיים
    const existingUser = users.find((user: any) => user.phoneNumber === phoneNumber);

    if (existingUser) {
      // משתמש קיים - בדיקת סיסמה
      if (existingUser.password === password) {
        // סיסמה נכונה - התחברות מוצלחת
        return NextResponse.json({
          success: true,
          message: 'התחברות מוצלחת',
          user: {
            phoneNumber: existingUser.phoneNumber,
            createdAt: existingUser.createdAt
          }
        });
      } else {
        // סיסמה שגויה
        return NextResponse.json(
          { error: 'סיסמה לא נכונה, נסה שוב!' },
          { status: 401 }
        );
      }
    } else {
      // משתמש חדש - יצירת משתמש חדש עם הסיסמה הראשונה
      const newUser = {
        phoneNumber,
        password,
        createdAt: new Date().toISOString()
      };
      
      users.push(newUser);
      saveUsers(users);
      
      return NextResponse.json({
        success: true,
        message: 'משתמש נוצר בהצלחה',
        user: {
          phoneNumber: newUser.phoneNumber,
          createdAt: newUser.createdAt
        }
      });
    }
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'שגיאה בשרת' },
      { status: 500 }
    );
  }
}
