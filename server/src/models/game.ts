import { GameStateInterface, Card, Player } from './gameStateTypes';
import { Client } from '../clients/clientTypes';

const deck = require('./deck');
const {
  createShuffledDeck,
} = deck();

module.exports = function () {
  const gameState: GameStateInterface = {
    players: null,
    attacker: null,
    defender: null,
    pairs: [],
    trump: null,
    drawPile: null,
    discardPile: [],
  };

  const gameRules = {
    maxPlayers: 6,
  };

  const setPlayers = (players: Client[]) => {
    gameState.players = players.map((player: Client) => {
      return {
        player,
        cards: [],
      };
    });
  };

  const setDrawPile = (cards: Card[]) => {
    gameState.drawPile = cards;
  };

  const setTrump = (card: Card): void => {
    gameState.trump = card.suit;
  };

  const pickTrump = () => {
    const trump: Card = gameState.drawPile.shift();
    setTrump(trump);
    gameState.drawPile.push(trump);
  };

  const startGame = (players: Client[]) => {
    setPlayers(players);
    setAttackerAndDefender();
    setDrawPile(createShuffledDeck());
    dealCards(gameState.drawPile, gameState.players); 
    pickTrump();
  };

  const nextRound = () => {
    setAttackerAndDefender();
    gameState.pairs.forEach(pair => {
      if (pair.attack) gameState.discardPile.push(pair.attack)
      if (pair.defend) gameState.discardPile.push(pair.defend)
    })
    gameState.pairs = []
    dealCards(gameState.drawPile, gameState.players);
  };

  const pickUp = () => {
    const playerIndex = gameState.players.findIndex((player) => (
      player.player.clientId === gameState.defender.clientId
    ))
    gameState.pairs.forEach(pair => {
      if (pair.attack) gameState.players[playerIndex].cards.push(pair.attack)
      if (pair.defend) gameState.players[playerIndex].cards.push(pair.defend)
    })
    gameState.pairs = []
    setAttackerAndDefender(true);
    dealCards(gameState.drawPile, gameState.players);
  };

  // this needs to take into account players that have no more cards in their hands
  const setAttackerAndDefender = (skipTurn?: boolean) => {
    const attacker = gameState.players.shift();
    const defender = gameState.players[0];
    gameState.players.push(attacker);
    // gameState.players.push(defender);
    gameState.attacker = attacker.player;
    gameState.defender = defender.player;
    // shift players one more time to skip the defender
    if (skipTurn === true) {
      setAttackerAndDefender()
    }
  };

  /**
   * Deal the players cards, so they have a minimum of 6 (if there is enough in the deck)
   * @param cards list of cards to deal from
   * @param players list of players to deal cards to
   */
  const dealCards = (cards: Card[], players: Player[]): void => {
    players.forEach((player) => {
      const cardCount = 6 - player.cards.length > 0 ? 6 - player.cards.length : 0
      for (let index = 0; index < cardCount; index++) {
        if (cards.length > 0) {
          player.cards.push(cards.shift());
        } 
      }
    });
  };

  const highestCard = (cardA: Card, cardB: Card): Card => {
    if (cardA.suit === cardB.suit) {
      if (cardA.value > cardB.value) {
        return cardA;
      } else return cardB;
    }

    if (cardA.suit === gameState.trump) {
      return cardA;
    } else return cardB;
  };

  return {
    gameState,
    gameRules, 
    highestCard,
    startGame,
    nextRound,
    pickUp,
  };
};
