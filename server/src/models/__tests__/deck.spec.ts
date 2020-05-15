const Deck = require('../deck');
const {
  createDeck,

} = Deck();

describe('Create a full deck of cards', () => {
  it('Has 52 cards', ()=>{
    const deck = createDeck();
    expect(deck).toHaveLength(52);
  });
});

describe('Create a 36 card deck', () => {
  it('Has 36 cards', ()=>{
    const deck = createDeck(4);
    expect(deck).toHaveLength(36);
  });
});
