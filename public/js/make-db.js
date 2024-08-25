const { Client } = require('@notionhq/client');

const notion = new Client({ auth: process.env.NOTION_API_KEY });

class Database {
  constructor() {
    this.studentsDatabaseId = process.env.NOTION_STUDENTS_DATABASE_ID;
    this.checkDatabaseId = process.env.NOTION_CHECK_DATABASE_ID;
    this.commentsDatabaseId = process.env.NOTION_COMMENTS_DATABASE_ID;
  }

  async getClassMembers(gradeNum, classNum) {
    const response = await notion.databases.query({
      database_id: this.studentsDatabaseId,
      filter: {
        and: [
          {
            property: 'grade',
            select: {
              equals: gradeNum,
            },
          },
          {
            property: 'class',
            select: {
              equals: classNum,
            },
          },
        ],
      },
    });
    return response;
  }

  async getStudentById(id) {
    const databaseId = this.checkDatabaseId;
    const response = await notion.databases.query({
      database_id: databaseId,
      filter: {
        property: 'id',
        unique_id: {
          equals: id,
        },
      },
    });
    return response;
  }

  // db 백업시 사용할 함수(학생들 사정자료를 comments db에 넣어주는 함수)
  async makeCommentRow(results) {
    results.forEach(async (result) => {
      this.makeEachCommentRow(result);
    });
  }

  async makeEachCommentRow(result) {
    const studentId = result.id;
    const studentName = result.properties['name'].title[0].plain_text;
    if (result.properties['2022'].rich_text.length > 0) {
      const comment2022 = result.properties['2022'].rich_text[0].plain_text;
      const response = await notion.pages.create({
        parent: {
          type: 'database_id',
          database_id: this.commentsDatabaseId,
        },
        properties: {
          studentId: {
            type: 'relation',
            relation: [
              {
                // 이거 데이터베이스 아이디가 아니라 데이터안의 relation할 친구들의 id값임
                id: studentId,
              },
            ],
            has_more: false,
          },
          name: {
            type: 'title',
            title: [
              {
                text: {
                  content: studentName,
                },
              },
            ],
          },
          year: {
            type: 'number',
            number: 2022,
          },
          comment: {
            type: 'rich_text',
            rich_text: [
              {
                text: {
                  content: comment2022,
                },
              },
            ],
          },
        },
      });
    }
    if (result.properties['2023'].rich_text.length > 0) {
      const comment2023 = result.properties['2023'].rich_text[0].plain_text;
      const response = await notion.pages.create({
        parent: {
          type: 'database_id',
          database_id: this.commentsDatabaseId,
        },
        properties: {
          studentId: {
            type: 'relation',
            relation: [
              {
                // 이거 데이터베이스 아이디가 아니라 데이터안의 relation할 친구들의 id값임
                id: studentId,
              },
            ],
            has_more: false,
          },
          name: {
            title: [
              {
                text: {
                  content: studentName,
                },
              },
            ],
          },
          year: {
            number: 2023,
          },
          comment: {
            rich_text: [
              {
                text: {
                  content: comment2023,
                },
              },
            ],
          },
        },
      });
    }
  }

  // 연초에 사용할 함수, 학생들 출석부를 false로 일자별로 초기화 하는 함수
  async makeYearCheckRow(results) {
    for (let e = 0; e < results.length; e++) {
      const result = results[e];
      this.makeEachYearCheckRow(result);
      await this.delay(10000);
    }
  }

  async makeEachYearCheckRow(result) {
    const studentId = result.id;
    const studentName = result.properties['name'].title[0].plain_text;
    // 해당연도와 첫 주일 계산
    const ThisYear = 2024;
    const startDate = new Date('2024-01-07');
    let date = startDate;
    let specialDate = '';
    // 특별한 날이 있으면 추가합니다.
    specialDate = new Date('2024-12-25');
    // ThisYear연도의 마지막 날짜를 구합니다.
    const lastDate = new Date('2024-12-31');
    // 마지막 날짜까지 반복문을 돌립니다.
    while (date <= lastDate) {
      await this.makeCheckRow(studentId, date, studentName);
      date.setDate(date.getDate() + 7);
      await this.delay(1000);
    }

    if (specialDate) {
      this.makeCheckRow(studentId, specialDate, studentName);
    }

    console.log(`${studentName} 완료!`);
  }

  async makeCheckRow(studentId, date, studentName) {
    await notion.pages.create({
      parent: {
        type: 'database_id',
        database_id: this.checkDatabaseId,
      },
      properties: {
        date: {
          date: {
            // date를 YYYY-MM-DD 형식으로 변환
            start: date.toISOString().split('T')[0],
          },
        },
        check: {
          checkbox: false,
        },
        studentId: {
          type: 'relation',
          relation: [
            {
              // 이거 데이터베이스 아이디가 아니라 데이터안의 relation할 친구들의 id값임
              id: studentId,
            },
          ],
          has_more: false,
        },
        name: {
          title: [
            {
              text: {
                content: studentName,
              },
            },
          ],
        },
      },
    });
  }

  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

const database = new Database();
const classMembers = await database.getClassMembers('3', '3');
database.makeYearCheckRow(classMembers.results);
