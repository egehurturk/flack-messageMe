document.addEventListener('DOMContentLoaded',()=> {      
    

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
            $('#myModal').modal('hide');
            e.preventDefault()
        }
    });

    // event: create a new channel
    // DONE
    $('#channelCreateBtn').click(()=> {
        var channel = $('#channelInput').val()
        socket.emit('channel created', {'channel':channel})
    })

    socket.on('channel exists error', data=>{
        alert(`${data.channel} already exists! Try another one:`);
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
            content.innerHTML = item;
            $('#listChannels').append(content);
        }
    })
    
});


