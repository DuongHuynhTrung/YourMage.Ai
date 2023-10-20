import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './entities/user.entity';
import { JwtGuard } from 'src/auth/jwt.guard';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiNotFoundResponse,
  ApiInternalServerErrorResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';
import { LevelEnum } from './enum/level.enum';
import { UpdateInterestsDto } from './dto/update-interests.dto';

@UseGuards(JwtGuard)
@ApiTags('User')
@ApiBearerAuth()
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiOperation({ summary: 'Get a user by email' })
  @ApiOkResponse({
    description: 'The user has been successfully retrieved.',
    type: [User],
  })
  @ApiNotFoundResponse({
    description: 'User not found.',
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error.',
  })
  @Get(':email')
  getUserByEmail(@Param('email') email: string): Promise<User> {
    return this.userService.getUserByEmail(email);
  }

  @ApiOperation({ summary: 'Upgrade User Level by email' })
  @ApiOkResponse({
    description: 'User updated successfully',
  })
  @ApiNotFoundResponse({
    description: 'User not found.',
  })
  @ApiBadRequestResponse({
    description: 'User status is false.',
  })
  @ApiBadRequestResponse({
    description: 'Level is not supported.',
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error.',
  })
  @Patch(':email/level/:level')
  upgradeUserLevel(
    @Param('email') email: string,
    @Param('level') level: LevelEnum,
  ): Promise<string> {
    return this.userService.upgradeLevelUser(email, level);
  }

  @ApiOperation({ summary: 'Update Tokens When User Generate Image' })
  @ApiOkResponse({
    description: 'Updated Tokens successfully',
  })
  @ApiNotFoundResponse({
    description: 'User not found.',
  })
  @ApiBadRequestResponse({
    description: 'User status is false.',
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error.',
  })
  @Patch('generate/:email')
  updateTokensWhenGenerate(@Param('email') email: string): Promise<string> {
    return this.userService.updateTokensWhenGenerate(email);
  }

  @ApiOperation({ summary: 'Change User Name' })
  @ApiOkResponse({
    description: 'UserName has been changed',
  })
  @ApiNotFoundResponse({
    description: 'User not found.',
  })
  @ApiBadRequestResponse({
    description: 'User status is false.',
  })
  @ApiBadRequestResponse({
    description: 'UserName is not following regex pattern.',
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error.',
  })
  @Patch(':email/username/:username')
  updateUserName(
    @Param('email') email: string,
    @Param('username') username: string,
  ): Promise<string> {
    return this.userService.changeUserName(email, username);
  }

  @ApiOperation({ summary: 'Update Interests of User' })
  @ApiOkResponse({
    description: 'Interests has been updated',
  })
  @ApiNotFoundResponse({
    description: 'User not found.',
  })
  @ApiBadRequestResponse({
    description: 'User status is false.',
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error.',
  })
  @Patch(':email/interests')
  updateInterests(
    @Param('email') email: string,
    @Body() interestsDto: UpdateInterestsDto,
  ): Promise<string> {
    return this.userService.changeInterests(email, interestsDto);
  }

  @ApiOperation({ summary: 'Update User Is Older 18' })
  @ApiOkResponse({
    description: 'IsOlder18 has been updated',
  })
  @ApiNotFoundResponse({
    description: 'User not found.',
  })
  @ApiBadRequestResponse({
    description: 'User status is false.',
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error.',
  })
  @Patch(':email/isOlder18/:isOlder18')
  updateIsOlder18(
    @Param('email') email: string,
    @Param('isOlder18') isOlder18: boolean,
  ): Promise<string> {
    return this.userService.changeIsOlder18(email, isOlder18);
  }

  @ApiOperation({ summary: 'Delete User by email' })
  @ApiOkResponse({
    description: 'Delete User Successfully.',
  })
  @ApiNotFoundResponse({
    description: 'User not found.',
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error.',
  })
  @Delete(':email')
  deleteUserByEmail(@Param('email') email: string): Promise<string> {
    return this.userService.deleteUser(email);
  }
}
