//VALIDATE CREATION OF POSTS
let create_button = document.getElementById('create-button')
let create_post = document.getElementById('create-post')
let create_form = document.getElementById('create-form')
let textarea = document.getElementById('create-post-textarea')
let error_message = document.getElementsByClassName('error-message')[0]
create_button.addEventListener('click',function(ev){
    create_post.classList.toggle('show')
})
create_form.addEventListener('submit',function(ev){
    if(textarea.value != ''){
    }
    else{
        error_message.innerHTML="The post can not be empty."
        ev.preventDefault()
    }
    
})


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


//DELETE POST POPUP
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

cancelEdit.addEventListener('click',function(){
    overlay.style.display='none'
    editPOPUP.style.display="none"
})
