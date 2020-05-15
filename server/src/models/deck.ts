import {Suit, Value, Card} from './gameStateTypes';

module.exports = function() {
  const suites: Array<Suit> = [
    Suit.Clubs,
    Suit.Hearts,
    Suit.Diamonds,
    Suit.Spades,
  ];

  const values: Array<Value> = [
    Value.Two,
    Value.Three,
    Value.Four,
    Value.Five,
    Value.Six,
    Value.Seven,
    Value.Eight,
    Value.Nine,
    Value.Ten,
    Value.Jack,
    Value.Queen,
    Value.King,
    Value.Ace,
  ];

  const createDeck = (fromIndex = 0): Array<Card> => {
    const deck: Array<Card> = [];
    suites.forEach((suit) => {
      values.forEach((value, index) => {
        if (index >= fromIndex) deck.push({suit, value});
      });
    });

    return deck;
  };

  const shuffleDeck = (deck: Array<Card>): Array<Card> => {
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
  };

  const createShuffledDeck = () => {
    return shuffleDeck(createDeck());
  };
  return {
    suites,
    values,
    createDeck,
    shuffleDeck,
    createShuffledDeck,
  };
};
