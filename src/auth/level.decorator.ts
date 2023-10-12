import { SetMetadata } from '@nestjs/common';
import { LevelEnum } from 'src/user/enum/level.enum';

export const LEVEL_KEY = 'levels';
export const Levels = (...levels: LevelEnum[]) =>
  SetMetadata(LEVEL_KEY, levels);
