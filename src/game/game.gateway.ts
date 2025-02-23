import { WebSocketGateway, SubscribeMessage, MessageBody, WebSocketServer, ConnectedSocket } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { GameService } from './game.service';

@WebSocketGateway({ cors: true })
export class GameGateway {
  @WebSocketServer()
  server: Server;

  constructor(private readonly gameService: GameService) { }

  @SubscribeMessage('createGame')
  handleCreateGame(@MessageBody() playerName: string, @ConnectedSocket() client: Socket): object {
    if (playerName === '') {
      return { event: 'error', message: 'Need player name' }
    }

    const game = this.gameService.createGame(playerName);
    client.join(game.id);
    return { event: 'gameCreated', data: game };
  }

  @SubscribeMessage('joinGame')
  handleJoinGame(@MessageBody() { gameId, playerName }: { gameId: string; playerName: string }, @ConnectedSocket() client: Socket) {
    const game = this.gameService.joinGame(gameId, playerName);
    if (game) {
      client.join(game.id)
      this.server.to(gameId).emit('playerJoined', game);
      return null
    }
    return { event: 'error', message: 'Game full or not found' };
  }

  @SubscribeMessage('sendWord')
  handleSendWord(@MessageBody() { gameId, word, playerName }: { gameId: string; word: string, playerName: string }) {
    const game = this.gameService.addWord(gameId, word, playerName);

    if (game) {
      if (game.finished) {
        this.server.to(gameId).emit('gameFinished', game);
      } else {
        // check if both words are sent to notify both client
        if (game.wordsFilled) {
          this.server.to(gameId).emit('wordAdded', game);
          return null
        }
        return { event: 'wordAdded', data: game };
      }
    } else {
      return { event: 'error', data: "Game not found or already finished" };
    }
  }
}
