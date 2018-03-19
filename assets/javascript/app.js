var config = {
    apiKey: "AIzaSyA1-Ecyp2NlHasTNKHhoPjtGyD_FQztno4",
    authDomain: "hello-f8ef5.firebaseapp.com",
    databaseURL: "https://hello-f8ef5.firebaseio.com",
    projectId: "hello-f8ef5",
    storageBucket: "hello-f8ef5.appspot.com",
    messagingSenderId: "22984384033"
};

firebase.initializeApp(config);

var database = firebase.database();

var player1 = {
    name: "",
    wins: 0,
    loses: 0,
    choice: ""
};

var playerNumber = null;
var firstRound = true;
var lastWinner;
var thereIs1 = false;
var thereIs2 = false;
var compared = false;
var login = false;

var player2 = {
    name: "",
    wins: 0,
    loses: 0,
    choice: ""
};

var round = 0;

$(document).ready(function() {

    database.ref().on("value", function(snapshot) {
            var noPlayerExists = (!(snapshot.child("player/1").exists()) && !(snapshot.child("player/2").exists()));

            thereIs1 = snapshot.hasChild("player/1");
            console.log("one" + thereIs1);
            thereIs2 = snapshot.hasChild("player/2");
            console.log("two" + thereIs2);
            round = snapshot.child("round").val();

            if (snapshot.hasChild("player/1/choice")) {
                player1.choice = snapshot.child("player/1/choice").val();
            } else {
                player1.choice = "";
            }

            if (snapshot.hasChild("player/2/choice")) {
                player2.choice = snapshot.child("player/2/choice").val();
            } else {
                player2.choice = "";
            }

            // ...displays player information, if avaiable...
            if (thereIs1) {
                $("#list1").empty();
                var div = $("#user1");
                $("#user1-name").text(player1.name);
                player1.wins = snapshot.child("player/1/wins").val();
                player1.loses = snapshot.child("player/1/loses").val();
                $("#user1-record").text("Wins: " + player1.wins + " Loses: " + player1.loses);
            } else {
                $("#user1-name, #list1, #user1-record").empty();
                var div = $("#list1");
                div.html($("<p>").text("Waiting for Player 1"))
            }
            if (thereIs2) {
                $("#list2").empty();
                var div = $("#user2");
                player2.name = snapshot.child("player/2/name").val();
                $("#user2-name").text(player2.name).val();
                player2.wins = snapshot.child("player/2/wins").val();
                player2.loses = snapshot.child("player/2/loses").val();
                $("#user1-record").text("Wins: " + player2.wins + " Loses: " + player2.loses);
                $("#user2-record").text("Wins: " + player2.wins + " Loses: " + player2.loses);
            } else {
                $("#user2-name, #list2, #user2-record").empty();
                var div = $("#list2");
                div.html($("<p>").text("Waiting for Player 2"))
            }

            if ((!(thereIs1) || !(thereIs2)) && !(login)) {
                displayLogin();
                login = true;
            }

            if (thereIs1 && thereIs2 && firstRound) {
                console.log("first round started::::");
                firstRound = false;
                newRound();
            }



            // ...and if both users have a choice variable, compare choices.
            if (snapshot.child("player/1/choice").exists() && snapshot.child("player/2/choice").exists() && snapshot.child("player/1/choice") !== "" && snapshot.child("player/2/choice") !== "" && (!(compared))) {
                player1.choice = snapshot.child("player/1/choice").val();
                player2.choice = snapshot.child("player/2/choice").val();
                findWinner();
            }
        },
        function(errorObject) {
            console.log("The read failed: " + errorObject.code);
        });

    function displayLogin() {
        // To the header...
        var head = $("#header");
        // ...append a form...
        head.append($("<form>")
            // ...append a text input label...
            .append($("<label>").attr("for", "name-input").text("Name: "))
            // ...append a text input... 
            .append($("<input>").attr({
                id: "name-input",
                type: "text"
            }))
            // ...and a submit button.
            .append($("<button>").attr({
                id: "start",
                type: "submit"
            }).text("Start"))
        );
    }

    function initiateUser() {
        var temp = $("#name-input").val().trim();
        event.preventDefault();
        // Save the new user to our local variable...
        setPlayerNumber();
        console.log(playerNumber);
        this["player" + playerNumber].name = temp;
        console.log(player1.name);
        // ...push our new user name to the database...
        if (playerNumber === 1) {
            database.ref().child("player/" + playerNumber).update(player1);
            database.ref("player/1/choice").remove();
        } else if (playerNumber === 2) {
            database.ref().child("player/" + playerNumber).update(player2);
            database.ref("player/2/choice").remove();
        }
        // ...if both users have names, set round to 1 and start a newRound...
        // if (player1.name !== "" && player2.name !== "") {
        //     round = 1;
        //     database.ref().update({ round: round });
        //     newRound();
        // }
        // ...empty the header div.
        $("#header").empty();
    }

    function setPlayerNumber() {
        if ((thereIs1) && !(thereIs2)) {
            // Player 2
            playerNumber = 2;
            console.log("player2");
        } else if (!(thereIs1)) {
            // Player 1
            playerNumber = 1;
            console.log("player1");
        }
    }

    function spectate() {
        // If the database currently has two users...

        // ...diplay a their names to the header...

        // ...and display their infromation to the user1 and user2 divs.

    }

    function sendChoice() {
        // Update the local variable...
        if (playerNumber === 1) {
            player1.choice = $(this).text();
            // ...push it to the database...
            database.ref("player/1").update({
                choice: player1.choice
            });
        } else if (playerNumber === 2) {
            player2.choice = $(this).text();
            // ...push it to the database...
            database.ref("player/2").update({
                choice: player2.choice
            });
        }
        console.log(player1.choice);
        console.log(player2.choice);
        // ...replace choices with user choice...
        $("#list").html($("<h1>").text($(this).text()));
        // ...compare if both choices have been made.
        if (player1.choice !== "" && player2.choice !== "") {
            console.log("COMPARING");
            updateRecords();
        }
    }


    function findWinner() {
        // If there is a tie...
        if (player1.choice === player2.choice) {
            displayWinner("draw");
        } else if ((player1.choice === "Rock" && player2.choice === "Paper") || (player1.choice === "Scissors" && player2.choice === "Rock") || (player1.choice === "Paper" && player2.choice == "Scissors")) {
            // ...display Winner...
            displayWinner(player1.name);

        } else if ((player1.choice === "Paper" && player2.choice == "Rock") || (player1.choice === "Rock" && player2.choice === "Scissors") || (player1.choice === "Scissors" && player2.choice === "Paper")) {
            // ...display Winner...
            displayWinner(player2.name);
        } else {}
        compared = true;
    }

    function updateRecords() {
        // If there is a tie...
        if (player1.choice === player2.choice) {} else if ((player1.choice === "Rock" && player2.choice === "Paper") || (player1.choice === "Scissors" && player2.choice === "Rock") || (player1.choice === "Paper" && player2.choice == "Scissors")) {
            // ...if player1 wins...
            player1.wins++;
            player2.loses--;
            // ...update the users' records to the database...
            database.ref("player/1").update({ wins: player1.wins });
            database.ref("player/2").update({ loses: player2.loses });
            // ...update the lastWinner variable...
            compared = true;

        } else if ((player1.choice === "Paper" && player2.choice == "Rock") || (player1.choice === "Rock" && player2.choice === "Scissors") || (player1.choice === "Scissors" && player2.choice === "Paper")) {
            player2.wins++;
            player1.loses--;
            // ...update the users' records to the database...
            database.ref("player/2").update({ wins: player2.wins });
            database.ref("player/1").update({ loses: player1.loses });
            // ...update the lastWinner variable...
            lastWinner = player2.name;
            displayWinner(player2.name);
            compared = true;
        } else {
            // Handle other inputs, issues.
        }
        // ...clear their choices from the database...
        database.ref("player/1/choice").remove();
        database.ref("player/2/choice").remove();
        // ...clear their choices from the local variables...


    }

    function displayWinner(winner) {
        // Remove the user's choice from their user div...
        $("#list" + playerNumber).empty();
        // Display the winner in the announce div...
        var div = $("#announce");
        if (winner === "draw") {
            div.append($("<h1>").text("It was a draw!"));
        } else {
            div.append($("<h1>").text(winner))
        }
        // ...and initiate a new round, after a time out.
        console.log("NEW ROUND");
        setTimeout(newRound, 20000);
    }

    function newRound() {
        // ...iterate the round variable...
        round++;
        database.ref().update({ round: round });
        $("#announce").empty();
        // Display the choices to the users.
        if (!($("#list").length)) {
            var list = $("<div>").attr("id", "list");
            list.append($("<p>").text("Rock").addClass("choices"));
            list.append($("<p>").text("Paper").addClass("choices"));
            list.append($("<p>").text("Scissors").addClass("choices"));
            console.log("placing choices.........");
            list.insertAfter("#user" + playerNumber + "-name");
        }
    }

    function displayChat() {

    }


    function quit() {
        // If in the middle of a round, delete the round...
        // ...reinitiate the round variable to zero...
        round = 0;
        // ...update the round variable in the database...
        database.ref().update({
            round: round
        });
        // ...delete user data from database.
        if (playerNumber === 1) {
            database.ref().child("player/1").remove();
            database.ref("player/2/choice").remove();
        }
        if (playerNumber === 2) {
            database.ref().child("player/2").remove();
            database.ref("player/1/choice").remove();
        }

    }


    $(document).on("click", "#start", function(event) { initiateUser(); });
    $(document).on("click", ".choices", sendChoice);
    window.onbeforeunload = function() { quit() };
});