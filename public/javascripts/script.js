var socket = io();

$("#textbox").on("input",function(){
  // console.log($(this).val())
})

$(document).ready(function(){
  socket.on("connection",function(message){
    $("#text").html(message.data)
  });
  socket.on("newText",function(message){
    console.log("newText ",message.data)
    $("#text").html(message.data)
  });

  $('#text').trumbowyg({
    autogrow: true
}) // Build Trumbowyg on the #editor element
.on('tbwchange', function(e){
  console.log($(this).html())
  setTimeout(function(){
    socket.emit('textUpdate',{
      data:e.currentTarget.innerHTML
    });
  },200)


});
})
