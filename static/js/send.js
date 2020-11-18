let delete_after_sent = 'False';

function send_email(file_name) {
    on_sending(file_name);
    const data = new FormData();
    data.append('file_name', file_name);
    data.append('delete_after_sent', delete_after_sent);
    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/send', true);
    xhr.onload = function () {
        document.getElementById(file_name).style.display = 'none';
        document.getElementById(file_name).innerHTML = '';
    };
    xhr.send(data);
}


function send_all_files() {
    for (let progress_bar of document.getElementsByName('file_bar')) {
        on_sending(progress_bar.id);
    }
    const data = new FormData();
    data.append('send_all_files', 'True');
    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/send', true);
    xhr.onload = function () {
        for (let progress_bar of document.getElementsByName('file_bar')) {
            document.getElementById(progress_bar.id).style.display = 'none';
            document.getElementById(progress_bar.id).innerHTML = '';
        }
    };
    xhr.send(data);
}


function on_sending(file_name) {

    document.getElementById(file_name).innerHTML = '<progress class="is-primary progress is-large" max="100" style="position: absolute;left: 50%;-webkit-transform:translate(-50%,-50%);width: 90%"></progress><div style="position:relative;left: 50%;-webkit-transform:translate(-50%,-50%);">'
        + '<span style="width:100%;font-size:'
        + document.getElementById(file_name).style.fontSize
        + '"><span style="padding-right:20px">'
        + file_name
        + '</span><span class="icon" style="padding-right:10px;margin-right: 0;right: 0;position: absolute"><i class="fas fa-upload"></i></span></span></div>';
}

function delete_all_files() {
    if (confirm('Confirm delete all files on server?')) {
        const data = new FormData();
        data.append('delete_all_files', 'True');
        const xhr = new XMLHttpRequest();
        xhr.open('POST', '/send', true);
        xhr.onload = function () {
            for (let progress_bar of document.getElementsByName('file_bar')) {
                document.getElementById(progress_bar.id).style.display = 'none';
                document.getElementById(progress_bar.id).innerHTML = '';
            }
        };
        xhr.send(data);
    }

}

function check_delete_file(delete_file_code) {
    if (delete_file_code === 1) {
        delete_after_sent = 'True';
        document.getElementById('delete_file').setAttribute('class', 'is-info button is-selected  is-small');
        document.getElementById('dont_delete_file').setAttribute('class', 'button is-small');
    } else {
        delete_after_sent = 'False';
        document.getElementById('dont_delete_file').setAttribute('class', 'is-info button is-selected  is-small');
        document.getElementById('delete_file').setAttribute('class', 'button is-small');
    }
}