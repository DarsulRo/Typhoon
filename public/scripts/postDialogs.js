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


function initiatePostDelete(event){
    var postID = event.attributes.postID.value;
    var content = event.parentElement.parentElement.parentElement.previousElementSibling.firstElementChild.innerText

    overlay.style.display="flex"
    deleteContent.innerText=content
    confirmDelete.setAttribute('href','/deletepost/'+postID)
    deletePOPUP.style.display="block"
}

cancelDelete.addEventListener('click',function(){
    overlay.style.display='none'
    deletePOPUP.style.display="none"
})

//EDIT POST
var editPOPUP = document.getElementById('editPOPUP')
var cancelEdit = document.getElementById('cancelEdit')
var editTextarea = document.getElementById('editContent')
var confirmEdit = document.getElementById('confirmEdit')
var editForm = document.getElementById('editForm')

async function initiatePostEdit(event){

    var postID = event.attributes.postID.value;
    editForm.setAttribute('action', "/editpost/"+postID) 

    var data = await fetch('/getpostcontent/'+postID)
    var content = await data.json()
    
    overlay.style.display='flex'
    editPOPUP.style.display='block'
    document.body.style.overflowY='hidden'
    document.body.style.height='100vh'
    editTextarea.value= content.content
    
    editTextarea.focus()
    editTextarea.setSelectionRange(editTextarea.value.length,editTextarea.value.length);

    
}
confirmEdit.addEventListener('click',function(){
    editForm.submit()
})
cancelEdit.addEventListener('click',function(){
    document.body.style.overflowY='visible'
    overlay.style.display='none'
    editPOPUP.style.display="none"
})
