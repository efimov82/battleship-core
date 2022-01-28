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
  addShip = 'addShip',
  deleteShip = 'deleteShip',
  playerReady = 'playerReady',
  rivalConnected = 'rivalConnected',
  // fieldsUpdate = 'fieldsUpdate',
  gameUpdate = 'gameUpdate',
  gameStarted = 'gameStarted',
  error = 'error',
}

export enum GameState {
  created = 'created',
  started = 'started',
  finished = 'finished',
}
