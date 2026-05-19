import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import {
  ApiCreatedDataResponse,
  ApiOkPaginatedResponse,
} from '../common/swagger/success-response.decorators';
import { BetOrderResponseDto } from './dto/bet-order-response.dto';
import { CreateMemberBetDto } from './dto/create-member-bet.dto';
import { QueryBetsDto } from './dto/query-bets.dto';
import { BetService } from './bet.service';

@ApiTags('会员下注')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.User, Role.Vip, Role.Admin)
@Controller()
export class MemberBetsController {
  constructor(private readonly betService: BetService) {}

  @Post('member/games/:id/bets')
  @ApiOperation({ summary: '登录用户提交指定游戏下注' })
  @ApiBody({ type: CreateMemberBetDto })
  @ApiCreatedDataResponse(BetOrderResponseDto, { messageExample: '下注成功' })
  async createBet(
    @Req() request: Request,
    @Param('id', ParseIntPipe) gameId: number,
    @Body() input: CreateMemberBetDto,
  ) {
    return {
      message: '下注成功',
      bet: await this.betService.createMemberBet(
        request.user!.id,
        gameId,
        input,
      ),
    };
  }

  @Get('member/bets')
  @ApiOperation({ summary: '登录用户查询个人下注历史' })
  @ApiOkPaginatedResponse(BetOrderResponseDto)
  getMemberBets(@Req() request: Request, @Query() query: QueryBetsDto) {
    return this.betService.listMemberBets(request.user!.id, query);
  }
}
