import { IntersectionType } from '@nestjs/swagger';
import { UserRelationsDto } from './user-relations.dto';
import { IdsDto } from '../../common/dtos/id-dto';

export class GetUsersDto extends IntersectionType(IdsDto, UserRelationsDto) {}
