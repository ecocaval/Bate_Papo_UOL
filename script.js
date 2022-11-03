/**
 * @brief - Érico A. B. Cavalcanti - Bate Papo UOL projeto
 *          Fifth week of the full stack driven course
 */

// user object sent to the api for validation
const user = {};

// auxiliary variable used for non-repeating messages in chat
let lastMessage;
let userSelected;
let userIsScrolling = false;

// auxiliary variable to see if user is scrolling
setInterval(() => {
    userIsScrolling = false;
}, 3000);

// will check if user is scrolling up and prevent it from going down to the last message
document.body.addEventListener('wheel', userScrolled);

// adds onclick functionality to modal name request section
document.querySelector('#send-request').addEventListener('click', getUserName); 

// displays participant menu
document.querySelector('header ion-icon').addEventListener('click',
displayUserAside);

// makes possible to send messages through enter key
document.querySelector('.send-message').addEventListener('keydown', (event) => {
    if(event.key === 'Enter') {
        sendMessage();
    }
});

// makes possible to send userName through enter key
document.querySelector('#request-name').addEventListener('keydown', (event) => {
    if(event.key === 'Enter') {
        getUserName();
    }
});

// displays the partcipants menu
function displayUserAside() {
    document.querySelector('.container').classList.toggle('hideElement')
}

// removes screen loader
function removeLoader() {
    let modalLoader = document.querySelector('.modal');

    modalLoader.classList.add('hideElement');
}

// removes screen loader
function addLoader() {
    let modalLoader = document.querySelector('.modal');
    
    modalLoader.classList.remove('hideElement');
}

// gets the name of the current user
function getUserName() {

    const inputName = document.querySelector('#request-name')
    const userName = inputName.value;
    /* 
        message sent to the api must have the following structure:
            {
                name: NAME_TO_SEND
            }  
    */
    user.name = userName;
    
    let modalContent = document.querySelector('.modal .content');
    let modalLoader = document.querySelector('.loader');

    // sends the user to the api
    axios.post('https://mock-api.driven.com.br/api/v6/uol/participants', user)
        .then(function (response) {
        
            // hides user_name modal and displays loading screen
            modalLoader.classList.remove('hideElement');
            modalContent.classList.add('hideElement');

            // starts sending user online status to the api
            startSendingStatus();
        })
        .catch(function(response) {
            console.error('erro ao enviar userName!');
            // cleans user_name modal input
            inputName.value = '';            
            alert('Este nome já está em uso!')
        }
    );
}

// sends user status to the api, so the user can be kept online
function startSendingStatus() {
    setInterval(() => {
        axios.post('https://mock-api.driven.com.br/api/v6/uol/status', user)
            .catch(function(response) {
                console.error('erro ao enviar status!');
            }
        );
    }, 5000) //sends status to server every 5 seconds
    
    // gets the list of the participants online in chat
    updateParticipants();   

    // searches and displays the user messages
    searchForMessages();
}

/* checks if the last message received from the server 
   is not repeated api.get is repeated every 200 ms */
function sameMessage(lastMessage, currentMessage) {
    if(lastMessage.from == currentMessage.from &&
       lastMessage.to   == currentMessage.to   &&
       lastMessage.text == currentMessage.text &&
       lastMessage.type == currentMessage.type &&
       lastMessage.time == currentMessage.time) {
        return true;
       }
    return false;
}

/* updates the messages, getting the last message 
   from the api, .get is repeated every 200ms */
function updateMessages() {
    const getMessages = axios.get('https://mock-api.driven.com.br/api/v6/uol/messages');

    getMessages.then(function (response) {
        
        // selects the last message from the api JSON
        let message = response.data[response.data.length - 1];
        
        // if message received is repeated it's content is not repeated
        if(sameMessage(lastMessage, message)) {
            return;
        }

        // if message is not the same we can update the lastMessage var
        lastMessage = message;
        
        // changes the css depending on the message type
        insertNewMessage(message);

        // scrolls the screen to the last message received from the ap
        if(!userIsScrolling) {
            scrollToLastMessage();
        }
    });    
}

// scrolls the screen to the last message received from the api
function scrollToLastMessage() {
    let lastMessageDiv = Array.from(document.querySelectorAll('.message'));
    
    // selects the last message from the messages array
    lastMessageDiv = lastMessageDiv[lastMessageDiv.length-1];  

    // scrolls into the last element
    lastMessageDiv.scrollIntoView({behavior: "smooth"});
}

// don't let the windows scroll down when user is scrolling up or down
function userScrolled(event) {
  userIsScrolling = true;
}

// first search for messages in the api
function searchForMessages() {
    const getMessages = axios.get('https://mock-api.driven.com.br/api/v6/uol/messages');

    getMessages.then(function(response) {

    // displays all the messages received from the JSON
    for(let i = 0; i < response.data.length; i++) {
        
        let message = response.data[i];

        insertNewMessage(message);

        // gets the last message from the first pull of the API get
        if(i === response.data.length - 1) {
            lastMessage = response.data[i];
        }
    }

    // remove the loader spinner after getting messages
    removeLoader();

    scrollToLastMessage();

    // sets an update to the messages every 300 ms
    setInterval(() => {
        updateMessages();        
    }, 300);

    });
}

// inserts new message depending on it's type, can be 'public', 'message' and 'private_message'
function insertNewMessage(message) {

    const messageSection = document.querySelector('.messageSection');

    switch (message.type) {
        case 'status':
            messageSection.innerHTML += `
            <div data-test="message" class="message status">
                <p class="messageHour">
                    ${message.time}
                </p>
                <p class="messageUser">
                    ${message.from}
                </p>
                <p class="messageContent">
                    ${message.text}
                </p>
            </div>
            `;
            break;
            
        case 'message':
            messageSection.innerHTML += `
            <div data-test="message" class="message public">
                <p class="messageHour">
                    ${message.time}
                </p>
                <p class="messageUser from">
                    ${message.from}
                </p>
                <p>Para</p>
                <p class="messageUser to">
                    ${message.to}
                </p>
                <p class="messageContent">
                    ${message.text}
                </p>
            </div>
            `;
            break;

        case 'private_message':

            // private messages won't be displayed to the wrong user
            if(message.to !== user.name && message.from !== user.name){
                break;
            }

            messageSection.innerHTML += `
            <div data-test="message" class="message reserved">
                <p class="messageHour">
                    ${message.time}
                </p>
                <p class="messageUser from">
                    ${message.from}
                </p>
                <p>reservadamente para</p>
                <p class="messageUser to">
                    ${message.to}
                </p>
                <p class="messageContent">
                    ${message.text}
                </p>
            </div>
            `;
            break;
    }
}

// sends the message inserted in the input section
function sendMessage() {
    const messageToSend = {};
    const messageBox = document.querySelector('footer input');

    // builds the message before sending it to the API
    messageToSend.from = user.name;
    messageToSend.to = checkReceiver();
    messageToSend.text = messageBox.value;
    if(messageIsPrivate()) {
        messageToSend.type = "private_message";
    } else {
        messageToSend.type = "message";
    }
    
    // sends the message and if an error occurs reloads the page
    axios.post(
        'https://mock-api.driven.com.br/api/v6/uol/messages', 
        messageToSend)
        .catch(function (response) {
            console.error('error while sending message!');
            alert('You were disconnected from the chat! Reloading page...');
            window.location.reload();
        }
    );   

    // cleans the modal input ssection after sending the messages
    messageBox.value = '';
}

// checks who's going to receive the message sent, can be selected through participants menu
function checkReceiver() {
    let option_selected;

    const participantsList = Array.from(document.querySelectorAll('.participant'));

    // checks in the participants list which participant's check mark is not hidden
    participantsList.forEach((participant) => {
        if(!participant.childNodes[5].classList.contains('hideElement')) {
            option_selected = participant; 
        }
    });    

    // gets the participant_name in the whole participant div, which includes icon, name and check mark
    option_selected = option_selected.childNodes[3].innerHTML;

    return option_selected;
}

// checks if message sent is private or public
function messageIsPrivate() {

    // lockers[0] --> 'Público' | lockers[1] --> 'Reservadamente'  

    const lockers = Array.from(document.querySelectorAll('.lock'));

    if(lockers[0].childNodes[5].classList.contains('hideElement')) {
        return true;
    }
    return false;
}

// gets the participants list from the api than updates the participants list
function updateParticipants() {

    const participantsMenu = document.querySelector('.participants-list');

    getParticipants(participantsMenu);

    setInterval(() => {
        getParticipants(participantsMenu);
    }, 10000);

}

// gets the participants from the api
function getParticipants(participantsMenu) {
    const participants = axios.get('https://mock-api.driven.com.br/api/v6/uol/participants');
        
    participants.then(function(response) {
        insertParticipants(response.data, participantsMenu);
    }).catch(function (response) {
        console.error('error while getting participants');
    })        
}

// inserts the participants list gotten from the api in the HTML
function insertParticipants(partcipantsList, participantsMenu) {

    let userSelectedName;

    if(userSelected != undefined) {
        userSelectedName = userSelected.childNodes[3].innerHTML;
    }

    // cleans all participants
    participantsMenu.innerHTML = '';
    
    // inserts the 'Todos' option
    participantsMenu.innerHTML += `
        <div data-test="all" class="menu-option participant">
                <ion-icon name="people"></ion-icon>
                <p>Todos</p>
                <ion-icon name="checkmark-sharp" class="check"></ion-icon>
        </div>
    `;

    // inserts all participants names
    for(let participant in partcipantsList) {

        let hideElement = 'hideElement';

        if(userSelected != undefined) {
            if(partcipantsList[participant].name === userSelectedName) {
                // maintains the check mark in this user when updating list
                hideElement = null;
                // removes check mark from 'todos' which is the default option
                let todosCheckMark = participantsMenu.childNodes[1].childNodes[5];
                todosCheckMark.classList.add('hideElement');
            } 
        }

        participantsMenu.innerHTML += `
            <div data-test="participant" class="menu-option participant">
                <ion-icon name="person-circle"></ion-icon>
                <p>${partcipantsList[participant].name}</p>
                <ion-icon data-test="check" name="checkmark-sharp" class="check ${hideElement}"></ion-icon>
            </div>
        `;
    }


    // displays the green check when an option is clicked at parcitipants menu
    document.querySelectorAll('.menu-option').forEach((option) => {
        option.addEventListener('click',displayCheck);
    });        
}

// displays the green check when an option is clicked at parcitipants menu
function displayCheck() {

    /* this variable is used to determine if the div selected 
       is of users or public and reserved options */
    const classList = Array.from(document.querySelectorAll(`.${this.classList[1]}`)); 

    userSelected = this; // auxiliary global variable

    // hides all the check marks
    classList.forEach((participant) => {
        participant.childNodes[5].classList.add('hideElement')
    })  

    // removes the hide class from the check mark, displaying it
    this.childNodes[5].classList.remove('hideElement');
}
