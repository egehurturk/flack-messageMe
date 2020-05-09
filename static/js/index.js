document.addEventListener('DOMContentLoaded',()=> {                  
   // const template = Handlebars.compile(document.querySelector('#channelList').innerHTML);

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

    
    

    $('#channelCreateBtn').click(()=> {
        channelArry = JSON.parse(localStorage.getItem('channelNames')); 
        if (channelArry === null) {
            channelArry = [];
        }

        if (channelArry.includes($('#channelInput').val())) {
            alert(`${$('#channelInput').val()} exists!`);
            return ;
        }


        channelArry.push($('#channelInput').val());
        localStorage.setItem('channelNames', JSON.stringify(channelArry));
        $('#channelModal').modal('hide');
        $('#channelInput').val("");

        var values, value;
        document.querySelector('#listChannels').innerHTML = "";
        for (values = 0; values < JSON.parse(localStorage.getItem('channelNames')).length; values++) {
            value = channelArry[values];
            var li = document.createElement('li');
            // li.addClass('channelLi');
            li.innerHTML = `${value}`;
            $('#listChannels').append(li);
           
        }
    });


});


/** PROBLEMS
 *  CHANNELS DO NOT APPEAR ON EVERYONE'S SCREEN, ONLY THE USER THAT THEY BELONG TO
 * 
 */

 /** TO DO'S
  * SHOW CHANNEL TO EVERYONE'S SCREEN
  * WHEN CLICKED ON A CHANNEL, USERS SHOULD GO TO THAT CHANNEL
  */