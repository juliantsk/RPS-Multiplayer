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
    losses: 0,
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
    losses: 0,
    choice: ""
};

var round = 0;

// JQuery for document.ready. 
$(function() {

    database.ref().on("value", function(snapshot) {
            // Checking if each player exists on the database.
            thereIs1 = snapshot.hasChild("player/1");
            console.log("Player1: " + thereIs1);
            thereIs2 = snapshot.hasChild("player/2");
            console.log("Player2: " + thereIs2);

            if (snapshot.hasChild("player/1/choice") && !(snapshot.child("player/1/choice").val() === "")) {
                player1.choice = snapshot.child("player/1/choice").val();
            }

            if (snapshot.hasChild("player/2/choice") && !(snapshot.child("player/2/choice").val() === "")) {
                player2.choice = snapshot.child("player/2/choice").val();
            }

            // ...displays player information, if avaiable...
            if (thereIs1) {
                player1.name = snapshot.child("player/1/name").val();
                $("#user1-name").text(player1.name);
                player1.wins = snapshot.child("player/1/wins").val();
                player1.losses = snapshot.child("player/1/losses").val();
                $("#user1-record").text("Wins: " + player1.wins + " losses: " + player1.losses);
            } else {
                $("#user1-name, #list1, #user1-record").empty();
                var div = $("#list1");
                div.html($("<p>").text("Waiting for Player 1"))
            }
            if (thereIs2) {
                player2.name = snapshot.child("player/2/name").val();
                $("#user2-name").text(player2.name).val();
                player2.wins = snapshot.child("player/2/wins").val();
                player2.losses = snapshot.child("player/2/losses").val();
                $("#user2-record").text("Wins: " + player2.wins + " losses: " + player2.losses);
            } else {
                $("#user2-name, #list2, #user2-record").empty();
                var div = $("#list2");
                div.html($("<p>").text("Waiting for Player 2"))
            }

            if ((!(thereIs1) || !(thereIs2)) && !(login)) {
                displayLogin();
                login = true;
            }
            if (!(thereIs1)) {
                console.log("wiped;;;;;;;;;");
                player1 = {
                    name: "",
                    wins: 0,
                    losses: 0,
                    choice: ""
                };
            }

            if (!(thereIs2)) {
                console.log("wiped;;;;;;;;;");
                player2 = {
                    name: "",
                    wins: 0,
                    losses: 0,
                    choice: ""
                };
            }

            if (thereIs1 && thereIs2 && round === 0) {
                console.log("first round started::::");
                round = 1;
                newRound();
            }



            // ...and if both users have a choice variable, compare choices.
            if (snapshot.child("player/1/choice").exists() && snapshot.child("player/2/choice").exists() && snapshot.child("player/1/choice") !== "" && snapshot.child("player/2/choice") !== "" && (!(compared))) {
                player1.choice = snapshot.child("player/1/choice").val();
                player2.choice = snapshot.child("player/2/choice").val();
                compared = true;
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
            database.ref("player/1").update({ choice: player1.choice });
            // ...replace choices with user choice...
            $("#list1").html($("<h1>").text($(this).text()));

        } else if (playerNumber === 2) {
            player2.choice = $(this).text();
            // ...push it to the database...
            database.ref("player/2").update({ choice: player2.choice });
            // ...replace choices with user choice...
            $("#list2").html($("<h1>").text($(this).text()));
        }
        console.log("player1 choice: " + player1.choice);
        console.log("player2 choice: " + player2.choice);
        // ...compare if both choices have been made.
        if (player1.choice !== "" && player2.choice !== "") {
            updateRecords();
        }
    }


    function findWinner() {
        // If there is a tie...
        if (player1.choice === player2.choice) {
            displayWinner("draw");
        } else if ((player1.choice === "Rock" && player2.choice === "Paper") || (player1.choice === "Scissors" && player2.choice === "Rock") || (player1.choice === "Paper" && player2.choice == "Scissors")) {
            // ...display Winner...
            displayWinner(player2.name);

        } else if ((player1.choice === "Paper" && player2.choice == "Rock") || (player1.choice === "Rock" && player2.choice === "Scissors") || (player1.choice === "Scissors" && player2.choice === "Paper")) {
            // ...display Winner...
            displayWinner(player1.name);
        } else {}
    }

    function updateRecords() {
        console.log("UPDATING RECORDS");
        // If there is a tie...
        if ((player1.choice === "Rock" && player2.choice === "Paper") || (player1.choice === "Scissors" && player2.choice === "Rock") || (player1.choice === "Paper" && player2.choice == "Scissors")) {
            // ...if player2 wins...
            player2.wins++;
            player1.losses++;
            console.log(player2.wins + " p1lose: " + player1.losses);
            // ...update the users' records to the database...
            database.ref("player").update({ 1: player1, 2: player2 });

        } else if ((player1.choice === "Paper" && player2.choice == "Rock") || (player1.choice === "Rock" && player2.choice === "Scissors") || (player1.choice === "Scissors" && player2.choice === "Paper")) {
            // ...if player1 wins...
            player1.wins++;
            player2.losses++;
            console.log(player1.wins + " p2lose: " + player2.losses);
            // ...update the users' records to the database...
            database.ref("player").update({ 1: player1, 2: player2 });
            // ...update the lastWinner variable...
        } else {
            // Handle other inputs, issues.
        }
        // ...clear their choices from the local variables...


    }

    function displayWinner(winner) {
        console.log("display WINNNER")
            // Display choices in players' lists...
        $("#list1").html($("<h1>").text(player1.choice));
        $("#list2").html($("<h1>").text(player2.choice));
        // Display the winner in the announce div...
        var div = $("#announce");
        if (winner === "draw") {
            div.append($("<h1>").text("It was a draw!"));
        } else {
            div.append($("<h1>").text(winner + " has won!"))
        }
        // ...and initiate a new round, after a time out.
        setTimeout(newRound, 5000);
    }

    function newRound() {
        console.log("NEW ROUND");
        // Empty the player's lists...
        $("#list1").empty();
        $("#list2").empty();
        // ...clear their choices from the database...
        database.ref("player/1/choice").remove();
        database.ref("player/2/choice").remove();
        player1.choice = "";
        player2.choice = "";
        // ...return compared to false...
        compared = false;
        // ...iterate the round variable...
        round++;
        database.ref().update({ round: round });
        $("#announce").empty();
        $("#list").empty();
        // Display the choices to the users.
        console.log("placing choices.........");
        if (playerNumber === 1) {
            var list = $("#list1");
        }
        if (playerNumber === 2) {
            var list = $("#list2");
        }
        list.empty();
        list.append($("<p>").text("Rock").addClass("choices"));
        list.append($("<p>").text("Paper").addClass("choices"));
        list.append($("<p>").text("Scissors").addClass("choices"));
    }

    function displayChat() {

    }


    function quit() {
        // If in the middle of a round, delete the round...
        // ...reinitiate the round variable to zero...
        round = 0;
        // ...update the round variable in the database...
        database.ref().update({ round: round });
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