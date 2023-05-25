document.addEventListener('DOMContentLoaded', () => {
    const follow_div = document.querySelector('.follow-div')
    if (follow_div != null) {
        load_follow_btn();
    }
})

function load_follow_btn() {
    const follow_div = document.querySelector('.follow-div')
    // Load follow button if not yet following
    if (follow_div.dataset.isFollowing === "False") {
        follow_div.innerHTML = `
            <button class="follow-btn btn btn-outline-primary fw-bold px-3" onclick="follow()">Follow</button>
        `;
    } else {
        follow_div.innerHTML = `
            <button class="follow-btn btn btn-primary fw-bold px-3" onclick="follow()">Unfollow</button>
        `;        
    }
}

function follow() {
    const follow_div = document.querySelector('.follow-div');

    // https://stackoverflow.com/questions/23349883/how-to-pass-csrf-token-to-javascript-file-in-django
    // Set following to True if currently not following
    fetch(`/profile/${follow_div.dataset.profileUser}`, {
        method: 'PUT',
        headers: {
            'X-CSRFToken': follow_div.dataset.csrf,
        },
        body: JSON.stringify({
            set_to_following: follow_div.dataset.isFollowing === "False"
        })
      })
    .then(response => {
        
        // Error occured 
        if (response.status !== 204) {
            const error = response.json().error;
            alert('Error:', error);
            console.log('Error:', error);
        } else {

            // Update follow status and follower count
            if (follow_div.dataset.isFollowing === "False") {
                follow_div.dataset.isFollowing = "True";
                const follower_count = document.querySelector(".follower-count");
                follower_count.innerHTML = parseInt(follower_count.innerHTML) + 1;
            } else {
                follow_div.dataset.isFollowing = "False";
                const follower_count = document.querySelector(".follower-count");
                follower_count.innerHTML = parseInt(follower_count.innerHTML) - 1;                
            }

            load_follow_btn();
        }
    })
}
