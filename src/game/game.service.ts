import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class GameService {
    private games: Map<string, Game> = new Map();

    createGame(playerName: string): Game {
        const uid = uuidv4()
        const game: Game = { id: uid, players: [], finished: false, round: 0, wordsFilled: false };
        const player: Player = { name: playerName, currentWord: '', history: [] }
        game.players.push(player)
        this.games.set(uid, game);
        return game;
    }

    joinGame(gameId: string, playerName: string): Game | null {
        const game = this.games.get(gameId);
        if (game && game.players.length < 2) {
            const player: Player = { name: playerName, currentWord: '', history: [] }
            game.players.push(player)
            return game
        }
        return null
    }

    addWord(gameId: string, word: string, playerName: string): Game | null {
        const game = this.games.get(gameId)
        if (game && !game.finished) {
            const player = game.players.find(player => player.name === playerName)
            if (game.wordsFilled) {
                // Reset current word
                game.players[0].currentWord = ''
                game.players[1].currentWord = ''
            }
            player!.currentWord = word
            game.wordsFilled = false
            if (game.players[0].currentWord === game.players[1].currentWord) {
                game.finished = true
            } else if (game.players[0].currentWord !== '' && game.players[1].currentWord !== '') {
                game.round++
                game.wordsFilled = true
                // Push current word in history
                game.players[0].history!.push(game.players[0].currentWord!)
                game.players[1].history!.push(game.players[1].currentWord!)
            }
            return game
        }
        return null;
    }

    getGame(gameId: string): Game | undefined {
        return this.games.get(gameId);
    }
}
