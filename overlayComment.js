$(document).ready(function () {
    $('#overlayBtn').on('click', function () {
        $('#overlay').fadeIn();
    });

    $('#closeBtn').on('click', function () {
        $('#overlay').fadeOut();
    });

    $('#submitComment').on('click', function () {
        const nickname = $('#commentNameInput').val().trim();
        const commentText = $('#commentText').val().trim();
        if (nickname !== "" && commentText !== "") {
            const newComment = $("<div></div>").text(nickname + " : " + commentText);
            $('#commentList').append(newComment);
            $('#commentNameInput').val('');
            $('#commentText').val('');

            const commentBox = $('#commentList')[0];
            commentBox.scrollTop = commentBox.scrollHeight;
        }
    });
});