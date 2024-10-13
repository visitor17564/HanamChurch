import { DateHelper } from './date-helper.js';

// 다큐먼트가 로드될 때가지 기다립니다.
document.addEventListener('DOMContentLoaded', async () => {
  var Grid = tui.Grid;
  const dateHelper = new DateHelper();
  const yearSundayArray = dateHelper.makeYearSundayArray();
  const checkAllYearBoard = new CheckAllYearBoard(yearSundayArray, Grid);
  await checkAllYearBoard.makeAttendance();
});

class CheckAllYearBoard {
  constructor(yearSundayArray, Grid) {
    this.yearSundayArray = yearSundayArray;
    this.Grid = Grid;
  }

  // 출석부를 만듭니다.
  async makeAttendance() {
    await this.simulateLoading();
    await this.getBoard();
    await this.stopLoading();
  }

  // 학년, 반, 날짜에 따른 출석부를 가져옵니다.
  async getBoard() {
    const data = await fetch(`/board/viewAllYearBoard/고등부/2024`);
    const response = await data.json();
    await this.wrapBoard(response.data);
  }

  // 출석부를 grid로 만들어서 wrapAttendance에 넣습니다.
  wrapBoard(item) {
    document.querySelector('.wrapAttendance').innerHTML = '';

    // grid 컬럼 설정
    const columns = [
      {
        header: '학년',
        name: 'grade',
        width: 50,
        renderer: {
          styles: {
            textAlign: 'center',
            fontWeight: 'bold',
          },
        },
        filter: 'select',
      },
      {
        header: '반',
        name: 'class',
        width: 50,
        renderer: {
          styles: {
            textAlign: 'center',
            fontWeight: 'bold',
          },
        },
        filter: 'select',
      },
      {
        header: '이름',
        name: 'name',
        width: 100,
        renderer: {
          styles: {
            textAlign: 'center',
            fontWeight: 'bold',
          },
        },
        filter: 'text',
      },
      {
        header: '총계',
        name: 'total',
        width: 100,
        renderer: {
          styles: {
            textAlign: 'center',
            fontWeight: 'bold',
          },
        },
        sortable: true,
      },
    ];

    // complex Columns 선언
    const complexColumns = [];

    // 컬럼에 날짜 추가
    this.yearSundayArray.forEach((date) => {
      // date중 월을 추출합니다.
      const month = parseInt(date.slice(5, 7));
      // complexColumns 배열을 순회하며 {header : `${month}월`} 값이 있는지 확인합니다.
      const foundColumns = complexColumns.find(
        (column) => column.header === `${month}월`,
      );
      if (!foundColumns) {
        complexColumns.push({
          header: `${month}월`,
          name: `${month}월`,
          childNames: [date.slice(5)],
        });
      } else {
        foundColumns.childNames.push(date.slice(5));
      }

      columns.push({
        header: date.slice(5),
        name: date.slice(5),
        renderer: {
          styles: {
            textAlign: 'center',
          },
        },
      });
    });
    const totalGrade = 3;
    const totalClass = {
      1: 6,
      2: 5,
      3: 3,
    };
    const data = [];
    for (let a = 1; a <= totalGrade; a++) {
      for (let b = 1; b <= totalClass[a]; b++) {
        for (let key in item[a][b]) {
          const student = {
            grade: a,
            class: b,
            name: key,
            total: 0,
          };
          this.yearSundayArray.map((date) => {
            if (item[a][b][key][date]) {
              item[a][b][key][date].check.data[0]
                ? (student[date.slice(5)] = '✅')
                : (student[date.slice(5)] = '❌');
              student.total += item[a][b][key][date].check.data[0];
            } else {
              student[date.slice(5)] = 0;
            }
          });
          data.push(student);
        }
      }
    }
    // div뿌리기
    this.Grid.setLanguage('ko'); // set Korean
    new this.Grid({
      el: document.querySelector('.wrapAttendance'),
      columns,
      bodyHeight: 500,
      header: {
        complexColumns,
      },
      columnOptions: {
        frozenCount: 4, // 1개의 컬럼을 고정하고
        frozenBorderWidth: 10, // 고정 컬럼의 경계선 너비를 2px로 한다.
      },
      data,
    });
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
