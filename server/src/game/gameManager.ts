import { Client } from '../clients/clientTypes';

import {
  GameStateCallback,
  Card,
  GameStateInterface,
  Suit,
} from '../models/gameStateTypes';

const game = require('../models/game');

interface gameInterface {
  startGame: StartGame
  highestCard: any
  gameState: GameStateInterface
  nextRound: any
  pickUp: any
}

interface StartGame {
  (clients: Client[])
}

module.exports = function () {
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
    // set new players
    const game = games.get(roomId);
    game.nextRound()
    games.set(roomId, game);
    return game.gameState;
  };

  const pickUp = (roomId: string) => {
    // set new players
    // deal cards to players (if they need them) in correct order
    const game = games.get(roomId);
    game.pickUp()
    games.set(roomId, game);
    return game.gameState;
  };

  const verifyAttack = (
    card: Card, 
    clientId: string,
    roomId: string,
    callback: any,
    gameState: GameStateInterface
  ) => {

    // can't attack on non existent room
    if (!gameExists(roomId)) {
      callback('Game does not exist');
      return false;
    }

    // can't attack if it's not attackers turn
    if (!correctAttacker(roomId, clientId)) {
      callback('This player cannot attack');
      return false;
    }

    // can't attack if 6 pairs have already been played
    if (games.get(roomId).gameState.pairs.length > 5) {
      callback('Maximum cards have already been played');
      return false;
    }

    // if defender has defended one, the attacker can attack again if the value matches any in the pairs already
    // TODO: this is a pretty messy function - should be cleaned up
    const pair = gameState.pairs.slice(-1)[0];
    if (pair?.defend) {

      const sameValue = gameState.pairs.some((p) => {
        return (p.attack.value === card.value || p.defend.value === card.value)
      });

      if (!sameValue) {
        callback('Card value doesn\'t match any on the table')
        return false;
      }
      
    }

    if (!pair?.defend && pair?.attack) {
      callback('Waiting on defender');
      return false;
    }

    // default true so it doesn't always fail
    return true
  }

  /**
   * Remove the played card from the player
   * Mutates gamestate object passed into function
   * @param card the card that the player attacked with
   * @param clientId the id of the player that attacked
   * @param gameState the state of the game to be updated
   */
  const removeCardFromAttacker = (
    card: Card,
    clientId: string,
    gameState: GameStateInterface
  ) => {

    const playerIndex = gameState.players.findIndex((player) => {
      return player.player.clientId === clientId;
    });

    const cardIndex = gameState.players[playerIndex].cards
      .findIndex((_card) => {
        console.log(_card);
        return (_card.suit === card.suit && _card.value === card.value);
      });

    const cards = gameState.players[playerIndex].cards;
    cards.splice(cardIndex, 1);

    if (playerIndex && cardIndex) {
      gameState.players[playerIndex].cards = cards;
    }
  }

  const attack = (
    card: Card,
    clientId: string,
    roomId: string,
    callback: GameStateCallback
  ): boolean | GameStateInterface => {

    let mutatedGame = games.get(roomId);

    console.log('attacking')

    if (!verifyAttack(card, clientId, roomId, callback, mutatedGame.gameState)) {
      console.log('attack failed');
      return false;
    }

    removeCardFromAttacker(card, clientId, mutatedGame.gameState)

    mutatedGame.gameState.pairs.push({
      attack: card,
      defend: undefined,
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

    console.log(attacking, defending);

    const highest = highestCard(
      attacking,
      defending,
      mutatedGame.gameState.trump
    );

    console.log('highest', highest)

    if (!highest) {
      callback('Unable to defend with this card')
      return false
    }

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
    const pairIndex = mutatedGame.gameState.pairs.findIndex((_pair) => {
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

  const getGame = (roomId: string) => {
      if (gameExists(roomId)) return games.get(roomId)
  }

  /**
   * Returns the highest card, taking into account the trump suit
   * if the cards are not compatable, returns undefined
   * 
   * @param attack Attacking card
   * @param defend Defending card
   * @param trump Trump suit
   */
  const highestCard = (attack: Card, defend: Card, trump: Suit): Card => {
    // check same suit match
    if (attack.suit === defend.suit) {
      if (attack.value > defend.value) return attack;
      if (defend.value > attack.value) return defend;
    }

    // check trump suit match
    if (attack.suit === trump) return attack;
    if (defend.suit === trump) return defend;

    // return undefined if cards are not compatable
    return undefined;
  };

  return {
    startGame,
    attack,
    nextRound,
    defend,
    pickUp,
    getGame,
  };
};
