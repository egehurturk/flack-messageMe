import os

from flask import Flask, session, render_template, jsonify, request, redirect, url_for
import time
from flask_session import Session
from flask_socketio import SocketIO, emit

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)

channels = ["general", "random"]
channelMessages = {
    "general":["The very first message", "Second message"],
    "random": ["This is the very first message", "Here's the second one", "Don't forget the third one"]
}


@app.route("/", methods=["POST", "GET"])
def index():
    return render_template("index.html")




@socketio.on("channel created")
def channel(data):
    channel = data["channel"]
    if channel in channels:
        emit('channel exists error', {"channel":channel}, broadcast=False)
    elif len(channel) >= 15:
        emit('channel length error', {'channel':channel}, broadcast=False)
    else:
        channels.append(channel)
        emit('channel created', {}, broadcast=True)
        emit('channel list', {"channels":channels}, broadcast=True)



@socketio.on('get channels')
def getChannels():
    emit('channel list', {"channels":channels}, broadcast=True)


@socketio.on('retrieve messages')
def displayMessages(data):
    channelName = data["channel name"]
    messages = channelMessages.get(channelName, None)
    if messages is None:
        channelMessages[channelName] = [""]
    else:
        emit('display messages', {"messages":messages}, broadcast=False)



@app.route("/more")
def more():
    return render_template("more.html")