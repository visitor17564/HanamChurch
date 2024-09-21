export class ModalHelper {
  constructor(item) {
    this.attandace = item;
    this.students = {};
    this.selectedStudent = {};
    this.selectedFollow = {};
  }
  // 새친구 추가 버튼을 눌렀을 때 모달창을 띄우는 이벤트리스너를 설정합니다.
  addSaveAndAddStudentEventListener() {
    //  저장버튼 누르면 학생정보 저장
    document
      .getElementById('saveStudent')
      .addEventListener('click', async () => {
        const name = document.getElementById('name').value;
        const mobile2 = document.getElementById('mobile2').value;
        const mobile3 = document.getElementById('mobile3').value;
        const birthday = document.getElementById('birthday').value;
        const regdate = document.getElementById('regDate').value;
        const school = document.getElementById('school').value;
        const followDiv = document.getElementById('followName');
        const comment = document.getElementById('comment').value;
        let follow;
        if (followDiv.innerText !== '') {
          follow = followDiv.dataset.id;
        }
        const data = {
          name,
          phone: `010-${mobile2}-${mobile3}`,
          birth: birthday,
          created_at: regdate,
          organizationId: this.selectedStudent.organizationId,
          school,
          comment,
          follow,
        };
        const response = await this.updateStudent(data);
        if (response.success) {
          alert('저장되었습니다.');
          location.reload();
        } else {
          alert('저장에 실패했습니다.');
        }
      });
    // 새친구 추가 버튼 누르면 학생정보 저장
    document
      .getElementById('makeStudent')
      .addEventListener('click', async () => {
        const name = document.getElementById('name').value;
        const mobile2 = document.getElementById('mobile2').value;
        const mobile3 = document.getElementById('mobile3').value;
        const gender = document.getElementById('gender').value;
        if (gender === '') {
          alert('성별을 선택해주세요.');
          return;
        }
        let phone = `010-${mobile2}-${mobile3}`;
        if (!mobile2 || !mobile3) {
          phone = '';
        }
        const birthday = document.getElementById('birthday').value;
        const school = document.getElementById('school').value;
        const followDiv = document.getElementById('followName');
        let follow;
        if (followDiv.innerText !== '') {
          follow = followDiv.dataset.id;
        }
        const comment = document.getElementById('comment').value;
        const data = {
          name,
          gender,
          phone,
          birth: birthday,
          school,
          comment,
          follow,
          grade: this.attandace.grade,
          class: this.attandace.classNum,
        };
        const response = await this.makeStudent(data);
        if (response.success) {
          alert('새친구가 추가되었어요!');
          location.reload();
        } else {
          alert('저장에 실패했습니다.');
        }
      });
  }

  // 학생의 이름을 클릭했을 때 모달창을 띄우는 이벤트리스너를 설정합니다.
  addNameEventListener() {
    const nameDivs = document.querySelectorAll('.name');
    // 이름클릭시 모달창이 뜨도록 합니다.
    nameDivs.forEach((nameDiv) => {
      nameDiv.addEventListener('click', async (event) => {
        this.openStudentModal(event);
      });
    });

    // 모달창 닫기
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
  }

  setAddStudentModalEventListener() {
    document
      .querySelector('#makeStudentModalButton')
      .addEventListener('click', () => {
        this.openAddStudentModal();
      });
  }

  addFollowEventListener() {
    const addFollowButton = document.getElementById('addFollow');
    const editFollowButton = document.getElementById('editFollow');
    const deleteFollowButton = document.getElementById('deleteFollow');
    addFollowButton.addEventListener('click', () => {
      this.openFollowModal();
    });
    editFollowButton.addEventListener('click', () => {
      this.openFollowModal();
    });
    // 모달창 닫기
    document
      .querySelector('.FLOATING_DIV_MASK_FOLLOW')
      .addEventListener('click', () => {
        this.closeFollowModal();
      });
    document
      .getElementById('modal-close-button-follow')
      .addEventListener('click', () => {
        this.closeFollowModal();
      });

    // 학생 검색 로직 추가
    document
      .getElementById('searchFollow')
      .addEventListener('click', async () => {
        const searchName = document.getElementById('findFollowName').value;
        const data = await fetch(
          `https://hanam-church-a3ghgaavagc9gxe7.koreacentral-01.azurewebsites.net/student/findStudentByName/${searchName}`,
        );
        const response = await data.json();
        this.wrapFollowList(response);
      });

    // follow 선택 로직 추가
    document
      .getElementById('chooseFollow')
      .addEventListener('click', async () => {
        const followDiv = document.getElementById('followName');
        followDiv.innerText = this.selectedFollow['innerText'];
        followDiv.dataset.id = this.selectedFollow['id'];
        document.getElementById('addFollow').style.display = 'none';
        document.getElementById('editFollow').style.display = 'block';
        document.getElementById('deleteFollow').style.display = 'block';
        this.closeFollowModal();
      });
    // follow 삭제 로직 추가
    deleteFollowButton.addEventListener('click', async () => {
      const followDiv = document.getElementById('followName');
      followDiv.innerText = '';
      followDiv.dataset.id = '';
      document.getElementById('addFollow').style.display = 'block';
      document.getElementById('editFollow').style.display = 'none';
      document.getElementById('deleteFollow').style.display = 'none';
    });
  }

  // 학생의 정보를 모달창에 띄웁니다.
  async openStudentModal(event) {
    const userId = event.target.dataset.userid;
    // this.students에서 key 값이 userId인 value를 가져옵니다.
    const student = this.students[userId];
    if (student.name) {
      document.getElementById('name').value = student.name;
    }
    if (student.gender.data) {
      document.getElementById('gender').value = parseInt(
        student.gender.data[0],
      );
    }
    if (student.phone) {
      document.getElementById('mobile2').value = student.phone.split('-')[1];
      document.getElementById('mobile3').value = student.phone.split('-')[2];
    }
    if (student.birth) {
      const birthDate = new Date(student.birth);
      const year = birthDate.getFullYear();
      const month = String(birthDate.getMonth() + 1).padStart(2, '0');
      const day = String(birthDate.getDate()).padStart(2, '0');
      document.getElementById('birthday').value = `${year}-${month}-${day}`;
    }
    if (student.created_at) {
      const regDate = new Date(student.created_at);
      const year2 = regDate.getFullYear();
      const month2 = String(regDate.getMonth() + 1).padStart(2, '0');
      const day2 = String(regDate.getDate()).padStart(2, '0');
      document.getElementById('regDate').value = `${year2}-${month2}-${day2}`;
    }
    if (student.school) {
      document.getElementById('school').value = student.school;
    }
    console.log(student);
    if (student.comment) {
      document.getElementById('comment').value = student.comment;
    }

    if (student.is_new.data[0] === 1) {
      if (student.follow) {
        const data = await fetch(
          `https://hanam-church-a3ghgaavagc9gxe7.koreacentral-01.azurewebsites.net/student/findStudentById/${student.follow}`,
        );
        const response = await data.json();
        const followId = response[0].id;
        const InnerText = `${response[0].grade}학년 ${response[0].class}반 ${response[0].name}`;
        document.getElementById('followName').innerText = InnerText;
        document.getElementById('followName').dataset.id = followId;
        document.getElementById('addFollow').style.display = 'none';
        document.getElementById('editFollow').style.display = 'block';
        document.getElementById('deleteFollow').style.display = 'block';
      } else {
        document.getElementById('addFollow').style.display = 'block';
        document.getElementById('editFollow').style.display = 'none';
        document.getElementById('deleteFollow').style.display = 'none';
      }
      document.getElementById('followTr').style.display = 'table-row';
      document.getElementById('followTr2').style.display = 'table-row';
    } else {
      document.getElementById('followTr').style.display = 'none';
      document.getElementById('followTr2').style.display = 'none';
    }
    const checkCount = await this.getStudentCheckCount(student.organizationId);
    document.getElementById('checkCount').innerText = checkCount;
    document.getElementById('studentDetails').style.display = 'block';
    this.selectedStudent['id'] = student.id;
    this.selectedStudent['organizationId'] = student.organizationId;
    document.getElementById('saveStudent').style.display = 'block';
    document.getElementById('regDateTr').style.display = 'table-row';
    document.getElementById('regDateTr2').style.display = 'table-row';
    document.getElementById('checkCountTr').style.display = 'table-row';
    document.getElementById('checkCountTr2').style.display = 'table-row';
    document.getElementById('makeStudent').style.display = 'none';
  }

  // 새로운 학생을 추가하는 모달창을 띄웁니다.
  async openAddStudentModal() {
    document.getElementById('name').value = '';
    document.getElementById('mobile2').value = '';
    document.getElementById('mobile3').value = '';
    document.getElementById('birthday').value = '';
    document.getElementById('regDate').value = '';
    document.getElementById('school').value = '';
    document.getElementById('gender').value = '';
    document.getElementById('followTr').style.display = 'table-row';
    document.getElementById('followTr2').style.display = 'table-row';
    document.getElementById('addFollow').style.display = 'block';
    document.getElementById('editFollow').style.display = 'none';
    document.getElementById('deleteFollow').style.display = 'none';
    document.getElementById('regDateTr').style.display = 'none';
    document.getElementById('regDateTr2').style.display = 'none';
    document.getElementById('checkCountTr').style.display = 'none';
    document.getElementById('checkCountTr2').style.display = 'none';
    document.getElementById('saveStudent').style.display = 'none';
    document.getElementById('makeStudent').style.display = 'table-row';
    document.getElementById('studentDetails').style.display = 'block';
  }

  async openFollowModal() {
    document.getElementById('followModal').style.display = 'block';
    document.getElementById('chooseFollow').style.display = 'none';
  }

  // 모달창을 닫습니다.
  closeStudentModal() {
    document.getElementById('studentDetails').style.display = 'none';
  }

  // follow모달창을 닫습니다.
  closeFollowModal() {
    document.getElementById('followModal').style.display = 'none';
  }

  // 학생의 출석 횟수를 가져옵니다.
  async getStudentCheckCount(organizationId) {
    const data = await fetch(
      `https://hanam-church-a3ghgaavagc9gxe7.koreacentral-01.azurewebsites.net/student/checkCount/${organizationId}`,
    );
    const response = await data.json();
    return response.data[0]['COUNT(*)'];
  }

  // 학생의 정보를 업데이트합니다.
  updateStudent(data) {
    return fetch(
      `https://hanam-church-a3ghgaavagc9gxe7.koreacentral-01.azurewebsites.net/student/updateStudent/${this.selectedStudent.id}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      },
    ).then((response) => response.json());
  }

  // 학생을 추가합니다.
  makeStudent(data) {
    return fetch('https://hanam-church-a3ghgaavagc9gxe7.koreacentral-01.azurewebsites.net/student/makeStudent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    }).then((response) => response.json());
  }

  // 검색한 학생들을 리스트에 띄웁니다.
  wrapFollowList(items) {
    const wrapDiv = document.getElementById('wrap-follows');
    let html = ``;
    items.forEach((item) => {
      html += `
          <div class="follow-content" data-id="${item.id}">
            <span>${item.grade}학년</span>
            <span>${item.class}반</span>
            <span>${item.name}</span>
          </div>
        `;
    });
    wrapDiv.innerHTML = '';
    wrapDiv.innerHTML = html;

    const followContents = document.querySelectorAll('.follow-content');
    followContents.forEach((content) => {
      content.addEventListener('click', async (event) => {
        // 가장 가까운 div를 가져옵니다.
        const followContent = event.target.closest('.follow-content');
        const studentId = followContent.dataset.id;
        const innerText = followContent.innerText;
        this.selectedFollow['id'] = studentId;
        this.selectedFollow['innerText'] = innerText;
        // 다른 follow-content들의 배경색을 초기화합니다.
        followContents.forEach((content) => {
          if (content !== followContent) {
            content.style.backgroundColor = 'white';
          }
        });
        followContent.style.backgroundColor = '#82c8d6';
        document.getElementById('chooseFollow').style.display = 'block';
      });
    });
  }
}
