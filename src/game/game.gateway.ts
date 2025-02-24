import { WebSocketGateway, SubscribeMessage, MessageBody, WebSocketServer, ConnectedSocket } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { GameService } from './game.service';

@WebSocketGateway({ cors: true })
export class GameGateway {
  @WebSocketServer()
  server: Server;

  constructor(private readonly gameService: GameService) { }

  @SubscribeMessage('createGame')
  handleCreateGame(@MessageBody() { playerName, isPrivate }: { playerName: string; isPrivate: boolean }, @ConnectedSocket() client: Socket): object {
    if (playerName === '') {
      return { event: 'error', message: 'Need player name' }
    }
    const game = this.gameService.createGame(playerName, isPrivate);
    client.join(game.id);

    if (!isPrivate) {
      const games = this.gameService.getPublicGames()
      this.server.to("lobby").emit('gameListChanged', games);
    }
    return { event: 'gameCreated', data: game };
  }

  @SubscribeMessage('addPlayerToLobby')
  handleAddPlayerToLobby(@ConnectedSocket() client: Socket): object {
    client.join("lobby")
    const games = this.gameService.getPublicGames();
    return { event: 'gameListChanged', data: games };
  }

  @SubscribeMessage('joinGame')
  handleJoinGame(@MessageBody() { gameId, playerName }: { gameId: string; playerName: string }, @ConnectedSocket() client: Socket) {
    const game = this.gameService.joinGame(gameId, playerName);
    if (game) {
      client.join(game.id)
      this.server.to(gameId).emit('playerJoined', game);
      const games = this.gameService.getPublicGames()
      this.server.to("lobby").emit('gameListChanged', games);
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
        const games = this.gameService.getPublicGames()
        this.server.to("lobby").emit('gameListChanged', games);
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
