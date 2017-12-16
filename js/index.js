
var cards_selected_count;
var selectedCellsList;

var first_element_to_render_index;
var last_element_to_render_index;
var pairs_on_field;

var cardsToCheck;


document.addEventListener('DOMContentLoaded', function () { 
    
        db = openDatabase("CardGame", "1.0", "GameDB", 200000);
        if (!db){
            alert("Cannot connect to database");
        }

       initDatabase();

        var start_button = document.querySelector('#start');
        start_button.onclick = function (e) {
            hideMenu();
            insertGametable(createGametable());
             PlayGame();
        }

        var results_button = document.querySelector('#results');
        results_button.onclick = function (e) {
            hideMenu();
            printResults();
        }

     }, true);
    
     function PlayGame(){
        var loadWords = function(successCallback){
            db.transaction(function(transaction){
                transaction.executeSql(("SELECT * FROM Dictionary"), [],
                    function(transaction, results){successCallback(results);}, function (error) {alert('Error')});
                });
        };


        var cards = loadWords(function (results) {
            var first_element_to_render_index = 0;
            var last_element_to_render_index = 2;
            var pairs_on_field = results.rows.length;
            var cardArray = [];
            var cards_selected_count = 0;
            var selectedCellsList = [];
            var errors_in_game = 0;

            for (var i = 0; i < results.rows.length; i++){
                cardArray.push(new Card(results.rows[i].word, results.rows[i].translation));
            }

                printCardsFromArray(getArrayWordsAndTranslations(cardArray));

                document.querySelectorAll('.card').forEach(function (element, index, list){
                    element.onclick = function(){
            
                            cardClicked(element);
                            cards_selected_count++;
                            selectedCellsList.push(element);
                            
                            if(cards_selected_count == 2){
            
                                setTimeout(function () {
                                    if (isTrueTranslate(selectedCellsList, cardArray)){
                                        hideTrueTranslatedElements(selectedCellsList);
                                        pairs_on_field--;
                                        if (pairs_on_field <= 0){
                                            document.querySelector('#app').innerHTML = '';
                                            renderResultForm();
                                            var submitButton = document.querySelector('#insertName');
                                            submitButton.onclick = function() {

                                                db.transaction(function(transaction){
                                                    var username = document.querySelector('#username').value;
                                                    transaction.executeSql("INSERT INTO Results (name, errors) values(?, ?);", [username, errors_in_game], null, null);
                                                });
                                                document.querySelector('#app').removeChild(document.querySelector('#gametable'));
                                                showMenu();
                                            }
                                        }
                                    } else {
                                        setErrorToCells(selectedCellsList);
                                        disposeAllStatesOfCardsWithDuring(selectedCellsList);
                                        errors_in_game++;
                                    }
            
                                    selectedCellsList = [];
                                    cards_selected_count = 0;
            
                                }, 750, selectedCellsList, cardArray);
                            }
                    }
                });
            return cardArray;
        });
     }
    
function printResults(){
        var loadResults = function(successCallback){
            db.transaction(function(transaction){
                transaction.executeSql("SELECT * FROM Results r order by r.rowid desc LIMIT 5;", [],
                    function(transaction, results){successCallback(results);}, function (error) {alert(error)});
                });
        };

        var res = loadResults(function (results) {
            var userResults = [];
            for (var i = 0; i < results.rows.length; i++){
                userResults.push(new Result(results.rows[i].Name, results.rows[i].Errors));
            }

            var app = document.querySelector('#app');

            var table = document.createElement("table");
            table.setAttribute('class', 'result');

            var head = document.createElement("thead");
            head.setAttribute('class', 'result');

            var header_row = document.createElement("tr");
            header_row.setAttribute('class', 'result');

            var name_column = document.createElement("td");
            name_column.setAttribute('class', 'result');
            name_column.innerHTML = 'Имя';

            var result_column = document.createElement("td");
            result_column.setAttribute('class', 'result');
            result_column.innerHTML = 'Ошибки';

            var body = document.createElement("tbody");
            body.setAttribute('class', 'result');

            header_row.appendChild(name_column);
            header_row.appendChild(result_column);
            head.appendChild(header_row);
            table.appendChild(head);
    
            userResults.forEach(function (element, index, list) {

                var result_row = document.createElement("tr");
                result_row.setAttribute('class', 'result');

                var result_name = document.createElement("td");
                result_name.setAttribute('class', 'result');
                result_name.innerHTML = element.Name;

                var result_error_count = document.createElement("td");
                result_error_count.setAttribute('class', 'result');
                result_error_count.innerHTML = element.Errors;

                result_row.appendChild(result_name);
                result_row.appendChild(result_error_count);
                body.appendChild(result_row);
            });

            table.appendChild(body);
            app.appendChild(table);
        }); 

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
    
function createGametable(){
    
    var gametable = document.createElement("table");
    gametable.setAttribute('id', 'gametable');
    gametable.setAttribute('class', 'translation_card_game');
    return gametable;
}

function insertGametable(gametable) {
    var app = document.querySelector('#app');
    app.appendChild(gametable);
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
    
    function Card(word, translate) {
            this.word = word.toString();
            this.translate = translate.toString();
    }

    function Result(Name, Errors) {
        this.Name = Name.toString();
        this.Errors = Errors.toString();
    }
    
    function getRandomValueFromDiapasone(min, max){
        var rand = min - 0.5 + Math.random() * (max - min + 1)
        rand = Math.round(rand);
        return rand;
    }

    function hideMenu(){
        var menu = document.querySelector('#menu');
        menu.setAttribute('style','display: none;');
    }

    function showMenu(){
        var menu = document.querySelector('#menu');
        menu.setAttribute('style','display: block;');
    }


    function renderResultForm(){
        var app = document.querySelector('#app');

        var form = document.createElement("form");
        form.setAttribute('class','form');

        var label = document.createElement('span');
        label.setAttribute('class','form');
        label.innerHTML = 'Введите ваше имя:';

        var name_input = document.createElement('input');
        name_input.setAttribute('id', 'username');
        name_input.setAttribute('class','form');
        name_input.setAttribute('type', 'text');

        var button = document.createElement('button');
        button.setAttribute('class','form');
        button.setAttribute('id', 'insertName');
        button.innerHTML = "Ввести";

        form.appendChild(label);
        form.appendChild(name_input);
        form.appendChild(button);
        app.appendChild(form);
    }
    
    var db;
     
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
            tx.executeSql("INSERT INTO Dictionary (Word, Translation) values(?, ?)", ["Salad", "Салат"], null, null);
            });
        });

        db.transaction(function(tx) {
            tx.executeSql("SELECT COUNT(*) FROM Results", [], function (result) { 
    
             }, function (tx, error) {
            tx.executeSql("CREATE TABLE Results (id REAL UNIQUE, Name TEXT, Errors INTEGER)", [], null, null);
            });
        });

    }

    function getResults(db) {
        var results = [];
        db.transaction(function(tx) {
            tx.executeSql("SELECT * FROM Results r order by r.rowid desc LIMIT 5;", [], function (tx, result) { 
                for (var i = 0 ; i < result.rows.length; i++){
                    results.push(result.rows.item(i));
                }
             }, function (tx, error) {
            alert("Error!");
            })});
        return results;
    }