document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.edit-div').forEach( item => {
        item.addEventListener('click', edit);
    });
})

function edit(event) {
    const content_div = event.target.parentElement.nextElementSibling;
    const content = content_div.innerText;
    
    // Replace content div with textarea
    content_div.innerHTML = `
        <textarea class="form-control my-2" name="content">${content}</textarea>
        <div class="d-flex justify-content-end gap-2">
            <button class="btn btn-sm btn-danger" onclick="cancel(event)">Cancel</button>
            <button class="btn btn-sm btn-primary" onclick="save(event)">Save</button>        
        </div>
    `;
}


function save(event) {
    const content_div = event.target.parentElement.parentElement;
    const post_id = content_div.parentElement.dataset.id;
    const post_content = event.target.parentElement.previousElementSibling.value;

    console.log(post_content);

    // Send edited post content to server
    fetch(`/post/${post_id}`, {
        method: 'PUT',
        headers: {
            'X-CSRFToken': csrf_token,
        },
        body: JSON.stringify({
            content: post_content,
        })
    })
    .then(response => {
        
        // Error occured 
        if (response.status !== 204) {
            const error = response.json().error;
            alert('Error:', error);
            console.log('Error:', error);
        } else {

            // Replace content div with edited post and add (edited) status
            content_div.innerHTML = post_content;
            const timestamp = content_div.parentElement.querySelector(".timestamp");
            if (! timestamp.innerText.includes("(edited)")) {
                timestamp.innerText += " (edited)";
            }
        }
    })
}


function cancel(event) {
    const content_div = event.target.parentElement.parentElement;
    const post_id = content_div.parentElement.dataset.id;
    
    // Fetch original post content
    fetch(`/post/${post_id}`, {
        method: 'GET',
        headers: {
            'X-CSRFToken': csrf_token,
        },
    })
    .then(response => response.json())
    .then(post => {
        
        if (post.error) {
            alert(post.error);
            console.log(post.error);
        } else {

            // Replace content div with original content
            content_div.innerHTML = post.content;
        }
    })
}
