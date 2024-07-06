// 다큐먼트가 로드될 때가지 기다립니다.
document.addEventListener('DOMContentLoaded', async () => {
  const grade = parseInt(
    new URLSearchParams(window.location.search).get('grade'),
  );
  const classNum = parseInt(
    new URLSearchParams(window.location.search).get('class'),
  );
  await wrapClassDiv(grade, classNum);
  simulateLoading();
  await makeAttendance(grade, classNum);
  stopLoading();
});

function wrapClassDiv(grade, classNum) {
  // parameter에서 grade를 가져옵니다.
  // 선생님 이름을 가져옵니다.
  const teacherName = makeTeacher(grade, classNum);

  const gradeDiv = document.querySelector('.wrapGrade');
  const div = `
  <div class="gradeDiv contentText"><h2>🐤 ${grade}학년 ${classNum}반 ${teacherName}선생님</h2></div>
  `;
  gradeDiv.innerHTML = div;
}

async function makeAttendance(grade, classNum) {
  let date = new URLSearchParams(window.location.search).get('date');
  date = await makeDate(date);
  await wrapDate(date);
  await getBoard(grade, classNum, date);
}

function makeTeacher(grade, classNum) {
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

async function getBoard(grade, classNum, date) {
  const data = await fetch(
    `http://localhost:3000/board/viewBoard/${date}/${parseInt(grade)}/${parseInt(classNum)}`,
  );
  const response = await data.json();

  if (response.data[0].length === response.data[1].length) {
    wrapAttendance(response.data[1]);
  }
}

function makeDate(date) {
  // 오늘이 일요일이 아니면 가장 직전의 일요일을 가져옵니다.
  let sundayString = '';
  if (!date) {
    const today = new Date();
    const sunday = new Date(
      today.setDate(today.getDate() - today.getDay()),
    ).toISOString();
    // sunday를 yyyy-mm-dd string 형식으로 바꿉니다.
    sundayString = sunday.split('T')[0];
  } else {
    sundayString = date;
  }

  return sundayString;
}

function wrapDate(date) {
  const dateDiv = document.querySelector('.wrapDate');
  const div = `
  <div class="goToBeforeWeek">◀️</div>
  <input type="date" class="dateDiv" value="${date}"></input>
  <div class="goToAfterWeek">▶️</div>
  `;
  dateDiv.innerHTML = div;
}

function goToBeforeWeek() {
  const date = document.querySelector('.dateDiv').value;
  const dateObj = new Date(date);
  const beforeWeek = new Date(
    dateObj.setDate(dateObj.getDate() - 7),
  ).toISOString();
  const beforeWeekString = beforeWeek.split('T')[0];
  wrapDate(beforeWeekString);
}

function goToAfterWeek() {
  const date = document.querySelector('.dateDiv').value;
  const dateObj = new Date(date);
  const beforeWeek = new Date(
    dateObj.setDate(dateObj.getDate() + 7),
  ).toISOString();
  const beforeWeekString = beforeWeek.split('T')[0];
  wrapDate(beforeWeekString);
}

function wrapAttendance(items) {
  const attendanceDiv = document.querySelector('.wrapAttendance');
  items.forEach((item) => {
    const name = item.properties.name.title[0].plain_text;
    const check = item.properties.check.checkbox;
    const checkColor = check ? 'green' : 'gray';
    const checkSvg = `
      <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" fill="${checkColor}" version="1.1" id="Capa_1" width="2em" height="2em" viewBox="0 0 305.002 305.002" xml:space="preserve">
        <g>
          <g>
            <path d="M152.502,0.001C68.412,0.001,0,68.412,0,152.501s68.412,152.5,152.502,152.5c84.089,0,152.5-68.411,152.5-152.5    S236.591,0.001,152.502,0.001z M152.502,280.001C82.197,280.001,25,222.806,25,152.501c0-70.304,57.197-127.5,127.502-127.5    c70.304,0,127.5,57.196,127.5,127.5C280.002,222.806,222.806,280.001,152.502,280.001z"/>
            <path d="M218.473,93.97l-90.546,90.547l-41.398-41.398c-4.882-4.881-12.796-4.881-17.678,0c-4.881,4.882-4.881,12.796,0,17.678    l50.237,50.237c2.441,2.44,5.64,3.661,8.839,3.661c3.199,0,6.398-1.221,8.839-3.661l99.385-99.385    c4.881-4.882,4.881-12.796,0-17.678C231.269,89.089,223.354,89.089,218.473,93.97z"/>
          </g>
        </g>
      </svg>
      `;
    const id = item.id;
    const studentId = item.properties.studentId.relation[0].id;
    const div = `
    <div class="attendanceDiv" data-id="${id}" data-studentId="${studentId}">
      <div class="name">🐤 ${name}</div>
      <div class="check">${checkSvg}</div>
    </div>
    `;
    attendanceDiv.innerHTML += div;
  });
}

function simulateLoading() {
  const exBox = document.querySelector('.ex-box');
  const loadingSpinner = document.querySelector('.loading-wrap--js');
  const loadingMessage = document.getElementById('loadingMessage');

  // 로딩 시작
  exBox.style.display = 'block';
  loadingSpinner.style.display = 'flex';
  loadingMessage.textContent = '로딩 중이에요!';
}

function stopLoading() {
  const exBox = document.querySelector('.ex-box');

  // 로딩 종료
  exBox.style.display = 'none';
}
