document.addEventListener('DOMContentLoaded',()=> { 

   
    currentChannelListener = '';
    
    // When pressed on "Enter" key, stop from from being submitted!
    $(document).on("keydown", "form", function (event) {
        return event.key != "Enter";
    })
    
    // initialize socketio connection
    var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

     // remembering the channel
     if (localStorage.getItem('currentChannel')) {
        document.querySelector("#messageDisplay").scrollIntoView(false);
        var currentChannel = localStorage.getItem('currentChannel');
        // listenForMessages(currentChannel);
        var currentBtn = $(`button[data-channel="${currentChannel}"]`);
        $('#nameChannel').text(currentChannel);
        $('li').css('color', '#6c757d');
        $('button', 'li').css('color', '#6c757d');
        currentBtn.css('color', 'white');
        currentBtn.parent().css('color', 'white');
        socket.emit('retrieve messages', {"channel name":currentChannel});
        $(`button[data-channel="${currentChannel}"]`).trigger('click');
    }

    // check if session does exist
    // DONE
    if (localStorage.getItem('username')) {                                      
        $('#nameField').text(localStorage.getItem('username'));                     
        $('#myModal').modal('hide');               
    } else {                              
        $('#myModal').modal();                 
    }
    
    // quick feedback
    // DONE
    $('#usernameInput').blur(function (e) {                     

        var username = $('#usernameInput').val();
        if (username !=="" && username.length >= 4) {       
            $('#usernameInput').css({"box-shadow": "0 0 15px #181", "border": "1px solid #060"});     
            $('#errorName').text("");                                   
            e.preventDefault();         
        } else {
            $('#errorName').text("Your username should be longer than 4 characters");                 
            $('#usernameInput').css({"box-shadow": "0 0 15px #811", "border": "1px solid #600"});       
            e.preventDefault()           
        }
    });


    // event: create username
    // DONE
    $('#approval').click(function (e) { 

        if (!localStorage.getItem('username')) {
            localStorage.setItem('username', $('#usernameInput').val())
        }

        if (localStorage.getItem('username')==="" || localStorage.getItem('username').length < 4) {
            e.preventDefault()
            return ;
        } else {

            $('#nameField').text(localStorage.getItem('username'));
            $('#myModal').modal('hide');
            e.preventDefault()
        }
    });


    // event: create a new channel
    // DONE
    $('#channelCreateBtn').click(()=> {
        var channel = $('#channelInput').val()
        if (channel.trim().length === 0) {
            alert("Channel name shouldn't be empty");
            return ;
        } else {
            socket.emit('channel created', {'channel':channel})
        }
        
    })

    // Allow to create a channel by pressing "Enter" Key!
    // BUG HERE----> WHEN SUBMIT FORM WITH ENTER, WHEN NAMES CONFLICT, MODAL WILL HIDE BUT ALERT WILL BE DISPLAYED.
    var channelNameInput = document.getElementById('channelInput');
    channelNameInput.addEventListener("keyup", function(event) {
        // Number 13 is the "Enter" key on the keyboard
        if (event.which === 13) {
            // get the value of input field
            var channelName = $('#channelInput').val();
            // Trigger the button element with a click
            socket.emit('channel created', {'channel':channelName});
            $('#channelModal').modal('hide');
            event.preventDefault();
        }
    })

    
    // Channel Name Conflict
    // DONE
    socket.on('channel exists error', data=>{
        alert(`${data.channel} already exists! Try another one:`);
    });

    


    // 30 Character limit
    // DONE
    socket.on('channel length error', data=> {
        alert(`${data.channel} is longer than 15 characters! Try to shorten it.`);
    });

    // channel created successfully, modal will close
    // DONE
    socket.on('channel created', data=>{
        $('#channelModal').modal('hide');
        $('#channelInput').val("");
    });

    // connect to web socket server and get the channel list
    // DONE
    socket.on('connect', () => {
        socket.emit('get channels')
    })

    // populate the channel list 
    // DONE
    socket.on('channel list', data=> {
        channelArray = data.channels;
        $('#listChannels').text("");
        var item;
        for (item of channelArray) {
            var content = document.createElement('li');
            content.innerHTML = `<button class="channelBtn" data-channel='${item}'>${item}</button>`;
            $('#listChannels').append(content);  
        }
        socket.emit("populated channel list")
    })

    // displaying the channel name on message part
    // DONE
    socket.on('process display channel msg', data=>{
        $(document).on('click','.channelBtn', (event)=> {
            $('#messageInput').val('');
            document.querySelector("#messageDisplay").scrollIntoView(false);
            var channelName = event.target.dataset.channel;
            var nameUser = data["allData"][channelName];
            localStorage.setItem('currentChannel', channelName);
            if (nameUser===null) {
                socket.emit('retrieve messages', {"channel name":channelName});
            } 
            $('#nameChannel').text(channelName);
            $('li').css('color', '#6c757d');
            $('button', 'li').css('color', '#6c757d');
            $(event.target).css('color', 'white');
            $(event.target).parent().css('color', 'white');
            socket.emit('retrieve messages', {"channel name":channelName, "username":nameUser});
            
        });
    });
   

    
    // displaying messages of a particular channel
    // DONE
    socket.on('display messages', data=>{
        messageArray = data.messages;
        channel = data.channel;
        listenForMessages(channel);
        $('#messageDisplay').text("");
        var item;
        for (item of messageArray) {
            if (item==="") {
                return ;
            } else {
                var userNaming = item["from"];
                var message = item["msg"];
                var time = item["time"];
                var content = document.createElement('div');
                if (userNaming===localStorage.getItem('username')) {
                    $(content).addClass('myMsgBox');
                    content.innerHTML = `
                    <p><strong style="margin-top:10px;margin-left:5.5%;color:black;">${userNaming}</strong><span style="color:#fff;margin-left:3%;">${time}</span></p>
                    <p class="myMsgText" style="margin-left:4%;" data-msg=${message}>${message}</p>
                    `
                    $('#messageDisplay').append(content);
                } else {
                    $(content).addClass('msgBox')
                    content.innerHTML = `
                    <p><strong style="margin-top:10px;margin-left:10px;color:black;">${userNaming}</strong><span style="color:#777777;margin-left:5%;">${time}</span></p>
                    <p class="msgText" data-msg=${message}>${message}</p>
                    `
                    $('#messageDisplay').append(content);
                }
                
            }

        }
    })

    // sending messages
    // DONE
    $('#sendBtn').on('click', ()=>{
        var message = $('#messageInput').val();
        var channel = $('#nameChannel').text();        //   FIX HERE
        if (message.trim().length === 0) {
            return ;
        } else {
            socket.emit('send a message', {"message":message, "channel":channel, "username":localStorage.getItem('username')});
            $('#messageInput').val("");
        }
    });
    listenForMessages('');
    // display that new message
    function listenForMessages(channelName) {
        channelName = (channelName === '' ? 'general' : channelName);
        if (currentChannelListener !== '' ) {
            socket.off('receive message '+currentChannelListener);
        }
        currentChannelListener = channelName;
        socket.on('receive message '+channelName , data=>{
            var newMessage = data.messages["msg"];
            var username = data.username;
            var msgTime = data.time
            var content = document.createElement('div');
            if (username===localStorage.getItem('username')) {
                $(content).addClass('myMsgBox');
                content.innerHTML = `
                <p><strong style="margin-top:10px;margin-left:5.5%;color:black;">${username}</strong><span style="color:#fff;margin-left:3%;">${msgTime}</span></p>
                <p class="myMsgText" style="margin-left:4%;" data-msg=${newMessage}>${newMessage}</p>
                `
                // BUG HERE: WHEN SOMEBODY SENDS A MESSAGE, THAT MESSAGE WILL APPEAR ON EVERY CHANNEL FIRST.
                $('#messageDisplay').append(content);
            } else {
                $(content).addClass('msgBox');
                content.innerHTML = `
                <p><strong style="margin-top:10px;margin-left:20px;color:black;">${username}</strong><span style="color:#777777;margin-left:5%;">${msgTime}</span></p>
                <p class="msgText" style="margin-left:20px;" data-msg=${newMessage}>${newMessage}</p>
                `
                // BUG HERE: WHEN SOMEBODY SENDS A MESSAGE, THAT MESSAGE WILL APPEAR ON EVERY CHANNEL FIRST. 
                $('#messageDisplay').append(content);
            }; 
        });
    };
   

    // send a message with enter key
    // DONE
    var msgInput = document.querySelector('#messageInput');
    msgInput.addEventListener("keyup", function(event) {
        // Number 13 is the "Enter" key on the keyboard
        if (event.which === 13) {
            // get the value of input field
            var msg = $('#messageInput').val();
            var channel = $('#nameChannel').text();
            if (msg.trim().length === 0) {
                return ;
            } else {
                // Trigger the button element with a click
                socket.emit('send a message', {"message":msg, "channel":channel, "username":localStorage.getItem('username')});
                $('#messageInput').val("");
                event.preventDefault();
            };
        };
    });

});



// get the all messages, uptade last 100 of them to local storage, use localstorage in displaying messages