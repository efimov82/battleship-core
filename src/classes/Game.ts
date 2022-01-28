import { v4 as uuidv4 } from 'uuid';
import { Cell } from './Cell';
import { Field } from './Field';
import { GameState, GameType } from '../common/game.enums';
import { GameSettings, ShipsCount } from '../common/game.types';
import { Player } from './Player';
import { AddShipPayload } from 'src/common/events.responses';

export class Game {
  private id: string;
  private player1: Player;
  private player2: Player;
  private field1: Field;
  private field2: Field;
  private state: GameState;

  constructor(private settings: GameSettings) {
    this.id = uuidv4();

    this.field1 = new Field(settings.rows, settings.cols, settings.ships);
    this.field2 = new Field(settings.rows, settings.cols, settings.ships);

    console.log(settings);
    if (settings.gameType === GameType.singlePlay) {
      this.player2 = new Player('Computer', null);
      this.generateDataForPlayer2();
    }
    this.state = GameState.created;
  }

  public updatePlayerSocketId(accessToken: string, socketId: string): Player {
    if (this.player1.getAccessToken() === accessToken) {
      this.player1.setSocketId(socketId);
      return this.player1;
    } else if (this.player2.getAccessToken() === accessToken) {
      this.player2.setSocketId(socketId);
      return this.player2;
    }

    throw new Error(`AccessToken ${accessToken} not found.`);
  }

  public getPlayerByAccessToken(accessToken: string): Player {
    if (this.player1.getAccessToken() === accessToken) {
      return this.player1;
    } else if (this.player2.getAccessToken() === accessToken) {
      return this.player2;
    }

    throw new Error(
      `getPlayerByAccessToken(): Token ${accessToken} not found.`,
    );
  }

  public getRival(player: Player): Player | null {
    if (player === this.player1) {
      return this.player2;
    } else if (player === this.player2) {
      return this.player1;
    }
  }

  public getPlayerShipsCount(player: Player): ShipsCount {
    if (player === this.player1) {
      return this.field1.getAvailableShipsCount();
    } else if (player === this.player2) {
      return this.field2.getAvailableShipsCount();
    }
  }

  public isPlayerReady(player: Player): boolean {
    return false; // TODO this.player1.isReady;
  }

  public getPlayerField(player: Player): Cell[][] {
    if (player === this.player1) {
      return this.field1.getData();
    } else if (player === this.player2) {
      return this.field2.getData();
    }

    throw new Error(
      `getPlayerField(): AccessToken ${player.getAccessToken()} not found.`,
    );
  }

  public getRivalField(player: Player): Cell[][] | null {
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

  public autoFill(accessToken: string): Player | null {
    if (this.player1.getAccessToken() === accessToken) {
      this.field1.generateShips(this.settings.ships, true);
      return this.player1;
    } else if (this.player2.getAccessToken() === accessToken) {
      this.field2.generateShips(this.settings.ships, true);
      return this.player2;
    }
  }

  public getPlayer1(): Player {
    return this.player1;
  }

  public getPlayer2(): Player {
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

  protected generateDataForPlayer2(): void {
    this.player2.setNickname('Computer');
    this.field2.generateShips(this.settings.ships);
  }
}
