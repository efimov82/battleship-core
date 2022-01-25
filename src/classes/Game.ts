import { v4 as uuidv4 } from 'uuid';
import { Cell } from './Cell';
import { Field } from './Field';
import { GameState, GameType } from '../common/game.enums';
import { GameSettings } from '../common/game.types';
import { Player } from './Player';

export class Game {
  private id: string;
  private player1: Player;
  private player2: Player;
  private field1: Field;
  private field2: Field;
  private state: GameState;

  constructor(private settings: GameSettings) {
    this.id = uuidv4();

    this.field1 = new Field(settings.rows, settings.cols);
    this.field2 = new Field(settings.rows, settings.cols);
    console.log(settings);
    if (settings.gameType === GameType.singlePlay) {
      this.player2 = new Player('Computer', null);
      this.generateDataForPlayer2();
    }
    this.state = GameState.created;
  }

  public updatePlayerSocketId(accessToken: string, socketId: string): string {
    if (this.player1.getAccessToken() === accessToken) {
      this.player1.setSocketId(socketId);
      return 'player1';
    } else if (this.player2.getAccessToken() === accessToken) {
      this.player2.setSocketId(socketId);
      return 'player2';
    }

    throw new Error(`AccessToken ${accessToken} not found.`);
  }

  public getPlayerField(accessToken: string): Cell[][] {
    if (this.player1.getAccessToken() === accessToken) {
      return this.field1.getData();
    } else if (this.player2.getAccessToken() === accessToken) {
      return this.field2.getData();
    }

    throw new Error(`AccessToken ${accessToken} not found.`);
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
    return GameState.created;
  }

  protected generateDataForPlayer2(): void {
    this.field2.generateShips(this.settings.ships);
    this.player2.setNickname('Computer');
  }
}
