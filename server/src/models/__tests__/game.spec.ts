/* eslint-disable no-unused-vars */
import { Suit, Value, Card, GameStateInterface } from '../gameStateTypes';
import { Client } from '../../clients/clientTypes';
const game = require('../game');

const clients: Client[] = [
  {
    address: '123',
    clientId: '1',
    userName: 'client-1',
  },
  {
    address: '234',
    clientId: '2',
    userName: 'client-2',
  },
  {
    address: '345',
    clientId: '3',
    userName: 'client-3',
  },
  {
    address: '456',
    clientId: '4',
    userName: 'client-4',
  },
  {
    address: '567',
    clientId: '5',
    userName: 'client-5',
  },
  {
    address: '678',
    clientId: '6',
    userName: 'client-6',
  },
];

describe('Card tests', () => {
  const {
    highestCard,
  } = game();

  it('Returns the highest card', () => {
    const fiveOfClubs: Card = {
      suit: Suit.Clubs,
      value: Value.Five,
    };
    const sixOfClubs = {
      suit: Suit.Clubs,
      value: Value.Six,
    };

    const highest = highestCard(fiveOfClubs, sixOfClubs);
    expect(highest).toBe(sixOfClubs);
  });
});

describe('Game tests', () => {
  const {
    gameState,
    startGame,
  }: {
    gameState: GameStateInterface,
    startGame: (clients: any) => {}
  } = game();

  it('Correctly sets up gamestate', () => {
    startGame(clients);
    expect(gameState).toHaveProperty('players');
    expect(gameState.players).toHaveLength(6);
    expect(gameState.players[0].cards).toHaveLength(6);
    expect(gameState.players[1].cards).toHaveLength(6);
    expect(gameState.players[2].cards).toHaveLength(6);
    expect(gameState.players[3].cards).toHaveLength(6);
    expect(gameState.players[4].cards).toHaveLength(6);
    expect(gameState.players[5].cards).toHaveLength(6);
    expect(gameState.drawPile).toHaveLength(16);
    expect(gameState.trump).toBeTruthy();
  });
});
