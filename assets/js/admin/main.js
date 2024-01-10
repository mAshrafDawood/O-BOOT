const form_element = document.getElementById('upload_training_file_form');
const file_upload_element = document.getElementById( 'file' );
const file_label_element = file_upload_element.nextElementSibling;
const label_value = file_label_element.innerHTML;
const status_element = document.getElementById('status');

form_element.addEventListener('submit', (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const form_data = new FormData(form);
    const url = form.action;
    status_element.innerHTML = 'Uploading file & terminating all running sessions...';
    fetch(url, {
        method: 'POST',
        body: form_data
    })
    .then((response) => {
        return response.json();
    })
    .then(result => {
        if (result.status === "ERROR") {
            status_element.innerHTML = result.response;
            return;
        }
        status_element.innerHTML = result.status;
    })
    .catch(error => {
        status_element.innerHTML = "Something went wrong, check the console";
        console.log(error.message);
    });
});

file_upload_element.addEventListener('change', (event) => {
    let fileName;
    if( this.files && this.files.length > 1 )
        fileName = ( this.getAttribute( 'data-multiple-caption' ) || '' ).replace( '{count}', this.files.length );
    else
        fileName = event.target.value.split( '\\' ).pop();

    if( fileName )
        file_label_element.querySelector( 'strong' ).innerHTML = fileName;
    else
        file_label_element.innerHTML = label_value;
});
