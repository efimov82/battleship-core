import { v4 as uuidv4 } from 'uuid';

export class Player {
  private accessToken: string;
  private _isReady = false;

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
}
