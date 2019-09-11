<?php
function validate_data($data) {
    return is_array($data["users"]) && 
    is_array($data["messages"]) &&
    is_array($data["times"]);
}

function remove_user($data, $user_name) {
    $users = $data["users"];
    $index = array_search($user_name, $users);
    if ($index !== false) {
        unset($users[$index]);
        $data["users"] = array_values($users);
        unset($data["times"][$user_name]);
    }

    foreach ($data["messages"] as $key => $value) {
        if ($value["target"] == $user_name) {
            unset($data["messages"][$key]);
        }
    }
    $data["messages"] = array_values($data["messages"]);
    write_file('data.json', $data);
}

function read_file($source) {
    $content = file_get_contents($source);
    if (($content == null) || (! validate_data(json_decode($content, true))))
    {
        $result = [
            "users" => [],
            "messages" => [],
            "times" => [],
        ];
    }
    else {
        $result = json_decode($content, true);
    }
    return $result;
}

function write_file($source, $data) {
    file_put_contents($source, json_encode($data, JSON_PRETTY_PRINT));
}

function update_users() {
    $data = read_file("data.json");
    foreach ($data["times"] as $key => $value) {
        if ((time() - $value) > 300)
        {
            remove_user($data, $key);
        }
    }
}

$command = $_POST['command'];

if ($command == "login")
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
        array_unshift($data["users"], $pseudo);
        $data["times"][$pseudo] = time();
        write_file('data.json', $data);
        echo "1";
    }
}
else if ($command == "send")
{
    update_users();
    $nom = $_POST['pseudo'];
    $message = $_POST['message'];
    $target = $_POST['target'];
    $message_object = [
        "date" => date('M d H:i:s'),
        "pseudo" => $nom,
        "message" => $message,
        "target" => $target,
    ];
    $data = read_file("data.json");
    array_unshift($data["messages"], $message_object);
    $data["times"][$nom] = time();
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