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
    discardPile: null,
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

  const setAttackerAndDefender = () => {
    const attacker = gameState.players.shift();
    const defender = gameState.players.shift();
    gameState.players.push(attacker, defender);
    gameState.attacker = attacker.player;
    gameState.defender = defender.player;
  };

  const dealCards = (cards: Card[], players: Player[]): void => {
    players.forEach((player) => {
      // deal six cards
      for (let index = 0; index < 6; index++) {
        const card = cards.shift();
        player.cards.push(card);
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
  };
};
