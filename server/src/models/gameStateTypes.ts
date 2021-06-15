/* eslint-disable no-unused-vars */
import { Client } from '../clients/clientTypes';

export enum Suit {
  Hearts = '♥',
  Diamonds = '♦',
  Spades = '♠',
  Clubs = '♣'
}

export enum Value {
  Two = 1,
  Three = 2,
  Four = 3,
  Five = 4,
  Six = 5,
  Seven = 6,
  Eight = 7,
  Nine = 8,
  Ten = 9,
  Jack = 10,
  Queen = 11,
  King = 12,
  Ace = 13,
}

export interface Card {
  suit: Suit,
  value: Value
}

export interface GameStateInterface {
  players: Array<Player>,
  attacker: Client,
  defender: Client,
  pairs: Pair[],
  trump: Suit,
  drawPile: Array<Card>,
  discardPile: Array<Card>
}

export interface Pair {
  attack: Card,
  defend: Card
}

export interface Player {
  player: Client,
  cards: Array<Card>
}

export interface GameStateCallback {
  (err?: string, gameState?: GameStateInterface)
};
