export class DateHelper {
  constructor(item) {
    this.date = this.makeDate(this.date);
    this.attendance = item;
    this.year = this.makeYear(this.date);
    this.startYear = 2024;
    this.endYear = 2025;
  }
  // date를 yyyy-mm-dd string 형식으로 바꿉니다.
  makeDate(date) {
    // 오늘이 일요일이 아니면 가장 직전의 일요일을 가져옵니다.
    let sundayString = '';
    if (!date) {
      // 기본 변수 선언
      const today = new Date();
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
      // 오늘이 일요일이아니거나 12월 25일이 아니면 가장 직전의 일요일을 가져옵니다.
      if (
        todayDay !== 0 &&
        todayString.split('-')[1] !== '12' &&
        todayString.split('-')[2] !== '25'
      ) {
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

  // year를 생성합니다.
  makeYear(date) {
    // date를 yyyy-mm-dd string 형식으로 바꿉니다.
    const year = date.split('-')[0];
    return parseInt(year);
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

  // year를 div로 만들어서 wrapDate에 넣습니다.
  wrapYear(year) {
    const dateDiv = document.querySelector('.wrapDate');
    const div = `
    <div class="goToBeforeYear">◀️</div>
    <select class="yearDiv year-only">
      ${this.generateYearOptions()}
    </select>
    <div class="goToAfterYear">▶️</div>
    `;
    dateDiv.innerHTML = div;
    const yearDiv = document.querySelector('.yearDiv');
    yearDiv.value = year;
  }

  // generateYearOptions 메서드 추가
  generateYearOptions() {
    let options = '';
    for (let year = this.startYear; year <= this.endYear; year++) {
      options += `<option value="${year}">${year}</option>`;
    }
    return options;
  }

  // 이전년도로 이동합니다.
  async goToBeforeYear() {
    // this.date를 date객체로 바꾸고 thisYear로 선언합니다.
    const thisYear = this.year;
    if (thisYear <= this.startYear) {
      return;
    }
    // thisYear를 1년 전으로 바꿉니다.
    const beforeYear = thisYear - 1;
    this.year = beforeYear;
    // .yearDiv의 value를 thisYear로 바꿉니다.
    const yearDiv = document.querySelector('.yearDiv');
    yearDiv.value = beforeYear;
    this.attendance.makeNewFriend();
  }

  // 다음년도로 이동합니다.
  async goToAfterYear() {
    // this.date를 date객체로 바꾸고 thisYear로 선언합니다.
    const thisYear = this.year;
    if (thisYear >= this.endYear) {
      return;
    }

    // 현재 연도에서 1년 더하기
    const afterYear = this.year + 1;
    this.year = afterYear;

    // .yearDiv의 value를 afterYear로 변경
    const yearDiv = document.querySelector('.yearDiv');
    yearDiv.value = afterYear;

    this.attendance.makeNewFriend();
  }

  // 이전주로 이동합니다.
  async goToBeforeWeek() {
    // this.date를 date객체로 바꾸고 thisDate로 선언합니다.
    const thisDate = new Date(this.date);
    // thisDate를 7일 전으로 바꿉니다.
    // this.date가 12월 25일이 아니라면 7일 전으로 바꿉니다.
    if (this.date.split('-')[1] !== '12' && this.date.split('-')[2] !== '25') {
      const beforeWeek = new Date(
        thisDate.setDate(thisDate.getDate() - 7),
      ).toISOString();
      const beforeWeekString = beforeWeek.split('T')[0];
      this.date = beforeWeekString;
      this.wrapDate(beforeWeekString);
      this.attendance.makeAttendance();
      this.setMoveDateEventlistener();
      return;
    } else {
      // this.date가 일요일인지 확인합니다.
      const todayDay = thisDate.getDay();
      // this.date가 일요일이라면 7일 전으로 바꿉니다.
      if (todayDay === 0) {
        const beforeWeek = new Date(
          thisDate.setDate(thisDate.getDate() - 7),
        ).toISOString();
        const beforeWeekString = beforeWeek.split('T')[0];
        this.date = beforeWeekString;
        this.wrapDate(beforeWeekString);
        this.attendance.makeAttendance();
        this.setMoveDateEventlistener();
        return;
      } else {
        // 아닐경우 가장 가까운 과거의 일요일로 바꿉니다.
        const yearSundayArray = this.makeYearSundayArray();
        const todayString = thisDate
          .toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            timeZone: 'Asia/Seoul',
          })
          .split('. ')
          .map((part) => part.replace('.', '').padStart(2, '0'))
          .join('-');
        const todayIndex = yearSundayArray.indexOf(todayString);
        const beforeWeek = yearSundayArray[todayIndex - 1];
        this.date = beforeWeek;
        this.wrapDate(beforeWeek);
        this.attendance.makeAttendance();
        this.setMoveDateEventlistener();
        return;
      }
    }
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
    // if (event.target.value > today) {
    //   alert('오늘 이후로는 선택할 수 없어요!');
    //   dateDiv.value = this.date;
    //   return;
    // }

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

  // 연도를 이동하는 이벤트리스너를 설정합니다.
  setMoveYearEventlistener() {
    const beforeYear = document.querySelector('.goToBeforeYear');
    // this.year가 startYear라면 beforeYear를 비활성화합니다.
    beforeYear.addEventListener('click', () => {
      this.goToBeforeYear();
    });
    // this.year가 endYear라면 afterYear를 비활성화합니다.
    const afterYear = document.querySelector('.goToAfterYear');
    afterYear.addEventListener('click', () => {
      this.goToAfterYear();
    });
    // yearDiv에 change 이벤트를 추가합니다.
    const yearDiv = document.querySelector('.yearDiv');
    yearDiv.addEventListener('change', (event) => {
      this.year = parseInt(event.target.value);
      this.attendance.makeNewFriend();
      this.setMoveYearEventlistener();
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

  makeYearSundayArrayForAllYearBoards(year) {
    // 올해를 기준으로 1월 첫번째 일요일부터 12월 마지막 일요일까지의 모든 일요일 날짜를 배열로 만듭니다.
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
