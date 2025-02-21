// Firebase SDK 라이브러리 가져오기
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";
import { collection, addDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";
import { getDocs, query, where, orderBy, limit } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";
import { doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

// Firebase 구성 정보 설정
// const firebaseConfig = {
//     apiKey: "AIzaSyAAIgbz4FEoiBiuXY7KTGphhMnFguXFaxk",
//     authDomain: "sparta-77cb3.firebaseapp.com",
//     projectId: "sparta-77cb3",
//     storageBucket: "sparta-77cb3.firebasestorage.app",
//     messagingSenderId: "844280955292",
//     appId: "1:844280955292:web:f119576d8c3492338b4859",
//     measurementId: "G-BLJXC0GTLX"
// };

const firebaseConfig = {
    apiKey: "AIzaSyBD-68R8ciQMdjvT3JSiefiPNNRPvDmtL0",
    authDomain: "sparta-3d526.firebaseapp.com",
    projectId: "sparta-3d526",
    storageBucket: "sparta-3d526.firebasestorage.app",
    messagingSenderId: "1067721673863",
    appId: "1:1067721673863:web:55545a9c32c4e2a431fc22",
    measurementId: "G-6ZB5RPNSET"
};

// Firebase 인스턴스 초기화
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

$(document).ready(function () {
    $(document).on("click", ".guest-edit", function () {
        const listItem = $(this).closest("li");  // 클릭한 댓글의 리스트 항목
        const commentId = listItem.find(".guestbook-index").text();  // 댓글 ID 가져오기
        const currentComment = listItem.find(".guest-comment").html();  // 기존 댓글 내용 가져오기
        const commentPassword = listItem.find(".guest-pw").text();  // 댓글 비밀번호 가져오기

        // 기존 댓글을 수정 폼으로 교체
        listItem.find(".guest-comment").hide();
        listItem.find(".guest-edit").hide();
        listItem.find(".guest-delete").hide();

        // 댓글 수정 폼 동적으로 생성 (기존 댓글 내용 넣기)
        const editForm = `
            <textarea class="new-comment-text">${currentComment}</textarea>
            <div class="edit-btn-group">
                <button class="save-comment-btn">저장</button>
                <button class="cancel-comment-btn">취소</button>
            </div>
        `;
        listItem.find(".guest-comment").after(editForm);  // 수정 폼을 댓글 바로 아래에 추가

        scrollToLastComment();

        // 저장 버튼 클릭 시 댓글 수정
        listItem.find(".save-comment-btn").off("click").on("click", async function () {
            const newCommentText = listItem.find(".new-comment-text").val().trim();
            const inputPassword = prompt("비밀번호를 입력하세요.");

            if (inputPassword !== commentPassword) {
                alert("비밀번호가 일치하지 않습니다.");
                return;  // 비밀번호가 일치하지 않으면 수정 불가
            }

            if (newCommentText) {
                try {
                    await updateComment(commentId, newCommentText);  // 댓글 수정 함수 호출
                    listItem.find(".guest-comment").html(newCommentText);  // 화면에 새 댓글 표시
                    listItem.find(".guest-comment").show();  // 기존 댓글 다시 보이기
                    listItem.find(".guest-edit").show();  // 수정 버튼 다시 보이기
                    listItem.find(".guest-delete").show();  // 삭제 버튼 다시 보이기
                    listItem.find(".new-comment-text").remove();  // 수정 폼 제거
                    listItem.find(".save-comment-btn").remove();  // 저장 버튼 제거
                    listItem.find(".cancel-comment-btn").remove();  // 취소 버튼 제거
                    alert("댓글이 수정되었습니다.");  // 성공 메시지
                } catch (error) {
                    console.error(error);
                    alert("댓글 수정에 실패했습니다.");
                }
            } else {
                alert("댓글을 입력하세요.");
            }
        });

        // 취소 버튼 클릭 시 수정 폼 숨기기
        listItem.find(".cancel-comment-btn").off("click").on("click", function () {
            listItem.find(".new-comment-text").remove();  // 수정 폼 제거
            listItem.find(".save-comment-btn").remove();  // 저장 버튼 제거
            listItem.find(".cancel-comment-btn").remove();  // 취소 버튼 제거
            listItem.find(".guest-comment").show();  // 기존 댓글 다시 보이기
            listItem.find(".guest-edit").show();  // 수정 버튼 다시 보이기
            listItem.find(".guest-delete").show();  // 삭제 버튼 다시 보이기
        });
    });
});



// 댓글 업데이트
async function updateComment(commentIndex, newCommentText) {
    try {
        const q = query(collection(db, "guestbook"), where("index", "==", parseInt(commentIndex)));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            alert("댓글을 찾을 수 없습니다.");
            return;
        }

        querySnapshot.forEach(async (doc) => {
            await updateDoc(doc.ref, {
                comment: newCommentText
            });
            console.log("수정 성공");
        });

    } catch (error) {
        console.error(error);
    }
}

// 방명록 목록 조회
async function loadGuestbook() {
    const memberIndex = $("#member-index").text();

    const guestbookRef = collection(db, "guestbook");
    const q = query(guestbookRef, where("memberIndex", "==", memberIndex), orderBy("date", "desc"));
    const querySnapshot = await getDocs(q);

    let guestbookList = $("#guestbook-list");
    guestbookList.empty(); // 기존 목록 초기화

    querySnapshot.forEach((doc) => {
        let data = doc.data();

        let template = $("#guestbook-temp")[0];
        let temp = $(template.content.cloneNode(true));

        temp.find(".guest-name").text(data.name);
        temp.find(".guest-pw").text(data.password);
        temp.find(".guest-comment").html(data.comment);
        temp.find(".guest-date").text(data.date);
        temp.find(".member-index").text(data.memberIndex);
        temp.find(".guestbook-index").text(data.index);

        $("#guestbook-list").prepend(temp);
    });

    scrollToLastComment();
}

function scrollToLastComment() {
    const guestbookList = $("#guestbook-list");
    const lastGuestbookItem = guestbookList.find("li").last();

    if (lastGuestbookItem.length) {
        lastGuestbookItem[0].scrollIntoView({ behavior: "smooth", block: "end" });
    }
}

async function getLastGuestIndex() {
    const q = query(collection(db, "guestbook"), orderBy("index", "desc"), limit(1));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
        return querySnapshot.docs[0].data().index; // 가장 마지막 index 값 반환
    } else {
        return 0; // 데이터가 없으면 0 반환
    }
}

function getFormattedDate() {
    let now = new Date();

    let year = now.getFullYear();
    let month = String(now.getMonth() + 1).padStart(2, "0");
    let day = String(now.getDate()).padStart(2, "0");
    let hours = String(now.getHours()).padStart(2, "0");
    let minutes = String(now.getMinutes()).padStart(2, "0");
    let second = String(now.getSeconds()).padStart(2, "0");

    return `${year}-${month}-${day} ${hours}:${minutes}:${second}`;
}

function checkComment() {
    // 입력값 가져오기
    let fields = [
        { id: "#guest-name", message: "이름을 입력하세요." },
        { id: "#guest-pw", message: "비밀번호 입력하세요." },
        { id: "#guest-comment", message: "내용을 선택하세요." }
    ];

    // 첫 번째로 비어있는 필드 찾기
    for (let i = 0; i < fields.length; i++) {
        let value = $(fields[i].id).val().trim();
        if (!value || value == "선택") {
            alert(fields[i].message); // 첫 번째로 비어있는 필드의 메시지만 띄움
            $(fields[i].id).focus(); // 해당 입력 필드에 포커스
            return false;
        } else {
            return true;
        }
    }
}

async function deleteComment() {
    let list = $(this).closest("li"); // 클릭한 버튼의 카드 찾기
    let index = list.find(".guestbook-index").text(); // 해당 카드의 인덱스 가져오기
    let pwd = list.find(".guest-pw").text();

    console.log("guestbook index : ", index);
    console.log("guestbook pwd : ", pwd);

    let inputPassword = prompt("비밀번호를 입력하세요.");

    if (inputPassword == pwd) {
        if (!index) {
            alert("오류: 인덱스를 찾을 수 없음");
            return;
        }

        let confirmDelete = confirm("정말 삭제하시겠습니까?");
        if (!confirmDelete) return;

        try {
            // Firestore에서 해당 데이터 삭제
            let docs = await getDocs(collection(db, "guestbook"));

            docs.forEach(async (doc) => {
                if (doc.data().index == index) { // 인덱스가 일치하는 데이터 찾기
                    await deleteDoc(doc.ref); // Firestore에서 삭제
                    alert("삭제되었습니다.");
                    loadGuestbook();
                }
            });
        } catch (error) {
            console.error("삭제 중 오류 발생:", error);
            alert("삭제 실패하였습니다.");
        }
    } else {
        alert("비밀번호가 일치하지 않습니다.");
    }

}

$(document).ready(function () {

    $(document).on("click", ".showInfoLink", async function () {
        let data = $(this).data();
        let page = $($("#showMemberInfo")[0]);

        page.find("#member-image").attr("src", data.image);
        page.find("#member-name").text(data.name);
        page.find("#member-gender").text(data.gender);
        page.find("#member-age").text(data.age);
        page.find("#member-mbti").text(data.mbti);
        page.find("#member-hobby").text(data.hobby);
        page.find("#member-git").attr("href", data.git);
        page.find("#member-blog").attr("href", data.blog);
        page.find("#member-message").text(data.message);
        page.find("#member-index").text(data.index);
        page.find("#member-date").text(data.date);

        await loadGuestbook();

        setTimeout(scrollToLastComment, 200);
    });

    // 팀원 방명록 저장하기
    $("#guestbook-add-btn").on("click", async function () {

        const lastIndex = await getLastGuestIndex(); // 마지막 인덱스 가져오기
        const newIndex = lastIndex + 1; // 새로운 인덱스 = 마지막 인덱스 + 1

        const userIndex = $("#member-index").text(); // 팀원의 인덱스

        let index = newIndex;
        let memberIndex = userIndex;
        let name = $("#guest-name").val();
        let password = $("#guest-pw").val();
        let comment = $("#guest-comment").html();
        let date = getFormattedDate();

        let doc = {
            'index': index,
            'memberIndex': memberIndex,
            'name': name,
            'password': password,
            'comment': comment,
            'date': date
        };

        if (checkComment()) {
            await addDoc(collection(db, "guestbook"), doc);
            // 목록 업데이트
            loadGuestbook();
            // 입력 값 비우기
            $("#guest-name").val("");
            $("#guest-pw").val("");
            $("#guest-comment").text("");
        }

    });

    $(document).on("click", ".guest-delete", deleteComment);

    $(document).on("mouseenter", ".guest-delete", function () {
        $(this).css("color", "black");
    });

    $(document).on("mouseleave", ".guest-delete", function () {
        $(this).css("color", "gray");
    });
});