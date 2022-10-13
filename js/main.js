/*-------constants-------*/
// The deck should be an array of objects, this way it has access to array methods
const SUITS = ['s', 'c', 'd', 'h'];
const RANKS = ['02', '03', '04', '05', '06', '07', '08', '09', '10', 'J', 'Q', 'K', 'A'];
const PHASES = {
    betting: false, 
    playerAction: false,
    dealerAction: false
};
const CHIPBET = new Audio('./sounds/pokerchip.mp3');
const WITHDRAW = new Audio('./sounds/withdraw.mp3');
/*----state variables----*/
let player;
let dealer;
let mainDeck;
let shuffledDeck;
let pot;
let playerWin;
let bet;
/*----Cached Elements----*/
const messageEl = document.getElementById('message');
const potEl = document.getElementById('pot');
const potChipsEl = document.getElementById('pot-chips');
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
dealbuttonEl.addEventListener('click', handleBet);
playerChipsEl.addEventListener('click', handleRaise);
hitbuttonEl.addEventListener('click', handleHit);
standbuttonEl.addEventListener('click', handleStand);
potChipsEl.addEventListener('click', handleWithdraw);
/*-------Functions-------*/
class Player  {
    constructor() {
        // array to house the card objects
        this.hand = [];
        this.bank = 0;
        // sum of card objects in hand value's
        this.handValue = 0;
        this.blackJack = false;
        this.bust = false;
        // for hand value function 
        this.aceCount = 0;
    }

    dealCards () {
        // reset the bust, value, and blackjack since this is the first 2 cards dealt
        this.handValue = 0;
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

    renderHand(hand, container, showing = true) {
        container.innerHTML = '';
        // build a string for the card to be passed into the inner HTML
        let cardHTML = '';
        hand.forEach(card => {
            cardHTML += `<div class='card large ${card.face}'></div>`;
        });
        container.innerHTML = cardHTML;

        // if hand not showing then toggleclass on showing hand
        if (!showing && this.hand.length > 1) {
            container.firstChild.classList.toggle('back');
        }
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
    PHASES.playerAction = false;
    PHASES.dealerAction = false;
    player.handValue = 0;
    dealer.handValue = 0;
    player.bust = false;
    dealer.bust = false;
    player.blackJack = false;
    dealer.blackJack = false;
    dealer.handShowing = false;
    bet = 0;
    player.bank = 500;
    render();
}

function handleBet() {
    // if no bet is entered then return
    if (!bet) return;
    dealer.dealCards();
    player.dealCards();
    PHASES.betting = false;
    PHASES.playerAction = true;
    player.bank -= bet;
    pot = bet * 2;
    setTimeout(checkBlackJack, 1000);
    render();
}

function handleRaise(evt) {
    // if its not the betting phase return
    if (!PHASES.betting) return;
    // in case the player misses and clicks the housing div
    if (evt.target.id === 'chips') return;
    // if the event target is a span get the id of the parent div and pass it into bet
    // if the event target is the chip div then just get its id
    bet += evt.target.tagName === 'SPAN' ? parseInt(evt.target.parentElement.id) : parseInt(evt.target.id);
    if (bet > player.bank) bet = player.bank;
    CHIPBET.play();
    render();
}

function handleWithdraw(evt) {
     // if its not the betting phase return
     if (!PHASES.betting) return;
     // in case the player misses and clicks the housing div
     if (evt.target.id === 'pot-chips') return;
     // if the event target is a span get the id of the parent div and pass it into bet
     // if the event target is the chip div then just get its id
     bet += evt.target.tagName === 'SPAN' ? parseInt(evt.target.parentElement.id) : parseInt(evt.target.id);
     if (bet < 0) bet = 0;
     WITHDRAW.play();
     render()
}

function handleHit() {
    player.hit()
    if (player.bust) {
        handlePlayerBust();
    }
    render()
}

function handleStand() {
    PHASES.playerAction = false;
    PHASES.dealerAction = true;
    dealer.handShowing = true;
    dealer.turn();
    render();
}

function handlePlayerBust() {
    dealer.handShowing = true;
    PHASES.playerAction = false;
    messageEl.innerText = "BUST!! Please Play again"
    setTimeout(resetGame, 3000);
}

function handlePlayerWin() {
    if (!dealer.bust) {
        messageEl.innerText = 'You Win!';
        payPlayer();
        setTimeout(resetGame, 3000);
        return;
    }
    payPlayer();
    resetGame();
}

function handleDealerWin() {
    messageEl.innerText = "Dealer Wins, Better Luck Next Time";
    setTimeout(resetGame, 3000);
}

function checkBlackJack() {
    if (player.blackJack && !dealer.blackJack) {
        // player blackjack
        payPlayer();
        messageEl.innerText = "BlackJack!!";
        setTimeout(resetGame, 4000);
    } else if (dealer.blackJack && !player.blackJack) {
        // dealer blackjack
        dealer.handShowing = true;
        render();
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
    player.bank += pot/2 ;
    messageEl.innerText = 'Push!';
    setTimeout(resetGame, 4000);
} 

function resetGame() {
    // if the player has no money in the bank restart the game
    if (player.bank === 0) {
        messageEl.innerText = "BANKRUPT";
        setTimeout(init, 3000)
        return;
    }
    // get a new shuffled deck
    shuffledDeck = getShuffledDeck();
    // reset the hands
    player.hand = [];
    dealer.hand = [];
    player.handValue = 0;
    dealer.handValue = 0;
    player.bust = false;
    dealer.bust = false;
    player.blackJack = false;
    dealer.blackJack = false;
    dealer.handShowing = false;
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
    if (player.blackJack) pot += (bet * 0.5);
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
    let tempDeck = [...mainDeck];
    let shuffleDeck = [];
    // when length = 0 this will evaluate false
    while (tempDeck.length) {
        // get a random idx between (0, length-1)
        let idx = Math.floor(Math.random() * tempDeck.length);
        // splice returns an array so we want the first (only) element
        shuffleDeck.push(tempDeck.splice(idx, 1)[0]);
    }
    return shuffleDeck;
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
}

function renderHands () {
   dealer.renderHand(dealer.hand, dealerHandEl, dealer.handShowing);
   player.renderHand(player.hand, playerHandEl);
}

function renderMessage () {
    if (PHASES.betting) {
        messageEl.innerText = 'Please Enter a Bet and Click Deal';
    } else if (PHASES.playerAction) {
        messageEl.innerText = 'Hit or Stand';
    }
}

function renderInfo() {
    bankAmountEl.innerText = `Bank: $${player.bank}`;
    potAmountEl.innerText = PHASES.betting ? bet : pot;
    potAmountEl.innerText = bet;
}