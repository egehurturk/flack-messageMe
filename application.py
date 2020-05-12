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
    "general":["This is the very beginning, Who knows, maybe one day I'll go popular", "Here comes the second", "Here's the third", "Watch me, I will expand cuz I want it that way, I will expand both vertically and horizontally"],
    "random": ["Let start #random", "Follow up: second", "Why not third"]
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
        emit('display messages', {"messages": channelMessages[channelName]}, broadcast=False)
    else:
        emit('display messages', {"messages":messages}, broadcast=False)



@app.route("/more")
def more():
    return render_template("more.html")