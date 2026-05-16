import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { AuthService } from './auth.service';
import { LoginResponseDto } from './dto/login-response.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import {
  ApiCreatedDataResponse,
  ApiOkDataResponse,
} from '../common/swagger/success-response.decorators';
import { SafeUserDto } from '../users/dto/safe-user.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: '普通用户注册' })
  @ApiCreatedDataResponse(SafeUserDto, { messageExample: '注册成功' })
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @ApiOperation({ summary: '用户登录并获取 JWT' })
  @ApiCreatedDataResponse(LoginResponseDto)
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '校验 JWT 并返回当前用户' })
  @ApiOkDataResponse(SafeUserDto, { messageExample: 'JWT 校验通过' })
  getProfile(@Req() request: Request) {
    return {
      message: 'JWT 校验通过',
      user: request.user,
    };
  }
}
