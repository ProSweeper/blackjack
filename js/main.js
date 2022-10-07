/*-------constants-------*/
// The deck should be an array of objects, this way it has access to array methods
    
// card objects should hold value(int), suit(string), showing(boolean) values 

/*----state variables----*/
// the player will be an object housing an array of card objects, hand value, bank value,      
// the dealer will be an object housing an array of card objects
// the pot holding the bet money

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
// check the players bank balance and make sure its not 0
// when the player goes to submit a bet make sure it is not larger than the bank value
// subtract the bet amount from the players bank and add it to the pot
// shuffle the deck
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