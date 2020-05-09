document.addEventListener('DOMContentLoaded',()=> {                  
   // const template = Handlebars.compile(document.querySelector('#channelList').innerHTML);

   var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

   

   // loading existing channels when page is loaded
   channelArry = JSON.parse(localStorage.getItem('channelNames')); 
   if (channelArry === null) {
       channelArry = [];
   }
    
    for (values = 0; values < channelArry.length; values++) {
        value = channelArry[values];
        var li = document.createElement('li');
        // li.addClass('channelLi');
        li.innerHTML = `${value}`;
        $('#listChannels').append(li);
    
    }
    // check if session does exists
    if (localStorage.getItem('username')) {                                      
        $('#nameField').text(localStorage.getItem('username'));                     
        $('#myModal').modal('hide');               
    } else {                              
        $('#myModal').modal();                 
    }
    
    // quick feedback
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

    // when the button is clicked...
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

    

    socket.on('connect', () => {
        $('#channelCreateBtn').click(()=> {
            channelArry = JSON.parse(localStorage.getItem('channelNames')); 
            if (channelArry === null) {
                channelArry = [];
            }
            var channel = $('#channelInput').val()

            if (channelArry.includes(channel)) {
                alert(`${channel} exists!`);
                return ;
            }


            channelArry.push(channel);
            //localStorage.setItem('channelNames', JSON.stringify(channelArry));
            $('#channelModal').modal('hide');
            $('#channelInput').val("");
            socket.emit('channel created', {'channel':channel})
        })
    })
        
    socket.on('show channel', data => {
        var li = document.createElement('li');
        li.innerHTML = `${data.channelName}`;
        channelArry = JSON.parse(localStorage.getItem('channelNames')); 
 
        channelArry.push(data.channelName)
        localStorage.setItem('channelNames', JSON.stringify(channelArry));
        $('#listChannels').append(li);
    

            // // add channels to unordered list
            // var values, value;
            // document.querySelector('#listChannels').innerHTML = "";
            // for (values = 0; values < JSON.parse(localStorage.getItem('channelNames')).length; values++) {
            //     value = channelArry[values];
            //     var li = document.createElement('li');
            //     // li.addClass('channelLi');
            //     li.innerHTML = `${value}`;
            //     $('#listChannels').append(li);
            //     console.log(li.innerHTML);
            //     socket.emit('channel created', {'channel':li.innerHTML})
                
            // }
        });
    


});


/** PROBLEMS
 *  CHANNELS DO NOT APPEAR ON EVERYONE'S SCREEN, ONLY THE USER THAT THEY BELONG TO
 *  CHANNELS ARE NOT ASYNCRHONOUS, IF YOU ADD A CHANNEL, THEN OTHER USER SHOULD UPDATE HIS SCREEN.
 */

 /** TO DO'S
  * SHOW CHANNEL TO EVERYONE'S SCREEN
  * WHEN CLICKED ON A CHANNEL, USERS SHOULD GO TO THAT CHANNEL
  * CHANNEL CREATION---> SOCKET IO, PYTHON
  */

