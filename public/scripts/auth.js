let password1 = document.getElementById('password1')
let password2 = document.getElementById('password2')
let form = document.getElementById('form')
let errormessage = document.getElementById('errorMessage')

form.addEventListener('submit', function(ev){
    if(password1.value != password2.value){
        errormessage.innerText="*Passwords not matching"
        ev.preventDefault()
    }
})

function hideMe(event){
    event.target.parentElement.style.top= "-7rem"
}
