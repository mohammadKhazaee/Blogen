ClassicEditor.create( document.querySelector( '#editor1' ) )

const logoutForm = document.getElementById('logout')

if (logoutForm) {
    logoutForm.firstElementChild.addEventListener('click', () => {
        logoutForm.submit()
    })
}

const addCategoryForm = document.getElementById('addCategoryForm')
const addPostForm = document.getElementById('addPostForm')
const addUserForm = document.getElementById('addUserForm')
const addCategoryBtn = document.getElementsByClassName('addCategoryBtn')[0]
const addUserBtn = document.getElementsByClassName('addUserBtn')[0]
const addPostBtn = document.getElementsByClassName('addPostBtn')[0]

if (addCategoryForm) {
    addCategoryBtn.addEventListener('click', () => {
        addCategoryForm.submit()
    }) 
}

if (addUserForm) {
    addUserBtn.addEventListener('click', () => {
        addUserForm.submit()
    }) 
}

if (addPostForm) {
    addPostBtn.addEventListener('click', () => {
        addPostForm.submit()
    }) 
}

const editPostForm = document.getElementById('editPostForm')
const editPostBtn = document.getElementsByClassName('editPostBtn')[0]
if (editPostForm) {
    editPostBtn.addEventListener('click', () => {
        editPostForm.submit()
    })
}

$('.fb > button').on('click', function() {
    $('#feedbackCollapse').collapse('hide')
})

const wrongInput = document.getElementsByName('wrongInput')[0]
if (wrongInput) {
    $(window).on('load', function(){
        $(`#add${wrongInput.value}Modal`).modal('show')
    })
}