var socket = io();

$(document).ready(function(){
  // Sent when we first connect (and on reconnect): the whole note so far.
  socket.on("init", function(message){
    $("#text").html(message.data);
  });
  // Someone else typed, or the day rolled over.
  socket.on("newText", function(message){
    $("#text").html(message.data);
  });

  $('#text').trumbowyg({
    autogrow: true
  })
  .on('tbwchange', function(e){
    setTimeout(function(){
      socket.emit('textUpdate', {
        data: e.currentTarget.innerHTML
      });
    }, 200);
  });
});
