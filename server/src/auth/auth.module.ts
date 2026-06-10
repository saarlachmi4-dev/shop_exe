import { Module } from '@nestjs/common'; // <-- תיקון ה-Import הישן שהיה לנו
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { User } from '../entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    // מגדירים את ה-JWT עם מפתח סודי ותוקף ארוך (למשל 7 ימים בשביל "זכור אותי")
    JwtModule.register({
      secret: 'SUPER_SECRET_KEY_123', // בעתיד כדאי להעביר ל-.env
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}