var tab_links = document.querySelectorAll('[tab-link]')
var tabs = document.querySelectorAll('.tab')
var tabs_overlay =document.querySelector('#tabs-overlay')

setTimeout(()=>{
    tabs_overlay.classList.remove('animeoverlay')
},300)

tab_links.forEach(tab_link => {
    tab_link.addEventListener('click',function(){
        const targetTab = document.querySelector(tab_link.getAttribute('tab-link'))
        tabs.forEach(tab => {
            tab.classList.remove('ACTIVE')
        })
        targetTab.classList.add('ACTIVE')

        tab_links.forEach(tab_link2 =>{
            tab_link2.classList.remove('ACTIVE')
        })
        tab_link.classList.add('ACTIVE')

        
        
        tabs_overlay.classList.add('animeoverlay')
        setTimeout(function(){
            tabs_overlay.classList.remove('animeoverlay')
        },400)
        
        
    })
})
