let loading = document.getElementById('loading')
let container = document.getElementById('posts-div')


function clearPosts(){
    container.innerHTML='';
    let create_post = document.getElementById('create-post')
    if(create_post)create_post.classList.remove('show')
}
function startLoadAnimation(){
    loading.style.display='flex'
}
function stopLoadAnimation(){
    loading.style.display='none'
}


async function uploadPosts(type){
    startLoadAnimation()
    try {
        var posts = await (await fetch('/get' + type)).json()
        var logged_user = await (await fetch('/getloggeduser')).json()
        

        clearPosts()
        posts.forEach(post => {

            container.insertAdjacentHTML('afterbegin',renderPost(post,logged_user)
        )})
        stopLoadAnimation()
    }
    catch (error) {
        console.log(error)
        stopLoadAnimation()
    }
}


function renderPost(post,logged_user){
    let POST = `<div class="flex-column POST" postID="${post.postID}">
    <div class="post-header flex-row">
        <div class="user flex-row">
            <a href="/user/${post.username}" class="avatar"><img class="" src="../public/res/favicon.png" alt=""></a>
            <a href="/user/${post.username}" class="display-name">${post.displayname}</a>
            <a href="/user/${post.username}" class="username">@${post.username}</a>
        </div>
        <div class="time">
            <p>${(new Date(post.date)).toLocaleString('en-GB',{dateStyle:'short',timeStyle:'medium'})}</p>
        </div>
    </div>
    <div class="content flex-column">
        <p>${post.content}</p>
    </div>
    <div class="interact flex-row">

        <div postID="${post.postID}" class="like flex-row">
            <p class="likes-count">${post.likes}</p>
            <a onclick="initiatePostLike(this,1)" class="C-underline">
                ${(post.liked==1)?`<img src="../public/res/liked.png" >`
                                :`<img src="../public/res/like.png" >`
                }
            </a>
            <a onclick="initiatePostLike(this,-1)" class="C-underline">
            ${(post.liked==-1)?`<img src="../public/res/disliked.png">`
                            :`<img src="../public/res/dislike.png">`
            }
                
            </a>
        </div>
        <div class="options">
            <a onclick="showOptions(event)"><img src="../public/res/more.png" alt=""></a>
            <ul class="hided flex-column">

                ${(post.username == logged_user.username)
                    ?`<a postID="${post.postID}" onclick="initiatePostEdit(this)" class="C-underline flex-row">
                    <img src="../public/res/edit.svg" alt=""><p>Edit</p>
                    </a>
                    <a postID="${post.postID}" onclick="initiatePostDelete(this)" class="C-underline flex-row">
                        <img src="../public/res/delete.svg" ><p >Delete</p>
                    </a>`
                    : 
                    `<a postID="${post.postID}" onclick="initiatePostSave(this)" class="C-underline flex-row">
                        ${(post.saved==false)?`<img src="../public/res/save.svg" alt=""><p>Save</p>`
                                            :`<img src="../public/res/saved.png" alt=""><p>Unsave</p>`
                        }
                    </a>
                    <a postID="${post.postID}" onclick="initiatePostReport(this)" class="C-underline flex-row"><img src="../public/res/warning.svg" alt=""><p>Report</p></a>`
                }
            </ul>
        </div>
    </div>
    </div>`
    return POST
}