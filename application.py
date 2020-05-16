import os

from flask import Flask, session, render_template, jsonify, request, redirect, url_for
import time
from flask_session import Session
from flask_socketio import SocketIO, emit
from engineio.payload import Payload
import datetime as dt
import time

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)
Payload.max_decode_packets = 50


channels = ["general", "random"]
channelMessages = {
    "general":[{"from":"bot1", "msg":"This is the very beginning", "time":"10 Apr 14.04 PM"}, {"from":"bot1", "msg":"Who knows, maybe one day I'll go popular", "time":"20 Apr 15.05 AM"}, {"from":"bot2", "msg":"Here comes the second", "time":"20 May 14.04 PM"}, {"from":"bot3", "msg":"Here's the third", "time":"22 May 14.04 PM"}, {"from":"bot4", "msg":"Watch me, I will expand cuz I want it that way, I will expand both vertically and horizontally", "time":"30 May 14.04 PM"}],
    "random": [{"from":"bot5", "msg":"Let start #random", "time":"10 Jun 14.04 AM"}, {"from":"bot6", "msg":"Follow up: second", "time":"20 Jun 14.04 PM"}, {"from":"bot7", "msg":"Why not third", "time":"14 Jul 14.04 AM"}],
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


@socketio.on('populated channel list')
def populateChannels():
    emit('process display channel msg', {"allData":channelMessages}, broadcast=False)

@socketio.on('retrieve messages')
def displayMessages(data):
    channelName = data["channel name"]
    messages = channelMessages.get(channelName, None)
    if messages is None:
        channelMessages[channelName] = list()
        emit('display messages', {"messages": channelMessages[channelName], "channel":channelName}, broadcast=False)
    else:
        messages = messages[-100:]
        emit('display messages', {"messages":messages, "channel":channelName}, broadcast=False)


@socketio.on('send a message')
def sendMessage(data):
    message = data["message"]
    channel = data["channel"]
    username = data["username"]
    msgTime = dt.datetime.now().strftime("%d %b %I:%M %p")
    getMessages = channelMessages[channel]
    getMessages.append({"from":username, "msg":message, "time":msgTime})
    emit(f'receive message {channel}', {"messages":getMessages[-1], "channelName":channel, "username":getMessages[-1]["from"], "time":msgTime}, broadcast=True)

@app.route("/more")
def more():
    return render_template("more.html")