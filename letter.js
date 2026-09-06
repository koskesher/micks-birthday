document.querySelector(".memory-wall").addEventListener("click", function(event) {

    const heart = document.createElement("div");

    heart.classList.add("click-heart");
    heart.textContent = "♥";

    heart.style.left = event.clientX + "px";
    heart.style.top = event.clientY + "px";

    document.body.appendChild(heart);

    setTimeout(function() {
        heart.remove();
    }, 900);

});