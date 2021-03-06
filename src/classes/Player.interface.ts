import { Field } from './Field';

export interface IPlayer {
  getAccessToken(): string;
  getNickname(): string;
  setNickname(value: string): void;
  getSocketId(): string;
  setSocketId(value: string): boolean;
  setIsReady(value: boolean): void;
  isReady(): boolean;
  takeShot(field: Field): Promise<{ row: number; col: number }>;
  setLastSuccessShot(row: number, col: number);
  setIsWin(value: boolean): void;
  isWin(): boolean;
  setGodMode(): void;
  setSpeed(value: string): void;
}
