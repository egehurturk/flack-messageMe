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
    "general":[{"from":"BOT", "msg":"This is the very beginning", "time":""}, {"from":"BOT", "msg":"Who knows, maybe one day I'll go popular", "time":""}, {"from":"BOT", "msg":"Here comes the second", "time":""}, {"from":"BOT", "msg":"And the third", "time":""}, {"from":"BOT", "msg":"Watch me, I will expand cuz I want it that way, I will expand both vertically and horizontally", "time":""}],
    "random": [{"from":"BOT", "msg":"Let start #random", "time":""}, {"from":"BOT", "msg":"Follow up: second", "time":""}, {"from":"BOT", "msg":"Why not third", "time":""}],
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

if __name__ == "__main__":
    app.run()