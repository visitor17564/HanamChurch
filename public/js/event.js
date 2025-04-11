import { ModalHelper } from './modal-helper.js';
import { DateHelper } from './date-helper.js';

// 다큐먼트가 로드될 때가지 기다립니다.
document.addEventListener('DOMContentLoaded', async () => {
  const event = new Event();
  await event.wrapTitle();
  await event.makeEvent();
});

class Event {
  constructor() {
    this.dateHelper = new DateHelper(this);
    this.modalHelper = new ModalHelper(this);
    this.event = {};
    this.totalEventCount = 0;
    this.isRequestInProcess = false;
  }

  // 이벤트 정보 호출
  async getEventInfo() {
    // get parameter에서 event를 가져옵니다.
    const urlParams = new URLSearchParams(window.location.search);
    const eventId = urlParams.get('event');
    const response = await fetch(`/event/getEvent/${eventId}`);
    const data = await response.json();
    this.event = data.data;
  }

  // 타이틀을 생성합니다.
  async wrapTitle() {
    await this.getEventInfo();
    // parameter에서 grade를 가져옵니다.
    const titleDiv = document.querySelector('.wrapGrade');
    const div = `
      <div class="gradeDiv contentText"><h2>🐤 ${this.event.name}</h2></div>
    `;
    titleDiv.innerHTML = div;
  }

  // 이벤트목록을 만듭니다.
  async makeEvent() {
    await this.simulateLoading();
    await this.getBoard();
    await this.stopLoading();
  }

  // 학년, 반, 날짜에 따른 출석부를 가져옵니다.
  async getBoard() {
    const data = await fetch(`/event/getEventCounts/${this.event.id}`);
    const response = await data.json();
    for (let i = 0; i < response.data.length; i++) {
      this.modalHelper.students[response.data[i].id] = response.data[i];
    }
    this.wrapAttendance(response.data);
    this.wrapBottomButton();
    this.modalHelper.addNameEventListener();
    this.modalHelper.addSaveAndAddStudentEventListener();
    this.modalHelper.addFollowEventListener();
    await this.modalHelper.addEventListModalEventListener();
  }

  // 출석부를 div로 만들어서 wrapAttendance에 넣습니다.
  wrapAttendance(items) {
    const attendanceDiv = document.querySelector('.wrapAttendance');
    // 기존에 있던 div들을 지웁니다.
    attendanceDiv.innerHTML = '';

    // 카운트를 위해 변수 초기화합니다.
    // let totalOnList = 0;
    // let totalNewCount = 0;
    let count = 0;
    items.forEach((item) => {
      let onPrizeDiv = '';
      count++;
      if (count <= 3) {
        onPrizeDiv = `&nbsp;<span class="codeGreen">🎉${count}등</span>`;
      }

      const { id, organizationId, name, grade } = item;
      const classNum = item.class;
      // totalNewCount += 1;
      const div = `
        <div class="attendanceDiv">
          <div class="name" data-userId="${id}" data-organizationId="${organizationId}">🐤 ${grade}학년 ${classNum}반 ${name} ${onPrizeDiv}</div>
          <div class="checkAndEventDiv" data-userId="${id}" data-organizationId="${organizationId}">
            체크 : ${item.event_check_count}회 🔍
          </div>
        </div>
      `;
      attendanceDiv.innerHTML += div;
    });

    // this.wrapSumCount(); // Call wrapSumCount to update totals
  }

  // 새친구 추가 버튼을 만듭니다.
  async wrapAddStudentButton() {
    const attendanceDiv = document.querySelector('.wrapAttendance');
    const div = `
    <div id="makeStudentModalButton" class="bottomDiv">
      <div>🥳 새 친구 추가</div>
      <div>➕</div>
    </div>
    `;
    attendanceDiv.innerHTML += div;
  }

  // 홈버튼을 만듭니다.
  wrapBottomButton() {
    const attendanceDiv = document.querySelector('.wrapAttendance');
    const div = `
    <div class="bottomDiv">
      <a class="goToHome" href="/">🏠 홈으로가기</a>
      <a class="goToHome" href="https://forms.gle/P6FSyJBXSMoMjjUx6">📝 목양관리</a>
    </div>
    `;
    attendanceDiv.innerHTML += div;
  }

  // 합계를 적용합니다.
  async wrapSumCount() {
    document.querySelector('.totalOnList').innerText = this.totalOnList;
    document.querySelector('.totalNewCount').innerText = this.totalNewCount;
  }

  // 로딩을 시뮬레이션합니다.
  simulateLoading() {
    const exBox = document.querySelector('.ex-box');
    const loadingSpinner = document.querySelector('.loading-wrap--js');
    const loadingMessage = document.getElementById('loadingMessage');

    // 로딩 시작
    exBox.style.display = 'block';
    loadingSpinner.style.display = 'flex';
    loadingMessage.textContent = '로딩 중이에요!';
  }

  // 로딩을 멈춥니다.
  stopLoading() {
    const exBox = document.querySelector('.ex-box');
    // 로딩 종료
    exBox.style.display = 'none';
  }

  // 이벤트 타입에 따른 svg를 반환합니다.
  getEventSvg(eventType, eventCheck) {
    const checkColor = eventCheck ? '#FF0000' : '#CCCCCC';
    switch (eventType) {
      case 0:
        return `<svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="${checkColor}" version="1.1" class="checkIcon" width="100px" height="2em" viewBox="0 0 24 24">
                  <g id="File / Note_Edit">
                  <path id="Vector" d="M10.0002 4H7.2002C6.08009 4 5.51962 4 5.0918 4.21799C4.71547 4.40973 4.40973 4.71547 4.21799 5.0918C4 5.51962 4 6.08009 4 7.2002V16.8002C4 17.9203 4 18.4801 4.21799 18.9079C4.40973 19.2842 4.71547 19.5905 5.0918 19.7822C5.5192 20 6.07899 20 7.19691 20H16.8031C17.921 20 18.48 20 18.9074 19.7822C19.2837 19.5905 19.5905 19.2839 19.7822 18.9076C20 18.4802 20 17.921 20 16.8031V14M16 5L10 11V14H13L19 8M16 5L19 2L22 5L19 8M16 5L19 8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </g>
                </svg>`;
      case 1:
        return `<svg>이벤트2</svg>`;
      case 2:
        return `<svg>이벤트3</svg>`;
      default:
        return `<svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="${checkColor}" version="1.1" class="checkIcon" width="100px" height="2em" viewBox="0 0 24 24">
                  <g id="File / Note_Edit">
                  <path id="Vector" d="M10.0002 4H7.2002C6.08009 4 5.51962 4 5.0918 4.21799C4.71547 4.40973 4.40973 4.71547 4.21799 5.0918C4 5.51962 4 6.08009 4 7.2002V16.8002C4 17.9203 4 18.4801 4.21799 18.9079C4.40973 19.2842 4.71547 19.5905 5.0918 19.7822C5.5192 20 6.07899 20 7.19691 20H16.8031C17.921 20 18.48 20 18.9074 19.7822C19.2837 19.5905 19.5905 19.2839 19.7822 18.9076C20 18.4802 20 17.921 20 16.8031V14M16 5L10 11V14H13L19 8M16 5L19 2L22 5L19 8M16 5L19 8" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </g>
                </svg>`;
    }
  }
}
