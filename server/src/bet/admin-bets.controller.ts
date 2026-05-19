import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { ApiOkPaginatedResponse } from '../common/swagger/success-response.decorators';
import { BetService } from './bet.service';
import { BetOrderResponseDto } from './dto/bet-order-response.dto';
import { QueryBetsDto } from './dto/query-bets.dto';

@ApiTags('下注管理')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.Admin)
@Controller('admin/bets')
export class AdminBetsController {
  constructor(private readonly betService: BetService) {}

  @Get()
  @ApiOperation({ summary: '管理员分页查询下注历史' })
  @ApiOkPaginatedResponse(BetOrderResponseDto)
  getAdminBets(@Query() query: QueryBetsDto) {
    return this.betService.listAdminBets(query);
  }
}
