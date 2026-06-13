import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'אימייל לא תקין' })
  @IsNotEmpty({ message: 'חובה להזין אימייל' })
  email!: string;

  @IsString()
  @MinLength(6, { message: 'הסיסמה חייבת להיות לפחות 6 תווים' })
  password!: string;
}