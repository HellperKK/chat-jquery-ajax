let interval = null;
let timeOut = 1000;
let toAllLogged = "All";

function envoiMessage() {
    let pseudo = $("#pseudo").val();
    let message = $("#message").val();
    $("#message").val("");
    if ((pseudo == "") || (message == "logged")) {
        return;
    }
    let target = $("#logged").val();
    $.post('interract.php', {
            command: "send",
            pseudo,
            message,
            target
        },
        readServer
    );
}

function isEnter(code) {
    return (code == "Enter") || (code == "NumpadEnter");
}

function login() {
    let pseudo = $("#pseudoLog").val();
    if (pseudo == "") {
        return;
    }
    $.post('interract.php', {
            command: "login",
            pseudo
        },
        function(data) {
            if (data === "1") {
                openChat(pseudo);
            }
            else {
                $("#alertLog").html("Pseudo en cours d'utilisation")
            }
        }
    );
}

function logout() {
    let pseudo = $("#pseudo").val();
    if (pseudo == "") {
        return;
    }
    $.post('interract.php', {
            command: "logout",
            pseudo
        },
        closeChat
    );
}

function openChat(pseudo) {
    localStorage.setItem("chat_pseudo", pseudo);
    $("#loginDiv").empty();
    let chat = $("#chatDiv");
    chat.append($("<select/>", {
        id : "content",
        size : 15,
        style : "width: 80%;"
    }));
    chat.append($("<select/>", {
        id : "logged",
        size : 15,
        style : "width: 20%;"
    }));
    chat.append($("<input/>", {
        id : "pseudo",
        readonly : true,
        type : "text",
        value : pseudo
    }));

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

    let envoi = $("<button/>", {
        id : "envoi",
        text : "Send"
    });
    envoi.on("click", envoiMessage);
    chat.append(envoi);

    let out = $("<button/>", {
        id : "logout",
        text : "Disconnect"
    });
    out.on("click", logout);
    chat.append(out);

    let clear = $("<button/>", {
        text : "Clear chat"
    });
    clear.on("click", clearChat);
    chat.append(clear);
    readServer();
    interval = setInterval(serverUpdate, timeOut);
}

function closeChat() {
    localStorage.removeItem("chat_pseudo");
    clearInterval(interval);
    interval = null;
    $("#chatDiv").empty();
    let loginDiv = $("#loginDiv");

    let entree = $("<input/>", {
        id : "pseudoLog",
        placeholder : "pseudonyme",
        type : "text"
    });
    entree.on("keypress", function(event) {
        if (isEnter(event.code)) {
            login();
        }
    });
    loginDiv.append(entree);

    let lin = $("<button/>", {
        id : "login",
        text : "Connect"
    });
    lin.on("click", login);

    loginDiv.append(lin);
    loginDiv.append($("<p/>", {
        id : "alertLog",
        class : "alert"
    }));
}

function autoLogout() {
    pseudo = $("#pseudo").val();
    $.post('interract.php', {command:"check", pseudo},
        function(data, status, xhr) {
            if (data == "1") {
                closeChat();
            }
        }
    );
}

function readServer() {
    $.post('interract.php', {command:"update"},
        function(data, status, xhr) {
            let select = $("#content");
            let users = $("#logged");
            let pseudo = $("#pseudo").val();
            
            index = users.prop("selectedIndex");
            if (index == -1) {
                index = 0;
            }

            select.empty();
            users.empty();
            
            let messages = JSON.parse(data)["messages"]
                .filter(message => (message.target == toAllLogged) || (message.target == pseudo))
                .slice(0, 15);
            for (const elem of messages) {
                let line; 
                if (elem.target == pseudo) {
                    let message = elem.date + " | " + elem.pseudo + " whispers " + " : " + elem.message;
                    line = $("<option/>", {
                        text: message,
                        class: "whisper"
                    });
                }
                else {
                    let message = elem.date + " | " + elem.pseudo + " : " + elem.message;
                    line = $("<option/>", {
                        text: message
                    });
                }
                select.append(line);
            }

            users.append($("<option/>", {text: toAllLogged}));

            for (const elem of JSON.parse(data)["users"]) {
                let line = $("<option/>", {text: elem, value:elem});
                users.append(line);
            }

            users.prop("selectedIndex", index);
        }
    );
    //autoLogout();
}

function clearChat() {
    $.post('interract.php', {
        command: "clearChat",
    });
    readServer
}

function serverUpdate() {
    readServer();
    autoLogout();
}

$("#login").on("click", login);
$("#pseudoLog").on("keypress", function(event) {
    if (isEnter(event.code)) {
        login();
    }
});

if (localStorage.getItem("chat_pseudo")) {
    let pseudo = localStorage.getItem("chat_pseudo");
    openChat(pseudo);
}