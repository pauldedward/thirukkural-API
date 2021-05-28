
const burger = document.querySelector(".burger");
const navlinks = document.querySelector(".nav-links");
const navbar = document.querySelector(".navbar");
const submit = document.querySelector(".submit-button");
const line1 = document.querySelector(".first-line");
const line2 = document.querySelector(".second-line");
const url = document.querySelector("#url-text");
const burgerLines = document.querySelectorAll(".bg-line");
const scrollA = document.querySelectorAll(".scroll");


scrollA.forEach( (aTag) => {
    
    aTag.addEventListener("click", () => {
        
        if($(document).width() <= 700 ) {
            navlinks.classList.toggle("active");
            navlinks.classList.toggle("shadow");
            navbar.classList.toggle("shadow");
        
            burgerLines.forEach( (line) => {
                line.classList.toggle("cross");
            })
        } 
    })
})

burger.addEventListener("click", () => {
    navlinks.classList.toggle("active");
    navlinks.classList.toggle("shadow");
    navbar.classList.toggle("shadow");
    
    burgerLines.forEach( (line) => {
        line.classList.toggle("cross");
    })
})

submit.addEventListener("click", async ()=> {
    reqKural();
})

url.addEventListener("keydown", (e)=> {

    const key = e.keyCode;
    if(key == 13 ) {
        reqKural();
    }
  
})
async function reqKural() {
    url.focus();
    
    if(!url.value) {
        line1.innerText = "Please Do enter"
        line2.innerText = "a value"
    } else {
        let kural = await axios.get(url.value)
        kural = kural.data
        
        if(Array.isArray(kural)) {
            line1.innerText = "Response is Array of objects"
            line2.innerText = "Try it in new tab"
        } else if (typeof kural == "object") {
            line1.innerText = kural.Line1
            line2.innerText = kural.Line2
        } else {
            line1.innerText = kural
            line2.innerText = "An error occured"
        }
    }
}


$(document).ready(function() {

    let scrollLink = $(".scroll");

    scrollLink.click(function(e) {
      
        e.preventDefault();
        $("body,html").animate({
            scrollTop : $(this.hash).offset().top - 46
        }, 500)


    });

    $(window).scroll(function() {

        let scrollBarLocation = $(this).scrollTop();

        scrollLink.each(function() {

            let sectionOffset = $(this.hash).offset().top - 350
            
            if( sectionOffset <= scrollBarLocation) {
                $(this).parent().addClass("active-link")
                $(this).parent().siblings().removeClass("active-link")
            }
            

        })
    })

})