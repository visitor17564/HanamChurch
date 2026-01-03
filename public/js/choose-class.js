async function wrapClass() {
  const classDiv = document.getElementById('wrapClass');
  // query string에서 grade를 가져옴
  const grade = parseInt(
    new URLSearchParams(window.location.search).get('grade'),
  );

  // teacher.json 파일을 가져와서 현재 연도에 맞는 반 수를 계산
  const response = await fetch('/data/teacher.json');
  const teacherData = await response.json();

  const currentYear = new Date().getFullYear();
  const classData = teacherData['고등부'][currentYear]?.[grade];
  const count = classData ? Object.keys(classData).length : 0;

  for (let i = 1; i <= count; i++) {
    const button = document.createElement('button');
    button.classList.add('gradeButton');
    button.classList.add('contentText');
    button.onclick = () => {
      location.href = `/attendance?grade=${grade}&class=${i}`;
    };
    button.innerHTML = `<h2>🐤 ${i}반</h2>`;
    classDiv.appendChild(button);
  }
}

// 다큐먼트가 로드될 때까지 기다리고 wrapClass 함수 실행
document.addEventListener('DOMContentLoaded', wrapClass);
