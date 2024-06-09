const { Client } = require("@notionhq/client");

const notion = new Client({ auth: process.env.NOTION_API_KEY });

class Database {
  constructor() {
    this.peopleDatabaseId = process.env.NOTION_PEOPLE_DATABASE_ID;
    this.checkDatabaseId = process.env.NOTION_CHECK_DATABASE_ID;
    this.peopleRelativeDatabaseId =
      process.env.NOTION_PEOPLE_RELATIVE_DATABASE_ID;
  }

  async getClassMembers(gradeNum, classNum) {
    const response = await notion.databases.query({
      database_id: this.peopleDatabaseId,
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
    });
    return response;
  }

  async getStudentById(id) {
    const databaseId = this.checkDatabaseId;
    const response = await notion.databases.query({
      database_id: databaseId,
      filter: {
        property: "id",
        unique_id: {
          equals: id,
        },
      },
    });
    return response;
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

database = new Database();
database.makeCheckRow().then((response) => {});
