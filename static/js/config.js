const email_pattern = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
let receiver_emails_set = new Set();
let receiver_emails_array = Array();
let receiver_last_email = '#';
let save_file_on_server = 'False';


change_receiver_emails();

document.getElementById('receiver_emails').oninput = change_receiver_emails;
document.getElementById('receiver_emails').onmouseleave = change_receiver_emails;
document.getElementById('receiver_emails').onkeydown = function (e) {
    if (!e) e = window.event;
    if ((e.keyCode || e.which) === 13)
        change_receiver_emails();

};

document.getElementById('sender_email').onmouseleave = check_sender_email;
document.getElementById('sender_email').onkeydown = function (e) {
    if (!e) e = window.event;
    if ((e.keyCode || e.which) === 13)
        check_sender_email();

};

document.getElementById('email_pass').onmouseleave = check_email_pass;
document.getElementById('email_pass').onkeydown = function (e) {
    if (!e) e = window.event;
    if ((e.keyCode || e.which) === 13)
        check_email_pass();

};


document.getElementById('email_port').onmouseleave = check_email_host_and_port;
document.getElementById('email_port').onkeydown = function (e) {
    if (!e) e = window.event;
    if ((e.keyCode || e.which) === 13)
        check_email_host_and_port();

};

function submit_config() {
    if (check_sender_email() && check_email_pass() && check_email_host_and_port() && check_receiver_emails()) {
        const data = new FormData();
        data.append('sender_email', document.getElementById('sender_email').value);
        data.append('email_pass', document.getElementById('email_pass').value);
        data.append('email_host', document.getElementById('email_host').value);
        data.append('email_port', document.getElementById('email_port').value);
        data.append('save_files_on_web_server', save_file_on_server);
        data.append('receiver_emails', JSON.stringify(Array.from(receiver_emails_set.values())));


        const xhr = new XMLHttpRequest();
        xhr.open('POST', '/config', true);
        xhr.onload = function () {
            alert('Config sent successfully.')
        };
        xhr.send(data);
    }
}

function clear_config() {
    document.getElementById('sender_email').value = '';
    document.getElementById('email_pass').value = '';
    document.getElementById('email_host').value = '';
    document.getElementById('email_port').value = '';
    check_save_file(0);
    document.getElementById('receiver_emails').value = '';
    for (let email_str of receiver_emails_set) {
        delete_email_tag(email_str);
    }
    receiver_emails_set = new Set();
    receiver_emails_array = Array();
}

function check_sender_email() {

    const sender_email_value = document.getElementById('sender_email').value;
    if (email_pattern.test(sender_email_value) && value_is_not_null(sender_email_value)) {
        document.getElementById('invalid_sender_email').style.display = 'none';
        document.getElementById('invalid_sender_email').innerText = '';
        return true;

    } else {
        document.getElementById('invalid_sender_email').innerText = 'This email is invalid';
        document.getElementById('invalid_sender_email').style.display = 'inline';
        return false;
    }
}

function change_receiver_emails() {

    const emails_array = get_receiver_emails_array();
    if (emails_array.length > receiver_emails_set.size)
        for (let i = 0; i < emails_array.length; i++) {
            const email_str = emails_array[i];
            add_email_tag(email_str);
        }
    else if (receiver_emails_set.size >= emails_array.length) {
        for (let email_str of receiver_emails_set) {
            if (emails_array.indexOf(email_str) === -1) {
                delete_email_tag(email_str);
            }
        }
    }

}

function get_receiver_emails_array() {
    const receiver_emails_value = document.getElementById('receiver_emails').value;
    if (receiver_emails_value.indexOf(',') !== -1) {
        receiver_emails_array = receiver_emails_value.split(',');
    } else if (receiver_emails_value.indexOf('，') !== -1) {
        receiver_emails_array = receiver_emails_value.split('，');
    } else {
        receiver_emails_array = receiver_emails_value.split(' ');
    }
    return receiver_emails_array;
}

function add_email_tag(email_str) {
    if (value_is_not_null(email_str) && !receiver_emails_set.has(email_str)) {
        if (email_pattern.test(email_str)) {
            if (email_str.indexOf(receiver_last_email) === -1 || receiver_last_email === email_str) {

                if (receiver_last_email === '#')
                    receiver_emails_set.add(email_str);
                else
                    receiver_emails_set.add(receiver_last_email);
                const tag_html = '<div class="tags has-addons" style="float: left;margin:2px" id="' + email_str + '">' +
                    '<span class="tag is-primary">' + email_str + '</span>' +
                    '<a class="tag is-delete" onclick="delete_email_tag(\'' + email_str + '\')"></a>' +
                    '</div>';
                document.getElementById('email_tags').innerHTML += tag_html;
                receiver_last_email = '';
            } else {
                receiver_last_email = email_str;
            }
            document.getElementById('invalid_receiver_email').style.display = 'none';
            document.getElementById('invalid_receiver_email').innerText = '';
        } else {
            document.getElementById('invalid_receiver_email').style.display = '';
            document.getElementById('invalid_receiver_email').innerText = '"' + email_str + '" is invalid email.';
        }
    }

}


function delete_email_tag(email) {
    receiver_emails_set.delete(email);
    const email_tag = document.getElementById(email);
    const receiver_emails = document.getElementById('receiver_emails');
    document.getElementById('receiver_emails').value = receiver_emails.value.replace(email + ' ', '').replace(email + ',', '').replace(email + '，', '').replace(email, '');
    if (value_is_not_null(email_tag)) {
        email_tag.innerHTML = '';
        email_tag.style.display = 'none';
    }
}

function value_is_not_null(value) {
    return !(value === '' || value === null || value === undefined);
}

function check_email_pass() {
    if (value_is_not_null(document.getElementById('email_pass').value)) {
        document.getElementById('invalid_email_pass').style.display = 'none';
        document.getElementById('invalid_email_pass').innerText = '';
        return true;
    } else {
        document.getElementById('invalid_email_pass').innerText = 'This password is invalid';
        document.getElementById('invalid_email_pass').style.display = 'inline';
        return false;
    }

}


function check_email_host_and_port() {
    if (value_is_not_null(document.getElementById('email_host').value) && value_is_not_null(document.getElementById('email_port').value) && /\d+/.test(document.getElementById('email_port').value)) {
        document.getElementById('invalid_email_host').style.display = 'none';
        document.getElementById('invalid_email_host').innerText = '';
        return true;
    } else {
        document.getElementById('invalid_email_host').innerText = 'This email host or port is invalid';
        document.getElementById('invalid_email_host').style.display = 'inline';
        return false;
    }

}

function check_receiver_emails() {
    if (value_is_not_null(document.getElementById('receiver_emails').value)) {
        document.getElementById('invalid_receiver_email').style.display = 'none';
        document.getElementById('invalid_receiver_email').innerText = '';
        return true;
    } else {
        document.getElementById('invalid_receiver_email').style.display = '';
        document.getElementById('invalid_receiver_email').innerText = 'This email is invalid.';
        return false;
    }
}

function check_save_file(save_f) {
    if (save_f === 1) {
        document.getElementById('save_file').setAttribute('class', 'is-info button is-selected  is-small');
        document.getElementById('dont_save_file').setAttribute('class', 'button is-small');
        save_file_on_server = 'True';
    } else {
        document.getElementById('dont_save_file').setAttribute('class', 'is-info button is-selected  is-small');
        document.getElementById('save_file').setAttribute('class', 'button is-small');
        save_file_on_server = 'False';
    }
}

