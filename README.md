# chat-jqury-ajax
A small chat with jquery and ajax

## Concept
This is a tiny chat made using jquery and ajax to test both technologies.

Since all the server data is stored in a file it should definitely not be used for other reasons than testing purpose.

Also it uses the localstorage to keep a user connected when they refresh so there can't be more that one user per browser.

## Features
- Take a pseudonym and connect with it. Checks if someone isn't connected with that pseudonym.
- Disconnect with a button or after 5 minutes of inactivity.
- Clean al the messages (warning, cleans them from the database)
- See all the connected users in the left.
- Select a user in that list to send them a private message. (Or select All for public message).
- When a user disconnects all the private messages sent to them are discarded.

## How to use
Clone the repository.
Run a php web server so that it can interpret the files in the folder.
Open index.html through localhost.
Try with more than one browser to see stuff happen !