document.addEventListener('DOMContentLoaded',()=> {      
    
    // template initialize
    // const template = Handlebars.compile(document.querySelector('#messageTemplate').innerHTML);
    
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


    // 30 Character limit
    // 
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
    $(document).on('click','.channelBtn', (event)=> {
        var channelName = event.target.dataset.channel
        socket.emit('retrieve messages', {"channel name":channelName});
        $('#nameChannel').text(channelName);
        $('li').css('color', '#6c757d');
        $('button', 'li').css('color', '#6c757d');
        $(event.target).css('color', 'white');
        $(event.target).parent().css('color', 'white');
    })
    
    socket.on('display messages', data=>{
        console.log('hey');
        messageArray = data.messages
        $('#messageDisplay').text("");
        var item;
        for (item of messageArray) {
            var content = document.createElement('p');
            content.innerHTML = item;
            $('#messageDisplay').append(content);
        }
    })
});



// when the channel is clicked,
//     socketio emit('retireve message, that channel name')--->python
//              python saves channel name & gets current messages from dict, socketio emit('display messages, that messages)
//                  js-> save messageArray, loops over array, creates element for message