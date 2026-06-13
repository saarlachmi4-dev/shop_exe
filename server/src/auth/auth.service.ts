import { Injectable, BadRequestException, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from '../entities/user.entity';
import { LoginDto } from './dto/login.dto'; 
import { RegisterDto } from './dto/register.dto';
import { OAuth2Client } from 'google-auth-library';

// מאתחלים את הלקוח של גוגל עם ה-Client ID שלך
const client = new OAuth2Client('796592562943-gilp0qrs6g9sfeotifeaj5mqdta1dteq.apps.googleusercontent.com');

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  // 🍏 תהליך אימות משתמש גוגל - מתוקן ועובד ישירות מול ה-Repository!
  async validateGoogleUser(idToken: string) {
    try {
      // שלב א': אימות קשיח של הטוקן מול השרתים של גוגל
      const ticket = await client.verifyIdToken({
        idToken: idToken,
        audience: '796592562943-gilp0qrs6g9sfeotifeaj5mqdta1dteq.apps.googleusercontent.com',
      });
      
      const payload = ticket.getPayload();
      if (!payload) {
        throw new UnauthorizedException('טוקן גוגל לא תקין');
      }

      // חילוץ הפרטים האמיתיים של המשתמש מגוגל
      const { email, name } = payload;
      if (!email) {
        throw new BadRequestException('לא התקבל אימייל מחשבון הגוגל');
      }

      // שלב ב': בדיקה במסד הנתונים (PostgreSQL / TypeORM) ישירות מול ה-Repository
      let user = await this.userRepository.findOneBy({ email });

      // אם המשתמש לא קיים בבסיס הנתונים שלנו - יוצרים ושומרים אותו אוטומטית!
      if (!user) {
        const newUser = this.userRepository.create({
          email,
          name: name || 'משתמש גוגל',
          password: '', // משתמשי גוגל לא צריכים סיסמה מקומית
          role: UserRole.USER, // שימוש ב-Enum הקיים אצלך ב-Entity
        });
        
        user = await this.userRepository.save(newUser);
      }

      // שלב ג': הנפקת ה-access_token האמיתי של המערכת שלך
      const jwtPayload = { sub: user.id, email: user.email, role: user.role };
      
      return {
        access_token: this.jwtService.sign(jwtPayload),
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      };
    } catch (error) {
      if (error instanceof UnauthorizedException || error instanceof BadRequestException) {
        throw error;
      }
      throw new UnauthorizedException('האימות מול גוגל נכשל או שהטוקן פג תוקף');
    }
  }

  // --- 1. הרשמה עם הצפנת סיסמה ---
  async register(registerDto: RegisterDto) {
    const { email, password, name } = registerDto;

    // בדיקה אם האימייל כבר תפוס
    const existingUser = await this.userRepository.findOneBy({ email });
    if (existingUser) {
      throw new BadRequestException('כתובת האימייל הזו כבר רשומה במערכת');
    }

    // הצפנת הסיסמה (Salt rounds = 10)
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = this.userRepository.create({
      name,
      email,
      password: hashedPassword,
      role: UserRole.USER,
    });

    await this.userRepository.save(user);
    return { message: 'ההרשמה בוצעה בהצלחה' };
  }

  // --- 2. התחברות והנפקת JWT ---
  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // חיפוש המשתמש
    const user = await this.userRepository.findOneBy({ email });
    if (!user) {
      throw new UnauthorizedException('אימייל או סיסמה שגויים');
    }

    // הגנה מפני מצב שמשתמש גוגל (ללא סיסמה) מנסה להתחבר דרך הטופס הרגיל
    if (!user.password) {
      throw new UnauthorizedException('חשבון זה מוגדר להתחברות עם גוגל בלבד');
    }

    // השוואת הסיסמה שהוזנה עם הסיסמה המוצפנת מה-DB
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      throw new UnauthorizedException('אימייל או סיסמה שגויים');
    }

    // יצירת ה-JWT Payload
    const payload = { sub: user.id, email: user.email, role: user.role };
    const token = this.jwtService.sign(payload);

    return {
      access_token: token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

  // --- 3. שליפת פרופיל לפי טוקן (בשביל ה-"זכור אותי" בטעינת האתר) ---
  async getProfile(userId: number) {
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) {
      throw new NotFoundException('משתמש לא נמצא');
    }
    const { password, ...result } = user;
    return result;
  }

  // --- 4. עדכון פרופיל (שם / אימייל) ---
  async updateProfile(userId: number, updateData: { name?: string; email?: string }) {
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) {
      throw new NotFoundException('משתמש לא נמצא');
    }

    if (updateData.name) user.name = updateData.name;
    if (updateData.email) {
      const existingUser = await this.userRepository.findOneBy({ email: updateData.email });
      if (existingUser && existingUser.id !== userId) {
        throw new BadRequestException('האימייל הזה כבר בשימוש על ידי משתמש אחר');
      }
      user.email = updateData.email;
    }

    await this.userRepository.save(user);
    const { password, ...result } = user;
    return result;
  }
}