import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @IsString()
  @IsNotEmpty({ message: 'חובה להזין שם מלא' })
  name!: string;

  @IsEmail({}, { message: 'אימייל לא תקין' })
  @IsNotEmpty({ message: 'חובה להזין אימייל' })
  email!: string;

  @IsString()
  @MinLength(6, { message: 'הסיסמה חייבת להיות לפחות 6 תווים' })
  password!: string;
}