import {Client} from '../clients/clientTypes';

import {
  GameStateCallback,
  Card,
  GameStateInterface,
  Suit,
} from '../models/gameStateTypes';

const game = require('../models/game');

interface gameInterface {
  startGame: StartGame,
  highestCard: any,
  gameState: GameStateInterface
}

interface StartGame {
  (clients: Client[])
}

module.exports = function() {
  const games = new Map<string, gameInterface>();

  const newGame = (roomId: string) => {
    games.set(roomId, game());
  };

  const startGame = (
      roomId: string,
      players: Client[],
      callback: GameStateCallback
  ) => {
    if (gameExists(roomId)) {
      callback('Game has already been started');
      return false;
    }
    if (players.length < 2) {
      callback('At least two people must join to play');
      return false;
    }
    if (!gameExists(roomId)) {
      newGame(roomId);
      const game = games.get(roomId);
      game.startGame(players);
      callback(null, game.gameState);
      return game.gameState;
    }
  };

  const nextRound = (roomId: string) => {
    console.log(roomId);
  };

  const attack = (
      card: Card,
      clientId: string,
      roomId: string,
      callback: GameStateCallback
  ) => {
    console.log('attacking from gamemanager');
    if (!gameExists(roomId)) {
      callback('Game does not exist');
      return false;
    }

    // check if attacker is correct
    if (!correctAttacker(roomId, clientId)) {
      callback('This player cannot attack');
      return false;
    }

    if (games.get(roomId).gameState.pairs.length > 5) {
      callback('Maximum cards have already been played');
      return false;
    }

    const mutatedGame = games.get(roomId);

    // remove the card from the players hand
    const playerIndex = mutatedGame.gameState.players.findIndex((player) => {
      return player.player.clientId === clientId;
    });

    const cardIndex = mutatedGame.gameState.players[playerIndex].cards
        .findIndex((_card) => {
          console.log(_card);
          return (_card.suit === card.suit && _card.value === card.value);
        });

    const cards = mutatedGame.gameState.players[playerIndex].cards;
    cards.splice(cardIndex, 1);

    if (playerIndex && cardIndex) {
      mutatedGame.gameState.players[playerIndex].cards = cards;
    }

    mutatedGame.gameState.pairs.push({
      attack: card,
      defend: null,
    });

    games.set(roomId, mutatedGame);

    callback(null, mutatedGame.gameState);
    return mutatedGame.gameState;
  };

  const defend = (
      attacking: Card,
      defending: Card,
      clientId: string,
      roomId: string,
      callback: GameStateCallback
  ) => {
    const mutatedGame = games.get(roomId);

    const highest = highestCard(
        attacking,
        defending,
        mutatedGame.gameState.trump
    );
    if (
      highest.suit !== defending.suit ||
        highest.value !== defending.value
    ) {
      callback('This card isn\'t high enough to defend with');
      return false;
    }

    if (!gameExists(roomId)) {
      callback('Game does not exist');
      return false;
    }

    // check if attacker is correct
    if (!correctDefender(roomId, clientId)) {
      callback('This player cannot defend');
      return false;
    }

    // remove the card from the players hand
    // todo make this into a function
    const playerIndex = mutatedGame.gameState.players.findIndex((player) => {
      return player.player.clientId === clientId;
    });
    const cardIndex = mutatedGame.gameState.players[playerIndex].cards
        .findIndex((_card) => {
          console.log(_card);
          return (
            _card.suit === defending.suit &&
            _card.value === defending.value
          );
        });
    const cards = mutatedGame.gameState.players[playerIndex].cards;
    cards.splice(cardIndex, 1);
    if (playerIndex && cardIndex) {
      mutatedGame.gameState.players[playerIndex].cards = cards;
    }

    // find attacking card, pair the defend with it
    const pairIndex = mutatedGame.gameState.pairs.findIndex((_pair)=> {
      return (
        _pair.attack.suit === attacking.suit &&
        _pair.attack.value === attacking.value
      );
    });

    mutatedGame.gameState.pairs[pairIndex].defend = defending;

    games.set(roomId, mutatedGame);

    callback(null, mutatedGame.gameState);
    return mutatedGame.gameState;
  };

  const correctAttacker = (roomId: string, clientId: string) => {
    return games.get(roomId).gameState.attacker.clientId === clientId;
  };

  const correctDefender = (roomId: string, clientId: string) => {
    return games.get(roomId).gameState.defender.clientId === clientId;
  };

  const gameExists = (roomId: string) => {
    return games.has(roomId);
  };

  const highestCard = (cardA: Card, cardB: Card, trump: Suit): Card => {
    if (cardA.suit === cardB.suit) {
      if (cardA.value > cardB.value) {
        return cardA;
      } else return cardB;
    }

    if (cardA.suit === trump) {
      return cardA;
    } else return cardB;
  };

  return {
    startGame,
    attack,
    nextRound,
    defend,
    // pickUp,
    // nextRound,
  };
};
