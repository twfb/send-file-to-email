let progress_counter = 0;
let last_fi = null;
document.getElementById('file').onchange = upload_file;

function upload_file() {
    let fi = document.getElementById('file').files[0];
    const my_form = new FormData();
    my_form.append("file", fi);
    let file_id = null;
    if (fi !== undefined) {
        if (last_fi !== fi) {
            let file_id = 'progress_file_' + progress_counter;
            create_file_progress(file_id, fi.name);
            const xhr = new XMLHttpRequest();
            post_file(xhr, file_id, fi.name).send(my_form);
            last_fi = fi;
            fi = undefined;
            file_id = null;
        }
    }
}

function post_file(xhr, file_id) {
    xhr.open("POST", "/upload");
    xhr.upload.addEventListener("progress", function (event) {
        if (event.lengthComputable) {
            const complete = (event.loaded / event.total * 100 | 0);
            document.getElementById(file_id).value = complete;
            document.getElementById(file_id + '_percent').innerText = complete + ' %';
            if (complete === 100) {
                document.getElementById(file_id).setAttribute('class', 'progress is-success is-small');

            }
        }
    });
    return xhr;
}

function create_file_progress(file_id, file_name) {
    if (document.getElementById(file_id) === undefined || document.getElementById(file_id) === null) {
        const progress_title = '<p style="display: inline;" class="subtitle">' + file_name + '</p>' + '<p class="subtitle" id="' + file_id + '_percent" style="float:right;display: inline"> 0 %</p>';
        const progress_bar = '<progress id="' + file_id + '" class="progress is-info is-small" value="0" max="100" id="progress"></progress>';
        const file_progress = '<div class="box">' + progress_title + progress_bar + '</div>';
        document.getElementById('progress_files').innerHTML += file_progress;
        progress_counter += 1;
    }
}

