// 다큐먼트가 로드될 때가지 기다립니다.
document.addEventListener('DOMContentLoaded', async () => {
  await wrapClassDiv();
  await getBoard();
});

function wrapClassDiv() {
  // parameter에서 grade를 가져옵니다.
  const grade = parseInt(
    new URLSearchParams(window.location.search).get('grade'),
  );
  // parameter에서 class를 가져옵니다.
  const classNum = parseInt(
    new URLSearchParams(window.location.search).get('class'),
  );
  // 선생님 이름을 가져옵니다.
  const teacherName = makeTeacher(grade, classNum);

  const gradeDiv = document.querySelector('.wrapGrade');
  const div = `
  <div class="gradeDiv contentText"><h2>🐤 ${grade}학년 ${classNum}반 ${teacherName}선생님</h2></div>
  `;
  gradeDiv.innerHTML = div;
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

async function getBoard() {
  const grade = parseInt(
    new URLSearchParams(window.location.search).get('grade'),
  );
  const classNum = parseInt(
    new URLSearchParams(window.location.search).get('class'),
  );
  const date = '2024-06-30';
  const data = await fetch(
    `http://localhost:3000/board/viewBoard/${date}/${parseInt(grade)}/${parseInt(classNum)}`,
  );
  const response = await data.json();

  if (response[0].length === response[1].length) {
  }
  console.log(response);
}
