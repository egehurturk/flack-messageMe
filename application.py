import os

from flask import Flask, session, render_template, jsonify, request, redirect, url_for
import time
from flask_session import Session
from flask_socketio import SocketIO, emit

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)


@app.route("/", methods=["POST", "GET"])
def index():
    return render_template("index.html")

@app.route("/more")
def more():
    return render_template("more.html")