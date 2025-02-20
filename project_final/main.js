// Firebase SDK 라이브러리 가져오기
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";
import { collection, addDoc, deleteDoc, updateDoc } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";
import { getDocs, query, where, orderBy, limit } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

// Firebase 구성 정보 설정
const firebaseConfig = {
    apiKey: "AIzaSyAAIgbz4FEoiBiuXY7KTGphhMnFguXFaxk",
    authDomain: "sparta-77cb3.firebaseapp.com",
    projectId: "sparta-77cb3",
    storageBucket: "sparta-77cb3.firebasestorage.app",
    messagingSenderId: "844280955292",
    appId: "1:844280955292:web:f119576d8c3492338b4859",
    measurementId: "G-BLJXC0GTLX"
};

// Firebase 인스턴스 초기화
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/***************************************************************************************************************************** */

$(document).ready(function() {

    // 팀원 목록 조회
    loadMembers();

    // 팀원 등록
    $("#saveBtn").on("click", addMember);

    // 수정 아이콘 클릭 이벤트
    $(document).on("click", ".edit", editBtnEvent);

    // 팀원 수정
    $("#editBtn").on("click", editMember);
    
    // 팀원 삭제
    $(document).on("click", ".delete", deleteMember);

    $("#addBtn").hover(
        function () {
            $(this).css("background-color", "black");
        },
        function () {
            $(this).css("background-color", "#6c757d");
        }
    );

    $(document).on("mouseenter", ".delete, .edit", function () {
        $(this).css("color", "red");
    });

    $(document).on("mouseleave", ".delete, .edit", function () {
        $(this).css("color", "gray");
    });

    $(document).on("click", "#addBtn", function() {
        $("#editBtn").hide();
    });
});

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

// 입력 값 체크
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

        if (value == "" || value == "선택") {
            alert(fields[i].message); // 첫 번째로 비어있는 필드의 메시지만 띄움
            $(fields[i].id).focus(); // 해당 입력 필드에 포커스
            return;
        }
    }
    return true;
}

// 오늘 날짜 2025-02-18 형식으로 가져오기
function getTodayDate() {
    let today = new Date();
    let year = today.getFullYear();
    let month = String(today.getMonth() + 1).padStart(2, '0'); // 월 (01~12)
    let day = String(today.getDate()).padStart(2, '0'); // 일 (01~31)

    return `${year}-${month}-${day}`;
}

// 팀원 목록 조회
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

        temp.attr("data-id", id);
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

    });
}

// 링크 형식 검사
function checkLink(link) {
    if (!link.startsWith("http://") && !link.startsWith("https://")) {
        link = "https://" + link;
    }
    return link;
}

// 팀원 등록
async function addMember() {
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
        'date':date
    };

    if(checkInput()) {
        await addDoc(collection(db, "members"), doc);
        alert("팀원 정보가 저장되었습니다.");
        window.location.reload();    
    }
}

// 수정 아이콘 클릭 이벤트
function editBtnEvent() {

    let card = $(this).closest(".col");
    let name = card.find(".name").text();
    let ageWithSuffix = card.find(".age").text();
    let gender = card.find(".gender").text();
    let mbti = card.find(".mbti").text();
    let hobby = card.find(".hobby").text();
    let git = card.find(".git").text();
    let blog = card.find(".blog").text();
    let message = card.find(".message").text();
    let id = card.data("id"); // Firestore 문서 ID 가져오기
    let index = card.find(".index").text(); // index 값 가져오기

    // index 값이 올바른지 로그로 확인
    console.log("가져온 index:", index);

    // 모달에 기존 정보 세팅
    $("#modalName").val(name);
    let age = ageWithSuffix.replace("살", "");
    $("#modalAge").val(age); // 숫자만 설정
    $("#modalGender").val(gender);
    $("#modalMbti").val(mbti);
    $("#modalHobby").val(hobby);
    $("#modalGit").val(git);
    $("#modalBlog").val(blog);
    $("#modalMsg").val(message);
    $("#modalImg").val(card.find(".image").attr("src"));

    // 모달 오픈
    $("#createMember").modal("show");

    // 수정할 때 Firestore 문서 index 저장
    $("#editBtn").data("index", index); // editBtn에 index 저장

    // editBtn을 보이게 하고 saveBtn 숨기기
    $("#editBtn").show(); // editBtn 보이기
    $("#saveBtn").hide(); // saveBtn 숨기기
}

// 팀원 수정
async function editMember() {
    console.log("수정하기 버튼 클릭");
    const index = $(this).data("index"); // 수정할 Firestore 문서 index 가져오기

    if (!index) {
        console.error("문서 index를 찾을 수 없습니다.");
        alert("문서 index를 찾을 수 없습니다.");
        return;
    }

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

    // Firestore에서 해당 index를 가진 문서 참조
    const q = query(collection(db, "members"), where("index", "==", parseInt(index))); // index를 숫자로 변환
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
        alert("해당 index에 대한 문서를 찾을 수 없습니다.");
        return;
    }

    const docRef = querySnapshot.docs[0].ref; // 첫 번째 문서 참조

    if (checkInput()) {
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
    
            // 수정된 내용을 기존 멤버 카드에 반영
            const card = $(`[data-id='${docRef.id}']`); // 수정된 카드 찾기
            card.find(".image").attr("src", image);
            card.find(".name").text(name);
            card.find(".gender").text(gender);
            card.find(".age").text(age + "살");
            card.find(".mbti").text(mbti);
            card.find(".hobby").text(hobby);
            card.find(".git").text(git);
            card.find(".blog").text(blog);
            card.find(".message").text(message);
    
            alert("정보가 수정되었습니다.");
            window.location.reload();
        } catch (error) {
            console.error("문서 업데이트 실패:", error);
            alert("정보 수정 중 오류가 발생했습니다.");
        }    
    }
}

// 팀원 삭제
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