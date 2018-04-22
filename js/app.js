document.addEventListener("DOMContentLoaded", function() {

    /** DECLARATIONS */

    const cont = document.getElementsByClassName('deck-container')[0];
    const deckContainer = document.getElementsByClassName('deck-container')[0];
    const gameEnd = document.getElementsByClassName('game-end')[0];
    const endTitle = document.getElementsByClassName('end-title')[0];
    const endStats = document.getElementsByClassName('end-stats')[0];
    const endTime = document.getElementsByClassName('end-time')[0];
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
    
    const cardsObj = {
        finalIconArr: [...iconArr, ...iconArr],
        stepCount: 0,
        clickCount: 0,
        moveCount: 0,
        openCards: [],
        scoreArray: [],
        get openCardsLast() { return this.openCards[this.openCards.length - 1] },
        get openCardsForelast() { return this.openCards[this.openCards.length - 2] },
        get lastScore() { return this.scoreArray[this.scoreArray.length - 1] },
        get starsCount() {
            if (star3.style.visibility !== "hidden") return 3;
            else if (star2.style.visibility !== "hidden") return 2;
            else if (star1.style.visibility !== "hidden") return 1;
            else return 0;
        }
    };

    readyDeck();

    /** EVENT HANDLERS */

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

    /** FUNCTIONS */

    /** Handles card matching logic */
    function cardLogic(e) {
        if (e.target.classList.contains('card')) {
            if (!timerOn) timer(100, 0, 120);
            cardsObj.stepCount += 1;
            cardsObj.clickCount += 1;
            e.target.classList.toggle('open');
            cardsObj.openCards.push(e.target);

            if (cardsObj.stepCount === 2) {
                attempt();
                if (checkMatch()) {
                    toggleClass(cardsObj.openCardsLast, cardsObj.openCardsForelast, 'match');
                    if (cardsObj.openCards.length === cardsObj.finalIconArr.length) {
                        fetchStats();
                        gameWon();
                    }
                } else {
                    toggleClass(cardsObj.openCardsLast, cardsObj.openCardsForelast, 'fail');
                    setTimeout(closeCards, 600, cardsObj.openCardsLast, cardsObj.openCardsForelast);
                    cardsObj.openCards.pop();
                    cardsObj.openCards.pop();
                }
                cardsObj.stepCount = 0;
            }
        }
    }

    /** Sets deck */
    function readyDeck() {
        shuffle(cardsObj.finalIconArr);
        createDeck();
    }

    /** Creates deck */
    function createDeck() {
        const frag = document.createDocumentFragment();
        const ul = document.createElement('ul');
        ul.setAttribute('class', 'deck');
        frag.appendChild(ul);

        for (let x = 0, n = cardsObj.finalIconArr.length; x < n; x++) {
            const li = document.createElement('li');
            li.setAttribute('class', 'card');
            li.setAttribute('data-index', `${cardsObj.finalIconArr[x].iconIndex}`);
            ul.appendChild(li);

            const cardInner = document.createElement('div');
            cardInner.setAttribute('class', `card-inner`);
            li.appendChild(cardInner);

            const face = document.createElement('div');
            face.setAttribute('class', `face fa ${cardsObj.finalIconArr[x].iconClass}`);
            cardInner.appendChild(face);
        }
        cont.appendChild(frag);
    }

    /**
     * @description Timer that counts upwards (stopwatch) with drift correction
     * @param {number} interval - Delay at which it runs tick / updates time in miliseconds
     * @param {number} startAt - Time it starts counting from in seconds
     * @param {number} endAt - Time it stops executing in seconds
     */
    function timer(interval, startAt, endAt) {
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

            //do
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
                timerSpan.style.color = "red";
            }

            //stop if endAt met else reassign setTimeout with corrected time
            if ((endAt * 1000 + startTime) <= Date.now() && endAt) {
                fetchStats();
                gameLost();
            } else timedFunc = setTimeout(tick, interval - driftTime);
        }
    }

    /**
     * @description Shuffles array
     * @param {Object[]} array
     * Shuffle function from http://stackoverflow.com/a/2450976
     */
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

    /** Counts moves and updates text */
    function attempt() {
        cardsObj.moveCount += 1;
        attemptSpan.textContent = `Moves: ${cardsObj.moveCount}`;
        spamPenalty();
    }

    /** Handles star visibility */
    function spamPenalty() {
        if (cardsObj.moveCount === 15) star3.style.visibility = "hidden";
        else if (cardsObj.moveCount === 25) star2.style.visibility = "hidden";
        else if (cardsObj.moveCount === 35) attemptSpan.style.color = "red";
        else if (cardsObj.moveCount === 40) {
            fetchStats();
            gameLost();
        }
    }

    /** Checks whether two last opened cards data-index matches */
    function checkMatch() {
        return (cardsObj.openCardsLast.getAttribute('data-index') === cardsObj.openCardsForelast.getAttribute('data-index'));
    }

    /**
     * @description Toggles class
     * @param {Object} elm1
     * @param {Object} elm2
     * @param {string} classString
     */
    function toggleClass(elm1, elm2, classString) {
        elm1.classList.toggle(classString);
        elm2.classList.toggle(classString);
    }

    /** Callback function of setTimeout */
    function closeCards(openCardsLast, openCardsForelast) {
        toggleClass(openCardsLast, openCardsForelast, 'open');
        toggleClass(openCardsLast, openCardsForelast, 'fail');
    }

    /** Shows stats when game won */
    function gameWon() {
        endTitle.textContent = "Congratulations! You Won!";
        stats();
        resetFadeClasses(gameEnd);
        gameEnd.classList.toggle('fadeIn');
        resetGame();
    }

    /** Shows stats when game lost */
    function gameLost() {
        endTitle.textContent = "Congratulations! You Lost!";
        stats();
        resetFadeClasses(gameEnd);
        gameEnd.classList.toggle('fadeIn');
        resetGame();
    }

    /** Saves stats in an array */
    function fetchStats() {
        cardsObj.scoreArray.push({moveCount: cardsObj.moveCount, starsCount: cardsObj.starsCount, timerStr: timerSpan.textContent});
    }

    /** Sets stats */
    function stats() {
        const str = cardsObj.lastScore.timerStr;
        const min = Number(str.substr(8,1));
        const sec = Number(str.substr(10,2));
        const starText = cardsObj.starsCount === 1 ? "Star" : "Stars";
        endStats.textContent = `With ${cardsObj.moveCount} Moves and ${cardsObj.starsCount} ${starText}.`;
        const secText = sec === 1 ? "second" : "seconds";
        if (min) {
            const minText = min === 1 ? "minute" : "minutes";
            endTime.textContent = `Your time is ${min} ${minText} and ${sec} ${secText}.`;
        }
        else endTime.textContent = `Your time is ${sec} ${secText}.`;
    }

    /**
     * @description Removes fade classes
     * @param {Object} elm
     */
    function resetFadeClasses(elm) {
        elm.classList.remove('fadeIn');
        elm.classList.remove('fadeOut');
    }

    /** Resets game state */
    function resetGame() {
        resetTimer();
        resetTimerSpan();
        resetStars();
        resetMoves();
        removeDeck();
        cardsObj.openCards = [];
        cardsObj.clickCount = 0;
        cardsObj.stepCount = 0;
    }

    /** Stops timer function execution */
    function resetTimer() {
        clearTimeout(timedFunc);
        timerOn = false;
    }

    /** Resets timer */
    function resetTimerSpan() {
        timerSpan.style.color = "black";
        timerSpan.textContent = "Timer: 00:00.0";
    }

    /** Resets stars to visible */
    function resetStars() {
        star2.style.visibility = "visible";
        star3.style.visibility = "visible";
    }

    /** Resets moves counter */
    function resetMoves() {
        cardsObj.moveCount = 0;
        attemptSpan.style.color = "black";
        attemptSpan.textContent = "Moves: 0";
    }

    /** Removes cards */
    function removeDeck() {
        while (cont.firstChild) {
            cont.removeChild(cont.firstChild);
        }
    }
});