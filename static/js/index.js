document.addEventListener('DOMContentLoaded',()=> {    
    
    // When pressed on "Enter" key, stop from from being submitted!
    $(document).on("keydown", "form", function (event) {
        return event.key != "Enter";
    })
    
    // initialize socketio connection
    var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

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
            var name = localStorage.getItem('username');
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
    // DONE
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
    })

    // displaying the channel name on message part
    // DONE
    $(document).on('click','.channelBtn', (event)=> {
        var channelName = event.target.dataset.channel
        $('#nameChannel').text(channelName);
        $('li').css('color', '#6c757d');
        $('button', 'li').css('color', '#6c757d');
        $(event.target).css('color', 'white');
        $(event.target).parent().css('color', 'white');
        socket.emit('retrieve messages', {"channel name":channelName});
    })

   
    
    // displaying messages of a particular channel
    // DONE
    socket.on('display messages', data=>{
        messageArray = data.messages
        $('#messageDisplay').text("");
        var item;
        for (item of messageArray) {
            if (item==="") {
                return ;
            } else {
                var content = document.createElement('div');
                $(content).addClass('msgBox')
                content.innerHTML = `<p class="msgText" data-msg=${item["msg"]}>${item["msg"]}</p>`
                $('#messageDisplay').append(content);
            }

        }
    })

    // sending messages
    $('#sendBtn').on('click', ()=>{
        var message = $('#messageInput').val();
        var channel = $('#nameChannel').text();
        if (message.trim().length === 0) {
            return ;
        } else {
            socket.emit('send a message', {"message":message, "channel":channel, "username":localStorage.getItem('username')});
            $('#messageInput').val("");
        }
    });

    // display that new message
    socket.on('recieve message', data=>{
        var newMessage = data.messages["msg"];
        var username = data.username;
        var content = document.createElement('div');
        $(content).addClass('msgBox');
        content.innerHTML = `<p class="msgText" data-msg=${newMessage}>${newMessage}, ${username}</p>`
        $('#messageDisplay').append(content);
        
        
    })

    // send a message with enter key
    // DONE
    var msgInput = document.querySelector('#messageInput');
    msgInput.addEventListener("keyup", function(event) {
        // Number 13 is the "Enter" key on the keyboard
        if (event.which === 13) {
            // get the value of input field
            var msg = $('#messageInput').val();
            var channel = $('#nameChannel').text();
            // Trigger the button element with a click
            socket.emit('send a message', {"message":msg, "channel":channel, "username":localStorage.getItem('username')});
            $('#messageInput').val("");
            event.preventDefault();
        }
    })

});


