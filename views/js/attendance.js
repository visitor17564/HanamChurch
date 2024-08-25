// 다큐먼트가 로드될 때가지 기다립니다.
document.addEventListener('DOMContentLoaded', async () => {
  const attendance = new Attendance();
  await attendance.wrapClassDiv();
  await attendance.makeAttendance();
  await attendance.setMoveDateEventlistener();
});

class Attendance {
  constructor() {
    this.grade = parseInt(
      new URLSearchParams(window.location.search).get('grade'),
    );
    this.classNum = parseInt(
      new URLSearchParams(window.location.search).get('class'),
    );
    this.date = this.makeDate(this.date);
    this.checkOnClass = 0;
    this.totalOnClass = 0;
    this.checkOnList = 0;
    this.totalOnList = 0;
    this.checkNewCount = 0;
    this.totalNewCount = 0;
  }

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

  async makeAttendance() {
    await this.wrapDate(this.date);
    await this.simulateLoading();
    await this.getBoard(this.grade, this.classNum, this.date);
    await this.stopLoading();
  }

  makeTeacher(grade, classNum) {
    let teacherName = '';
    switch (grade) {
      case 1:
        switch (classNum) {
          case 1:
            teacherName = '문민욱';
            break;
          case 2:
            teacherName = '허은성';
            break;
          case 3:
            teacherName = '한미연';
            break;
          case 4:
            teacherName = '박창용';
            break;
          case 5:
            teacherName = '소양신';
            break;
          case 6:
            teacherName = '김두환';
            break;
          default:
            console.log('반 정보가 잘못되었습니다.');
        }
        break;
      case 2:
        switch (classNum) {
          case 1:
            teacherName = '박인영';
            break;
          case 2:
            teacherName = '최재혁';
            break;
          case 3:
            teacherName = '조성욱, 최익도';
            break;
          case 4:
            teacherName = '함석주';
            break;
          case 5:
            teacherName = '임신배';
            break;
          default:
            console.log('반 정보가 잘못되었습니다.');
        }
        break;
      case 3:
        switch (classNum) {
          case 1:
            teacherName = '최현미';
            break;
          case 2:
            teacherName = '윤지성';
            break;
          case 3:
            teacherName = '홍사성';
            break;
          default:
            console.log('반 정보가 잘못되었습니다.');
        }
      default:
        console.log('학년 정보가 잘못되었습니다.');
    }
    return teacherName;
  }

  async getBoard(grade, classNum, date) {
    const data = await fetch(
      `http://localhost:3000/board/viewBoard/${date}/${parseInt(grade)}/${parseInt(classNum)}`,
    );
    const response = await data.json();
    console.log(response);
    this.wrapAttendance(response.data);
    this.setStudentEventListener();
    this.addNameEventListener();
  }

  makeDate(date) {
    // 오늘이 일요일이 아니면 가장 직전의 일요일을 가져옵니다.
    let sundayString = '';
    if (!date) {
      const today = new Date();
      // 오늘이 일요일이 아니면 가장 직전의 일요일을 가져옵니다.
      const todayDay = today.getDay();
      const todayString = today
        .toLocaleDateString('ko-KR', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          timeZone: 'Asia/Seoul',
        })
        .split('. ')
        .map((part) => part.replace('.', '').padStart(2, '0'))
        .join('-');
      if (todayDay !== 0) {
        const sunday = new Date(
          today.setDate(today.getDate() - todayDay),
        ).toLocaleDateString('ko-KR', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          timeZone: 'Asia/Seoul',
        });
        // sunday를 yyyy-mm-dd string 형식으로 바꿉니다.
        const [year, month, day] = sunday
          .split('. ')
          .map((part) => part.replace('.', '').padStart(2, '0'));
        sundayString = `${year}-${month}-${day}`;
      } else {
        sundayString = todayString;
      }
    } else {
      sundayString = date;
    }

    return sundayString;
  }

  wrapDate(date) {
    const dateDiv = document.querySelector('.wrapDate');
    const div = `
    <div class="goToBeforeWeek">◀️</div>
    <input type="date" class="dateDiv" value="${date}"></input>
    <div class="goToAfterWeek">▶️</div>
    `;
    dateDiv.innerHTML = div;
  }

  async goToBeforeWeek() {
    // this.date를 date객체로 바꾸고 thisDate로 선언합니다.
    const thisDate = new Date(this.date);
    // thisDate를 7일 뒤로 바꿉니다.
    const beforeWeek = new Date(
      thisDate.setDate(thisDate.getDate() - 7),
    ).toISOString();
    const beforeWeekString = beforeWeek.split('T')[0];
    this.date = beforeWeekString;
    this.wrapDate(beforeWeekString);
    this.makeAttendance();
    this.setMoveDateEventlistener();
  }

  async goToAfterWeek() {
    const dateObj = new Date(this.date);
    const afterWeek = new Date(
      dateObj.setDate(dateObj.getDate() + 7),
    ).toISOString();
    const afterWeekString = afterWeek.split('T')[0];
    this.date = afterWeekString;
    this.wrapDate(afterWeekString);
    this.makeAttendance();
    this.setMoveDateEventlistener();
  }

  async goToThisWeek(event, dateDiv) {
    // 만약 dateDiv.value가 일요일이 아니라면 일요일로 바꿉니다.
    const dateObj = new Date(event.target.value);
    const day = dateObj.getDay();
    if (day !== 0) {
      alert('주일만 선택 가능해요!');
      dateDiv.value = this.date;
      return;
    }
    // 만약 day가 오늘보다 미래라면 오늘로 바꿉니다.
    const today = new Date().toISOString();
    if (event.target.value > today) {
      alert('오늘 이후로는 선택할 수 없어요!');
      dateDiv.value = this.date;
      return;
    }

    this.date = dateDiv.value;
    this.wrapDate(this.date);
    this.makeAttendance();
    this.setMoveDateEventlistener();
  }

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
      if (item.board_check.data[0] === 1) {
        checkOnClass++;
        if (item.is_on_list.data[0] === 1) {
          checkOnList++;
        } else {
          checkNewCount++;
        }
      }
      if (item.is_on_list.data[0] === 1) {
        totalOnList++;
      } else {
        totalNewCount++;
      }

      // div뿌리기
      const name = item.name;
      const check = item.board_check.data[0];
      const checkColor = check ? 'green' : 'gray';
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
      const userId = item.userId;
      const organizationId = item.organizationId;
      const checkId = item.id;
      const isOnList = item.is_on_list.data[0];
      let newFriendSpan = '';
      if (!isOnList) {
        newFriendSpan = `&nbsp;<span class="codeGreen">새친구</span>`;
      }
      const div = `
      <div class="attendanceDiv">
        <div class="name" data-userId="${userId}" data-organizationId="${organizationId}">🐤 ${name} ${newFriendSpan}</div>
        <div class="check" data-checkId="${checkId}" data-isOnList="${isOnList}">${checkSvg}</div>
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

  async wrapSumCount() {
    document.querySelector('.checkOnClass').innerText = this.checkOnClass;
    document.querySelector('.totalOnClass').innerText = this.totalOnClass;
    document.querySelector('.checkOnList').innerText = this.checkOnList;
    document.querySelector('.totalOnList').innerText = this.totalOnList;
    document.querySelector('.checkNewCount').innerText = this.checkNewCount;
    document.querySelector('.totalNewCount').innerText = this.totalNewCount;
  }

  setMoveDateEventlistener() {
    const beforeWeek = document.querySelector('.goToBeforeWeek');
    beforeWeek.addEventListener('click', () => {
      this.goToBeforeWeek();
    });
    // 만약 this.date보다 7일 뒤가 today보다 크다면 afterWeek를 비활성화합니다.
    const check = this.checkAfterWeek();
    if (check) {
      const afterWeek = document.querySelector('.goToAfterWeek');
      afterWeek.addEventListener('click', () => {
        this.goToAfterWeek();
      });
    }
    const dateDiv = document.querySelector('.dateDiv');
    dateDiv.addEventListener('change', (event) => {
      this.goToThisWeek(event, dateDiv);
    });
  }

  checkAfterWeek() {
    // this.date를 date객체로 바꾸고 thisDate로 선언합니다.
    const thisDate = new Date(this.date);
    // thisDate를 7일 뒤로 바꿉니다.
    const afterWeek = new Date(
      thisDate.setDate(thisDate.getDate() + 7),
    ).toISOString();
    // 오늘 날짜를 today로 선언합니다.
    const today = new Date().toISOString();
    // 만약 this.date보다 7일 뒤가 today보다 크다면 afterWeek를 비활성화합니다.
    if (afterWeek > today) {
      const afterWeekDiv = document.querySelector('.goToAfterWeek');
      afterWeekDiv.style.color = 'gray';
      return false;
    }
    return true;
  }

  setStudentEventListener() {
    const checkDivArray = document.querySelectorAll('.check');
    checkDivArray.forEach((checkDiv) => {
      checkDiv.addEventListener('click', async (event) => {
        // event가 일어난 node의 상위노드중 자신을 포함한 가장 가까운 div를 찾습니다.
        const targetDiv = event.target.closest('.check');
        const checkId = targetDiv.dataset.checkid;
        const isOnList = targetDiv.dataset.isonlist;
        const response = await this.boardCheck(checkId);
        if (response.data === 1) {
          // targetDiv 아래 svg의 fill을 green으로 바꿉니다.
          targetDiv.querySelector('svg').setAttribute('fill', 'green');
          this.changeCount(response.data, isOnList);
        } else {
          // targetDiv 아래 svg의 fill을 gray으로 바꿉니다.
          targetDiv.querySelector('svg').setAttribute('fill', 'gray');
          this.changeCount(response.data, isOnList);
        }
      });
    });
  }

  async boardCheck(checkId) {
    const data = await fetch(
      `http://localhost:3000/board/checkAttendance/${checkId}`,
      {
        method: 'PATCH',
      },
    );
    const response = await data.json();
    return response;
  }

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

  simulateLoading() {
    const exBox = document.querySelector('.ex-box');
    const loadingSpinner = document.querySelector('.loading-wrap--js');
    const loadingMessage = document.getElementById('loadingMessage');

    // 로딩 시작
    exBox.style.display = 'block';
    loadingSpinner.style.display = 'flex';
    loadingMessage.textContent = '로딩 중이에요!';
  }

  stopLoading() {
    const exBox = document.querySelector('.ex-box');

    // 로딩 종료
    exBox.style.display = 'none';
  }

  addNameEventListener() {
    const nameDivs = document.querySelectorAll('.name');
    nameDivs.forEach((nameDiv) => {
      nameDiv.addEventListener('click', async () => {
        this.openStudentModal();
      });
    });
    document
      .querySelector('.FLOATING_DIV_MASK')
      .addEventListener('click', () => {
        this.closeStudentModal();
      });
    document
      .getElementById('modal-close-button')
      .addEventListener('click', () => {
        this.closeStudentModal();
      });
    console.log('안끝남?');
  }

  openStudentModal() {
    document.getElementById('studentDetails').style.display = 'block';
  }

  closeStudentModal() {
    document.getElementById('studentDetails').style.display = 'none';
  }
}
