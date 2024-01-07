var next_message_id = 0;

const chat_window = document.getElementById("chat-window");
const user_input_textarea_element = document.getElementById("message");
const send_button = document.getElementById("send-button");
const start_recording_button = document.getElementById('recordButton');
const stop_recording_button = document.getElementById('stopButton');
const submit_text_button = document.getElementById('send-button');

const user_icon = document.createElement("i");
user_icon.classList = "fa-solid fa-user";

const bot_icon = document.createElement("i");
bot_icon.classList = "fa-solid fa-play";

function create_message_container(id) {
    let message_container = document.createElement("div");
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
            throw new TypeError(
                "Invalid argument: " + from + '. Expected "user" or "bot".'
            );
    }
}

function create_message_element(value, type, message_id) {
    switch (type) {
        case "text":
            let message_element = document.createElement("p");
            message_element.textContent = value;
            return message_element;

        case "audio":
            return create_audio_element(message_id, value);

        default:
            throw new TypeError(
                "Invalid argument: " + type + '. Expected "audio" or "text".'
            );
    }
}

function create_message_inner_container(from, value, type, message_id) {
    let message_inner_container = document.createElement("div");
    try {
        message_inner_container.appendChild(get_icon_for_message(from));
        message_inner_container.appendChild(create_message_element(value, type, message_id));
    } catch (TypeError) {
        return false;
    }
    return message_inner_container;
}

//todo can be impoved by returning the message_id somehow while running the rest in the background using an async function
function new_message(from, value, type) {
    next_message_id++;

    let message_container = create_message_container(next_message_id);
    let message_inner_container = create_message_inner_container(
        from,
        value,
        type,
        next_message_id
    );
    if (!message_inner_container) return -1;
    message_container.appendChild(message_inner_container);
    chat_window.append(message_container);
    message_container.scrollIntoView({
        behavior: "smooth",
        block: "end",
        inline: "nearest",
    });

    return next_message_id;
}

function get_message_text(message_id) {
    const message_container = document.getElementById("message-id-" + message_id);
    return message_container.firstChild.lastChild.innerText;
}

function update_message(new_value, message_id) {
    let message_container = document.getElementById("message-id-" + message_id);
    let message_paragraph_element = message_container.firstChild.lastChild;
    message_paragraph_element.innerText += new_value;
    message_container.scrollIntoView({
        behavior: "smooth",
        block: "end",
        inline: "nearest",
    });
}

async function send_text_message(value, message_id) {
    let form_data = new FormData();
    form_data.append("chat_id", 1);
    form_data.append("message", value);
    chat_id = await fetch(base_uri + "/message.php", {
        method: "POST",
        body: form_data,
    }).then((response) => {
        return response.text();
    });

    const eventSource = new EventSource(
        base_uri + `message.php?chat_id=${chat_id}`
    );

    eventSource.addEventListener("error", () => {
        update_message("Sorry, there was an error in the request", message_id);
    });

    eventSource.addEventListener("message", (event) => {
        let response = JSON.parse(event.data);
        update_message(response.content, message_id);
    });

    eventSource.addEventListener("stop", async function () {
        eventSource.close();
        const audio_element = await link_audio_file(
            message_id,
            await request_audio_file(
                get_message_text(message_id)
            )
        );
        audio_element.addEventListener("canplaythrough", () => {
            if (!isAnyAudioPlaying()) audio_element.play();
        });
    });
}

function user_input() {
    let text_value = user_input_textarea_element.value;
    new_message("user", text_value, "text");
    let message_id = new_message("bot", "", "text");
    send_text_message(text_value, message_id);
}

user_input_textarea_element.addEventListener("keypress", (event) => {
    if (event.key == "Enter") {
        event.preventDefault();
        user_input();
        user_input_textarea_element.value = "";
    }
});

submit_text_button.addEventListener("click", () => {
    user_input();
    user_input_textarea_element.value = "";
});

function isAnyAudioPlaying() {
    const audioElements = document.querySelectorAll('audio');
    for (let i = 0; i < audioElements.length; i++) {
        if (!audioElements[i].paused) {
            return true;
        }
    }
    return false;
}


function create_audio_element(message_id, audio_source) {
    const audio_element = document.createElement('audio');
    audio_element.src = audio_source;
    audio_element.controls = true;
    audio_element.id = `audio-id-${message_id}`
    return audio_element;
}

async function link_audio_file(message_id, audio_source) {
    const message_container = document.getElementById("message-id-" + message_id);
    const audio_element = create_audio_element(message_id, audio_source);
    audio_element.style.display = "none";
    message_container.appendChild(audio_element);
    message_container.addEventListener("click", () => {
        if (!isAnyAudioPlaying()) audio_element.play();
    });
    return audio_element;
}

async function request_audio_file(message_text) {
    let formData = new FormData();
    formData.append("text", message_text);

    return fetch(base_uri + "/text_to_audio.php", {
        method: "POST",
        body: formData
    }).then((response) => {
        return response.json();
    }).then((data) => {
        if (data.status == "OK") {
            return base_uri + "/speech/output/" + data.response
        }
        console.log(data);
        throw new Error("Server error");
    });
}

const recordAudio = () => {
    return new Promise(resolve => {
        navigator.mediaDevices.getUserMedia({ audio: true })
            .then(stream => {
                const mediaRecorder = new MediaRecorder(stream);
                const audioChunks = [];

                mediaRecorder.addEventListener("dataavailable", event => {
                    audioChunks.push(event.data);
                });

                const start = () => {
                    mediaRecorder.start(5);
                };

                const stop = () => {
                    return new Promise(resolve => {
                        mediaRecorder.addEventListener("stop", () => {
                            const audioBlob = new Blob(audioChunks);
                            const audioUrl = URL.createObjectURL(audioBlob);
                            const audio = new Audio(audioUrl);
                            const play = () => {
                                if (!isAnyAudioPlaying()) audio.play();
                            };

                            resolve({ audioBlob, audioUrl, play });
                        });

                        mediaRecorder.stop();
                    });
                };

                resolve({ start, stop });
            });
    });
};


var audio_recorder;

async function start_recording() {
    start_recording_button.style.display = 'none';
    stop_recording_button.style.display = 'block';

    audio_recorder = await recordAudio();
    audio_recorder.start();
}

async function stop_recording() {
    start_recording_button.style.display = 'block';
    stop_recording_button.style.display = 'none';

    const result = await audio_recorder.stop();
    new_message("user", result.audioUrl, "audio");
    const text = await request_transcription(result.audioBlob);
    link_audio_file(new_message("user", text, "text"), result.audioUrl);
    let message_id = new_message("bot", "", "text");
    send_text_message(text, message_id);
}

start_recording_button.addEventListener('click', start_recording);
stop_recording_button.addEventListener('click', stop_recording);

async function request_transcription(audioBlob) {
    let formData = new FormData();
    formData.append("blob", audioBlob);

    return fetch(base_uri + "/audio_to_text.php", {
        method: "POST",
        body: formData
    }).then((response) => {
        return response.json();
    }).then((data) => {
        return data.text;
    });
}

