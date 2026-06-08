import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity'; 
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

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
}