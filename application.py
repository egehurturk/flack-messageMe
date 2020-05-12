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
    "general":[{"from":"bot1", "msg":"This is the very beginning"}, {"from":"bot1", "msg":"Who knows, maybe one day I'll go popular"}, {"from":"bot2", "msg":"Here comes the second"}, {"from":"bot3", "msg":"Here's the third"}, {"from":"bot4", "msg":"Watch me, I will expand cuz I want it that way, I will expand both vertically and horizontally"}],
    "random": [{"from":"bot5", "msg":"Let start #random"}, {"from":"bot6", "msg":"Follow up: second"}, {"from":"bot7", "msg":"Why not third"}],
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
        channelMessages[channelName] = list()
        emit('display messages', {"messages": channelMessages[channelName]}, broadcast=False)
    else:
        emit('display messages', {"messages":messages}, broadcast=False)


@socketio.on('send a message')
def sendMessage(data):
    message = data["message"]
    channel = data["channel"]
    username = data["username"]
    getMessages = channelMessages[channel]
    getMessages.append({"from":username, "msg":message})
    emit('recieve message', {"messages":getMessages[-1], "channelName":channel, "username":getMessages[-1]["from"]}, broadcast=True)

@app.route("/more")
def more():
    return render_template("more.html")