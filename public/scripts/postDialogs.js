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

// POST LIKE & DISLIKE

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

//SHOW COMMENTS 
var thatPOST
async function showComments(event){
    let fullpost = document.getElementById('comment-overlay')
    let post_container = document.getElementById('post-container')
    let close_overlay = document.getElementById('close-overlay')

    close_overlay.addEventListener('click',function(){
        fullpost.style.display='none'
        document.body.style.overflowY='auto'
    })


    let post = event.parentElement.parentElement;
    thatPOST = post
    let postID = post.attributes.postID.value
    loadComments(postID)


    let postString = await (await fetch('/getpost/'+postID)).json()
    let logged_user = await fetch('/getloggeduser')
    let renderedPost = renderPost(postString)

    post_container.innerHTML= renderedPost;
    let comment_onpost_btn = document.querySelector('#post-container .show-comments')
    comment_onpost_btn.style.display='none'
    

    fullpost.style.display='flex'
    document.body.style.overflowY='hidden'

    
    fullpost.scrollTo(0,0)
}
//ADD COMMENT
async function addComment(event){
    let post_container = document.getElementById('post-container')
    let postID = post_container.firstElementChild.attributes.postID.value
    let input = document.getElementById('new-comment')
   
    let thatCommentCount = thatPOST.lastElementChild.firstElementChild.nextElementSibling.firstElementChild.nextElementSibling

    if(input.value!=''){
        let commentcount = await (await fetch('/addcomment',{
            method: 'POST',
            headers:{
                'Content-Type' : 'application/json'
            },
            body: JSON.stringify({
                postID:postID,
                comment: input.value
            })
        })).json()

        input.value=''
        thatCommentCount.innerText=commentcount
        loadComments(postID)
    }

}
async function loadComments(postID){
    let comments_container = document.getElementById('comments')
    comments_container.innerHTML=''

    let all_comments = await (await fetch('/getpostcomments/' + postID)).json()

    all_comments.forEach(comment => {
        let renderedcomment = renderComment(comment)
        comments_container.insertAdjacentHTML('afterbegin',renderedcomment)
    })
}

function deleteComment(event){

}
function editComment(event){

}
function reportComment(event){

}
function likeComment(){

}


function renderComment(comment){
    let COMMENT = 
    `<div class="flex-column COMMENT" postID="${comment.commentID}">
    <div class="post-header flex-row">
        <div class="user flex-row">
            <a href="/user/${comment.username}" class="avatar"><img class="" src="../public/res/favicon.png" alt=""></a>
            <a href="/user/${comment.username}" class="display-name">${comment.displayname}</a>
            <a href="/user/${comment.username}" class="username">@${comment.username}</a>
        </div>
        <div class="time">
            <p>${(new Date(comment.date)).toLocaleString('en-GB',{dateStyle:'short',timeStyle:'medium'})}</p>
        </div>
    </div>
    <div class="content flex-column">
        <p>${comment.content}</p>
    </div>
    <div class="interact flex-row">

        <div postID="${comment.commentID}" class="like flex-row">
            <p class="likes-count">${comment.likes}</p>
            <a onclick="initiatePostLike(this,1)" class="C-underline">
                ${(comment.liked==1)?`<img src="../public/res/liked.png" >`
                                :`<img src="../public/res/like.png" >`
                }
            </a>
            <a onclick="initiatePostLike(this,-1)" class="C-underline">
            ${(comment.liked==-1)?`<img src="../public/res/disliked.png">`
                            :`<img src="../public/res/dislike.png">`
            }
            </a>
        </div>
        
        <div class="options">
            <a onclick="showOptions(event)"><img src="../public/res/more.png" alt=""></a>
            <ul class="hided flex-column">

                ${(comment.madeby_loggeduser==true)
                    ?`<a postID="${comment.commentID}" onclick="initiateCommentEdit(this)" class="C-underline flex-row">
                    <img src="../public/res/edit.svg" alt=""><p>Edit</p>
                    </a>
                    <a postID="${comment.commentID}" onclick="initiateCommentDelete(this)" class="C-underline flex-row">
                        <img src="../public/res/delete.svg" ><p >Delete</p>
                    </a>`
                    : 
                    `
                    <a postID="${comment.commentID}" onclick="initiateCommentReport(this)" class="C-underline flex-row"><img src="../public/res/warning.svg" alt=""><p>Report</p></a>`
                }
            </ul>
        </div>
    </div>
    </div>`
    return COMMENT
}