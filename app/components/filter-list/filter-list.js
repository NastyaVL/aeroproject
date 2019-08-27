const filter = document.querySelector('.filter-list'); //находим элемент по классу

const classes = {
    isActive: 'is-active'
}

const toggleClass = (el, className) => {
    if(el.classList.contains(className)){
        el.classList.remove(className);
    }
    else{
        el.classList.add(className);
    }
}

filter.addEventListener('click', (e) => {
    toggleClass(e.currentTarget, classes.isActive);
});
