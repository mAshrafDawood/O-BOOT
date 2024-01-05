var next_message_id = 0;

const chat_window = document.getElementById("chat-window");
const user_input_textarea_element = document.getElementById('message');
const send_button = document.getElementById('send-button');

const user_icon = document.createElement("i");
user_icon.classList = "fa-solid fa-user";

const bot_icon = document.createElement("i");
bot_icon.classList = "fa-solid fa-play";


function create_message_container(id){
    let message_container = document.createElement('div');
    message_container.classList = "message-container";
    message_container.id = "message-id-" + id;
    return message_container;
}

function get_icon_for_message(from) {
    switch (from) {
        case "user": 
            return user_icon.cloneNode(true);
        case "bot":
            return bot_icon.cloneNode(true);
        default:
            throw new TypeError('Invalid argument: ' + from + '. Expected "user" or "bot".');
    }
}

function create_message_element(value, type) {
    switch (type) {
        case "text":
            let message_element = document.createElement('p');
            message_element.textContent = value;
            return message_element;

        case "audio":
            //todo to be implemented later
            return document.createElement('audio'); //placeholder return
            
        default:
            throw new TypeError('Invalid argument: ' + type + '. Expected "audio" or "text".');
    }
}

function create_message_inner_container(from, value, type) {
    let message_inner_container = document.createElement('div');
    try {
        message_inner_container.appendChild(get_icon_for_message(from));
        message_inner_container.appendChild(create_message_element(value, type));
    }
    catch (TypeError) {
        return false;
    }
    return message_inner_container;
}

//todo can be impoved by returning the message_id somehow while running the rest in the background using an async function
function new_message(from, value, type) {
    next_message_id++;

    message_container = create_message_container(next_message_id);
    let message_inner_container = create_message_inner_container(from, value, type);
    if (!message_inner_container) return -1;
    message_container.appendChild(message_inner_container);
    message_container.append(document.createElement("hr"));
    chat_window.append(message_container);
    message_container.scrollIntoView({
        behavior: "smooth",
         block: "end",
          inline: "nearest"
    });

    return next_message_id;
}

function update_message(new_value, message_id) {
    let message_container = document.getElementById('message-id-' + message_id);
    let message_paragraph_element = message_container.firstChild.lastChild;
    message_paragraph_element.innerText += new_value;
}

async function send_text_message(value, message_id) {
    let form_data = new FormData();
    form_data.append('chat_id', 1);
    form_data.append('message', value)
    chat_id = await fetch(base_uri + '/message.php', {
        method: "POST",
        body: form_data
    }).then(
        (response) => {
            return response.text();
    });

    const eventSource = new EventSource(
        base_uri + `message.php?chat_id=${chat_id}`
    );

    eventSource.addEventListener('error', () => {
        update_message("Sorry, there was an error in the request", message_id);
    });

    eventSource.addEventListener('message', (event) => {
        let response = JSON.parse(event.data);
        update_message(response.content, message_id);
    });

    eventSource.addEventListener('stop', async function() {
        eventSource.close();
    });
}

function user_input() {
    let text_value = user_input_textarea_element.value;
    new_message("user", text_value, "text");
    let message_id = new_message("bot", "", "text");
    send_text_message(text_value, message_id);
}

user_input_textarea_element.addEventListener('keypress', (event) => {
    if (event.key == 'Enter') {
        user_input();
        user_input_textarea_element.value = '';
    }
});