# coding:utf-8
import shutil
import importlib
import os
from datetime import time
from flask import Flask, render_template, request, redirect, url_for, abort, make_response
from werkzeug.utils import secure_filename
from pypinyin import pinyin, lazy_pinyin
from utils.send_email import send_email


app = Flask(__name__)


def get_file_name(base_path, upload_path, file_name):
    if os.path.exists(upload_path):
        file_name = '1_' + file_name
        upload_path = os.path.join(base_path, 'uploads',
                                   secure_filename(file_name))
        return get_file_name(base_path, upload_path, file_name)
    else:
        return file_name


@app.route('/', methods=['GET'])
@app.route('/upload', methods=['POST', 'GET'])
def upload():
    if request.method == 'POST':
        f = request.files['file']
        base_path = os.path.dirname(__file__)
        try:
            import setting
            importlib.reload(setting)
            save_files = setting.SAVE_FILES
        except Exception:
            save_files = False
        if save_files:
            pre_file_name = f.filename
            file_name = secure_filename("".join(lazy_pinyin(pre_file_name)))
            if not os.path.exists(os.path.join(base_path, 'uploads')):
                os.mkdir(os.path.join(base_path, 'uploads'))
            upload_path = os.path.join(base_path, 'uploads',
                                       file_name)
            file_name = get_file_name(base_path, upload_path, file_name)
            upload_path = os.path.join(base_path, 'uploads',
                                       file_name)
            f.save(upload_path)
            with open(os.path.join(os.path.dirname(__file__), 'not_sent_files.txt'), 'a+') as f:
                f.write('{}\n{}\n'.format(pre_file_name, file_name))

        else:
            send_email(f.filename, file_content=f.read())
    return render_template('upload.html')


@app.route('/config', methods=['POST', 'GET'])
def config():
    if request.method == 'POST':
        sender_email = request.form['sender_email']
        email_pass = request.form['email_pass']
        email_host = request.form['email_host']
        email_port = int(request.form['email_port'])
        save_files_on_web_server = request.form['save_files_on_web_server']
        receiver_emails = request.form['receiver_emails']
        with open('setting.py', 'w') as f:
            email_config_str = 'EMAIL_PASS = "{}"\nEMAIL_SENDER = "{}"\nEMAIL_HOST = "{}"\nEMAIL_PORT = {}\nSAVE_FILES = {}\nRECEIVER_EMAILS = {}'.format(
                email_pass,
                sender_email,
                email_host,
                email_port,
                save_files_on_web_server,
                str(receiver_emails)
            )
            f.write(email_config_str)
    if request.method == 'GET':
        is_setting = True
        email_pass = ''
        email_sender = ''
        email_host = ''
        email_port = ''
        save_files = False
        receiver_emails = []
        try:
            import setting
            importlib.reload(setting)
            try:
                email_sender = setting.EMAIL_SENDER
            except Exception:
                pass
            try:
                email_host = setting.EMAIL_HOST
            except Exception:
                pass
            try:
                email_pass = setting.EMAIL_PASS
            except Exception:
                pass
            try:
                email_port = setting.EMAIL_PORT
            except Exception:
                pass
            try:
                receiver_emails = setting.RECEIVER_EMAILS
            except Exception:
                pass
            try:
                save_files = setting.SAVE_FILES
            except Exception:
                pass
        except Exception:
            pass
        

        config_dict = {
            'EMAIL_PASS': email_pass,
            'EMAIL_SENDER': email_sender,
            'EMAIL_HOST': email_host,
            'EMAIL_PORT': email_port,
            'SAVE_FILES': save_files,
            'RECEIVER_EMAILS': receiver_emails,
        }

        return make_response(render_template('config.html', **config_dict))

    return render_template('config.html')


@app.route('/send', methods=['POST', 'GET'])
def send():
    files_list_path = os.path.join(
        os.path.dirname(__file__), 'not_sent_files.txt')
    files_dict = {}
    if os.path.exists(files_list_path):
        tmp_file = None
        tmp_i = 0
        for i in open(files_list_path, 'r').read().split('\n'):
            if i != '':
                if tmp_i % 2 == 0:
                    files_dict[i] = ''
                    tmp_file = i
                else:
                    if files_dict.get(tmp_file, None) and tmp_file:
                        files_dict['_' + tmp_file] = i
                    elif tmp_file:
                        files_dict[tmp_file] = i
                tmp_i += 1

    if request.method == 'POST':
        dir_path = os.path.join(os.path.dirname(__file__), 'uploads')
        files_list_path = os.path.join(
            os.path.dirname(__file__), 'not_sent_files.txt')
        file_name = None
        send_all_files = False
        delete_all_files = False
        delete_after_sent = False
        try:
            file_name = request.form['file_name']
        except Exception:
            pass
        try:
            send_all_files = request.form['send_all_files'] == 'True'
        except Exception:
            pass
        try:
            delete_all_files = request.form['delete_all_files'] == 'True'
        except Exception:
            pass
        try:
            delete_after_sent = request.form['delete_after_sent'] == 'True'
        except Exception:
            pass

        if file_name:
            try:
                file_path = os.path.join(dir_path, files_dict[file_name])
                with open(file_path, 'rb') as f:
                    send_email(file_name, f.read())
                if delete_after_sent:
                    os.remove(file_path)
                tmp_content = open(files_list_path, 'r').read().replace(
                    '{}\n{}\n'.format(file_name, files_dict[file_name]), '')
                with open(files_list_path, 'w') as f:
                    f.write(tmp_content)
                files_dict.pop(file_name)
            except Exception as e:
                print(e)
        if os.path.exists(files_list_path) and send_all_files:
            for k, v in files_dict.items():
                file_path = os.path.join(dir_path, v)
                send_email(k, file_path=file_path)
                if delete_after_sent:
                    os.remove(file_path)
            os.remove(files_list_path)
        if delete_all_files:
            if os.path.exists(dir_path):
                shutil.rmtree(dir_path)
            if not os.path.exists(dir_path):
                os.makedirs(dir_path)
            os.remove(files_list_path)

    elif request.method == 'GET':
        return make_response(render_template('send.html', files_list=files_dict.keys()))
    return render_template('send.html')


if __name__ == '__main__':
    # 使用http
    app.run(host='0.0.0.0',port=80)

    # 使用https
    # app.run(host='0.0.0.0',port=443, ssl_context=(
    #     "your_path/server.crt",
    #     "your_path/server.key"
    # ))
