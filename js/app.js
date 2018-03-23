/*
 * Create a list that holds all of your cards
 */


/*
 * Display the cards on the page
 *   - shuffle the list of cards using the provided "shuffle" method below
 *   - loop through each card and create its HTML
 *   - add each card's HTML to the page
 */
document.addEventListener("DOMContentLoaded", function() {


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

    function checkMatch(e) {
        let indexLast = containerArray.openCards.length - 1;
        return (e.target.getAttribute('data-index') === containerArray.openCards[indexLast - 1].getAttribute('data-index'));
    }

    let iconArr = [
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
    
    let containerArray = {
        finalIconArr: shuffle(iconArr.concat(iconArr)),
        openCards: [],
        stepCount: 0,
        clickCount: 0,
    };

    const cont = document.querySelector('.deck-container');
    function create() {
        const frag = document.createDocumentFragment();
        const ul = document.createElement('ul');
        ul.setAttribute('class', 'deck');
        frag.appendChild(ul);

        for (let x = 0; x < 16; x++) {
            const li = document.createElement('li');
            li.setAttribute('class', 'card');
            li.setAttribute('data-index', `${containerArray.finalIconArr[x].iconIndex}`);
            ul.appendChild(li);

            const face = document.createElement('div');
            face.setAttribute('class', `face fa ${containerArray.finalIconArr[x].iconClass}`);
            li.appendChild(face);
        }
        cont.appendChild(frag);
    }

    create();

    document.querySelector('.deck-container').addEventListener('click', function(e) {


        if (e.target.matches('.card')) {
            containerArray.stepCount += 1;
            containerArray.clickCount += 1;

            e.target.classList.toggle('open');
            containerArray.openCards.push(e.target);

            if (containerArray.stepCount === 2) {
                if (checkMatch(e)) {
                    console.log('MATCHED');
                } else {
                    console.log('RESET')
                }
                containerArray.stepCount = 0;
            }
        }
    });
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
