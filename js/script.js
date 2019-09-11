// variable that holds the setInterval that fetch the server when the user is connected
let interval = null;

// delay of the interval
let timeOut = 1000;

// custom name for the special user the targets everyone
let toAllLogged = "All";

/**
 * tells if a input event code is an enter
 */
function isEnter(code) {
    return (code == "Enter") || (code == "NumpadEnter");
}

/**
 * sends a message to the server
 */
function envoiMessage() {

    // get pseudo message and target
    let pseudo = $("#pseudo").val();
    let message = $("#message").val();
    let target = $("#logged").val();

    // stops if there is no message
    if (message == "") {
        return;
    }

    // cleans the message input
    $("#message").val("");

    // sends message to server
    $.post('interract.php', {
            command: "send",
            pseudo,
            message,
            target
        },
        // fetch server when is completed
        readServer
    );
}

/**
 * tries to log into the chat
 */
function login() {
    
    // get pseudo
    let pseudo = $("#pseudoLog").val();

    // stops if no pseudo
    if (pseudo == "") {
        return;
    }

    // send pseudo to server and gets a response
    $.post('interract.php', {
            command: "login",
            pseudo,
            everyone : toAllLogged
        },
        function(data) {

            // open the chat if response is valid
            if (data === "1") {
                openChat(pseudo);
            }

            // else alerts the user thatthe pseudo is already used
            else {
                $("#alertLog").html("Pseudo already used or forbidden")
            }
        }
    );
}

/**
 * logs the user out
 */
function logout() {
    
    // gets the pseudo 
    let pseudo = $("#pseudo").val();

    // send pseudo to server
    $.post('interract.php', {
            command: "logout",
            pseudo
        },

        // close chat when finished
        closeChat
    );
}

/**
 * Tries to deletes a message based of if index and the
 */
function deleteMessage() {

    let pseudo = $("#pseudo").val();
    let index = $("#content").prop("selectedIndex");

    $.post('interract.php', {
            command: "deleteMessage",
            index,
            pseudo 
        },
        // fetch server when is completed
        readServer
    );
}

/**
 * creates the chat part and removes the login part
 */
function openChat(pseudo) {

    // saves the pseudo in the localStroage
    localStorage.setItem("chat_pseudo", pseudo);

    // clears the log in part
    $("#loginDiv").empty();

    // gets the chat div
    let chat = $("#chatDiv");

    // appends the select for chat messages
    let content = $("<select/>", {
        id : "content",
        size : 15,
        style : "width: 80%;"
    });
    content.on("keydown", function(event) {
        if (event.code == "Delete") {
            deleteMessage();
        }
    });
    chat.append(content);

    // appends the user list
    chat.append($("<select/>", {
        id : "logged",
        size : 15,
        style : "width: 20%;"
    }));

    // appends the player pseudo
    chat.append($("<input/>", {
        id : "pseudo",
        readonly : true,
        type : "text",
        value : pseudo
    }));

    // creates the message input adds event on iput for fast message send
    // and appends it
    let entree = $("<input/>", {
        id : "message",
        type : "text"
    });
    entree.on("keypress", function(event) {
        if (isEnter(event.code)) {
            envoiMessage();
        }
    });
    chat.append(entree);

    // create the send button adds a click event and appends it
    let envoi = $("<button/>", {
        id : "envoi",
        text : "Send"
    });
    envoi.on("click", envoiMessage);
    chat.append(envoi);

    // create the logout button adds a click event and appends it
    let out = $("<button/>", {
        id : "logout",
        text : "Disconnect"
    });
    out.on("click", logout);
    chat.append(out);

    // create the clear chat button adds a click event and appends it
    let clear = $("<button/>", {
        text : "Clear chat"
    });
    clear.on("click", clearChat);
    chat.append(clear);

    // fetch server to fill html with data
    readServer();

    // create interval for server fetch
    interval = setInterval(serverUpdate, timeOut);
}

/**
 * creates the login part and removes the chat part
 */
function closeChat() {

    // remove the pseudo from localStorage
    localStorage.removeItem("chat_pseudo");

    // clear server fetch inverval
    clearInterval(interval);
    interval = null;

    // clears the chat part
    $("#chatDiv").empty();

    // creates the login div
    let loginDiv = $("#loginDiv");

    // creates the pseudo input adds event on iput for fast send
    // and appends it
    let entree = $("<input/>", {
        id : "pseudoLog",
        placeholder : "pseudonym",
        type : "text"
    });
    entree.on("keypress", function(event) {
        if (isEnter(event.code)) {
            login();
        }
    });
    loginDiv.append(entree);

    // create the login chat button adds a click event and appends it
    let lin = $("<button/>", {
        id : "login",
        text : "Connect"
    });
    lin.on("click", login);
    loginDiv.append(lin);

    // appends a paragraphfor alerts
    loginDiv.append($("<p/>", {
        id : "alertLog",
        class : "alert"
    }));
}

/**
 * fetches the server to check if hasn't been disconnected
 */
function autoLogout() {

    // gets pseudo
    pseudo = $("#pseudo").val();

    // send pseudo to server
    $.post('interract.php', {command:"check", pseudo},
        function(data, status, xhr) {

            // closes chat if the response is 1
            if (data == "1") {
                closeChat();
            }
        }
    );
}

/**
 * fetches server for new data that should be inserted in the document
 */
function readServer() {
    // gets pseudo
    let pseudo = $("#pseudo").val();

    // sends request to the server with the user pseudo and the pseudo for everyone
    $.post('interract.php', {
        command:"update",
        pseudo,
        everyone : toAllLogged
        },
        function(data, status, xhr) {

            // gets chat and users select
            let select = $("#content");
            let users = $("#logged");
            
            // gets content selected index and changes it to 0 if no user selected
            indexContent = select.prop("selectedIndex");
            if (indexContent == -1) {
                indexContent = 0;
            }

            // gets users selected index and changes it to 0 if no user selected
            index = users.prop("selectedIndex");
            if (index == -1) {
                index = 0;
            }

            // clears the selects
            select.empty();
            users.empty();
            
            // gets the messages from the data response
            let messages = JSON.parse(data)["messages"]

                // keep only the 15 last messages
                .slice(0, 15);
            
            // creates a option elment for each message
            for (const elem of messages) {
                let line; 

                // if the message target is the user pseudo (ie a personnal message) creates an
                // option with the whisper class (to put it in italic)
                if (elem.target == pseudo) {
                    let message = elem.date + " | " + elem.pseudo + " whispers " + " : " + elem.message;
                    let val = JSON.stringify(elem);
                    line = $("<option/>", {
                        value: val,
                        text: message,
                        class: "whisper"
                    });
                }
                // else creates a select with no class
                else {
                    let message = elem.date + " | " + elem.pseudo + " : " + elem.message;
                    line = $("<option/>", {
                        text: message
                    });
                }

                // appends the option to the select
                select.append(line);
            }

            // resets the user selection
            select.prop("selectedIndex", indexContent);


            // adds the All user to the user list
            users.append($("<option/>", {text: toAllLogged}));

            // adds all the users to the list
            for (const elem of JSON.parse(data)["users"]) {
                let line = $("<option/>", {text: elem, value:elem});
                users.append(line);
            }

            // resets the user selection
            users.prop("selectedIndex", index);
        }
    );
}

/**
 * sends a message to the chat to clear the messages
 */
function clearChat() {

    // send a request with no data (other than command)
    $.post('interract.php', {
        command: "clearChat",
    });

    // fetches the server when finished
    readServer
}

/**
 * function to call every x seconds when connected
 */
function serverUpdate() {
    readServer();
    autoLogout();
}

// adds events to the login elments at the beggining
$("#login").on("click", login);
$("#pseudoLog").on("keypress", function(event) {
    if (isEnter(event.code)) {
        login();
    }
});

// reconnects the user if he refreshed the page without disconnecting
if (localStorage.getItem("chat_pseudo")) {
    let pseudo = localStorage.getItem("chat_pseudo");
    openChat(pseudo);
}