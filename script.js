/**
 * @brief - Érico A. B. Cavalcanti - Bate Papo UOL projeto
 *          Fifth week of the full stack driven course
 */

const user = {};

askUserName();

function askUserName() {

    const userName = prompt('Digite o seu nome:');
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
            askUserName();
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
    
    searchForMessages();
}
 
function searchForMessages() {
    const getMessages = axios.get('https://mock-api.driven.com.br/api/v6/uol/messages');

    const messageSection = document.querySelector('.messageSection');

    
    getMessages.then(function(response) {
        // console.log('TEST', response.data);
        // response.data.map(message => console.log('MESSAGE MAP', message))
        for(let i = 0; i < response.data.length; i++) {
            let message = response.data[i]
            if(message.type === 'status') {
                // console.log('MENSAGEM', message.type)
                // from, to, text, type, time 
                // document.querySelector('.messageSection').innerHTML += `
                // <div class="message">
                //     <p class="messageHour">
                //         ${message.time}
                //     </p>
                //     <p class="messageUser">
                //         ${message.from}
                //     </p>
                //     <p class="messageContent">
                //         entra na sala...
                //     </p>
                // </div>
                // `
            }

            if(message.type === 'message') {
                console.log('MENSAGEM', message.type)
                // from, to, text, type, time 
                document.querySelector('.messageSection').innerHTML += `
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
                `
            }
            

        }
    });
}

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
            console.log(message);
            console.log('mensagem enviada com sucesso!');
        })
        .catch(function (response) {
            console.log('um erro aconteceu no envio da mensagem!');
        }
    );
}