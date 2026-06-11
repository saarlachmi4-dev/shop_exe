import { Injectable, BadRequestException, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '../entities/user.entity';
import { LoginDto } from './dto/login.dto'; //
import { RegisterDto } from './dto/register.dto';
import { UserRole } from '../entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

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

    // השוואת הסיסמה שהוזנה עם הסיסמה המוצפנת מה-DB
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      throw new UnauthorizedException('אימייל או סיסמה שגויים');
    }

    // יצירת ה-JWT Payload
    const payload = { sub: user.id, email: user.email, role: user.role };
    const token = this.jwtService.sign(payload);

    // החזרת הטוקן ופרטי המשתמש (ללא הסיסמה)
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