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

function cancel(event) {
    const content_div = event.target.parentElement.parentElement;
    const post_id = content_div.parentElement.dataset.id;
    
    // Fetch original post content
    
}