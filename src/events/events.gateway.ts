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
import { Game } from 'src/classes/Game';
import { GameEventType, GameType } from 'src/common/game.enums';
import { GameSettings } from 'src/common/game.types';
import { Player } from 'src/classes/Player';
import {
  AutoFillPayload,
  CheckInPayload,
  CreateGamePayload,
  FieldsUpdatePayload,
  GameErrorPayload,
  JoinGamePayload,
  rivalConnectedPayload,
} from '../common/events.responses';

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
  tokensSockets: Map<string, string> = new Map();

  handleConnection(client: any) {
    console.log('client connected', client.id);
  }

  handleDisconnect(client: any) {
    console.log('client disconnected', client.id);
    // TODO check all client lost - remove game timer???
    console.log(this.games);
  }

  @SubscribeMessage(GameEventType.createGame)
  async newGame(
    @MessageBody() data: { nickname: string; gameType: GameType },
    @ConnectedSocket() client: any,
  ): Promise<CreateGamePayload> {
    console.log('newGame:', data);
    console.log('client=', client.id);

    // TODO add on client send settings
    const settings = {
      rows: 10,
      cols: 10,
      gameType: data.gameType,
      ships: {
        x1: 4,
        x2: 3,
        x3: 2,
        x4: 1,
      },
    } as GameSettings;
    const game = new Game(settings);
    const player1 = new Player(data.nickname, client.id);
    game.setPlayer1(player1);

    this.games.set(game.getId(), game);
    this.tokensSockets.set(player1.getAccessToken(), client.id);

    return {
      accessToken: player1.getAccessToken(),
      gameId: game.getId(),
      gameState: game.getState(),
      player1: player1.getNickname(),
      player2: '',
    };
  }

  @SubscribeMessage(GameEventType.checkIn)
  async checkIn(
    @MessageBody() data: { accessToken: string; gameId: string },
    @ConnectedSocket() client: any,
  ): Promise<CheckInPayload | GameErrorPayload> {
    const game = this.games.get(data.gameId);
    if (!game) {
      return { error: 'gameId not found' };
    }

    const player = game.updatePlayerSocketId(data.accessToken, client.id);
    if (player) {
      this.sendFieldsUpdate(game);
      return { player };
    } else {
      return {
        error: 'CheckIn failure. Wrong accessToken:' + data.accessToken,
      };
    }
  }

  @SubscribeMessage(GameEventType.joinGame)
  async joinGame(
    @MessageBody() data: { gameId: string; nickname: string },
    @ConnectedSocket() client: any,
  ): Promise<JoinGamePayload | GameErrorPayload> {
    const game = this.games.get(data.gameId);
    if (!game) {
      return { error: 'Game id not found' };
    }

    const player2 = new Player(data.nickname, client.id);

    game.setPlayer2(player2);
    this.tokensSockets.set(player2.getAccessToken(), client.id);

    const player1 = game.getPlayer1();

    const rivalPayload = { nickname: data.nickname };
    this.sendTo<rivalConnectedPayload>(
      player1.getSocketId(),
      GameEventType.rivalConnected,
      rivalPayload,
    );

    this.sendFieldsUpdate(game);
    this.games.set(game.getId(), game);

    return {
      accessToken: player2.getAccessToken(),
      gameId: game.getId(),
      gameState: game.getState(),
      playerName: player2.getNickname(),
      rivalName: player1.getNickname(),
    };
  }

  @SubscribeMessage(GameEventType.autoFill)
  async autoFill(
    @MessageBody() data: { accessToken: string; gameId: string },
    @ConnectedSocket() client: any,
  ): Promise<GameErrorPayload> {
    const game = this.games.get(data.gameId);
    if (!game) {
      return { error: 'gameId not found' };
    }

    const player = game.autoFill(data.accessToken);
    if (player) {
      this.sendFieldsUpdateForPlayer(game, player);
    } else {
      return {
        error: 'AutoFill failure. Wrong accessToken:' + data.accessToken,
      };
    }
  }

  private sendGameUpdate(game: Game) {
    // TODO
  }

  private sendFieldsUpdate(game: Game) {
    const player1 = game.getPlayer1();
    const player2 = game.getPlayer2();

    this.sendFieldsUpdateForPlayer(game, player1);
    this.sendFieldsUpdateForPlayer(game, player2);
  }

  private sendFieldsUpdateForPlayer(game: Game, player: Player): void {
    if (!player) return;

    const fieldsUpdate = {
      playerField: game.getPlayerField(player.getAccessToken()),
      rivalField: game.getRivalField(player.getAccessToken()),
    };

    this.sendTo<FieldsUpdatePayload>(
      player.getSocketId(),
      GameEventType.fieldsUpdate,
      fieldsUpdate,
    );
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

  // protected emitErrorGameNotFound(gameId: string): void {
  //   this.eventService.emit('error', {
  //     message: `GameId ${gameId} not found`,
  //     code: 'invalid_game_id',
  //   });
  // }

  // @SubscribeMessage('message')
  // async identity(@MessageBody() data: any): Promise<string> {
  //   console.log('message', data);
  //   // this.server.sockets.socket().emit('message', data);
  //   return data; // JSON.stringify
  // }

  private sendTo<T>(socketId: string, event: GameEventType, payload: T): void {
    this.server.to(socketId).emit(event, payload);
  }
}
