import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity'; 
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { OAuth2Client } from 'google-auth-library';

const googleClient = new OAuth2Client('796592562943-gilp0qrs6g9sfeotifeaj5mqdta1dteq.apps.googleusercontent.com');

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  // לוגיקת הרשמה (Register)
  async register(registerDto: RegisterDto) {
    const { email, password, name } = registerDto;

    // בדיקה אם האימייל כבר תפוס
    const existingUser = await this.userRepository.findOneBy({ email });
    if (existingUser) {
      throw new BadRequestException('כתובת האימייל הזו כבר רשומה במערכת');
    }

    // יצירת המשתמש החדש (מומלץ בעתיד להוסיף כאן bcrypt להצפנת הסיסמה!)
    const newUser = this.userRepository.create({
      name,
      email,
      password, // נשמר זמנית כטקסט פשוט, בהמשך נצפין
      role: 'user',
    });

    return this.userRepository.save(newUser);
  }

  // לוגיקת התחברות (Login)
  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // חיפוש המשתמש לפי אימייל
    const user = await this.userRepository.findOneBy({ email });
    if (!user) {
      throw new UnauthorizedException('אימייל או סיסמה אינם נכונים');
    }

    // בדיקת סיסמה
    if (user.password !== password) {
      throw new UnauthorizedException('אימייל או סיסמה אינם נכונים');
    }

    // החזרת פרטי המשתמש ל-Frontend (ללא הסיסמה מטעמי אבטחה)
    const { password: _, ...result } = user;
    return result;
  }

  async googleLogin(token: string) {
    try {
      // 1. מאמתים את הטוקן ישירות מול השרתים של גוגל
      const ticket = await googleClient.verifyIdToken({
        idToken: token,
        audience: '796592562943-gilp0qrs6g9sfeotifeaj5mqdta1dteq.apps.googleusercontent.com',
      });

      const payload = ticket.getPayload();
      if (!payload) {
        throw new BadRequestException('טוקן גוגל לא תקין');
      }

      const { email, name, sub: googleId } = payload;

      // 2. בודקים אם המשתמש כבר קיים אצלנו במסד הנתונים לפי האימייל
      let user = await this.userRepository.findOneBy({ email });

      // 3. אם הוא לא קיים - יוצרים לו משתמש חדש אוטומטית (הרשמה שקופה!)
      if (!user) {
        user = this.userRepository.create({
          email,
          name: name || 'משתמש גוגל',
          password: `google_${googleId}`, // סיסמת רפאים מכיוון שהוא מתחבר רק דרך גוגל
          role: 'user',
        });
        await this.userRepository.save(user);
      }

      // 4. מחזירים את פרטי המשתמש ללא הסיסמה
      const { password: _, ...result } = user;
      return result;
    } catch (error) {
      throw new UnauthorizedException('אימות מול גוגל נכשל');
    }
  }
}