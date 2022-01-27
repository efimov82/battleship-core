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
  autoFill = 'autoFill',
  rivalConnected = 'rivalConnected',
  fieldsUpdate = 'fieldsUpdate',
  error = 'error',
}

export enum GameState {
  created = 'created',
}
