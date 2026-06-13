import { Controller, Post, Body, Get, Put, Headers, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto'; //
import { RegisterDto } from './dto/register.dto';
import { JwtService } from '@nestjs/jwt';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
  ) {}

  @Post('register')
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('google')
  async googleLogin(@Body() body: { token: string }) {
    // כאן בעתיד תפענח את ה-idToken מגוגל. 
    // בינתיים, כדי שהאתר לא יישבר ויעבוד, נחזיר טוקן זמני או שנחבר את המשתמש של גוגל:
    return {
      access_token: this.jwtService.sign({ sub: 1, email: 'google-user@gmail.com', role: 'user' }),
      user: { id: 1, name: 'משתמש גוגל', email: 'google-user@gmail.com', role: 'user' }
    };
  }

  // Endpoint שבודק אם הטוקן הקיים בדפדפן עדיין בתוקף ומחזיר את המשתמש הקיים
  @Get('me')
  async getMe(@Headers('authorization') authHeader: string) {
    const userId = this.extractUserIdFromHeader(authHeader);
    return this.authService.getProfile(userId);
  }

  // Endpoint לעדכון פרטי הפרופיל
  @Put('profile')
  async updateProfile(
    @Headers('authorization') authHeader: string,
    @Body() body: { name?: string; email?: string },
  ) {
    const userId = this.extractUserIdFromHeader(authHeader);
    return this.authService.updateProfile(userId, body);
  }

  // פונקציית עזר קטנה לחילוץ ואימות ה-JWT מהבקשה
  private extractUserIdFromHeader(authHeader: string): number {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('חסר טוקן אימות או שהטוקן לא תקין');
    }
    try {
      const token = authHeader.split(' ')[1];
      const decoded = this.jwtService.verify(token, { secret: 'SUPER_SECRET_KEY_123' });
      return decoded.sub;
    } catch {
      throw new UnauthorizedException('הטוקן פג תוקף או אינו תקין');
    }
  }
}