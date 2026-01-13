let suits = ["Hearts", "Diamonds", "Clubs", "Spades"]
let numbers = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"]
let aces = 0;
let deck = []
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

function getCardImage(card) {
    // e.g., https://deckofcardsapi.com/static/img/KH.png (King of Hearts)
    const suitLetter = card.suit.charAt(0).toUpperCase();
    let numberLetter = card.number;
    if (numberLetter === "10") numberLetter = "0"; // API uses 0 for 10
    
    return `https://deckofcardsapi.com/static/img/${numberLetter}${suitLetter}.png`;
}
function createDeck(){
    for(let i =0; i < suits.length; i++){
        for (let j =0; j < numbers.length; j++){
            let card = {
                suit: suits[i],
                number: numbers[j]
            }
            deck.push(card)
        }
    }
}
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        // Generate a random index from 0 to i
        const j = Math.floor(Math.random() * (i + 1));
        
        // Swap elements array[i] and array[j]
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}
function Value(card) {
    let cardValue = 0;
    let aceIncrement = 0;

    if (card.number === "J" || card.number === "Q" || card.number === "K") {
        cardValue = 10;
    } 
    else if (card.number === "A") {
        aceIncrement = 1;
        // Logic for soft/hard Ace
        if (total + 11 > 21) {
            cardValue = 1;
        } else {
            cardValue = 11;
        }
    } 
    else {
        cardValue = parseInt(card.number);
    }

    // Return both values as an object
    return {
        points: cardValue,
        addedAce: aceIncrement
    };
}

function ddrawcard(){
    let card = deck.pop();
    
    // Unpack the two values from the function
    const { points, addedAce } = Value(card);
    
    // Update your globals
    d_total += points;
    aces += addedAce; 

    // Update UI
    document.getElementById("deal").innerHTML += `<img src="${getCardImage(card)}" class="card-img">`;    document.getElementById("d_hand").textContent = `Player's Hand: (${total})`;
    document.getElementById("d_hand").textContent = `Dealer's Hand: (${d_total})`;
    
}
function drawcard() {
    let card = deck.pop();
    
    // Unpack the two values from the function
    const { points, addedAce } = Value(card);
    
    // Update your globals
    total += points;
    aces += addedAce; 

    // Update UI
    document.getElementById("num").innerHTML += `<img src="${getCardImage(card)}" class="card-img">`;
    document.getElementById("p_hand").textContent = `Player's Hand: (${total})`;
}

async function setup(){
    // Player Card 1
    let card1 = deck.pop();
    let val1 = Value(card1); // Get the object
    total = val1.points;     // Extract just the number
    aces += val1.addedAce;   // Track the ace
    document.getElementById("num").innerHTML = `<img src="${getCardImage(card1)}" class="card-img">`;

    // Dealer Card 1
    let d_card1 = deck.pop();
    let d_val1 = Value(d_card1);
    d_total = d_val1.points;
    // Note: If you want to track dealer aces specifically, you'd need a d_aces variable
    document.getElementById("deal").innerHTML = `<img src="${getCardImage(d_card1)}" class="card-img">`;

    // Player Card 2
    let card2 = deck.pop();
    let val2 = Value(card2);
    total += val2.points;    // Add the number, not the object
    aces += val2.addedAce;
    document.getElementById("num").innerHTML += `<img src="${getCardImage(card2)}" class="card-img">`;

    // Dealer Card 2 (Hidden)
    let d_card2 = deck.pop();
    let d_val2 = Value(d_card2);
    d_total += d_val2.points;
    
    document.getElementById("deal").innerHTML += `
        <img src="https://deckofcardsapi.com/static/img/back.png" id="dealer-hidden-img" class="card-img">
        <span id="dealer-second-card" style="display: none;">
            <img src="${getCardImage(d_card2)}" class="card-img">
        </span>`;
    
    document.getElementById("d_hand").textContent = `Dealer's Hand: ( ? )`;
    document.getElementById("p_hand").textContent = `Player's Hand: (${total})`;

    if (total === 21){
        await sleep(2000);
        stand()
    }


    // Show split button if cards match
    if (card1.number === card2.number){
        document.getElementById("split-btn").style.display = "inline-block";
    }

    // Ensure everything is visible
    document.getElementById("num").style.display = "block";
    document.getElementById("deal").style.display = "block";
    document.getElementById("p_hand").style.display = "block";
    document.getElementById("d_hand").style.display = "block";
}

function split(){
    console.log("split");

}
function hit(){
    drawcard();
    bust();
}
async function stand() {
    document.getElementById("dealer-hidden-img").style.display = "none";
    const hiddenCard = document.getElementById("dealer-second-card");
    if (hiddenCard) {
        hiddenCard.style.display = "inline"; 
    }
    document.getElementById("d_hand").textContent = `Dealer's Hand: (${d_total} )`;
    await sleep(500);
    while (d_total < 17){
        ddrawcard();
        document.getElementById("d_hand").textContent = `Dealer's Hand: (${d_total})`;
        await sleep(500);
    }
    await sleep(1000);
    check()
}

async function bust(){
    await sleep(1000);
    if (total > 21 && aces == 0){
        document.getElementById("message").style.display = "block";
    document.getElementById("message").textContent = "You busted! Click to start a new game.";
        reset();}
    else if (total > 21 && aces > 0){
        total -= 10;
        aces -= 1;
        document.getElementById("p_hand").textContent = `Player's Hand: (${total})`;
    }
}
function check(){
    if (d_total > 21 || total > d_total){
        reset();
        document.getElementById("message").style.display = "block";
        document.getElementById("message").textContent = "You win! Click to start a new game."; }
    else if (d_total > total && d_total <= 21){
        reset();
        document.getElementById("message").style.display = "block";
        document.getElementById("message").textContent = "You lose! Click to start a new game.";}
    else{
        reset();
        document.getElementById("message").style.display = "block";
        document.getElementById("message").textContent = "It's a tie! Click to start a new game.";
    }
}
function lose(){
    
}
function reset(){
    total = 0;
    document.getElementById("num").style.display = "none";
    document.getElementById("deal").style.display = "none";
    document.getElementById("p_hand").style.display = "none";
    document.getElementById("d_hand").style.display = "none";
    document.getElementById("num").textContent = "";
    document.getElementById("deal").textContent = "Dealer's hand: ";
    document.getElementById("hit-btn").style.display = "none";
    document.getElementById("stand-btn").style.display = "none";
    document.getElementById("split-btn").style.display = "none";

    document.getElementById("start-game-btn").style.display = "inline-block";
}

function blackjack(value){
    if (value == 21){
        return true;
    }
}


function start(event) {
    event.target.style.display = "none";
    document.getElementById("message").style.display = "none";
    
    document.getElementById("bet-label").style.display = "block";
    document.getElementById("bet-amount").style.display = "inline-block";
    document.getElementById("confirm-bet-btn").style.display = "inline-block";
}

function confirmBet() {
    // Get the value
    const betValue = document.getElementById("bet-amount").value;
    console.log("Player bet: " + betValue);

    //Hide the betting UI now that we have the value
    document.getElementById("bet-label").style.display = "none";
    document.getElementById("bet-amount").style.display = "none";
    document.getElementById("confirm-bet-btn").style.display = "none";

    //start the actual game logic
    total = 0;
    d_total = 0;
    
    createDeck();
    shuffle(deck);
    setup(); // This draws the cards

    document.getElementById("hit-btn").style.display = "inline-block";
    document.getElementById("stand-btn").style.display = "inline-block";
}



