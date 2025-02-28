import { Module } from '@nestjs/common';
import { GameService } from './game.service';
import { GameGateway } from './game.gateway';

@Module({
    exports: [GameService, GameGateway],
    providers: [GameService, GameGateway]
})
export class GameModule { }
