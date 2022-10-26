/**
 * @brief - Érico A. B. Cavalcanti - Bate Papo UOL projeto
 *          Fifth week of the full stack driven course
 */

const user = {};

let lastMessage;

// adds onclick functionality to modal name request section
document.querySelector('#send-request').addEventListener('click', function() {
    let modalContent = document.querySelector('.modal .content');
    let modalLoader = document.querySelector('.loader');

    // adds hideElement do modal and displays loading screen
    modalLoader.classList.remove('hideElement');
    modalContent.classList.add('hideElement');
    
    // gets the userName written in the modal section
    getUserName();
}); 

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

function getUserName() {
    const inputName = document.querySelector('#request-name')
    const userName = inputName.value;
    user.name = userName;
    
    axios.post(
        'https://mock-api.driven.com.br/api/v6/uol/participants', 
        user)
        .then(function (response) {
            console.log('sucesso ao enviar userName!');
            startSendingStatus();
        })
        .catch(function(response) {
            console.log('erro ao enviar userName!');
            getUserName();
        }
    );
}

function startSendingStatus() {
    const userStatus = setInterval(() => {
        axios.post(
            'https://mock-api.driven.com.br/api/v6/uol/status', 
            user)
            .then(function (response) {
                console.log('sucesso ao enviar status!');
            })
            .catch(function(response) {
                console.log('erro ao enviar status, limpando intervalo!');
                clearInterval(userStatus);
            }
        );
    }, 5000) //sends status to server every 5 seconds
    
    // getParticipants();
    // setInterval(searchForMessages, 6000); // updates user messages every 6 seconds   

    searchForMessages();
    
    setInterval(() => {
        console.log('atualizando mensagens!');
        updateMessages();        
    }, 500);

}

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

function updateMessages() {
    const getMessages = axios.get('https://mock-api.driven.com.br/api/v6/uol/messages');

    const messageSection = document.querySelector('.messageSection');

    getMessages.then(function (response) {
        
        let message = response.data[response.data.length - 1];

        console.log(`CURRENT MESSAGE`);
        console.log(message);
        
        if(sameMessage(lastMessage, message)) {
            console.log('mensagens iguais!');
            return;
        }

        console.log(`LAST MESSAGE`);
        console.log(message);

        lastMessage = message;
        
        if(message.type === 'status') {
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
        }
    
        if(message.type === 'message') {
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
        }
    
        if(message.type === 'private_message') {
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
        }

        // scrolls to the last message sent
        window.scrollTo(0, document.body.scrollHeight);
    });    
}


function searchForMessages() {
    const getMessages = axios.get('https://mock-api.driven.com.br/api/v6/uol/messages');

    const messageSection = document.querySelector('.messageSection');

    getMessages.then(function(response) {

    for(let i = 0; i < response.data.length; i++) {
        let message = response.data[i]
        if(message.type === 'status') {
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
        }

        if(message.type === 'message') {
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
        }

        if(message.type === 'private_message') {
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
        }

        if(i === response.data.length - 1) {
            lastMessage = response.data[i];
            console.log(`LAST MESSAGE`);
            console.log(lastMessage);
        }
    }

    // loader false
    removeLoader();

    // scrolls to the last message sent
    window.scrollTo(0, document.body.scrollHeight);
    });
}

// sends the message inserted in the input section
function sendMessage() {
    const message = {};
    const messageBox = document.querySelector('footer input');

    // builds the message before sending it to the API
    message.from = user.name;
    message.to = "Todos";
    message.text = messageBox.value;
    message.type = "message"; // THIS TYPE CAN BE PRIVATE IN THE BONUS FUNCTION

    axios.post(
        'https://mock-api.driven.com.br/api/v6/uol/messages', 
        message)
        .then(function (response) {
            console.log('mensagem enviada com sucesso!');
            
        })
        .catch(function (response) {
            console.log('um erro aconteceu no envio da mensagem!');
        }
    );

    messageBox.value = ''
}

function getParticipants() {

    const participants = axios.get('https://mock-api.driven.com.br/api/v6/uol/participants');
    
    participants.then(function(response) {
        console.log('sucessfully got participants');
        console.log(response);
    }).catch(function (response) {
        console.log('error while getting participants');
        console.log(response);
    })
}