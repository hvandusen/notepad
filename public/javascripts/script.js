var socket = io();

socket.on("connection",function(message){
  console.log("connection")
  $("#text").html(message.data)
});
socket.on("newText",function(message){
  console.log(message.data)
  $("#text").html(message.data)
});



$("#textbox").on("input",function(){
  // console.log($(this).val())
})

$(document).ready(function(){
  $('#text').trumbowyg({
    // autogrow: true
});
$('#text').trumbowyg() // Build Trumbowyg on the #editor element
.on('tbwchange', function(e){
  console.log($(e.target).html());
  socket.emit('textUpdate',{
    data:$(e.target).html()
  });
});
})
if(false)
$(document).keypress(function(e){
  if($(e.target).hasClass("trumbowyg-editor")){
    console.log($("#text").html())
    socket.emit('textUpdate',{
      data:$(e.target).html()
    });
  }
})
