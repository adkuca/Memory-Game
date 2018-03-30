document.addEventListener("DOMContentLoaded", function() {
    const cont = document.getElementsByClassName('deck-container')[0];
    const deckContainer = document.getElementsByClassName('deck-container')[0];
    const gameEnd = document.getElementsByClassName('gameEnd')[0];
    const endTitle = document.getElementsByClassName('end-title')[0];
    const endStats = document.getElementsByClassName('end-stats')[0];
    const playAgainBtn = document.getElementsByClassName('btn-proceed')[0];
    const timerSpan = document.getElementsByClassName('timer')[0];
    const attemptSpan = document.getElementsByClassName('moves')[0];
    const star1 = document.getElementsByClassName('fa-star')[0];
    const star2 = document.getElementsByClassName('fa-star')[1];
    const star3 = document.getElementsByClassName('fa-star')[2];
    const restart = document.getElementsByClassName('restart')[0];

    timedFunc = undefined;
    timerOn = false;

    const iconArr = [
        {
            iconIndex: 1,
            iconClass: "fa-diamond"
        },
        {
            iconIndex: 2,
            iconClass: "fa-paper-plane-o"
        },
        {
            iconIndex: 3,
            iconClass: "fa-anchor"
        },
        {
            iconIndex: 4,
            iconClass: "fa-bolt"
        },
        {
            iconIndex: 5,
            iconClass: "fa-cube"
        },
        {
            iconIndex: 6,
            iconClass: "fa-bomb"
        },
        {
            iconIndex: 7,
            iconClass: "fa-leaf"
        },
        {
            iconIndex: 8,
            iconClass: "fa-bicycle"
        }
    ];
    
    const containerArray = {
        finalIconArr: iconArr.concat(iconArr),
        stepCount: 0,
        clickCount: 0,
        attemptCount: 0,
        openCards: [],
        get openCardsLast() { return this.openCards[this.openCards.length - 1] },
        get openCardsForelast() { return this.openCards[this.openCards.length - 2] },
        get starsCount() {
            if (star3.style.visibility !== "hidden") return 3;
            else if (star2.style.visibility !== "hidden") return 2;
            else if (star1.style.visibility !== "hidden") return 1;
            else return 0;
        }
    };

    readyDeck();

    restart.addEventListener('click', function() {
        resetGame();
        readyDeck();
    });

    playAgainBtn.addEventListener('click', function() {
        readyDeck();
        gameEnd.classList.toggle('fadeOut');
    });

    deckContainer.addEventListener('dragstart', function(e) {
        e.preventDefault();
    });

    deckContainer.addEventListener('click', cardLogic);

    function cardLogic(e) {
        if (e.target.classList.contains('card')) {
            if (!timerOn) timer(100, 0, 120);
            containerArray.stepCount += 1;
            containerArray.clickCount += 1;
            e.target.classList.toggle('open');
            containerArray.openCards.push(e.target);

            if (containerArray.stepCount === 2) {
                attempt();
                if (checkMatch()) {
                    toggleClass(containerArray.openCardsLast, containerArray.openCardsForelast, 'match');
                    if (containerArray.openCards.length === containerArray.finalIconArr.length) gameWon();
                } else {
                    toggleClass(containerArray.openCardsLast, containerArray.openCardsForelast, 'fail');
                    setTimeout(closeCards, 600, containerArray.openCardsLast, containerArray.openCardsForelast);
                    containerArray.openCards.pop();
                    containerArray.openCards.pop();
                }
                containerArray.stepCount = 0;
            }
        }
    }

    function readyDeck() {
        shuffle(containerArray.finalIconArr);
        createDeck();
    }

    function createDeck() {
        const frag = document.createDocumentFragment();
        const ul = document.createElement('ul');
        ul.setAttribute('class', 'deck');
        frag.appendChild(ul);

        for (let x = 0, n = containerArray.finalIconArr.length; x < n; x++) {
            const li = document.createElement('li');
            li.setAttribute('class', 'card');
            li.setAttribute('data-index', `${containerArray.finalIconArr[x].iconIndex}`);
            ul.appendChild(li);

            const cardInner = document.createElement('div');
            cardInner.setAttribute('class', `card-inner`);
            li.appendChild(cardInner);

            const face = document.createElement('div');
            face.setAttribute('class', `face fa ${containerArray.finalIconArr[x].iconClass}`);
            cardInner.appendChild(face);
        }
        cont.appendChild(frag);
    }

    function timer(interval, startAt, endAt) { //interval in ms, startAt in sec, endAt in sec 0 for infinite
        let counter = 0;
        const startTime = Date.now() - (startAt * 1000);
        timerOn = true;
        timedFunc = setTimeout(tick, interval);

        function tick() {
            //calculation drift time
            counter += interval;
            const expectedTime = startTime + counter;
            const driftTime = Date.now() - expectedTime;

            //correcting
            const timePast = Date.now() - startTime;
            const corrTimePast = timePast - driftTime;

            const time = [
                Math.floor((corrTimePast / 1000 / 60) % 60),
                Math.floor((corrTimePast / 1000) % 60),
                Math.floor((corrTimePast / 100) % 10)
            ];

            const prepMin = time[0] < 10 ? `0${time[0]}` : `${time[0]}`;
            const prepSec = time[1] < 10 ? `0${time[1]}` : `${time[1]}`;
            const prepMS = time[2];
            timerSpan.textContent = `Timer: ${prepMin}:${prepSec}.${prepMS}`;

            if (time[0] === 0 && time[1] === 30 && time[2] === 0) star3.style.visibility = "hidden";
            else if (time[0] === 1 && time[1] === 0 && time[2] === 0) star2.style.visibility = "hidden";
            else if (time[0] === 1 && time[1] === 50 && time[2] === 0) {
                star1.style.visibility = "hidden";
                timerSpan.style.color = "red";
            }

            ((endAt * 1000 + startTime) <= Date.now() && endAt) ? gameLost() : timedFunc = setTimeout(tick, interval - driftTime);
        }
    }

    // Shuffle function from http://stackoverflow.com/a/2450976
    function shuffle(array) {
        let currentIndex = array.length, temporaryValue, randomIndex;

        while (currentIndex !== 0) {
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;
            temporaryValue = array[currentIndex];
            array[currentIndex] = array[randomIndex];
            array[randomIndex] = temporaryValue;
        }

        return array;
    }

    function attempt() {
        containerArray.attemptCount += 1;
        attemptSpan.textContent = `Moves: ${containerArray.attemptCount}`;
        spamPenalty();
    }

    function spamPenalty() {
        if (containerArray.attemptCount === 15) star3.style.visibility = "hidden";
        else if (containerArray.attemptCount === 25) star2.style.visibility = "hidden";
        else if (containerArray.attemptCount === 35) {
            star1.style.visibility = "hidden";
            attemptSpan.style.color = "red";
        }
        else if (containerArray.attemptCount === 40) gameLost();
    }

    function checkMatch() {
        return (containerArray.openCardsLast.getAttribute('data-index') === containerArray.openCardsForelast.getAttribute('data-index'));
    }

    function toggleClass(elm1, elm2, classString) {
        elm1.classList.toggle(classString);
        elm2.classList.toggle(classString);
    }

    function closeCards(openCardsLast, openCardsForelast) {
        toggleClass(openCardsLast, openCardsForelast, 'open');
        toggleClass(openCardsLast, openCardsForelast, 'fail');
    }

    function gameWon() {
        endTitle.textContent = "Congratulations! You Won!";
        const starText = containerArray.starsCount === 1 ? "Star" : "Stars";
        endStats.textContent = `With ${containerArray.attemptCount} Moves and ${containerArray.starsCount} ${starText}.`;
        resetFadeClasses(gameEnd);
        gameEnd.classList.toggle('fadeIn');
        resetGame();
    }

    function gameLost() {
        endTitle.textContent = "Congratulations! You Lost!";
        const starText = containerArray.starsCount === 1 ? "Star" : "Stars";
        endStats.textContent = `With ${containerArray.attemptCount} Moves and ${containerArray.starsCount} ${starText}.`;
        resetFadeClasses(gameEnd);
        gameEnd.classList.toggle('fadeIn');
        resetGame();
    }

    function resetFadeClasses(elm) {
        elm.classList.remove('fadeIn');
        elm.classList.remove('fadeOut');
    }

    function resetGame() {
        resetTimer();
        resetTimerSpan();
        resetStars();
        resetMoves();
        removeDeck();
        containerArray.openCards = [];
        containerArray.clickCount = 0;
        containerArray.stepCount = 0;
    }

    function resetTimer() {
        clearTimeout(timedFunc);
        timerOn = false;
    }

    function resetTimerSpan() {
        timerSpan.style.color = "black";
        timerSpan.textContent = "Timer: 00:00.0";
    }

    function resetStars() {
        star1.style.visibility = "visible";
        star2.style.visibility = "visible";
        star3.style.visibility = "visible";
    }

    function resetMoves() {
        containerArray.attemptCount = 0;
        attemptSpan.style.color = "black";
        attemptSpan.textContent = "Moves: 0";
    }

    function removeDeck() {
        while (cont.firstChild) {
            cont.removeChild(cont.firstChild);
        }
    }
});
/*
 * set up the event listener for a card. If a card is clicked:
 *  - display the card's symbol (put this functionality in another function that you call from this one)
 *  - add the card to a *list* of "open" cards (put this functionality in another function that you call from this one)
 *  - if the list already has another card, check to see if the two cards match
 *    + if the cards do match, lock the cards in the open position (put this functionality in another function that you call from this one)
 *    + if the cards do not match, remove the cards from the list and hide the card's symbol (put this functionality in another function that you call from this one)
 *    + increment the move counter and display it on the page (put this functionality in another function that you call from this one)
 *    + if all cards have matched, display a message with the final score (put this functionality in another function that you call from this one)
 */
