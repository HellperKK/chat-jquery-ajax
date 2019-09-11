<?php
/** 
 * checks if the database $data has the necessary fields for the program to work
 * fields being users, messages and times
 */
function validate_data($data) {
    return is_array($data["users"]) && 
    is_array($data["messages"]) &&
    is_array($data["times"]);
}

/**
 * removes a user and all its private messages from the database
 */
function remove_user($data, $user_name) {
    $users = $data["users"];

    // removes the users by finding its position
    $index = array_search($user_name, $users);
    if ($index !== false) {
        // removes from list of connected
        unset($users[$index]);

        //reset users to indexed array
        $data["users"] = array_values($users);

        // removes save of last action
        unset($data["times"][$user_name]);
    }

    // removes alll private messages
    foreach ($data["messages"] as $key => $value) {
        if ($value["target"] == $user_name) {
            unset($data["messages"][$key]);
        }
    }
    // reset messages to indexed array
    $data["messages"] = array_values($data["messages"]);

    // save changes
    write_file('data.json', $data);
}

/**
 * returns a database from a source file
 */
function read_file($source) {
    // reads the source
    $content = file_get_contents($source);

    // validate data
    if (($content == null) || (! validate_data(json_decode($content, true))))
    {
        // recreate database if necessary
        $result = [
            "users" => [],
            "messages" => [],
            "times" => [],
        ];
    }
    else {
        // or parses it
        $result = json_decode($content, true);
    }
    
    return $result;
}

/**
 * write ta databse in a source file
 */
function write_file($source, $data) {
    file_put_contents($source, json_encode($data, JSON_PRETTY_PRINT));
}

/**
 * removes user that have been innactive for 5 minutes or more
 */
function update_users() {
    $data = read_file("data.json");
    foreach ($data["times"] as $key => $value) {
        if ((time() - $value) > 300)
        {
            remove_user($data, $key);
        }
    }
}

/**
 * main process
 */
// gets the command to execute
$command = $_POST['command'];

// user login
if ($command == "login")
{
    update_users();
    // get pseudonyme and database
    $pseudo = $_POST['pseudo'];
    $data = read_file("data.json");

    //tells if the unsername is already used by sending 0 or 1
    if (in_array($pseudo, $data["users"]))
    {
        echo "0";
    }
    // if user not in database, adds it
    else
    {
        // adds the user
        array_unshift($data["users"], $pseudo);

        //save their login time
        $data["times"][$pseudo] = time();

        // save database
        write_file('data.json', $data);

        //tells it ok
        echo "1";
    }
}
// send message
else if ($command == "send")
{
    update_users();

    // get datas
    $nom = $_POST['pseudo'];
    $message = $_POST['message'];
    $target = $_POST['target'];

    // build message object
    $message_object = [
        "date" => date('M d H:i:s'),
        "pseudo" => $nom,
        "message" => $message,
        "target" => $target,
    ];

    // get database
    $data = read_file("data.json");

    // adds message to database
    array_unshift($data["messages"], $message_object);

    // update last action time
    $data["times"][$nom] = time();

    // saves database
    write_file('data.json', $data);
}
else if ($command == "update")
{
    $data = read_file("data.json");
    unset($data["times"]);
    //$data["messages"] = array_slice($data["messages"], 0, 40);
    echo json_encode($data);
}
else if ($command == "logout")
{
    $pseudo = $_POST['pseudo'];
    $data = read_file("data.json");
    remove_user($data, $pseudo);
}
else if ($command == "check")
{
    update_users();
    $pseudo = $_POST['pseudo'];
    $data = read_file("data.json");
    if (in_array($pseudo, $data["users"]))
    {
        echo "0";
    }
    else
    {
        echo "1";
    }
}
else if ($command == "clearChat")
{
    update_users();
    $data = read_file("data.json");
    $data["messages"] = [];
    write_file('data.json', $data);
}