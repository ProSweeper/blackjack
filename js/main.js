/*-------constants-------*/
// The deck should be an array of objects, this way it has access to array methods
const SUITS = ['s', 'c', 'd', 'h'];
const RANKS = ['02', '03', '04', '05', '06', '07', '08', '09', '10', 'J', 'Q', 'K', 'A'];
const PHASES = ['betting', 'player action', 'dealer action']
// card objects should hold value(int), suit(string), showing(boolean) values 


/*----state variables----*/
// the player will be an object housing an array of card objects, hand value, bank value,      
// the dealer will be an object housing an array of card objects
// the pot holding the bet money
let player;
let dealer;
let mainDeck;
let shuffledDeck;
let pot;
/*----Cached Elements----*/
// chip buttons
// hit and stand buttons
// message element

/*----Event Listeners----*/
// click our chips to incriment the bet
// manually enter bet in a text bar
// make bet button
// hit and stand buttons
// deal cards button

/*-------Functions-------*/
init ();

function init() {
    // set the pot to 0
    resetPot();
    // get the main deck that we will copy and reshuffle
    mainDeck = getMainDeck();
    // copy and shuffle the deck
    shuffledDeck = getShuffledDeck();
}

class Player {
    constructor() {
        this.hand = [];
        this.bank = 0;
        this.handValue = 0;
        this.blackJack = false;
        this.bust = false;
    }

    dealCard () {
        this.hand.push(shuffledDeck.pop());
        this.hand.push(shuffledDeck.pop());
        if (this.handValue === 21) {
            this.blackJack = true;
        }
    }
    
    hit () {
        this.hand.push(shuffledDeck.pop());
    }
}

function resetPot() {
    pot = 0;
}

function getMainDeck() {
    // array to hold the card objects
    const deck = [];
    // loop through each suit
    SUITS.forEach(function(suit) {
        // loop through each rank to get all 52 cards
        RANKS.forEach(function(rank) {
            let card = {
                // face value for the css 
                face: `${suit}${rank}`,
                // value for the hand value, if rank is a number use that, else give value of 10
                // or 11 if Ace
                value: Number(rank) || (rank === 'A' ? 11 : 10)
            };
            // push the card to the deck
            deck.push(card);
        })
    })
    return deck;
}


function getShuffledDeck() {
    // we want to use a temp deck so we don't alter our maindeck ever
    let tempDeck = mainDeck;
    let shuffledDeck = [];
    // when length = 0 this will evaluate false
    while (tempDeck.length) {
        // get a random idx between (0, length-1)
        let idx = Math.floor(Math.random() * tempDeck.length);
        // splice returns an array so we want the first (only) element
        shuffledDeck.push(tempDeck.splice(idx, 1)[0]);
    }
    return shuffledDeck;
}
// check the players bank balance and make sure its not 0
// subtract the bet amount from the players bank and add it to the pot
// deal cards
// handle standing or hitting
// evaluate player hand
// dealers turn
// compare hands
// handle the phases
// render
    // render hands
    // render board
    // render message
    // render chips
    // render buttons