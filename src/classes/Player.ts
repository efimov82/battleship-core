import { v4 as uuidv4 } from 'uuid';
import { BotSpeed } from './BotPlayer';
import { Field } from './Field';
import { IPlayer } from './Player.interface';

export class Player implements IPlayer {
  protected _botDelay = 2000;

  private accessToken: string;
  private _isReady = false;
  private _isWin = false;

  constructor(private nickname: string, private socketId: string) {
    this.accessToken = uuidv4();
  }

  public getAccessToken(): string {
    return this.accessToken;
  }

  public getNickname(): string {
    return this.nickname;
  }

  public setNickname(value: string): void {
    this.nickname = value;
  }

  public getSocketId(): string {
    return this.socketId;
  }

  public setSocketId(value: string): boolean {
    this.socketId = value;
    return true;
  }

  public setIsReady(value = true): void {
    this._isReady = value;
  }

  public isReady(): boolean {
    return this._isReady;
  }

  public setIsWin(value: boolean): void {
    this._isWin = value;
  }

  public isWin(): boolean {
    return this._isWin;
  }

  public takeShot(field: Field): Promise<{ row: number; col: number }> {
    return null;
  }

  public setLastSuccessShot(row: number, col: number) {
    return null;
  }

  public setSpeed(value: BotSpeed): void {
    switch (value) {
      case BotSpeed.low:
        this._botDelay = 3000;
        break;
      case BotSpeed.high:
        this._botDelay = 900;
        break;
      default:
        this._botDelay = 2000;
    }
  }

  public setGodMode(value = true) {
    return null;
  }
}
