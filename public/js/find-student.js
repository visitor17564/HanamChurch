import { ModalHelper } from './modal-helper.js';

document.addEventListener('DOMContentLoaded', async () => {
  const findStudent = new FindStudent();
  await findStudent.init();
});

class FindStudent {
  constructor() {
    this.modalHelper = new ModalHelper(this);
    this.students = {};
    this.selectedStudent = {};
  }

  // 초기화
  async init() {
    await this.wrapTitle();
    this.addSearchEventListener();
    this.modalHelper.addSaveAndAddStudentEventListener();
    this.addModalCloseEventListener();
  }

  // 타이틀을 생성합니다.
  async wrapTitle() {
    // parameter에서 grade를 가져옵니다.
    const dpartment = '고등부';
    const titleDiv = document.querySelector('.wrapGrade');
    const div = `
      <div class="gradeDiv contentText"><h2>🐤 ${dpartment} 친구찾기</h2></div>
    `;
    titleDiv.innerHTML = div;
  }

  // 검색 버튼 이벤트리스너 추가
  addSearchEventListener() {
    document
      .getElementById('searchFollow')
      .addEventListener('click', async () => {
        const searchName = document.getElementById('findFollowName').value;
        if (!searchName) {
          alert('학생 이름을 입력해주세요.');
          return;
        }
        const data = await fetch(`/student/findStudentByName/${searchName}`);
        const response = await data.json();
        this.wrapStudentList(response);
      });

    // 엔터키로 검색
    document
      .getElementById('findFollowName')
      .addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
          document.getElementById('searchFollow').click();
        }
      });
  }

  // 검색한 학생들을 리스트에 띄웁니다.
  wrapStudentList(items) {
    const wrapDiv = document.getElementById('wrap-follows');
    let html = ``;

    if (items.length === 0) {
      html = `<div class="no-result">검색 결과가 없습니다.</div>`;
    } else {
      items.forEach((item) => {
        // students 객체에 저장
        this.students[item.id] = item;
        this.modalHelper.students[item.id] = item;

        html += `
          <div class="student-item" data-userid="${item.id}">
            <span>${item.grade}학년</span>
            <span>${item.class}반</span>
            <span>${item.name}</span>
          </div>
        `;
      });
    }

    wrapDiv.innerHTML = html;

    // 학생 이름 클릭 이벤트 추가
    const studentItems = document.querySelectorAll('.student-item');
    studentItems.forEach((item) => {
      item.addEventListener('click', async (event) => {
        // 가장 가까운 div를 가져옵니다.
        const studentItem = event.target.closest('.student-item');
        await this.openStudentModal({
          target: studentItem,
        });
      });
    });
  }

  // 학생 상세 정보 모달을 엽니다.
  async openStudentModal(event) {
    const userId = event.target.dataset.userid;

    // API 호출로 전체 정보 가져오기
    const data = await fetch(`/student/detail/${userId}`);
    const student = await data.json();

    // this.students와 modalHelper.students에 저장
    this.students[userId] = student;
    this.modalHelper.students[userId] = student;

    // 기존 modal-helper의 openStudentModal 호출
    await this.modalHelper.openStudentModal(event);
  }

  // 모달창 닫기 이벤트리스너
  addModalCloseEventListener() {
    // 모달창 배경 클릭시 닫기
    const mask = document.querySelector('.FLOATING_DIV_MASK');
    if (mask) {
      mask.addEventListener('click', () => {
        this.closeStudentModal();
      });
    }

    // X 버튼 클릭시 닫기
    const closeButton = document.getElementById('modal-close-button');
    if (closeButton) {
      closeButton.addEventListener('click', () => {
        this.closeStudentModal();
      });
    }

    // 닫기 버튼 클릭시 닫기
    const closeStudentButton = document.getElementById('closeStudent');
    if (closeStudentButton) {
      closeStudentButton.addEventListener('click', () => {
        this.closeStudentModal();
      });
    }
  }

  // 모달창 닫기
  closeStudentModal() {
    document.getElementById('studentDetails').style.display = 'none';
  }
}
