export class DateHelper {
  constructor(item) {
    this.date = this.makeDate(this.date);
    this.attendance = item;
  }
  // date를 yyyy-mm-dd string 형식으로 바꿉니다.
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
      } else if (todayString >= '2024-12-22' && todayString <= '2024-12-25') {
        // 만약 오늘이 12.22~12.25 사이라면 12.25를 가져옵니다.
        sundayString = '2024-12-25';
      } else {
        sundayString = todayString;
      }
    } else {
      sundayString = date;
    }

    return sundayString;
  }

  // date를 div로 만들어서 wrapDate에 넣습니다.
  wrapDate(date) {
    const dateDiv = document.querySelector('.wrapDate');
    const div = `
    <div class="goToBeforeWeek">◀️</div>
    <input type="date" class="dateDiv" value="${date}"></input>
    <div class="goToAfterWeek">▶️</div>
    `;
    dateDiv.innerHTML = div;
  }

  // 이전주로 이동합니다.
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
    this.attendance.makeAttendance();
    this.setMoveDateEventlistener();
  }

  // 다음주로 이동합니다.
  async goToAfterWeek() {
    const dateObj = new Date(this.date);
    const afterWeek = new Date(
      dateObj.setDate(dateObj.getDate() + 7),
    ).toISOString();
    const afterWeekString = afterWeek.split('T')[0];
    this.date = afterWeekString;
    this.wrapDate(afterWeekString);
    this.attendance.makeAttendance();
    this.setMoveDateEventlistener();
  }

  // 선택한 주로 이동합니다.
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
    this.attendance.makeAttendance();
    this.setMoveDateEventlistener();
  }

  // 날짜를 이동하는 이벤트리스너를 설정합니다.
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

  // 7일 뒤가 today보다 크다면 afterWeek를 비활성화합니다.
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

  makeYearSundayArray() {
    // 올해를 기준으로 1월 첫번째 일요일부터 12월 마지막 일요일까지의 모든 일요일 날짜를 배열로 만듭니다.
    const today = new Date();
    const year = today.getFullYear();
    const yearDateArray = [];
    for (let month = 0; month < 12; month++) {
      const lastDay = new Date(year, month + 1, 0);
      for (let day = 1; day <= lastDay.getDate(); day++) {
        const date = new Date(year, month, day);
        // date를 'yyyy-mm-dd' string으로 바꿉니다.
        const formattedDate = date
          .toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            timeZone: 'Asia/Seoul',
          })
          .split('. ')
          .map((part) => part.replace('.', '').padStart(2, '0'))
          .join('-');
        const dayOfWeek = date.getDay();
        if (dayOfWeek === 0 || formattedDate === '2024-12-25') {
          yearDateArray.push(formattedDate);
        }
      }
    }
    return yearDateArray;
  }
}
