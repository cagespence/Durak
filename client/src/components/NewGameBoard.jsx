import React, { useState, useEffect, useRef } from "react";
import "./styles.scss";
import { connect, useDispatch } from "react-redux";
import { gameActions } from "../redux/actions/gameActions";
var _ = require('lodash');

function useWindowSize() {
  const isClient = typeof window === 'object';

  function getSize() {
    return isClient ? window.innerWidth : undefined
  }

  const [windowSize, setWindowSize] = useState(getSize);

  useEffect(() => {
    if (!isClient) {
      return false;
    }
    
    function handleResize() {
      setWindowSize(getSize());
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowSize;
}

const DRAW_PILE_SELECTOR = 'talon';
const GAME_AREA_SELECTOR = 'game';
const DISCARD_PILE_SELECTOR = 'discard';

// Hook to compare previous value and current value
const  usePrevious = (value) => {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}

const virtualMove = (oldFrom, oldTo, element) => {
  // remove 'element' from 'from'
  console.log('oldFrom', oldFrom)
  const oldElementIndex = oldFrom.findIndex(el => el.suit === element.suit && el.value === element.value)
  oldFrom.splice(oldElementIndex, 1)
  // add 'element' to 'to'
  oldTo.push(element)
  return [oldFrom, oldTo]
}

// const difference = (arrays) => {
//   const movedCardSelectors = []
//   arrays.forEach((prevCardArray, prevArrayIndex) => {
//     prevCardArray.previous.forEach((prevCard, cardIndex) => {
//       arrays.forEach((newCardArray, newArrayIndex) => {
//         const found = newCardArray.new.findIndex(newCard => {
//           if (
//             prevCard.suit === newCard.suit &&
//             prevCard.value === newCard.value
//           ) {
//             return prevArrayIndex !== newArrayIndex
//           }
//           return false;
//         });
//         if (found !== -1) {
//           movedCardSelectors.push({
//             from: `${newCardArray.new[found].suit}-${newCardArray.new[found].value}`, 
//             to: newCardArray.selector
//           })
//         }
//       });
//     });
//   });
//   return movedCardSelectors
// };

const getPositions = (opponents) => 
  opponents.length === 1
  ? ["top"]
  : opponents.length === 2 
  ? ["top-left", "top-right"]
  : opponents.length === 3
  ? ["top-left", "top", "top-right"]
  : opponents.length === 4
  ? ["left", "top-left", "top", "top-right"]
  : opponents.length === 5
  ? ["left", "top-left", "top", "top-right", "right"]
  : []

const NewGameBoard = ({ 
    players,
    user,
    attacker,
    defender,
    pairs,
    trump,
    drawPile,
    discardPile,
    error,
    room
  }) => {
  const currentPlayer = (player) => player.player.clientId === user.clientId
  const dispatch = useDispatch()
  const [newPlayers, setNewPlayers] = useState(players)
  const [newPairs, setNewPairs] = useState(pairs)
  const [newDrawPile, setNewDrawPile] = useState(drawPile)
  const [newDiscardPile, setNewDiscardPile] = useState(discardPile)
  const [positions, setPositions] = useState(getPositions(players.filter(currentPlayer)))
  const [selectors, setSelectors] = useState([])
  const [differences, setDifferences] = useState([])
  const [value, setValue] = useState(0);
  const [refs, setRefs] = useState()
  const [names, setNames] = useState(players.map((player, index) => `${player.player.userName}_ref`))
  const windowSize = useWindowSize()

  const prevPlayers = usePrevious(newPlayers)
  const prevPairs = usePrevious(newPairs)
  const prevDrawPile = usePrevious(newDrawPile)
  const prevDiscardPile = usePrevious(newDiscardPile)

  const discard = useRef(React.createRef())
  const game = useRef(React.createRef())
  const talon = useRef(React.createRef())
  
  const newRefs = useRef(newPlayers.map(() => React.createRef()))
  
  const applyAnimation = (originSelector, desitinationSelector, index) => {
    let origin;
    let destination;
    switch (originSelector) {
      case DRAW_PILE_SELECTOR:
        origin = talon.current
        break;
      case GAME_AREA_SELECTOR:
        origin = game.current
        break;
      case DISCARD_PILE_SELECTOR:
        origin = discard.current
        break;
      default: 
        origin = newRefs.current[index]
        break;
    }
    switch (desitinationSelector) {
      case DRAW_PILE_SELECTOR:
        destination = talon.current
        break;
      case GAME_AREA_SELECTOR:
        destination = game.current
        break;
      case DISCARD_PILE_SELECTOR:
        destination = discard.current
        break;
      default: 
        destination = newRefs.current[index]
        break;
    }
    // const origin = refs.find(ref => ref.name === `${originSelector}_ref`).ref.current;
    // const destination = refs.find(ref => ref.name === `${originSelector}_ref`).ref.current;
    if (!(origin || destination)) return;
    const bodyRect = document.body.getBoundingClientRect();
    const originRect = origin.getBoundingClientRect();
    const originOffset = {
      x: originRect.left - bodyRect.left,
      y: originRect.top - bodyRect.top
    };
    const destinationRect = destination.getBoundingClientRect();
    const destinationOffset = {
      x: destinationRect.left - bodyRect.left,
      y: destinationRect.top - bodyRect.top
    };
    const deltaX = destinationOffset.x - originOffset.x;
    const deltaY = destinationOffset.y - originOffset.y;
    origin.style.transition = "transform .5s cubic-bezier(.48,.31,.4,.89)";
    origin.style.transform = `translateX(${deltaX}px) translateY(${deltaY}px)`;
  }

  // move element with classname to position of another element by classname
  const moveElement = (
    originSelector,
    desitinationSelector,
    fromArray,
    toArray,
    element
  ) => {
    applyAnimation(originSelector, desitinationSelector);
    setTimeout(() => {
      const [newFrom, newTo] = virtualMove(fromArray, toArray, element);
      switch (originSelector) {
        case DRAW_PILE_SELECTOR:  
          setNewDrawPile(newFrom);
          break;
        case GAME_AREA_SELECTOR:
          setNewPairs(newFrom);
          break;
        case DISCARD_PILE_SELECTOR: 
          setNewDiscardPile(newFrom)
          break;
        default: 
          // find player and update state
          const playerIndex = newPlayers.findIndex(player => player.userName === originSelector)
          const playerMutation = [...newPlayers]
          playerMutation[playerIndex].cards = newFrom
          // setNewPlayers(playerMutation)
          break;
      }
      switch (desitinationSelector) {
        case DRAW_PILE_SELECTOR:  
          setNewDrawPile(newTo);
          break;
        case GAME_AREA_SELECTOR:
          setNewPairs(newTo);
          break;
        case DISCARD_PILE_SELECTOR: 
          setNewDiscardPile(newTo)
          break;
        default: 
          // find player and update state
          const playerIndex = newPlayers.findIndex(player => player.userName === originSelector)
          const playerMutation = [...newPlayers]
          playerMutation[playerIndex].cards = newTo
          // setNewPlayers(playerMutation)
          break;
      }
    }, 500);
  };

  const difference = async (arrays) => {
    const movedCardSelectors = [];
    const previousArrays = []
      await arrays.forEach((prevCardArray, prevArrayIndex) => {
      prevCardArray.previous.forEach((prevCard, prevCardIndex) => {
        arrays.forEach((newCardArray, newArrayIndex) => {
          const found = newCardArray.new.findIndex(newCard => {
            if (
              prevCard.suit === newCard.suit &&
              prevCard.value === newCard.value
            ) {
              return prevArrayIndex !== newArrayIndex;
            }
            return false;
          });
          if (found !== -1) {
            movedCardSelectors.push({
              from: `${newCardArray.new[found].suit}-${
                newCardArray.new[found].value
              }`,
              to: newCardArray.selector,
              fromSelector: prevCardArray.selector,
              toSelector: newCardArray.selector,
              index: prevCardArray.index
            });

            const playersCopy = [...newPlayers]
              console.log('newplay', newPlayers)
              console.log('playercopy', playersCopy)
              if(prevCardArray.selector === 'talon') {
                const talon = [...newDrawPile.splice(prevCardIndex, 1)]
                // setNewDrawPile(talon)
              } else if (prevCardArray.selector === 'discard') {
  
              } else if (prevCardArray.selector === 'game') {
  
              } else {
                playersCopy.forEach((player, index) => {
                  setTimeout(() => {
                    const copy = [...playersCopy]
                    if (copy[index].player.userName === prevCardArray.selector) {
                      copy[index].cards.splice(prevCardIndex, 1)
                    }
                    // setNewPlayers(copy)
                  }, 500)
                })
              }
              if(newCardArray.selector === 'talon') {
                const talon = [...newDrawPile.splice(prevCardIndex, 1)]
                setNewDrawPile(talon)
              } else if (newCardArray.selector === 'discard') {
  
              } else if (newCardArray.selector === 'game') {
  
              } else {
                playersCopy.forEach((player, index) => {
                  setTimeout(() => {
                    const copy = [...playersCopy]
                    console.log(copy)
                    // console.log('player', player)
                    if (copy[index].player.userName === newCardArray.selector) {
                      copy[index].cards.push(prevCard)
                    }
                    // setNewPlayers(copy)
                  }, 500)
                })
              }
            }
        });
      });
    });
    return {differences: arrays, selectors: movedCardSelectors};
  };

  useEffect(() => {
    if (prevPlayers !== undefined) {
      const pileDiffs = [
        {
          selector: "talon", 
          previous: prevDrawPile, 
          new: drawPile}, 
        {
          selector: "discard", 
          previous: prevDiscardPile, 
          new: discardPile
        }
      ]

      const getDif = async () => {
        return await players.map((newPlayer, index) => {
          return {
            selector: newPlayer.player.userName, 
            previous: prevPlayers[index].cards, 
            new: newPlayer.cards,
            index
          }
          })
        }
      getDif().then(diff => {
        const diffs = pileDiffs.concat(diff)
        console.log(diffs)
  
        difference(diffs).then(({differences, selectors}) => {
          // setSelectors(selectors)
          // setDifferences(difference)
          // const intermediates = generateIntermediates(selectors, differences)
          moveWithDelay(selectors)
          setTimeout(() => {
            // setNewPlayers(players)
            // setNewPairs(pairs)
            // setNewDrawPile(drawPile)
            // setNewDiscardPile(discardPile)
          }, selectors.length * 500)
        })
  
      })
      
      
    }

    return () => {
      //
    }
  }, [players, pairs, drawPile, discardPile])

const moveWithDelay = (selectors) =>{
  selectors.forEach((selector, index) => {
    setTimeout(() => {
      moveElement(selector.from, selector.to, selector.index) 
    }, 500 * index)
  })
}

// const generateIntermediates = (selectors, differences) => {

//   const arrayDeltas = selectors.map(selector => {
//     console.log('from', differences[selector.oldIndex])
//     console.log('to', differences[selector.newIndex])
//     console.log('el', differences[selector.oldIndex].previous[selector.elementIndex])
//     return {
//       from: differences[selector.oldIndex], 
//       to: differences[selector.newIndex],
//       index: selector.elementIndex
//     }
//   })

//   console.log(arrayDeltas)
//   const changes = new Map()
  
//   for (let i = 0; i < arrayDeltas.length; i++) {
//     const delta = arrayDeltas[i]
//     const changedCount = Math.abs(delta.from.new.length - delta.from.previous.length )
//     for (let j = 0; j < changedCount; j++) {
//       const from = delta.from.previous
//       const to = delta.to.previous
//       const fromChanges = changes.get(delta.from.selector)
//       const toChanges = changes.get(delta.to.selector)
//       if (!fromChanges){
//         changes.set(delta.from.selector, [[...from]])
//       }
//       if (fromChanges) {
//         console.log(fromChanges)
//         let mutated = [...fromChanges[fromChanges.length-1]]
//         mutated.splice(delta.index, 1)
//         changes.set(delta.from.selector, [...fromChanges, ...mutated])
//       }
//       console.log(Array.from(changes.values()))
//     }
//   }
// }

  // useEffect(()=> {
  //   console.log('selectors', selectors)
  //   console.log('diffs', differences)
  //   const intermediates = generateIntermediates(selectors, differences)
  //   moveWithDelay(selectors)
  //   setTimeout(() => {
  //     setNewPlayers(players)
  //     setNewPairs(pairs)
  //     setNewDrawPile(drawPile)
  //     setNewDiscardPile(discardPile)
  //   }, selectors.length * 500)
  // }, [selectors])
  
  const Opponents = ({ opponents }) => {
    return (
      <>
        {opponents.map((opponent, index) => (
          <div 
          ref={() => newRefs.current[index]} 
          className={`opponent-${positions[index]} ${opponent.player.userName}`}
          key={`opponent-${positions[index]}`}>
            <div className="container">
              <div className="name">{opponent.player.userName}</div>
              <CardSpread cards={opponent.cards} />
            </div>
          </div>
        ))}
      </>
    );
  };

  const CardSpread = ({ cards, showFace, style, value, delta = 10 }) => {
    const length = cards.length;
    const begin = (-length * delta) / 2 + delta / 2;
    const angle = index => {
      return begin + delta * index;
    };
    const height = index => {
      return Math.abs(angle(index) / delta);
    };
    const transform = index => {
      return `rotate(${angle(index)}deg) translate(0px, ${height(index)}px)`;
    };
    
    return cards.map((card, index) => (
      <div
        className={`card-container ${
          showFace ? (index == value ? "selected" : "") : ""
        }
        `} key={`${card.suit}-${card.value}`}
      >
        <div
          // ref={() => refs.find(ref => ref.name === `card ${card.suit}-${card.value}_ref`)?.ref}
          className={`card ${card.suit}-${card.value}`}
          style={{
            transform: `${transform(index)}`,
            translate: "all 1s",
            ...style
          }}
        >
          {showFace ? (
            <>
              <div className="card-top">
                {card.value}
                <br />
                {card.suit}
              </div>
              <div className="card-bottom">
                {card.value}
                <br />
                {card.suit}
              </div>
            </>
          ) : (
            <div className="card-back" />
          )}
        </div>
      </div>
    ));
  };

  const Game = ({ cards }) =>
    cards.map(card => (
      <div 
        className="card current"
        key={`${card.suit}-${card.value}`}
        >
        <div className="card-top">
          {card.value}
          <br />
          {card.suit}
        </div>
        <div className="card-bottom">
          {card.value}
          <br />
          {card.suit}
        </div>
      </div>
    ));

  const handleAttack = (card, room) => {
    dispatch(gameActions.attack(card, room))
  }
  
  const handleDeal = () => {
    console.log('dealing', room)
    dispatch(gameActions.deal(room))
  }
  return (
    <div class="grid-container">
      <Opponents opponents={newPlayers.filter(player => player.player.clientId !== user.clientId)} />
      <div class={`player ${(newPlayers.find(currentPlayer)).player.userName}`}>
        <div className="container">
          <CardSpread showFace={true} cards={(newPlayers.find(currentPlayer)).cards} value={value} />
          <div class="slidecontainer">
            <input
              type="range"
              min="0"
              max={(newPlayers.find(currentPlayer)).cards.length - 1}
              onChange={e => setValue(e.target.value)}
              value={value}
              class="slider"
              id="myRange"
            />
          </div>
        </div>
      </div>
      <button
        style={{ position: "absolute", left: "50%", top: "50%" }}
        // onClick={() =>
        //   moveElement({
        //     originSelector: "selected",
        //     originArray: players.find(player => player.player.clientId === user.clientId),
        //     originIndex: 0,
        //     desitinationSelector: "current",
        //     destinationArray: gameCards
        //   })
        // }
        onClick={handleDeal}
      >
        deal
      </button>
      <div 
      // ref={() => refs.find(ref => ref.name === 'talon_ref')?.ref} class="talon"
      >
        <div className="container origin">
          <CardSpread cards={newDrawPile} delta={3} delta={0.5} style={{ marginRight: "-90px", boxShadow: '0 0 5px rgba(0, 0, 0, 5%)' }} />
        </div>
      </div>
      <div 
      // ref={() => refs.find(ref => ref.name === 'game_ref')?.ref} class="game"
      >
        <div className="container">
          <Game cards={(newPairs.map(pair => [pair.attack, pair.defend])).flat()} />
        </div>
      </div>
    </div>
  );
}

const mapStateToProps = (state) => ({
  user: state.registration.user,
  players: state.game.gameState.players,
  attacker: state.game.gameState.attacker,
  defender: state.game.gameState.defender,
  pairs: state.game.gameState.pairs,
  trump: state.game.gameState.trump,
  drawPile: state.game.gameState.drawPile,
  discardPile: state.game.gameState.discardPile,
  error: state.game.error,
  room: state.rooms.inRoom
})

export default connect(mapStateToProps)(NewGameBoard)
