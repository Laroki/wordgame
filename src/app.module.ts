import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GameController } from './game/game.controller';
import { GameModule } from './game/game.module';


@Module({
  imports: [GameModule],
  controllers: [AppController, GameController],
  providers: [AppService],
})
export class AppModule {}
