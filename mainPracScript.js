// Firebase SDK 라이브러리 가져오기
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";
import { collection, addDoc, deleteDoc, updateDoc, doc } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";
import { getDocs, query, orderBy, limit } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

// Firebase 구성 정보 설정
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyAbwX7tWMJi1gTl_fURKx6FzFQjY6XOoto",
    authDomain: "sparta-e8b3d.firebaseapp.com",
    projectId: "sparta-e8b3d",
    storageBucket: "sparta-e8b3d.firebasestorage.app",
    messagingSenderId: "677399503700",
    appId: "1:677399503700:web:6b6359c8c8be5aa61adec1",
    measurementId: "G-TGCXX8SPG8"
};

// Firebase 인스턴스 초기화
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 마지막 인덱스를 가져오는 함수
async function getLastIndex() {
    const q = query(collection(db, "members"), orderBy("index", "desc"), limit(1));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
        return querySnapshot.docs[0].data().index; // 가장 마지막 index 값 반환
    } else {
        return 0; // 데이터가 없으면 0 반환
    }
}

function checkInput() {
    // 입력값 가져오기
    let fields = [
        { id: "#modalImg", message: "이미지 주소를 입력하세요." },
        { id: "#modalName", message: "이름을 입력하세요." },
        { id: "#modalGender", message: "성별을 선택하세요." },
        { id: "#modalAge", message: "나이를 입력하세요." },
        { id: "#modalMbti", message: "MBTI를 입력하세요." },
        { id: "#modalHobby", message: "취미를 입력하세요." },
        { id: "#modalGit", message: "GitHub 주소를 입력하세요." },
        { id: "#modalBlog", message: "블로그 주소를 입력하세요." },
        { id: "#modalMsg", message: "한마디를 입력하세요." }
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

// 오늘 날짜 2025-02-18 형식으로 가져오기
function getTodayDate() {
    let today = new Date();
    let year = today.getFullYear();
    let month = String(today.getMonth() + 1).padStart(2, '0'); // 월 (01~12)
    let day = String(today.getDate()).padStart(2, '0'); // 일 (01~31)

    return `${year}-${month}-${day}`;
}


async function loadMembers() {
    $("#cards").empty();
    let docs = await getDocs(collection(db, "members"));

    docs.forEach((doc) => {
        let row = doc.data();
        let id = doc.id;

        let index = row["index"];
        let image = row["image"];
        let name = row["name"];
        let gender = row["gender"];
        let age = row["age"];
        let mbti = row["mbti"];
        let hobby = row["hobby"];
        let git = row["git"];
        let blog = row["blog"];
        let message = row["message"];
        let date = row["date"];

        let template = $("#cardTemplate")[0];
        let temp = $(template.content.cloneNode(true)); // 템플릿 복사 후 jQuery 객체로 변환

        temp.find(".image").attr("src", image);
        temp.find(".name").text(name);
        temp.find(".gender").text(gender);
        temp.find(".age").text(age + "살");
        temp.find(".mbti").text(mbti);
        temp.find(".hobby").text(hobby);
        temp.find(".git").text(git);
        temp.find(".blog").text(blog);
        temp.find(".message").text(message);
        temp.find(".index").text(index);
        temp.find(".date").text(date);


        // temp.attr("data-id", id); // 카드에 Firestore 문서 ID 저장
        // temp.find(".name").text(row.name);
        // temp.find(".age").text(row.age);
        // temp.find(".gender").text(row.gender);
        // temp.find(".mbti").text(row.mbti);
        // temp.find(".hobby").text(row.hobby);
        // temp.find(".git").text(row.git);
        // temp.find(".blog").text(row.blog);
        // temp.find(".message").text(row.message);
        // temp.find(".image").attr("src", row.image);

        // 개인 페이지 값 전달을 위해 data 값 세팅
        let showInfoLink = temp.find(".showInfoLink");

        showInfoLink
            .data("image", image).attr("data-image", image)
            .data("name", name).attr("data-name", name)
            .data("gender", gender).attr("data-gender", gender)
            .data("age", age).attr("data-age", age)
            .data("mbti", mbti).attr("data-mbti", mbti)
            .data("hobby", hobby).attr("data-hobby", hobby)
            .data("git", git).attr("data-git", git)
            .data("blog", blog).attr("data-blog", blog)
            .data("message", message).attr("data-message", message)
            .data("index", index).attr("data-index", index)
            .data("date", date).attr("data-date", date);

        $("#cards").append(temp);
        temp.attr("data-id", id); // 카드에 Firestore 문서 ID 저장

    });
}

function checkLink(link) {
    if (!link.startsWith("http://") && !link.startsWith("https://")) {
        link = "https://" + link;
    }
    return link;
}

// 팀원 삭제 함수
async function deleteMember() {
    let card = $(this).closest(".col"); // 클릭한 버튼의 카드 찾기
    let memberIndex = card.find(".index").text(); // 해당 카드의 인덱스 가져오기

    if (!memberIndex) {
        alert("오류: 인덱스를 찾을 수 없음");
        return;
    }

    let confirmDelete = confirm("정말 삭제하시겠습니까?");
    if (!confirmDelete) return;

    try {

        let memberDocs = await getDocs(collection(db, "members"));
        let guestDocs = await getDocs(collection(db, "guestbook"));

        // 해당 팀원의 방명록 삭제
        guestDocs.forEach(async (doc) => {
            if (doc.data().memberIndex == memberIndex) {
                await deleteDoc(doc.ref);
                console.log("memberIndex: " + memberIndex + " 방명록 삭제 완료");
            }
        });

        // 팀원 정보 삭제
        memberDocs.forEach(async (doc) => {
            if (doc.data().index == memberIndex) {
                await deleteDoc(doc.ref);
                alert("삭제되었습니다.");
                location.reload();
            }
        });

    } catch (error) {
        console.error("삭제 중 오류 발생:", error);
        alert("삭제 실패하였습니다.");
    }
}
$(document).ready(function () {

    // 팀원 정보 불러오기
    loadMembers();

    // 팀원 정보 저장하기
    $("#saveBtn").on("click", async function () {
        const lastIndex = await getLastIndex(); // 마지막 인덱스 가져오기
        const newIndex = lastIndex + 1; // 새로운 인덱스 = 마지막 인덱스 + 1

        let userGit = $("#modalGit").val();
        let userBlog = $("#modalBlog").val();

        let index = newIndex;
        let image = $("#modalImg").val();
        let name = $("#modalName").val();
        let gender = $("#modalGender").val();
        let age = $("#modalAge").val();
        let mbti = $("#modalMbti").val();
        let hobby = $("#modalHobby").val();
        let git = checkLink(userGit);
        let blog = checkLink(userBlog);
        let message = $("#modalMsg").val();
        let date = getTodayDate();

        let doc = {
            'index': index,
            'image': image,
            'name': name,
            'gender': gender,
            'age': age,
            'mbti': mbti,
            'hobby': hobby,
            'git': git,
            'blog': blog,
            'message': message,
            'date': date
        };

        if (checkInput()) {
            await addDoc(collection(db, "members"), doc);
            alert("팀원 정보가 저장되었습니다.");
            window.location.reload();
        }

    });

    // 팀원 정보 삭제하기
    $(document).on("click", ".delete", deleteMember);

    $("#addBtn").hover(
        function () {
            $(this).css("background-color", "black");
        },
        function () {
            $(this).css("background-color", "#6c757d");
        }
    );

    $(document).on("mouseenter", ".delete", function () {
        $(this).css("color", "red");
    });

    $(document).on("mouseleave", ".delete", function () {
        $(this).css("color", "gray");
    });



})



//수정기능

$(document).on("click", ".edit", function () {
    console.log("수정 버튼 클릭");

    let card = $(this).closest(".col");
    let name = card.find(".name").text();
    let ageWithSuffix = card.find(".age").text();
    let gender = card.find(".gender").text();
    let mbti = card.find(".mbti").text();
    let hobby = card.find(".hobby").text();
    let git = card.find(".git").text();
    let blog = card.find(".blog").text();
    let message = card.find(".message").text();
    let id = card.data("id");


    // 모달에 기존 정보 세팅
    $("#modalName").val(name);
    let age = ageWithSuffix.replace("살", ""); 
    $("#modalAge").val(age);
    $("#modalGender").val(gender);
    $("#modalMbti").val(mbti);
    $("#modalHobby").val(hobby);
    $("#modalGit").val(git);
    $("#modalBlog").val(blog);
    $("#modalMsg").val(message);
    $("#modalImg").val(card.find(".image").attr("src"));

    // 모달 오픈
    $("#createMember").modal("show");

    // 수정할 때 Firestore 문서 ID 저장
    $("#saveBtn").data("id", id); // 카드에 저장된 Firestore 문서 ID 사용


});

$("#saveBtn").on("click", async function () {
    const id = $(this).data("id"); // 수정할 Firestore 문서 ID 가져오기

    let image = $("#modalImg").val();
    let name = $("#modalName").val();
    let gender = $("#modalGender").val();
    let age = $("#modalAge").val();
    let mbti = $("#modalMbti").val();
    let hobby = $("#modalHobby").val();
    let git = checkLink($("#modalGit").val()); 
    let blog = checkLink($("#modalBlog").val()); 
    let message = $("#modalMsg").val();
    let date = getTodayDate(); // 현재 날짜 가져오기

    const docRef = doc(db, "members", id); // Firestore 문서 참조

    // Firestore에서 수정
    try {
        await updateDoc(docRef, {
            image: image,
            name: name,
            gender: gender,
            age: age,
            mbti: mbti,
            hobby: hobby,
            git: git,
            blog: blog,
            message: message,
            date: date
        });

        console.log(`문서 (${id}) 업데이트 완료!`);

        // 수정된 내용을 기존 멤버 카드에 반영
        const card = $(`[data-id='${id}']`); // 수정된 카드 찾기
        card.find(".image").attr("src", image);
        card.find(".name").text(name);
        card.find(".gender").text(gender);
        card.find(".age").text(age);
        card.find(".mbti").text(mbti);
        card.find(".hobby").text(hobby);
        card.find(".git").text(git);
        card.find(".blog").text(blog);
        card.find(".message").text(message);

        alert("정보가 수정되었습니다.");
        $("#createMember").modal("hide"); // 모달 닫기
    } catch (error) {
        console.error("문서 업데이트 실패:", error);
        alert("정보 수정 중 오류가 발생했습니다.");
    }
});



