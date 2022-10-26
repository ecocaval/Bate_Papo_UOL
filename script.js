/**
 * @brief - Érico A. B. Cavalcanti - Bate Papo UOL projeto
 *          Fifth week of the full stack driven course
 */

const user = {};

askUserName();

function askUserName() {

    const userName = prompt('Digite o seu nome:');
    user.name = userName;

    console.log(user); 
    
    axios.post(
        'https://mock-api.driven.com.br/api/v6/uol/participants', 
        user)
        .then(function (response) {
            console.log('sucesso ao enviar userName!');
            console.log(response);
            startSendingStatus();
        })
        .catch(function(response) {
            console.log('erro ao enviar userName!');
            console.log(response);
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
                console.log(response);
            })
            .catch(function(response) {
                console.log('erro ao enviar status!');
                console.log(response);
                clearInterval(userStatus);
            }
        );
    }, 5000) //sends status to server every 5 seconds
    
    searchForMessages();
}
 
function searchForMessages() {
    const getMessages = axios.get('https://mock-api.driven.com.br/api/v6/uol/messages');

    getMessages.then(function(response) {
        console.log(response);
    });
}

function sendMessage() {
    const message = {};
    const messageBox = document.querySelector('footer input');

    console.log('botao clicado!');

    // builds the message before sending it to the API
    message.from = user.name;
    message.to = "Todos";
    message.text = messageBox.value;
    message.type = "message"; // THIS TYPE CAN BE PRIVATE IN THE BONUS FUNCTION

    console.log(message);

    axios.post(
        'https://mock-api.driven.com.br/api/v6/uol/messages', 
        message)
        .then(function (response) {
            console.log(message);
            console.log('mensagem enviada com sucesso!');
        })
        .catch(function(response) {
            console.log('um erro aconteceu no envio da mensagem!');
        }
    );
}