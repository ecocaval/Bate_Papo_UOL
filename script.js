/**
 * @brief - Érico A. B. Cavalcanti - Bate Papo UOL projeto
 *          Fifth week of the full stack driven course
 */

const user = {};

let lastMessage;

// adds onclick functionality to modal name request section
document.querySelector('#send-request').addEventListener('click', getUserName); 

// displays participant menu
document.querySelector('header ion-icon').addEventListener('click',
displayUserAside);

document.querySelectorAll('.menu-option').forEach((option) => {
    option.addEventListener('click',displayCheck);
})

function displayCheck() {
    this.childNodes[5].classList.toggle('hideElement');
}

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

function getUserName() {
    const inputName = document.querySelector('#request-name')
    const userName = inputName.value;
    user.name = userName;
    
    let modalContent = document.querySelector('.modal .content');
    let modalLoader = document.querySelector('.loader');

    axios.post('https://mock-api.driven.com.br/api/v6/uol/participants', user)
        .then(function (response) {
        
            // adds hideElement do modal and displays loading screen
            modalLoader.classList.remove('hideElement');
            modalContent.classList.add('hideElement');

            console.log('sucesso ao enviar userName!');
            startSendingStatus();
        })
        .catch(function(response) {
            console.error('erro ao enviar userName!');
            inputName.value = '';            
            alert('Este nome já está em uso!')
        }
    );
}

function startSendingStatus() {
    const userStatus = setInterval(() => {
        axios.post('https://mock-api.driven.com.br/api/v6/uol/status', user)
            .then(function (response) {
                console.log('sucesso ao enviar status!');
            })
            .catch(function(response) {
                console.error('erro ao enviar status!');
            }
        );
    }, 5000) //sends status to server every 5 seconds
    
    getParticipants();   

    searchForMessages();
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

        // console.log(`CURRENT MESSAGE`);
        // console.log(message);
        
        if(sameMessage(lastMessage, message)) {
            console.log('mensagens iguais!');
            return;
        }

        // console.log(`LAST MESSAGE`);
        // console.log(message);

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

        scrollToLastMessage();
    });    
}

function scrollToLastMessage() {
    let lastMessageDiv = Array.from(document.querySelectorAll('.message'));
    
    lastMessageDiv = lastMessageDiv[lastMessageDiv.length-1];  
    
    console.log(lastMessageDiv);
    
    lastMessageDiv.scrollIntoView();
}


function searchForMessages() {
    const getMessages = axios.get('https://mock-api.driven.com.br/api/v6/uol/messages');

    getMessages.then(function(response) {

    for(let i = 0; i < response.data.length; i++) {
        
        let message = response.data[i];

        insertNewMessage(message);

        if(i === response.data.length - 1) {
            lastMessage = response.data[i];
        }
    }

    // loader false
    removeLoader();

    scrollToLastMessage();

    // updates the last message every 200 miliseconds
    setInterval(() => {
        console.log('atualizando mensagens!');
        updateMessages();        
    }, 200);

    });
}

function insertNewMessage(message) {

    const messageSection = document.querySelector('.messageSection');

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
            console.error('um erro aconteceu no envio da mensagem!');
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
        console.error('error while getting participants');
        console.log(response);
    })
}