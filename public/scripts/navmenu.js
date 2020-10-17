let AllPosts = document.getElementById('AllPosts')
let MyPosts = document.getElementById('MyPosts')
let SavedPosts = document.getElementById('SavedPosts')
let posts_div = document.getElementById('posts-div')

AllPosts.addEventListener('click',function(){
    posts_div.remove()
})