import { DateHelper } from './date-helper.js';
import { ModalHelper } from './modal-helper.js';

// 다큐먼트가 로드될 때가지 기다립니다.
document.addEventListener('DOMContentLoaded', async () => {
  const attendance = new Attendance();
  await attendance.wrapClassDiv();
  await attendance.makeAttendance();
  await attendance.dateHelper.setMoveDateEventlistener();
});

class Attendance {
  constructor() {
    this.dateHelper = new DateHelper(this);
    this.modalHelper = new ModalHelper(this);
    this.grade = parseInt(
      new URLSearchParams(window.location.search).get('grade'),
    );
    this.classNum = parseInt(
      new URLSearchParams(window.location.search).get('class'),
    );
    this.checkOnClass = 0;
    this.totalOnClass = 0;
    this.checkOnList = 0;
    this.totalOnList = 0;
    this.checkNewCount = 0;
    this.totalNewCount = 0;
    this.isRequestInProcess = false;
  }

  // 학년, 반, 선생님 이름을 div로 만들어서 wrapGrade에 넣습니다.
  async wrapClassDiv() {
    // parameter에서 grade를 가져옵니다.
    // 선생님 이름을 가져옵니다.
    const teacherName = this.makeTeacher(this.grade, this.classNum);

    const gradeDiv = document.querySelector('.wrapGrade');
    const div = `
    <div class="gradeDiv contentText"><h2>🐤 ${this.grade}학년 ${this.classNum}반 ${teacherName}선생님</h2></div>
    `;
    gradeDiv.innerHTML = div;
  }

  // 출석부를 만듭니다.
  async makeAttendance() {
    await this.dateHelper.wrapDate(this.dateHelper.date);
    await this.simulateLoading();
    await this.getBoard(this.grade, this.classNum, this.dateHelper.date);
    await this.stopLoading();
  }

  // 학년, 반에 따른 선생님을 만듭니다.
  makeTeacher(grade, classNum) {
    let teacherName = '';
    switch (grade) {
      case 1:
        switch (classNum) {
          case 1:
            teacherName = '전은경';
            break;
          case 2:
            teacherName = '이은진';
            break;
          case 3:
            teacherName = '최현미';
            break;
          case 4:
            teacherName = '홍사성';
            break;
          case 5:
            teacherName = '허은성';
            break;
          case 6:
            teacherName = '함석주';
            break;
          default:
            console.log('반 정보가 잘못되었습니다.');
        }
        break;
      case 2:
        switch (classNum) {
          case 1:
            teacherName = '문민욱';
            break;
          case 2:
            teacherName = '한미연';
            break;
          case 3:
            teacherName = '소양신';
            break;
          case 4:
            teacherName = '김두환';
            break;
          default:
            console.log('반 정보가 잘못되었습니다.');
        }
        break;
      case 3:
        switch (classNum) {
          case 1:
            teacherName = '소담희';
            break;
          case 2:
            teacherName = '최재혁';
            break;
          case 3:
            teacherName = '윤지성';
            break;
          case 4:
            teacherName = '임신배';
            break;
          default:
            console.log('반 정보가 잘못되었습니다.');
        }
      default:
        console.log('학년 정보가 잘못되었습니다.');
    }
    return teacherName;
  }

  // 학년, 반, 날짜에 따른 출석부를 가져옵니다.
  async getBoard(grade, classNum, date) {
    const data = await fetch(
      `/board/viewBoard/${date}/${parseInt(grade)}/${parseInt(classNum)}`,
    );
    const response = await data.json();
    for (let i = 0; i < response.data.length; i++) {
      this.modalHelper.students[response.data[i].id] = response.data[i];
    }
    this.wrapAttendance(response.data);
    this.wrapAddStudentButton();
    this.wrapBottomButton();
    this.setStudentEventListener();
    this.setEventCheckEventListener();
    this.modalHelper.setAddStudentModalEventListener();
    this.modalHelper.addNameEventListener();
    this.modalHelper.addSaveAndAddStudentEventListener();
    this.modalHelper.addFollowEventListener();
  }

  // 출석부를 div로 만들어서 wrapAttendance에 넣습니다.
  wrapAttendance(items) {
    const attendanceDiv = document.querySelector('.wrapAttendance');
    // 기존에 있던 div들을 지웁니다.
    attendanceDiv.innerHTML = '';

    // 카운트를 위해 변수 초기화합니다.
    let checkOnClass = 0;
    let totalOnClass = 0;
    let checkOnList = 0;
    let totalOnList = 0;
    let checkNewCount = 0;
    let totalNewCount = 0;

    items.forEach((item) => {
      totalOnClass += 1;
      let check = 0;
      if (item.board_check !== null) {
        if (item.board_check) {
          check = item.board_check;
          checkOnClass++;
          if (item.is_on_list) {
            checkOnList++;
          } else {
            checkNewCount++;
          }
        }
      }
      if (item.is_on_list) {
        totalOnList++;
      } else {
        totalNewCount++;
      }

      // div뿌리기
      const name = item.name;
      const checkColor = check ? '#FF0000' : '#CCCCCC';
      const checkSvg = `
        <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" fill="${checkColor}" version="1.1" class="checkIcon" width="2em" height="2em" viewBox="0 0 305.002 305.002" xml:space="preserve">
          <g>
            <g>
              <path d="M152.502,0.001C68.412,0.001,0,68.412,0,152.501s68.412,152.5,152.502,152.5c84.089,0,152.5-68.411,152.5-152.5    S236.591,0.001,152.502,0.001z M152.502,280.001C82.197,280.001,25,222.806,25,152.501c0-70.304,57.197-127.5,127.502-127.5    c70.304,0,127.5,57.196,127.5,127.5C280.002,222.806,222.806,280.001,152.502,280.001z"/>
              <path d="M218.473,93.97l-90.546,90.547l-41.398-41.398c-4.882-4.881-12.796-4.881-17.678,0c-4.881,4.882-4.881,12.796,0,17.678    l50.237,50.237c2.441,2.44,5.64,3.661,8.839,3.661c3.199,0,6.398-1.221,8.839-3.661l99.385-99.385    c4.881-4.882,4.881-12.796,0-17.678C231.269,89.089,223.354,89.089,218.473,93.97z"/>
            </g>
          </g>
        </svg>
        `;
      const organizationId = item.organizationId;
      let eventDiv = '';
      if (item.event.length > 0) {
        eventDiv = `<div class="eventDiv">`;
        item.event.forEach((event) => {
          const eventSvg = this.getEventSvg(event.type, event.check);
          eventDiv += `
            <div class="eventCheck" data-eventId="${event.id}" data-eventType="${event.type}" data-eventCheckId="${event.eventCheckId}" data-organizationId="${organizationId}" data-content="${event.check}">${eventSvg}</div>
          `;
        });
        eventDiv += `</div>`;
      }
      const userId = item.id;
      const checkId = item.checkId;
      const isOnList = item.is_on_list;
      const isNew = item.is_new;
      let addedSpan = '';
      if (isNew) {
        addedSpan += `&nbsp;<span class="codeGreen">새친구</span>`;
      }
      if (isNew && isOnList) {
        addedSpan += `&nbsp;<span class="codeGreen">재적포함</span>`;
      }
      const div = `
        <div class="attendanceDiv">
          <div class="name" data-userId="${userId}" data-organizationId="${organizationId}">🐤 ${name} ${addedSpan}</div>
          <div class="checkAndEventDiv">
            <div class="check" data-checkId="${checkId}" data-isOnList="${isOnList}" data-organizationId="${organizationId}">${checkSvg}</div>
            ${eventDiv}
          </div>
        </div>
      `;
      attendanceDiv.innerHTML += div;
    });

    // 숫자를 적용합니다.
    this.totalOnClass = totalOnClass;
    this.checkOnClass = checkOnClass;
    this.totalOnList = totalOnList;
    this.checkOnList = checkOnList;
    this.totalNewCount = totalNewCount;
    this.checkNewCount = checkNewCount;

    this.wrapSumCount();
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
    document.querySelector('.checkOnClass').innerText = this.checkOnClass;
    document.querySelector('.totalOnClass').innerText = this.totalOnClass;
    document.querySelector('.checkOnList').innerText = this.checkOnList;
    document.querySelector('.totalOnList').innerText = this.totalOnList;
    document.querySelector('.checkNewCount').innerText = this.checkNewCount;
    document.querySelector('.totalNewCount').innerText = this.totalNewCount;
  }

  // 학생의 출석을 체크하는 이벤트리스너를 설정합니다.
  setStudentEventListener() {
    const checkDivArray = document.querySelectorAll('.check');
    checkDivArray.forEach((checkDiv) => {
      checkDiv.addEventListener('click', async (event) => {
        // event가 일어난 node의 상위노드중 자신을 포함한 가장 가까운 div를 찾습니다.
        const targetDiv = event.target.closest('.check');
        const checkId = targetDiv.dataset.checkid;
        const isOnList = targetDiv.dataset.isonlist;
        const organizationId = targetDiv.dataset.organizationid;
        const response = await this.boardCheck(checkId, organizationId);
        if (response.data !== 0) {
          // targetDiv 아래 svg의 fill을 FF0000으로 바꿉니다.
          targetDiv.querySelector('svg').setAttribute('fill', '#FF0000');
          this.changeCount(1, isOnList);
          if (response.data !== 1) {
            targetDiv.dataset.checkid = response.data;
          }
        } else {
          // targetDiv 아래 svg의 fill을 #CCCCCC으로 바꿉니다.
          targetDiv.querySelector('svg').setAttribute('fill', '#CCCCCC');
          this.changeCount(response.data, isOnList);
        }
      });
    });
    // 수정버튼 누르면 학생정보 수정
  }

  // 학생의 이벤트를 체크하는 이벤트리스너를 설정합니다.
  setEventCheckEventListener() {
    const checkDivArray = document.querySelectorAll('.eventCheck');
    checkDivArray.forEach((checkDiv) => {
      checkDiv.addEventListener('click', async (event) => {
        // event가 일어난 node의 상위노드중 자신을 포함한 가장 가까운 div를 찾습니다.
        const targetDiv = event.target.closest('.eventCheck');
        const eventId = parseInt(targetDiv.dataset.eventid);
        const eventCheckId = parseInt(targetDiv.dataset.eventcheckid);
        const organizationId = parseInt(targetDiv.dataset.organizationid);
        const eventType = parseInt(targetDiv.dataset.eventtype);
        let content = '';
        if (eventType !== 0) {
          content = '';
        } else {
          const check = parseInt(targetDiv.dataset.content);
          content = check === 1 ? 0 : 1;
        }
        const response = await this.eventCheck(
          eventId,
          eventCheckId,
          organizationId,
          content,
        );
        console.log(response);
        targetDiv.dataset.content = response.data.content;
        targetDiv.dataset.eventcheckid = response.data.id;
        if (response.data.content === 1) {
          // targetDiv 아래 svg의 stroke을 FF0000으로 바꿉니다.
          targetDiv.querySelector('svg').setAttribute('stroke', '#FF0000');
        } else {
          // targetDiv 아래 svg의 stroke을 #CCCCCC으로 바꿉니다.
          targetDiv.querySelector('svg').setAttribute('stroke', '#CCCCCC');
        }
      });
    });
    // 수정버튼 누르면 학생정보 수정
  }

  // 출석을 체크합니다.
  async boardCheck(checkId, organizationId) {
    if (this.isRequestInProcess) {
      alert('🥲이전 출첵을 처리중입니다. 🙏잠시만 기다려주세요.');
      return;
    }
    this.isRequestInProcess = true;

    try {
      if (checkId !== 'null') {
        const data = await fetch(`/board/checkAttendance/${checkId}`, {
          method: 'PATCH',
        });
        const response = await data.json();
        this.isRequestInProcess = false;
        return response;
      } else {
        const body = {
          date: this.dateHelper.date,
        };
        const data = await fetch(`/board/makeAttendance/${organizationId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
        });
        const response = await data.json();
        this.isRequestInProcess = false;
        return response;
      }
    } catch (error) {
      this.isRequestInProcess = false;
      console.error('Error:', error);
    }
  }

  // 이벤트를 체크합니다.
  async eventCheck(eventId, eventCheckId, organizationId, content) {
    if (this.isRequestInProcess) {
      alert('🥲이전 이벤트를 처리중입니다. 🙏잠시만 기다려주세요.');
      return;
    }
    this.isRequestInProcess = true;

    try {
      if (eventCheckId !== 0) {
        const body = {
          content: content,
          eventId: eventId,
          organizationId: organizationId,
          date: this.dateHelper.date,
        };
        const data = await fetch(`/event/updateEvent/${eventCheckId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
        });
        const response = await data.json();
        this.isRequestInProcess = false;
        return response;
      } else {
        const body = {
          eventId: eventId,
          organizationId: organizationId,
          content: content,
          date: this.dateHelper.date,
        };
        const data = await fetch(`/event/makeEvent`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
        });
        const response = await data.json();
        this.isRequestInProcess = false;
        return response;
      }
    } catch (error) {
      this.isRequestInProcess = false;
      console.error('Error:', error);
    }
  }

  // 출석을 체크할 때마다 카운트를 바꿉니다.
  changeCount(data, isOnList) {
    if (data === 1) {
      this.checkOnClass += 1;
      if (isOnList === '1') {
        this.checkOnList += 1;
      } else {
        this.checkNewCount += 1;
      }
    } else {
      this.checkOnClass -= 1;
      if (isOnList === '1') {
        this.checkOnList -= 1;
      } else {
        this.checkNewCount -= 1;
      }
    }
    this.wrapSumCount();
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
