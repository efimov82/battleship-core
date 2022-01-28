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
import { GameEventType, GameState, GameType } from 'src/common/game.enums';
import { GameSettings } from 'src/common/game.types';
import { Player } from 'src/classes/Player';
import {
  AddShipPayload,
  AutoFillPayload,
  CheckInPayload,
  CreateGamePayload,
  //FieldsUpdatePayload,
  GameErrorPayload,
  GameUpdatePayload,
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
      this.sendGameUpdateForPlayer(game, player);
      return { player: player.getNickname() };
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

    this.sendGameUpdateForPlayer(game, player1);
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
      this.sendGameUpdateForPlayer(game, player);
    } else {
      return {
        error: 'AutoFill failure. Wrong accessToken:' + data.accessToken,
      };
    }
  }

  @SubscribeMessage(GameEventType.addShip)
  async addShip(
    @MessageBody()
    data: { accessToken: string; gameId: string; payload: AddShipPayload },
    @ConnectedSocket() client: any,
  ): Promise<GameErrorPayload> {
    console.log('addShip', data);
    const game = this.games.get(data.gameId);
    if (!game) {
      return { error: 'gameId not found' };
    }

    const player = game.getPlayerByAccessToken(data.accessToken);
    if (player) {
      if (game.addShip(data.accessToken, data.payload)) {
        this.sendGameUpdateForPlayer(game, player);
      }
    } else {
      return {
        error: 'AddShip failure. Wrong accessToken:' + data.accessToken,
      };
    }
  }

  @SubscribeMessage(GameEventType.deleteShip)
  async deleteShip(
    @MessageBody()
    data: { accessToken: string; gameId: string; row: number; col: number },
    @ConnectedSocket() client: any,
  ): Promise<GameErrorPayload> {
    console.log('removeShip', data);
    const game = this.games.get(data.gameId);
    if (!game) {
      return { error: 'gameId not found' };
    }

    const player = game.getPlayerByAccessToken(data.accessToken);
    if (player) {
      if (game.deleteShip(data.accessToken, data.row, data.col)) {
        this.sendGameUpdateForPlayer(game, player);
      }
    } else {
      return {
        error: 'AddShip failure. Wrong accessToken:' + data.accessToken,
      };
    }
  }

  @SubscribeMessage(GameEventType.playerReady)
  async playerReady(
    @MessageBody()
    data: { accessToken: string; gameId: string },
    @ConnectedSocket() client: any,
  ): Promise<GameErrorPayload> {
    const game = this.games.get(data.gameId);
    if (!game) {
      return { error: 'gameId not found' };
    }

    const player = game.getPlayerByAccessToken(data.accessToken);
    if (player) {
      if (game.setPlayerReady(player.getAccessToken())) {
        this.sendGameUpdateForPlayer(game, player);
        if (game.getState() === GameState.started) {
          this.sendGameStartedEvent(game);
        }
      }
    } else {
      return {
        error: 'PlayerReady failure. Wrong accessToken:' + data.accessToken,
      };
    }
  }

  protected sendGameStartedEvent(game: Game): void {
    this.sendTo(
      game.getPlayer1().getSocketId(),
      GameEventType.gameStarted,
      null,
    );

    if (game.getType() !== GameType.singlePlay) {
      this.sendTo(
        game.getPlayer2().getSocketId(),
        GameEventType.gameStarted,
        null,
      );
    }
  }

  // private sendGameUpdate(game: Game, player: Player): void {
  //   const player1 = game.getPlayer1();
  //   const player2 = game.getPlayer2();

  //   this.sendGameUpdateForPlayer(game, player1);
  //   this.sendGameUpdateForPlayer(game, player2);
  // }

  private sendFieldsUpdate(game: Game) {
    // old
    // const player1 = game.getPlayer1();
    // const player2 = game.getPlayer2();
    // this.sendFieldsUpdateForPlayer(game, player1);
    // this.sendFieldsUpdateForPlayer(game, player2);
  }

  // private sendFieldsUpdateForPlayer(game: Game, player: Player): void {
  //   if (!player) return;

  //   const fieldsUpdate = {
  //     playerField: game.getPlayerField(player.getAccessToken()),
  //     rivalField: game.getRivalField(player.getAccessToken()),
  //   };

  //   this.sendTo<FieldsUpdatePayload>(
  //     player.getSocketId(),
  //     GameEventType.fieldsUpdate,
  //     fieldsUpdate,
  //   );
  // }

  private sendGameUpdateForPlayer(game: Game, player: Player): void {
    const rival = game.getRival(player);

    const data = {
      state: game.getState(),
      settings: game.getSettings(),
      player: {
        nickname: player.getNickname(),
        field: game.getPlayerField(player),
        shipsCount: game.getPlayerShipsCount(player),
        isReady: player.isReady(),
      },
      isPlayerTurn: game.isPlayerTurn(player),
    };

    if (rival) {
      data['rival'] = {
        nickname: rival.getNickname(),
        field: game.getRivalField(player),
        shipsCount: game.getPlayerShipsCount(rival),
        isReady: rival.isReady(),
      };
    }

    this.sendTo<GameUpdatePayload>(
      player.getSocketId(),
      GameEventType.gameUpdate,
      data,
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
