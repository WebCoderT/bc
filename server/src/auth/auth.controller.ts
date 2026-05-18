import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
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
/**
 * 认证控制器负责注册、登录与当前用户资料查询。
 */
export class AuthController {
  /**
   * 注入认证服务，复用注册登录与令牌校验逻辑。
   */
  constructor(private readonly authService: AuthService) {}

  /**
   * 处理普通用户注册请求。
   */
  @Post('register')
  @ApiOperation({ summary: '普通用户注册' })
  @ApiBody({ type: RegisterDto, description: '注册参数' })
  @ApiCreatedDataResponse(SafeUserDto, { messageExample: '注册成功' })
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  /**
   * 处理用户登录并返回访问令牌。
   */
  @Post('login')
  @ApiOperation({ summary: '用户登录并获取 JWT' })
  @ApiBody({ type: LoginDto, description: '登录参数' })
  @ApiCreatedDataResponse(LoginResponseDto)
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  /**
   * 校验当前 JWT，并回传当前登录用户信息。
   */
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
