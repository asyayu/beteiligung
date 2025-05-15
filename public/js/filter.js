function filterOptions() {
    var input, filter, ul, li, a, i, txtValue;
    input = document.getElementById('lieblingsort');
    filter = input.value.toUpperCase();
    ul = document.getElementById("myUL");
    li = ul.getElementsByTagName('li');

    if (input.value.trim() !== "") {
        ul.style.display = "block";
    } else {
        ul.style.display = "none";
    }

    for (i = 0; i < li.length; i++) {
        a = li[i].getElementsByTagName("a")[0];
        txtValue = a.textContent || a.innerText;
        if (txtValue.toUpperCase().indexOf(filter) > -1) {
            li[i].style.display = "";
        } else {
            li[i].style.display = "none";
        }
    }
}

document.querySelectorAll('#myUL li a').forEach(function (item) {
    item.addEventListener('click', function (e) {
        document.getElementById('lieblingsort').value = e.target.innerText;

        document.getElementById('myUL').style.display = "none";
    });
});