import { Controller, Get, Param } from '@nestjs/common';
import { GameService } from './game.service';

@Controller('game')
export class GameController {
    constructor(private readonly gameService: GameService) { }

    @Get(':gameId')
    getGame(@Param('gameId') gameId: string): Game | Object {
        return this.gameService.getGame(gameId) || { message: 'Game not found' };
    }
}
