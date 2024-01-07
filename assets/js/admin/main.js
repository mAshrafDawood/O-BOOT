const form_element = document.getElementById('upload_training_file_form');

form_element.addEventListener('submit', (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const form_data = new FormData(form);
    const url = form.action;
    fetch(url, {
        method: 'POST',
        body: form_data
    })
    .then(response => response.json())
    .then(result => {
        console.log('Success:', result);
        alert("File uploaded successfully")
    })
    .catch(error => {
        console.error('Error:', error);
        alert("There was a problem");
    });
});
