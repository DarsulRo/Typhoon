let password1 = document.getElementById('password1')
let password2 = document.getElementById('password2')
let username = document.getElementById('username')
let form = document.getElementById('form')
let errormessage = document.getElementById('errorMessage')

form.addEventListener('submit', function(ev){
    var userstring = username.value
    
    if(userstring.includes(' ')){
        errormessage.innerText ="*Username can not include spaces"
        ev.preventDefault()
    }
    if(password1.value != password2.value){
        errormessage.innerText="*Passwords not matching"
        ev.preventDefault()
    }
})

function hideMe(event){
    event.target.parentElement.style.top= "-7rem"
}
