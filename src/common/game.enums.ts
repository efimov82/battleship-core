export enum GameType {
  singlePlay = 'singlePlay',
  multyPlay = 'multyPlay',
}

export enum GameEventType {
  message = 'message',
  connected = 'connected',
  createGame = 'createGame',
  checkIn = 'checkIn',
  joinGame = 'joinGame',
  playerConnected = 'playerConnected',
  error = 'error',
}

export enum GameState {
  created = 'created',
}
