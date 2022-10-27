/**
 * @brief - Érico A. B. Cavalcanti - Bate Papo UOL projeto
 *          Fifth week of the full stack driven course
 */

// user object sent to the api for validation
const user = {};

// auxiliary variable used for non-repeating messages in chat
let lastMessage;

// adds onclick functionality to modal name request section
document.querySelector('#send-request').addEventListener('click', getUserName); 

// displays participant menu
document.querySelector('header ion-icon').addEventListener('click',
displayUserAside);

// displays the green check when an option is clicked at parcitipants menu
function displayCheck() {
    const lockers = Array.from(document.querySelectorAll(`.${this.classList[1]}`));

    lockers.forEach(item => {
        item.childNodes[5].classList.toggle('hideElement');
    })    
}

// displays the partcipants menu
function displayUserAside() {
    document.querySelector('.participants-menu').classList.toggle('hideElement');
    document.querySelector('.transparent-back').classList.toggle('hideElement');
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

            console.log('sucesso ao enviar userName!');
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
            .then(function (response) {
                console.log('sucesso ao enviar status!');
            })
            .catch(function(response) {
                console.error('erro ao enviar status!');
            }
        );
    }, 5000) //sends status to server every 5 seconds
    
    // gets the list of the participants online in chat
    getParticipants();   

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

    const messageSection = document.querySelector('.messageSection');

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

        // scrolls the screen to the last message received from the api
        scrollToLastMessage();
    });    
}

// scrolls the screen to the last message received from the api
function scrollToLastMessage() {
    let lastMessageDiv = Array.from(document.querySelectorAll('.message'));
    
    // selects the last message from the messages array
    lastMessageDiv = lastMessageDiv[lastMessageDiv.length-1];  

    // scrolls into the last element
    lastMessageDiv.scrollIntoView();
}

// first search for messages in the api
function searchForMessages() {
    const getMessages = axios.get('https://mock-api.driven.com.br/api/v6/uol/messages');

    getMessages.then(function(response) {

    // displays all the messages received from the JSON
    for(let i = 0; i < response.data.length; i++) {
        
        let message = response.data[i];

        insertNewMessage(message);

        if(i === response.data.length - 1) {
            lastMessage = response.data[i];
        }
    }

    removeLoader();

    scrollToLastMessage();

    setInterval(() => {
        updateMessages();        
    }, 200);

    });
}

function insertNewMessage(message) {

    const messageSection = document.querySelector('.messageSection');

    switch (message.type) {
        case 'status':
            messageSection.innerHTML += `
            <div class="message status">
                <p class="messageHour">
                    ${message.time}
                </p>
                <p class="messageUser">
                    ${message.from}
                </p>
                <p class="messageContent">
                    entra na sala...
                </p>
            </div>
            `;
            break;
        case 'message':
            messageSection.innerHTML += `
            <div class="message public">
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
            messageSection.innerHTML += `
            <div class="message reserved">
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
    messageToSend.to = "Todos"; // MAKE CHANGES HERE
    messageToSend.text = messageBox.value;
    if(messageIsPrivate()) {
        messageToSend.type = "private_message";
    } else {
        messageToSend.type = "message";
    }

    axios.post(
        'https://mock-api.driven.com.br/api/v6/uol/messages', 
        messageToSend)
        .then(function (response) {
            console.log('mensagem enviada com sucesso!');            
        })
        .catch(function (response) {
            console.error('um erro aconteceu no envio da mensagem!');
        }
    );   

    messageBox.value = '';
}

function messageIsPrivate() {
    const icons = Array.from(document.querySelectorAll('ion-icon'));
    
    // icons[8] get the check mark of the public div option
    if(!icons[8].classList.contains('hideElement')) {
        return true
    }
    return false;
}

function getParticipants() {

    const participants = axios.get('https://mock-api.driven.com.br/api/v6/uol/participants');
    
    participants.then(function(response) {
        console.log('sucessfully got participants');
        console.log(response.data);
        updateParticipantsList(response.data);
    }).catch(function (response) {
        console.error('error while getting participants');
    })
}

function updateParticipantsList(partcipantsList) {
    const participantsMenu = document.querySelector('.participants-menu');

    for(let participant in partcipantsList) {
        participantsMenu.innerHTML += `
            <div class="menu-option">
                <ion-icon name="person-circle"></ion-icon>
                <p>${partcipantsList[participant].name}</p>
                <ion-icon name="checkmark-sharp" class="check hideElement"></ion-icon>
            </div>
        `;
    }

    participantsMenu.innerHTML += `
        <p>Escolha a visibilidade:</p>
        <div class="menu-option lock">
            <ion-icon name="lock-open"></ion-icon>
            <p>Público</p>
            <ion-icon name="checkmark-sharp" class="check"></ion-icon>
        </div>

        <div class="menu-option lock">
            <ion-icon name="lock-closed"></ion-icon>
            <p>Reservadamente</p>
            <ion-icon name="checkmark-sharp" class="check hideElement"></ion-icon>
        </div>
    `;

    // displays the green check when an option is clicked at parcitipants menu
    document.querySelectorAll('.menu-option').forEach((option) => {
        option.addEventListener('click',displayCheck);
    });
}