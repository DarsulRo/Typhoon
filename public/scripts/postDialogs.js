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

var overlay = document.getElementById('overlay')
var cancelButtons = document.querySelectorAll('[cancelPopup]')
cancelButtons.forEach(cancelButton => {
    cancelButton.addEventListener('click',function(){
        finalizeDialog()
    })
})

function initiateDialog(){
    finalizeDialog()
    overlay.style.display='flex'
    document.body.style.overflowY='hidden'
}
function finalizeDialog(){
    document.body.style.overflowY='auto'
    overlay.style.display='none'
    deletePOPUP.style.display='none'
    editPOPUP.style.display='none'
    reportPOPUP.style.display='none'
}



//DELETE POST
var deletePOPUP = document.getElementById('deletePOPUP')
var deleteContent = document.getElementById('deleteContent')
var confirmDelete = document.getElementById('confirmDelete')
    
var deleteTarget

async function requestDelete(){
    let action = confirmDelete.attributes.action.value
    let actionID = confirmDelete.attributes.actionID.value
    let result = await fetch(action,{
        method: 'POST',
        headers:{
            'Content-Type' : 'application/json'
        },
        body: JSON.stringify({
            actionID: actionID
        })
    })
    result = await result.json()
    if(result!=0)deleteTarget.style.display='none'
    if(action=='/deletepostcomment'){
        let thatCommentCount = thatPOST.lastElementChild.firstElementChild.nextElementSibling.firstElementChild.nextElementSibling
        thatCommentCount.innerText=result.commentcount
    }
    finalizeDialog()
}

function initiatePostDelete(event){
    initiateDialog()
    let post = event.parentElement.parentElement.parentElement.parentElement
    deleteTarget=post

    let postID = post.attributes.postID.value;
    var content = event.parentElement.parentElement.parentElement.previousElementSibling.firstElementChild.innerText

    deleteContent.innerText=content
    deletePOPUP.style.display="block"

    confirmDelete.setAttribute('action', '/deletepost')
    confirmDelete.setAttribute('actionID', postID)
    
    confirmDelete.onclick=requestDelete
}



//EDIT POST
var editPOPUP = document.getElementById('editPOPUP')
var editTextarea = document.getElementById('editContent')
var confirmEdit = document.getElementById('confirmEdit')
var editTarget

async function requestEdit(){
    let action = confirmEdit.attributes.action.value
    let actionID = confirmEdit.attributes.actionID.value
    let result = await fetch(action,{
        method: 'POST',
        headers:{
            'Content-Type': 'application/json'
        },
        body:JSON.stringify({
            actionID: actionID,
            newcontent: editTextarea.value
        })
    })
    result= await result.result.json()
    if(result!=0){
        editTarget.firstElementChild.nextElementSibling.firstElementChild.innerText=editTextarea.value
        
    }
    finalizeDialog()
}

async function initiatePostEdit(event){
    initiateDialog()
    
    let post = event.parentElement.parentElement.parentElement.parentElement
    let postID = post.attributes.postID.value
    editTarget = post

    let data = await fetch('/getpostcontent/'+postID)
    var content = await data.json()
    
    editPOPUP.style.display='block'
    editTextarea.value= content.content
    
    editTextarea.focus()
    editTextarea.setSelectionRange(editTextarea.value.length,editTextarea.value.length);

    confirmEdit.setAttribute('action','/editpost')
    confirmEdit.setAttribute('actionID',postID)
    confirmEdit.onclick= requestEdit
}

//REPORT POST
var reportPOPUP = document.getElementById('reportPOPUP')
var reportReason = document.getElementById('reportReason')
var reportText = document.getElementById('reportText')
var confirmReport = document.getElementById('confirmReport')
var reportForm = document.getElementById('reportForm')

async function requestReport(){
    let action = confirmReport.attributes.action.value
    let actionID = confirmReport.attributes.actionID.value

    let result = await fetch(action,{
        method: 'POST',
        headers:{
            'Content-Type': 'application/json'
        },
        body:JSON.stringify({
            actionID: actionID,
            reason: reportReason.value,
            reasonText: reportText.value
        })
    })
    finalizeDialog()
}

function initiatePostReport(event){
    
    reportForm.reset()
    initiateDialog() 
    
    let post = event.parentElement.parentElement.parentElement.parentElement
    let postID = post.attributes.postID.value

    reportPOPUP.style.display='flex'

    confirmReport.setAttribute('action','/reportpost')
    confirmReport.setAttribute('actionID',postID)
    confirmReport.onclick= requestReport

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
    if(all_comments==null)comments_container.innerHTML='No comments to show'

    all_comments.forEach(comment => {
        let renderedcomment = renderComment(comment)
        comments_container.insertAdjacentHTML('afterbegin',renderedcomment)
    })
}

function initiateCommentDelete(event){
    initiateDialog()
    let comment = event.parentElement.parentElement.parentElement.parentElement
    deleteTarget=comment

    let commentID = comment.attributes.commentID.value
    let content = event.parentElement.parentElement.parentElement.previousElementSibling.firstElementChild.innerText

    deleteContent.innerText=content
    deletePOPUP.style.display='block'

    confirmDelete.setAttribute('action','/deletepostcomment')
    confirmDelete.setAttribute('actionID',commentID)
    confirmDelete.onclick=requestDelete
}
function initiateCommentEdit(event){
    initiateDialog()

    let comment = event.parentElement.parentElement.parentElement.parentElement
    editTarget = comment

    let commentID = comment.attributes.commentID.value
    let content = event.parentElement.parentElement.parentElement.previousElementSibling.firstElementChild.innerText
    
    editPOPUP.style.display='block'
    editTextarea.value= content
    
    editTextarea.focus()
    editTextarea.setSelectionRange(editTextarea.value.length,editTextarea.value.length);

    confirmEdit.setAttribute('action','/editpostcomment')
    confirmEdit.setAttribute('actionID',commentID)
    confirmEdit.onclick= requestEdit
}
function initiateCommentReport(event){
    
    reportForm.reset()
    initiateDialog()

    let comment = event.parentElement.parentElement.parentElement.parentElement
    let commentID = comment.attributes.commentID.value

    reportPOPUP.style.display='flex'

    confirmReport.setAttribute('action','/reportpostcomment')
    confirmReport.setAttribute('actionID',commentID)
    confirmReport.onclick= requestReport

}
async function initiateCommentLike(event, like_type){
    let comment = event.parentElement.parentElement.parentElement
    commentID = comment.attributes.commentID.value
    
    let response = await (await fetch('/likepostcomment',{
        method: 'POST',
        headers:{
            'Content-Type' : 'application/json'
        },
        body: JSON.stringify({
            commentID: commentID,
            like_type: like_type
        })
    })).json()
    
    event.parentElement.firstElementChild.innerText= response.likecount

    let like_childs = event.parentElement
    let likeCount = like_childs.firstElementChild
    let likeBtn = likeCount.nextElementSibling.firstElementChild
    let dislikeBtn = like_childs.lastElementChild.firstElementChild

    likeBtn.setAttribute('src','../public/res/like.png')
    dislikeBtn.setAttribute('src','../public/res/dislike.png')

    if(response.like_result==1)likeBtn.setAttribute('src','../public/res/liked.png')
    if(response.like_result==-1)dislikeBtn.setAttribute('src','../public/res/disliked.png')
}


function renderComment(comment){

    let COMMENT = 
    `<div class="flex-column COMMENT" commentID="${comment._id}">
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
            <a onclick="initiateCommentLike(this,1)" class="C-underline">
                ${(comment.liked==1)?`<img src="../public/res/liked.png" >`
                                :`<img src="../public/res/like.png" >`
                }
            </a>
            <a onclick="initiateCommentLike(this,-1)" class="C-underline">
            ${(comment.liked==-1)?`<img src="../public/res/disliked.png">`
                            :`<img src="../public/res/dislike.png">`
            }
            </a>
        </div>
        
        <div class="options">
            <a onclick="showOptions(event)"><img src="../public/res/more.png" alt=""></a>
            <ul class="hided flex-column">

                ${(comment.madeby_loggeduser==true)
                    ?`<a  onclick="initiateCommentEdit(this)" class="C-underline flex-row">
                    <img src="../public/res/edit.svg" alt=""><p>Edit</p>
                    </a>
                    <a onclick="initiateCommentDelete(this)" class="C-underline flex-row">
                        <img src="../public/res/delete.svg" ><p >Delete</p>
                    </a>`
                    : 
                    `
                    <a onclick="initiateCommentReport(this)" class="C-underline flex-row"><img src="../public/res/warning.svg" alt=""><p>Report</p></a>`
                }
            </ul>
        </div>
    </div>
    </div>`
    return COMMENT
}