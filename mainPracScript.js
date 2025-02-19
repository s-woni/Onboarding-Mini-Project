// Firebase SDK 라이브러리 가져오기
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";
import { collection, addDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";
import { getDocs, query, orderBy, limit } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

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

        let index = row["index"];
        let image = row["image"];
        let name = row["name"];
        let gender = row["gender"];
        let age = row["age"];
        let mbti = row["mbti"];
        let date = row["date"];

        let template = $("#cardTemplate")[0];
        let temp = $(template.content.cloneNode(true)); // 템플릿 복사 후 jQuery 객체로 변환

        temp.find(".image").attr("src", image);
        temp.find(".name").text(name);
        temp.find(".gender").text(gender);
        temp.find(".age").text(age + "살");
        temp.find(".mbti").text(mbti);
        temp.find(".index").text(index);
        temp.find(".date").text(date);

        $("#cards").append(temp);

    });
}

$(document).ready(function() {

    // 팀원 정보 불러오기
    loadMembers();

    // 팀원 정보 저장하기
    $("#saveBtn").on("click", async function() {
        const lastIndex = await getLastIndex(); // 마지막 인덱스 가져오기
        const newIndex = lastIndex + 1; // 새로운 인덱스 = 마지막 인덱스 + 1

        let index = newIndex;
        let image = $("#modalImg").val();
        let name = $("#modalName").val();
        let gender = $("#modalGender").val();
        let age = $("#modalAge").val();
        let mbti = $("#modalMbti").val();
        let hobby = $("#modalHobby").val();
        let git = $("#modalGit").val();
        let blog = $("#modalBlog").val();
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

    });

    // 팀원 정보 삭제하기
    $(document).on("click", ".delete", async function () {
        let card = $(this).closest(".col"); // 클릭한 버튼의 카드 찾기
        let index = card.find(".index").text(); // 해당 카드의 인덱스 가져오기
        
        if (!index) {
            alert("오류: 인덱스를 찾을 수 없음");
            return;
        }

        let confirmDelete = confirm("정말 삭제하시겠습니까?");
        if (!confirmDelete) return;
    
        try {
            // Firestore에서 해당 데이터 삭제
            let docs = await getDocs(collection(db, "members"));
    
            docs.forEach(async (doc) => {
                if (doc.data().index == index) { // 인덱스가 일치하는 데이터 찾기
                    await deleteDoc(doc.ref); // Firestore에서 삭제
                    alert("삭제되었습니다.");
                    location.reload(); // 페이지 새로고침
                }
            });
        } catch (error) {
            console.error("삭제 중 오류 발생:", error);
            alert("삭제 실패하였습니다.");
        }
    });
    
})


