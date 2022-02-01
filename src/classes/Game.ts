import { v4 as uuidv4 } from 'uuid';
import { Cell, CellState, CellTypeEnum } from './Cell';
import { Field } from './Field';
import { GameState, GameType } from '../common/game.enums';
import { GameSettings, ShipsCount } from '../common/game.types';
import { Player } from './Player';
import { AddShipPayload } from 'src/common/events.responses';
import { randomInt } from 'crypto';
import { BotPlayer } from './BotPlayer';
import { IPlayer } from './Player.interface';
import { Observable, Subject } from 'rxjs';
import { Ship } from './Ship';

type Shot = {
  row: number;
  col: number;
};
export class Game {
  private id: string;
  private player1: IPlayer;
  private player2: IPlayer;
  private field1: Field;
  private field2: Field;
  private state: GameState;
  private shotsSubject: Subject<Cell> = new Subject();
  #currentTurn = randomInt(3) > 1 ? 2 : 1;

  constructor(private settings: GameSettings) {
    this.id = uuidv4();

    this.field1 = new Field(settings.rows, settings.cols, settings.ships);
    this.field2 = new Field(settings.rows, settings.cols, settings.ships);

    if (settings.gameType === GameType.singlePlay) {
      this.player2 = new BotPlayer('Computer', null);
      this.player2.setGodMode();
      this.player2.setSpeed(settings.speed);
      this.field2.generateShips(this.settings.ships);
      this.player2.setIsReady(true);
    }
    this.state = GameState.created;
  }

  public updatePlayerSocketId(accessToken: string, socketId: string): IPlayer {
    if (this.player1.getAccessToken() === accessToken) {
      this.player1.setSocketId(socketId);
      return this.player1;
    } else if (this.player2.getAccessToken() === accessToken) {
      this.player2.setSocketId(socketId);
      return this.player2;
    }

    throw new Error(`AccessToken ${accessToken} not found.`);
  }

  public getPlayerByAccessToken(accessToken: string): IPlayer {
    if (this.player1.getAccessToken() === accessToken) {
      return this.player1;
    } else if (this.player2.getAccessToken() === accessToken) {
      return this.player2;
    }

    throw new Error(
      `getPlayerByAccessToken(): Token ${accessToken} not found.`,
    );
  }

  public getRival(player: IPlayer): IPlayer | null {
    if (player === this.player1) {
      return this.player2;
    } else if (player === this.player2) {
      return this.player1;
    }
  }

  public getRivalShips(player: IPlayer): Map<number, Ship> {
    if (player === this.player1) {
      return this.field2.getShips();
    } else if (player === this.player2) {
      return this.field1.getShips();
    }
  }

  public getPlayerShipsCount(player: IPlayer): ShipsCount {
    if (player === this.player1) {
      return this.field1.getAvailableShipsCount();
    } else if (player === this.player2) {
      return this.field2.getAvailableShipsCount();
    }
  }

  public isPlayerTurn(player: IPlayer): boolean {
    if (player === this.player1) {
      return this.#currentTurn === 1;
    } else {
      return this.#currentTurn === 2;
    }
  }

  public isPlayerWin(player: IPlayer): boolean {
    if (player === this.player1) {
      return this.player1.isWin();
    } else {
      return this.player2.isWin();
    }
  }

  public getPlayerField(player: IPlayer): Cell[][] {
    if (player === this.player1) {
      return this.field1.getData();
    } else if (player === this.player2) {
      return this.field2.getData();
    }

    throw new Error(
      `getPlayerField(): AccessToken ${player.getAccessToken()} not found.`,
    );
  }

  public getRivalField(player: IPlayer): Cell[][] | null {
    if (player === this.player1) {
      if (this.player2) {
        return this.field2.getData(true);
      } else {
        return null;
      }
    } else if (player === this.player2) {
      return this.field1.getData(true);
    }

    throw new Error(
      `getRivalField() AccessToken ${player.getAccessToken()} not found.`,
    );
  }

  public addShip(accessToken: string, data: AddShipPayload): boolean {
    if (this.player1.getAccessToken() === accessToken) {
      //const [row, col, shipSize, isVertical] = data;
      return (
        this.field1.addShip(
          data.row,
          data.col,
          data.shipSize,
          data.isVertical,
        ) !== null
      );
    } else if (this.player2.getAccessToken() === accessToken) {
      return (
        this.field2.addShip(
          data.row,
          data.col,
          data.shipSize,
          data.isVertical,
        ) !== null
      );
    }
  }

  public deleteShip(accessToken: string, row: number, col: number): boolean {
    if (this.player1.getAccessToken() === accessToken) {
      //const [row, col, shipSize, isVertical] = data;
      return this.field1.deleteShip(row, col) !== null;
    } else if (this.player2.getAccessToken() === accessToken) {
      return this.field2.deleteShip(row, col) !== null;
    }
  }

  public autoFill(accessToken: string): IPlayer | null {
    if (this.player1.getAccessToken() === accessToken) {
      this.field1.generateShips(this.settings.ships, true);
      return this.player1;
    } else if (this.player2.getAccessToken() === accessToken) {
      this.field2.generateShips(this.settings.ships, true);
      return this.player2;
    }
  }

  public setPlayerReady(accessToken: string): boolean {
    if (this.player1.getAccessToken() === accessToken) {
      const ships = this.field1.getShips();
      return this._setPlayerReady(this.player1, ships);
    } else if (this.player2.getAccessToken() === accessToken) {
      const ships = this.field2.getShips();
      return this._setPlayerReady(this.player2, ships);
    }
  }

  public takeShot(
    accessToken: string,
    row: number,
    col: number,
  ): Cell[] | null {
    if (this.player1.getAccessToken() === accessToken) {
      if (this.#currentTurn !== 1) return;
      if (this.state !== GameState.started) return;

      const cells = this.field2.takeShot(row, col);
      if (!cells) return;

      if (cells[0].getType() === CellTypeEnum.empty) {
        this.#currentTurn = 2;
      }

      if (this.field2.isAllShipsKilled()) {
        this.state = GameState.finished;
        this.player1.setIsWin(true);
      }

      return cells;
    } else if (this.player2.getAccessToken() === accessToken) {
      if (this.#currentTurn !== 2) return;
      if (this.state !== GameState.started) return;

      const cells = this.field1.takeShot(row, col);
      if (!cells) return;

      if (cells[0].getType() === CellTypeEnum.empty) {
        this.#currentTurn = 1;
      }

      if (this.field1.isAllShipsKilled()) {
        this.state = GameState.finished;
        this.player2.setIsWin(true);
      }

      return cells;
    }

    throw new Error(`takeShot() AccessToken ${accessToken} not found.`);
  }

  public isBotShot(): boolean {
    return (
      this.settings.gameType === GameType.singlePlay && this.#currentTurn === 2
    );
  }

  public async botShoting() {
    while (true) {
      const shot = await this.player2.takeShot(this.field1);
      const cells = this.field1.takeShot(shot.row, shot.col);

      if (cells[0].getType() === CellTypeEnum.empty) {
        this.#currentTurn = 1;
        this.shotsSubject.next(cells[0]);
        this.shotsSubject = new Subject();
        break;
      } else {
        this.player2.setLastSuccessShot(shot.row, shot.col);
        this.shotsSubject.next(cells[0]);

        if (this.field1.isAllShipsKilled()) {
          this.state = GameState.finished;
          this.player2.setIsWin(true);
        }
      }
    }
  }

  public getBotShots(): Observable<Cell> {
    return this.shotsSubject.asObservable();
  }

  private delay(ms = 2000) {
    return new Promise((resolve, reject) => {
      setTimeout(resolve, ms);
    });
  }

  public getType(): GameType {
    return this.settings.gameType;
  }

  protected _setPlayerReady(player: IPlayer, ships): boolean {
    if (ships.size !== this.getCountShipsInGame()) return false;

    player.setIsReady(true);
    if (this.player1.isReady() && this.player2?.isReady()) {
      this.state = GameState.started;
      if (this.settings.gameType === GameType.singlePlay) {
        this.#currentTurn = 1;
      }
    }
    return true;
  }

  protected getCountShipsInGame(): number {
    return (
      this.settings.ships.x1 +
      this.settings.ships.x2 +
      this.settings.ships.x3 +
      this.settings.ships.x4
    );
  }

  public getPlayer1(): IPlayer {
    return this.player1;
  }

  public getPlayer2(): IPlayer {
    return this.player2;
  }

  public setPlayer1(player: Player): void {
    this.player1 = player;
  }

  public setPlayer2(player: Player): void {
    this.player2 = player;
  }

  public getId(): string {
    return this.id;
  }

  public getState(): GameState {
    return this.state;
  }

  public getSettings(): GameSettings {
    return this.settings;
  }

  // protected generateDataForPlayer2(): void {
  //   this.player2.setNickname('Computer');
  //   this.field2.generateShips(this.settings.ships);
  // }
}
