document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.like-div').forEach( item => {
        // If not liked yet, set like to true
        item.addEventListener('click', () => update_like(item, item.dataset.liked === "False"));
    });
})


function update_like(like_div, like) {

    // Reject if user is not logged in
    if (logged_in === "False") {
        alert("Log in to like the post");
        return;
    }

    // Reject if trying to like own post
    if (user === like_div.dataset.postUser) {
        alert("Cannot like own post");
        return;
    }

    const post_id = like_div.parentElement.dataset.id;

    // Send like/unlike status to server
    fetch(`/like/${post_id}`, {
        method: 'PUT',
        headers: {
            'X-CSRFToken': csrf_token,
        },
        body: JSON.stringify({
            like: like,
        })
    })
    .then(response => {
        
        // Error occured 
        if (response.status !== 204) {
            const error = response.json().error;
            alert('Error:', error);
            console.log('Error:', error);
        } else {

            const like_count = like_div.querySelector(".like-count");
            const heart = like_div.querySelector(".fa-heart");

            // Update like/unlike status and like count
            if (like) {

                // Now liked
                like_div.dataset.liked = "True";
                like_count.innerText = parseInt(like_count.innerText) + 1;
                heart.className = "fa-solid fa-heart";

            } else {

                // Now unliked
                like_div.dataset.liked = "False";
                like_count.innerText = parseInt(like_count.innerText) - 1;
                heart.className = "fa-regular fa-heart";             
            }
        }
    })
}
