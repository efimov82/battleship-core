import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsResponse,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Game } from 'src/common/Game';
import { createGameResp } from 'src/common/game.types';
import { Player } from 'src/common/Player';
import {
  CreateGameResponse,
  GameErrorResponse,
  JoinGameResponse,
} from './events.types';
// import { Game } from 'src/common/Game';
// import { GameSettings } from '../common/game.types';
// import { ICell, newGameRes } from './events.types';

const port = process.env.PORT || 9090;
@WebSocketGateway(Number(port), {
  transports: ['websocket'],
  cors: {
    origin: '*',
  },
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  games: Map<string, Game> = new Map();
  clients: Map<string, string> = new Map();

  handleConnection(client: any) {
    console.log('client connected', client.id);
  }

  handleDisconnect(client: any) {
    console.log('client disconnected', client.id);
    const gameId = this.clients.get(client.id);
    this.games.delete(client.id);
    this.clients.delete(client.id);

    console.log(this.games);
  }

  @SubscribeMessage('createGame')
  async newGame(
    @MessageBody() data: any, // settings: GameSettings,
    @ConnectedSocket() client: any,
  ): Promise<CreateGameResponse> {
    console.log('newGame:', data);
    console.log('client=', client.id);

    // const currentGameId = this.clients.get(client.id);
    // this.games.delete(currentGameId);

    const game = new Game(); //settings
    const player1 = new Player(data.nickname, client.id);
    game.setPlayer1(player1);

    this.games.set(game.getId(), game);
    this.clients.set(game.getId(), client.id);

    return {
      accessToken: player1.getAccessToken(),
      gameId: game.getId(),
      gameState: game.getState(),
      player1: player1.getNickname(),
      player2: '',
    };
    // this.server.emit('newGameRes', {
    //   id: game.getId(),
    //   gameState: game.getState(),
    //   countMines: game.getCountMines(),
    // } as newGameRes);
  }

  @SubscribeMessage('joinGame')
  async joinGame(
    @MessageBody() data: any, // settings: GameSettings,
    @ConnectedSocket() client: any,
  ): Promise<JoinGameResponse | GameErrorResponse> {
    console.log('joinGame:', data);
    console.log('client=', client.id);

    const game = this.games.get(data.gameId);
    if (!game) {
      return { message: 'Game id not found' };
    }

    const player2 = new Player(data.nickname, client.id);

    game.setPlayer2(player2);

    const player1 = game.getPlayer1();
    this.server.to(player1.getSocketId()).emit(
      'player2Joined',
      JSON.stringify({
        nickname: data.nickname,
      }),
    );

    console.log('games', this.games);
    // Todo check need it
    // this.games.set(game.getId(), game);
    return {
      accessToken: player2.getAccessToken(),
      gameId: game.getId(),
      gameState: game.getState(),
      player1: player1.getNickname(),
      player2: player2.getNickname(),
    };
  }

  // @SubscribeMessage('cellClick')
  // async cellClick(
  //   @MessageBody() body: { gameId: string; cell: ICell },
  //   @ConnectedSocket() client: any,
  // ) {
  //   const game = this.games.get(body.gameId);
  //   if (!game) {
  //     return this.emitErrorGameNotFound(body.gameId);
  //   }

  //   const fieldUpdate = JSON.stringify(game.openCell(body.cell));

  //   this.server.emit('cellClickRes', {
  //     gameState: game.getState(),
  //     fieldUpdate,
  //   });
  // }

  protected emitErrorGameNotFound(gameId: string): void {
    this.server.emit('error', {
      message: `GameId ${gameId} not found`,
      code: 'invalid_game_id',
    });
  }

  @SubscribeMessage('message')
  async identity(@MessageBody() data: any): Promise<any> {
    console.log('message', data);
    // this.server.sockets.socket().emit('message', data);
    return data; // JSON.stringify
  }
}
