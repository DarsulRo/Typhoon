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

