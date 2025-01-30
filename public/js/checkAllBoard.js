import { DateHelper } from './date-helper.js';

// 다큐먼트가 로드될 때가지 기다립니다.
document.addEventListener('DOMContentLoaded', async () => {
  const checkAllBoard = new CheckAllBoard();
  await checkAllBoard.makeAttendance();
  await checkAllBoard.dateHelper.setMoveDateEventlistener();
});

class CheckAllBoard {
  constructor() {
    this.dateHelper = new DateHelper(this);
    this.checkOnClass = 0;
    this.totalOnClass = 0;
    this.checkOnList = 0;
    this.totalOnList = 0;
    this.checkNewCount = 0;
    this.totalNewCount = 0;
  }

  // 출석부를 만듭니다.
  async makeAttendance() {
    await this.dateHelper.wrapDate(this.dateHelper.date);
    await this.simulateLoading();
    await this.getBoard(this.dateHelper.date);
    await this.stopLoading();
  }

  // 학년, 반, 날짜에 따른 출석부를 가져옵니다.
  async getBoard(date) {
    const data = await fetch(`/board/viewAllBoard/${date}`);
    const response = await data.json();
    await this.wrapBoard(response.data);
    this.wrapBottomButton();
  }

  // 출석부를 div로 만들어서 wrapAttendance에 넣습니다.
  wrapBoard(item) {
    const attendanceDiv = document.querySelector('.wrapAttendance');
    // 기존에 있던 div들을 지웁니다.
    attendanceDiv.innerHTML = '';
    // div뿌리기
    const totalGrade = 3;
    const totalClass = {
      1: 6,
      2: 5,
      3: 4,
    };
    for (let a = 1; a <= totalGrade; a++) {
      for (let b = 1; b <= totalClass[a]; b++) {
        if (item.checkedCount[a][b]['totalCount'] === 0) {
          continue;
        }
        const div = `
        <div class="attendanceDiv" data-grade="${a}" data-class="${b}">
          <a class="name" href="/attendance?grade=${a}&class=${b}">${a}학년 ${b}반</a>
          <div class="OnListCount">${item.checkedCount[a][b]['onListCount']}/${item.totalCount[a][b]['onListCount']}
            <span style="font-weight:400; font-size:0.8em; color:#59c1d5;">${Math.floor((item.checkedCount[a][b]['onListCount'] * 100) / item.totalCount[a][b]['onListCount'])}%</span>
          </div>
          <div class="NewCount">${item.checkedCount[a][b]['newListCount']}/${item.totalCount[a][b]['newListCount']}</div>
          <div class="totalCount">${item.checkedCount[a][b]['totalCount']}/${item.totalCount[a][b]['totalCount']}
            <span style="font-weight:400; font-size:0.8em; color:#59c1d5;">${Math.floor((item.checkedCount[a][b]['totalCount'] * 100) / item.totalCount[a][b]['totalCount'])}%</span>
          </div>
        </div>
        `;
        attendanceDiv.innerHTML += div;
      }
    }

    const totalDiv = `
      <div class="totalDiv">
        <div class="name">전체카운트</div>
        <div class="OnListCount">${item.checkedCount['onListCount']['totalCount']}/${item.totalCount['onListCount']['totalCount']}
          <span style="font-weight:400; font-size:0.8em; color:#59c1d5;">${Math.floor((item.checkedCount['onListCount']['totalCount'] * 100) / item.totalCount['onListCount']['totalCount'])}%</span>
        </div>
        <div class="NewCount">${item.checkedCount['newListCount']['totalCount']}/${item.totalCount['newListCount']['totalCount']}</div>
        <div class="totalCount">${item.checkedCount['totalCount']}/${item.totalCount['totalCount']}
          <span style="font-weight:400; font-size:0.8em; color:#59c1d5;">${Math.floor((item.checkedCount['totalCount'] * 100) / item.totalCount['totalCount'])}%</span>
        </div>
      </div>
      <div class="totalDiv">
        <div class="name">남자카운트</div>
        <div class="OnListCount">${item.checkedCount['onListCount']['maleCount']}/${item.totalCount['onListCount']['maleCount']}
          <span style="font-weight:400; font-size:0.8em; color:#59c1d5;">${Math.floor((item.checkedCount['onListCount']['maleCount'] * 100) / item.totalCount['onListCount']['maleCount'])}%</span>
        </div>
        <div class="NewCount">${item.checkedCount['newListCount']['maleCount']}/${item.totalCount['newListCount']['maleCount']}</div>
        <div class="totalCount">${item.checkedCount['onListCount']['maleCount'] + item.checkedCount['newListCount']['maleCount']}/${item.totalCount['onListCount']['maleCount'] + item.totalCount['newListCount']['maleCount']}
          <span style="font-weight:400; font-size:0.8em; color:#59c1d5;">${Math.floor(((item.checkedCount['onListCount']['maleCount'] + item.checkedCount['newListCount']['maleCount']) * 100) / (item.totalCount['onListCount']['maleCount'] + item.totalCount['newListCount']['maleCount']))}%</span>
        </div>
      </div>
      <div class="totalDiv">
        <div class="name">여자카운트</div>
        <div class="OnListCount">${item.checkedCount['onListCount']['femaleCount']}/${item.totalCount['onListCount']['femaleCount']}
          <span style="font-weight:400; font-size:0.8em; color:#59c1d5;">${Math.floor((item.checkedCount['onListCount']['femaleCount'] * 100) / item.totalCount['onListCount']['femaleCount'])}%</span>
        </div>
        <div class="NewCount">${item.checkedCount['newListCount']['femaleCount']}/${item.totalCount['newListCount']['femaleCount']}</div>
        <div class="totalCount">${item.checkedCount['onListCount']['femaleCount'] + item.checkedCount['newListCount']['femaleCount']}/${item.totalCount['onListCount']['femaleCount'] + item.totalCount['newListCount']['femaleCount']}
          <span style="font-weight:400; font-size:0.8em; color:#59c1d5;">${Math.floor(((item.checkedCount['onListCount']['femaleCount'] + item.checkedCount['newListCount']['femaleCount']) * 100) / (item.totalCount['onListCount']['femaleCount'] + item.totalCount['newListCount']['femaleCount']))}%</span>
        </div>
      </div>
    `;
    attendanceDiv.innerHTML += totalDiv;
  }

  // 홈버튼을 만듭니다.
  wrapBottomButton() {
    const attendanceDiv = document.querySelector('.wrapAttendance');
    const div = `
    <div id="makeStudentModalButton" class="bottomDiv">
      <a class="goToHome" href="/">🏠 홈으로가기</a>
      <a class="goToHome" href="https://forms.gle/P6FSyJBXSMoMjjUx6">📝 목양관리</a>
    </div>
    `;
    attendanceDiv.innerHTML += div;
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
}
