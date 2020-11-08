//NOTIFICATION
var msg_paragraph = document.getElementById('notification-message')
var notificationDialog = document.getElementById('notification')

async function initiateNotification(msg){
    msg_paragraph.innerText=msg;
    notificationDialog.style.left= '2rem'

    setTimeout(function(){
        endNotififaction()
    },3000)
}
function endNotififaction(){
    notificationDialog.style.left= '-30rem'
}


//SHOW&HIDE POST OPTIONS MENU
window.addEventListener('click',hideOptions)
function hideOptions(){
    var els = document.getElementsByClassName("options");
    Array.prototype.forEach.call(els, function(item) {
        item.lastElementChild.classList.add('hided')
    })
}
function showOptions(event){
    var hasClass= event.currentTarget.nextElementSibling.classList.contains('hided');
    hideOptions()
    event.currentTarget.nextElementSibling.classList.toggle('hided')
    if(!hasClass) event.currentTarget.nextElementSibling.classList.toggle('hided')
    event.stopPropagation()
}


var cancelButtons = document.querySelectorAll('[cancelPopup]')
cancelButtons.forEach(cancelButton => {
    cancelButton.addEventListener('click',function(){
        finalizePost()
    })
})

//DELETE POST
var overlay = document.getElementById('overlay')
var deletePOPUP = document.getElementById('deletePOPUP')
var deleteContent = document.getElementById('deleteContent')
var confirmDelete = document.getElementById('confirmDelete')
var cancelDelete = document.getElementById('cancelDelete')



function initiatePost(){
    finalizePost()
    overlay.style.display='flex'
    document.body.style.overflowY='hidden'
}
function finalizePost(){
    document.body.style.overflowY='auto'
    overlay.style.display='none'
    deletePOPUP.style.display='none'
    editPOPUP.style.display='none'
    reportPOPUP.style.display='none'
}
function initiatePostDelete(event){
    initiatePost()
    var postID = event.attributes.postID.value;
    var content = event.parentElement.parentElement.parentElement.previousElementSibling.firstElementChild.innerText

    deleteContent.innerText=content
    confirmDelete.setAttribute('href','/deletepost/'+postID)
    deletePOPUP.style.display="block"
}



//EDIT POST
var editPOPUP = document.getElementById('editPOPUP')
var cancelEdit = document.getElementById('cancelEdit')
var editTextarea = document.getElementById('editContent')
var confirmEdit = document.getElementById('confirmEdit')
var editForm = document.getElementById('editForm')

async function initiatePostEdit(event){
    initiatePost()

    var postID = event.attributes.postID.value;
    editForm.setAttribute('action', "/editpost/"+postID) 
    var data = await fetch('/getpostcontent/'+postID)
    var content = await data.json()
    
    editPOPUP.style.display='block'
    editTextarea.value= content.content
    
    editTextarea.focus()
    editTextarea.setSelectionRange(editTextarea.value.length,editTextarea.value.length);
}
confirmEdit.addEventListener('click',function(){
    finalizePost()
    editForm.submit()
})

//REPORT POST
var reportPOPUP = document.getElementById('reportPOPUP')
var reportForm = document.getElementById('reportForm')

function initiatePostReport(event){
    initiatePost() 

    var postID = event.attributes.postID.value;
    reportForm.setAttribute('action', "/reportpost/"+postID) 

    reportPOPUP.style.display='flex'
}


//save POST

async function initiatePostSave(event){
    let post = event.parentElement.parentElement.parentElement.parentElement
    let postID = post.attributes.postID.value
    
    
    var response = await fetch('/savepost',{
        method: 'Post',
        headers:{
            'Content-Type' : 'application/json'
        },
        body: JSON.stringify({
            postID
        })
    })
    response= await response.json()

    if(response=='saved'){
        event.firstElementChild.setAttribute('src',"../public/res/saved.png")
        event.lastElementChild.innerText='Saved'
        initiateNotification('Post saved')
    }   

    else if(response=='unsaved'){
        event.firstElementChild.setAttribute('src',"../public/res/save.png")
        event.lastElementChild.innerText='Save'
        initiateNotification('Post unsaved')
    }
    else{
        initiateNotification('There was an error while saving this post')
    }
}

async function initiatePostLike(event, like_type){
    let postID = event.parentElement.attributes.postID.value
    
    let response = await(await fetch('/likepost',{
      method:'POST',
      headers:{
          'Content-Type': 'application/json'
      },
      body:JSON.stringify({
        liketype:like_type,
        postID: postID
      })
    })).json()
    event.parentElement.firstElementChild.innerText=response.likes
    let like_childs = event.parentElement
    let likeCount = like_childs.firstElementChild
    let likeBtn = likeCount.nextElementSibling.firstElementChild
    let dislikeBtn = like_childs.lastElementChild.firstElementChild

    likeBtn.setAttribute('src','../public/res/like.png')
    dislikeBtn.setAttribute('src','../public/res/dislike.png')

    if(response.like_result==1)likeBtn.setAttribute('src','../public/res/liked.png')
    if(response.like_result==-1)dislikeBtn.setAttribute('src','../public/res/disliked.png')
}