/*-------constants-------*/
// The deck should be an array of objects, this way it has access to array methods
const SUITS = ['s', 'c', 'd', 'h'];
const RANKS = ['02', '03', '04', '05', '06', '07', '08', '09', '10', 'J', 'Q', 'K', 'A'];
const PHASES = {
    betting: false, 
    playerAction: false,
    dealerAction: false
};
const CHIPS = ['5', '10', '25', '50'];
// card objects should hold value(int), face(string) values 


/*----state variables----*/
// the player will be an object housing an array of card objects, hand value, bank value,      
// the dealer will be an object housing an array of card objects
// the pot holding the bet money
let player;
let dealer;
let mainDeck;
let shuffledDeck;
let pot;
let playerWin;
let bet;
/*----Cached Elements----*/
// chip buttons
// hit and stand buttons
// message element
const messageEl = document.getElementById('message');
const betAmountEl = document.getElementById('bet-amount');
const potEl = document.getElementById('pot');
const potAmountEl = document.getElementById('pot-amount');
const hitbuttonEl = document.getElementById('hit');
const standbuttonEl = document.getElementById('stand');
const dealbuttonEl = document.getElementById('deal');
const dealerHandEl = document.getElementById('dealer-hand');
const playerHandEl = document.getElementById('player-hand');
const betEl = document.getElementById('bet');
const playerChipsEl = document.getElementById('chips');
const bankAmountEl = document.getElementById('bank-amount');

/*----Event Listeners----*/
// click our chips to incriment the bet (delegated event)
// manually enter bet in a text bar
// make bet button
// hit and stand buttons
// deal cards button
dealbuttonEl.addEventListener('click', handleBet);
playerChipsEl.addEventListener('click', handleRaise);
hitbuttonEl.addEventListener('click', handleHit);
standbuttonEl.addEventListener('click', handleStand);

/*-------Functions-------*/
class Player  {
    constructor() {
        this.hand = [];
        this.bank = 0;
        this.handValue = 0;
        this.blackJack = false;
        this.bust = false;
        this.aceCount = 0;
    }

    dealCards () {
        // reset the bust and blackjack since this is the first 2 cards dealt
        this.blackJack = false;
        this.bust = false;
        this.hand.push(shuffledDeck.pop());
        this.hand.push(shuffledDeck.pop());
        this.evalHand();
    }
    
    hit () {
        this.hand.push(shuffledDeck.pop());
        this.evalHand();
    }

    evalHand () {
        // reset handvalue from last eval
        this.handValue = 0;
        // reset the acecount in case any are lingering from a previous eval
        this.aceCount = 0;
        // cards look like {face: 'c04', value: 4}
        this.hand.forEach((card) => {
            this.handValue += card.value;
            // add to the ace count if we need to 
            if (card.value === 11) this.aceCount++;
        });
        // blackjacks can only occur in the first two cards dealt
        if (this.handValue === 21 && this.hand.length === 2) {
            this.blackJack = true;
        }
        // since ace can be worth 11 or 1 we must reduce handvalue by 10 if it goes over 21
        // and an ace is in the hand
        while (this.aceCount && this.handValue > 21) {
            this.handValue -= 10;
            this.aceCount -= 1;
        }
        if (this.handValue > 21 ) this.bust = true;
        render();
    }

    renderHand(hand, container, showing=true) {
        container.innerHTML = '';
        // build a string for the card to be passed into the inner HTML
        let cardHTML = '';
        hand.forEach(card => {
            cardHTML += `<div class='card large ${card.face}'></div>`;
        });
        container.innerHTML = cardHTML;
    }
}

class Dealer extends Player {
    // use settimeouts for automated dealer turn so player can register what is going on
    constructor() {
        super();
        this.handShowing = false;
    }
    turn() {
        while (this.handValue < 18 && !this.bust) {
            this.hit();
            setTimeout(function() {return}, 2000);
            render();
        }
        if (dealer.bust){
            messageEl.innerText = "Dealer Bust! You Win!";
            setTimeout(handlePlayerWin, 3000);
            return;
        }
        findWinner();
    } 
}

init ();

function init() {
    // set the pot to 0
    resetPot();
    // get the main deck that we will copy and reshuffle
    mainDeck = getMainDeck();
    // copy and shuffle the deck
    shuffledDeck = getShuffledDeck();
    player = new Player();
    dealer = new Dealer();
    PHASES.betting = true;
    bet = 0;
    player.bank = 500;
    render();
}

function handleBet() {
    if (!bet) return;
    if (bet > player.bank) {
        messageEl.innerText = "Please Enter a Valid Bet"
        setTimeout(resetGame, 1500);
        return;
    }
    dealer.dealCards();
    player.dealCards();
    PHASES.betting = false;
    PHASES.playerAction = true;
    pot = bet;
    player.bank -= bet;
    setTimeout(checkBlackJack, 1000);
    render();
}

function handleRaise(evt) {
    if (evt.target.tagName !== 'BUTTON' || !PHASES.betting) return;
    bet += parseInt(evt.target.id);
    betAmountEl.innerText = bet;
    render()
}

function handleHit() {
    player.hit()
    if (player.bust) {
        handlePlayerBust();
    }
    render()
}

function handlePlayerBust() {
    PHASES.playerAction = false;
    messageEl.innerText = "BUST!! Please Play again"
    setTimeout(resetGame, 3000);
}

function handleStand() {
    PHASES.playerAction = false;
    PHASES.dealerAction = true;
    dealer.turn();
    render();
}

function handlePlayerWin() {
    if (!dealer.bust) {
        messageEl.innerText = 'You Win!';
        player.bank += pot * 2;
        setTimeout(resetGame, 3000);
        return;
    }
    player.bank += pot * 2;
    resetGame();
}

function handleDealerWin() {
    messageEl.innerText = "Dealer Wins, Better Luck Next Time";
    setTimeout(resetGame, 3000);
}

function checkBlackJack() {
    if (player.blackJack && !dealer.blackJack) {
        player.bank += pot * 2.5;
        messageEl.innerText = "BlackJack!!";
        setTimeout(resetGame, 4000);
    } else if (dealer.blackJack && !player.blackJack) {
        // dealer blackjack
        messageEl.innerText = "Dealer BlackJack, Better Luck Next Time";
        setTimeout(resetGame, 4000);

    } else if (dealer.blackJack && player.blackJack) {
        // both blackjack
        handleDraw();
    }
}

function findWinner() {
    if (player.handValue === dealer.handValue) {
        handleDraw();
        return;
    }
    player.handValue > dealer.handValue ? handlePlayerWin() : handleDealerWin();
}

function handleDraw() {
    player.bank += pot;
    messageEl.innerText = 'Push!';
    setTimeout(resetGame, 4000);
} 

function resetGame() {
    player.hand = [];
    dealer.hand = [];
    player.handValue = 0;
    dealer.handValue = 0;
    player.bust = false;
    dealer.bust = false;
    player.blackJack = false;
    dealer.blackJack = false;
    resetPot();
    bet = 0;
    // just make sure everything is reset in phases
    PHASES.betting = true;
    PHASES.playerAction = false;
    PHASES.dealerAction = false;
    render();
}

function resetPot() {
    pot = 0;
}

function payPlayer() {
    player.bank += pot;
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
            // card looks something like {face: 'c04', value: 4}
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

function render() {
    renderHands();
    renderMessage();
    renderPlayerChips();
    renderPotChips();
    renderControls();
    renderInfo();
}

function renderControls() {
    // set phases to booleans, if phase === false controls for that phase will be hidden
    // update the pertanent booleans with the functions that would end the current phase
    for (let phase in PHASES) {
        if (PHASES[phase]) {
            // if the phase is true then get all els that relate to that phase and make them visble
            let buttons = [...document.querySelectorAll(`.${phase}`)];
            buttons.forEach(button => (button.style.visibility = 'visible'))
        } else {
            let buttons = [...document.querySelectorAll(`.${phase}`)];
            buttons.forEach(button => (button.style.visibility = 'hidden'))
        }
    }
    // 
}

function renderHands () {
   dealer.renderHand(dealer.hand, dealerHandEl);
   player.renderHand(player.hand, playerHandEl);

}

function renderMessage () {
    if (PHASES.betting) {
        messageEl.innerText = 'Please Enter a Bet and Click Deal';
    } else if (PHASES.playerAction) {
        messageEl.innerText = 'Hit or Stand';
    }
}

function renderPlayerChips () {
    return;
}

function renderPotChips () {
    return;
}

function renderInfo() {
    bankAmountEl.innerText = player.bank;
    betEl.style.visibility = PHASES.betting ? 'visible' : 'hidden';
    potEl.style.visibility = PHASES.betting ? 'hidden' : 'visible';
    betAmountEl.innerText = bet;
    potAmountEl.innerText = pot;
}