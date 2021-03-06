import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  // WsResponse,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Game } from 'src/classes/Game';
import { GameEventType, GameState, GameType } from 'src/common/game.enums';
import { GameSettings } from 'src/common/game.types';
import { Player } from 'src/classes/Player';
import {
  AddShipPayload,
  // AutoFillPayload,
  CheckInPayload,
  CreateGamePayload,
  //FieldsUpdatePayload,
  GameErrorPayload,
  GameUpdatePayload,
  JoinGamePayload,
  rivalConnectedPayload,
  ShotUpdatePayload,
} from '../common/events.responses';
import { Cell } from 'src/classes/Cell';
import { IPlayer } from 'src/classes/Player.interface';

const port = process.env.PORT || 9090;
//Number(port),
@WebSocketGateway({
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
    // TODO check all client lost - remove game???
    console.log(this.games.size);
  }

  @SubscribeMessage(GameEventType.createGame)
  async newGame(
    @MessageBody()
    data: { nickname: string; gameType: GameType; speed?: string },
    @ConnectedSocket() client: any,
  ): Promise<CreateGamePayload> {
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
      speed: data.speed,
    } as GameSettings;
    const game = new Game(settings);
    const player1 = new Player(data.nickname, client.id);
    game.setPlayer1(player1);

    this.cleanOldGames();
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
  ): Promise<boolean | GameErrorPayload> {
    const game = this.games.get(data.gameId);
    if (!game) {
      return { error: 'gameId not found' };
    }

    const player = game.getPlayerByAccessToken(data.accessToken);
    if (player) {
      if (game.addShip(data.accessToken, data.payload)) {
        this.sendGameUpdateForPlayer(game, player);
        return true;
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
  ): Promise<boolean | GameErrorPayload> {
    const game = this.games.get(data.gameId);
    if (!game) {
      return { error: 'gameId not found' };
    }

    const player = game.getPlayerByAccessToken(data.accessToken);
    if (player) {
      if (game.deleteShip(data.accessToken, data.row, data.col)) {
        this.sendGameUpdateForPlayer(game, player);
        return true;
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

  @SubscribeMessage(GameEventType.takeShot)
  async takeShot(
    @MessageBody()
    data: { accessToken: string; gameId: string; row: number; col: number },
    @ConnectedSocket() client: any,
  ): Promise<GameErrorPayload> {
    const game = this.games.get(data.gameId);
    if (!game) {
      return { error: 'gameId not found' };
    }

    const player = game.getPlayerByAccessToken(data.accessToken);
    if (player) {
      const shotResult = await game.takeShot(
        data.accessToken,
        data.row,
        data.col,
      );
      if (shotResult) {
        this.sendShotUpdate(game, player, shotResult);
      }

      if (game.isBotShot()) {
        // ?? unsubscribe
        const subscription = game.getBotShots().subscribe((cell) => {
          // const cell = new Cell(botShot.row, botShot.col);
          this.sendShotUpdateForPlayer(game, player, [cell], false);
          this.sendGameUpdateForPlayer(game, player);
        });

        game.botShoting();
      }
    } else {
      return {
        error: 'takeShot failure. Wrong accessToken:' + data.accessToken,
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

  protected sendShotUpdate(game: Game, player: IPlayer, cells: Cell[]): void {
    this.sendShotUpdateForPlayer(game, player, cells);
    this.sendGameUpdateForPlayer(game, player);

    if (game.getType() !== GameType.singlePlay) {
      const rival = game.getRival(player);
      this.sendShotUpdateForPlayer(game, rival, cells, false);
      this.sendGameUpdateForPlayer(game, rival);
    }
  }

  protected sendShotUpdateForPlayer(
    game: Game,
    player,
    cells: Cell[],
    isPlayerShotted = true,
  ): void {
    const payload = {
      isPlayerTurn: game.isPlayerTurn(player),
      state: game.getState(),
    };

    if (isPlayerShotted) {
      payload['rival'] = {
        field: cells,
      };
    } else {
      payload['player'] = {
        field: cells,
      };
    }

    this.sendTo<ShotUpdatePayload>(
      player.getSocketId(),
      GameEventType.shotUpdate,
      payload,
    );
  }

  private sendGameUpdateForPlayer(game: Game, player: IPlayer): void {
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
      isPlayerWin: game.isPlayerWin(player),
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

  protected cleanOldGames() {
    this.games.forEach((game, key) => {
      if (game.getState() === GameState.finished) {
        this.games.delete(key);
      }
    });
  }

  private sendTo<T>(socketId: string, event: GameEventType, payload: T): void {
    this.server.to(socketId).emit(event, payload);
  }
}
