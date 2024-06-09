class Database {
  constructor() {
    this.peopleDatabaseId = "21e0f6a5b5ba4698aeaa1c63891d0e7f";
    this.checkDatabaseId = "a1c088eea3384301ae6110cb917b7ad7";
    this.notionApiKey = "secret_Xsx3tp2AZ1reFdAORdnc9SUJp3oLCW7IcMdw8lNLtfk";
    this.API_END_POINT = "https://api.notion.com/v1";
  }

  async makeHeaders() {
    const headers = {
      Authorization: `Bearer ${this.notionApiKey}`,
      "Notion-Version": "2022-06-28",
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*", // CORS 정책을 위한 헤더
      "Access-Control-Allow-Methods": "GET, HEAD, POST, PUT, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };
    return headers;
  }

  async queryDatabase(databaseId, body) {
    const request = await new Request(
      `${this.API_END_POINT}/databases/${databaseId}/query`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.notionApiKey}`,
          "Notion-Version": "2022-06-28",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );

    const response = await fetch(request);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  }

  async makeGetClassMembersBody(gradeNum, classNum) {
    const body = {
      filter: {
        and: [
          {
            property: "grade",
            select: {
              equals: gradeNum,
            },
          },
          {
            property: "class",
            select: {
              equals: classNum,
            },
          },
        ],
      },
    };
    return body;
  }

  async makeGetStudentByIdBody(id) {
    const body = {
      filter: {
        property: "id",
        unique_id: {
          equals: id,
        },
      },
    };
    return body;
  }

  async makeCheckRow() {
    const response = await notion.pages.create({
      parent: {
        type: "database_id",
        database_id: this.checkDatabaseId,
      },
      properties: {
        date: {
          date: {
            start: "2024-05-25",
          },
        },
        check: {
          checkbox: true,
        },
        peopleId: {
          type: "relation",
          relation: [
            {
              // 이거 데이터베이스 아이디가 아니라 데이터안의 relation할 친구들의 id값임
              id: "7a292790-0128-4903-afab-8fc1dbdcab4a",
            },
          ],
          has_more: false,
        },
      },
    });
    return response;
  }
}
// 다큐먼트가 로드될 때가지 기다립니다.
document.addEventListener("DOMContentLoaded", async () => {
  await wrapClassDiv();
  const database = new Database();
  const testBody = await database.makeGetStudentByIdBody(1);

  const result = await database.queryDatabase(
    database.peopleDatabaseId,
    testBody
  );
  console.log(result);
});

function wrapClassDiv() {
  // parameter에서 grade를 가져옵니다.
  const grade = parseInt(
    new URLSearchParams(window.location.search).get("grade")
  );
  // parameter에서 class를 가져옵니다.
  const classNum = parseInt(
    new URLSearchParams(window.location.search).get("class")
  );
  // 선생님 이름을 가져옵니다.
  const teacherName = makeTeacher(grade, classNum);

  const gradeDiv = document.querySelector(".wrapGrade");
  const div = `
  <div class="gradeDiv contentText"><h2>🐤 ${grade}학년 ${classNum}반 ${teacherName}선생님</h2></div>
  `;
  gradeDiv.innerHTML = div;
}

function makeTeacher(grade, classNum) {
  let teacherName = "";
  switch (grade) {
    case 1:
      switch (classNum) {
        case 1:
          teacherName = "문민욱";
          break;
        case 2:
          teacherName = "허은성";
          break;
        case 3:
          teacherName = "한미연";
          break;
        case 4:
          teacherName = "박창용";
          break;
        case 5:
          teacherName = "소양신";
          break;
        case 6:
          teacherName = "김두환";
          break;
        default:
          console.log("반 정보가 잘못되었습니다.");
      }
      break;
    case 2:
      switch (classNum) {
        case 1:
          teacherName = "박인영";
          break;
        case 2:
          teacherName = "최재혁";
          break;
        case 3:
          teacherName = "조성욱, 최익도";
          break;
        case 4:
          teacherName = "함석주";
          break;
        case 5:
          teacherName = "임신배";
          break;
        default:
          console.log("반 정보가 잘못되었습니다.");
      }
      break;
    case 3:
      switch (classNum) {
        case 1:
          teacherName = "최현미";
          break;
        case 2:
          teacherName = "윤지성";
          break;
        case 3:
          teacherName = "홍사성";
          break;
        default:
          console.log("반 정보가 잘못되었습니다.");
      }
    default:
      console.log("학년 정보가 잘못되었습니다.");
  }
  return teacherName;
}
