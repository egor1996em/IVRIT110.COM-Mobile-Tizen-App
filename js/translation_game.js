
document.addEventListener('DOMContentLoaded', function () { 

    db = openDatabase("CardGame", "1.0", "GameDB", 200000);
    if (!db){
        alert("Cannot connect to database");
    }

    var cards_selected_count = 0;
    var selectedCellsList = [];
    var cardsToCheck = createArrayOfCards();
    printCardsFromArray(getArrayWordsAndTranslations(cardsToCheck));

    document.querySelectorAll('.card').forEach(function (element, index, list){
        element.onclick = function(){

                cardClicked(element);
                cards_selected_count++;
                selectedCellsList.push(element);
                
                if(cards_selected_count == 2){

                    setTimeout(function () {
                        if (isTrueTranslate(selectedCellsList, cardsToCheck)){
                            hideTrueTranslatedElements(selectedCellsList);
                        } else {
                            setErrorToCells(selectedCellsList);
                            disposeAllStatesOfCardsWithDuring(selectedCellsList);
                        }

                        selectedCellsList = [];
                        cards_selected_count = 0;

                    }, 750, selectedCellsList, cardsToCheck);
                }
        }
    });

 }, true);

 function createArrayOfCards(){
    var cards = [];

    cards.push(new Card('Apple','Яблоко'));
    cards.push(new Card('Banana','Банан'));
    cards.push(new Card('Cherry','Вишня'));

    return cards;
 }

 function printCardsFromArray(contentArray){
    var table = document.querySelector('#gametable');

    var countRowsToAdd = contentArray.length / 2;

    for (var i = 0; i < countRowsToAdd; i++){
        var row = document.createElement('tr');
        
        var left_card_view = createRandomCellFromArray(contentArray);

        var right_card_view = createRandomCellFromArray(contentArray);

        row.appendChild(left_card_view);
        row.appendChild(right_card_view);
        table.appendChild(row);
    }
 }

 function createRandomCellFromArray(contentArray){
    var cell = document.createElement('td');
    cell.setAttribute('class', 'card');

    var randomElementNumber = getRandomValueFromDiapasone(0, contentArray.length - 1);

    cell.innerHTML += contentArray[randomElementNumber];
    contentArray.splice(randomElementNumber, 1);

    return cell;
 }

 function getArrayWordsAndTranslations(cardsArray){
   var contentToCards = [];

    cardsArray.forEach(function(element, index, list){
        contentToCards.push(element.word);
        contentToCards.push(element.translate);
    });

    return contentToCards;
 }

 function cardClicked(card){
    var card_classes = card.getAttribute('class');

    if(card_classes == "card"){
        card_classes += " selected";
    } else {
        card_classes = "card"
    }

    card.setAttribute("class", card_classes.toString());
 }

 function isTrueTranslate(selectedCellsList, cardsToCheck){
    var first_cell_value = selectedCellsList[0].innerHTML;
    var second_cell_value = selectedCellsList[1].innerHTML;
    
    for (var i = 0; i < cardsToCheck.length; i++){

        if (cardsToCheck[i].word == first_cell_value){
            if (cardsToCheck[i].translate == second_cell_value){
                cardsToCheck.splice(i,1);
                return true;
                break;
            }
        } else if (cardsToCheck[i].translate == first_cell_value) {
            if (cardsToCheck[i].word == second_cell_value){
                cardsToCheck.splice(i,1);
                return true;
                break;
            }
        }
    }

    return false;
 }

 function hideTrueTranslatedElements(selectedCellsList){
    selectedCellsList.forEach(function (element, index, list){
        element.setAttribute('class','card hide');
	setTimeout(function () {
                       element.setAttribute('style','visibility: hidden;');
                    }, 500);
    });
 }

 function setErrorToCells(selectedCellsList){
    selectedCellsList.forEach(function (element, index, list){
        element.setAttribute('class','card error');
    });
 }

 function disposeAllStatesOfCardsWithDuring(selectedCellsList){
    setTimeout(function() {
        cardClicked(selectedCellsList[0]);
        cardClicked(selectedCellsList[1]);
    }, 700);
 }

class Card {
    constructor(word, translate) {
        this.word = word.toString();
        this.translate = translate.toString();
    }
}

function getRandomValueFromDiapasone(min, max){
    var rand = min - 0.5 + Math.random() * (max - min + 1)
    rand = Math.round(rand);
    return rand;
}

 
function initDatabase(){
    db.transaction(function(tx) {
        tx.executeSql("SELECT COUNT(*) FROM Dictionary", [], function (result) { 

         }, function (tx, error) {
        tx.executeSql("CREATE TABLE Dictionary (id REAL UNIQUE, word TEXT, translation TEXT)", [], null, null);
        tx.executeSql("INSERT INTO Dictionary (Word, Translation) values(?, ?)", ["Apple", "Яблоко"], null, null);
        tx.executeSql("INSERT INTO Dictionary (Word, Translation) values(?, ?)", ["Chery", "Вишня"], null, null);
        tx.executeSql("INSERT INTO Dictionary (Word, Translation) values(?, ?)", ["Banana", "Банан"], null, null);
        tx.executeSql("INSERT INTO Dictionary (Word, Translation) values(?, ?)", ["Tomato", "Помидор"], null, null);
        tx.executeSql("INSERT INTO Dictionary (Word, Translation) values(?, ?)", ["Carrot", "Морковь"], null, null);
        tx.executeSql("INSERT INTO Dictionary (Word, Translation) values(?, ?)", ["Apple", "Яблоко"], null, null);
        });
    });
}

var db;