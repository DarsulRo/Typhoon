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

var overlay = document.getElementById('overlay')
var deletePOPUP = document.getElementById('deletePOPUP')
var deleteContent = document.getElementById('deleteContent')
var confirmDelete = document.getElementById('confirmDelete')
var cancelDelete = document.getElementById('cancelDelete')

function initiatePost(){
    overlay.style.display='flex'
    document.body.style.overflowY='hidden'
}
function finalizePost(){
    document.body.style.overflowY='auto'
    overlay.style.display='none'
}
function initiatePostDelete(event){
    initiatePost()
    var postID = event.attributes.postID.value;
    var content = event.parentElement.parentElement.parentElement.previousElementSibling.firstElementChild.innerText

    deleteContent.innerText=content
    confirmDelete.setAttribute('href','/deletepost/'+postID)
    deletePOPUP.style.display="block"
}

cancelDelete.addEventListener('click',function(){
    deletePOPUP.style.display="none"
    finalizePost()
})

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
cancelEdit.addEventListener('click',function(){
    finalizePost()
    editPOPUP.style.display="none"
})
