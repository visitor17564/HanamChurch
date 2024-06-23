function wrapClass() {
  const classDiv = document.getElementById('wrapClass');
  // query string에서 grade를 가져옴
  const grade = parseInt(
    new URLSearchParams(window.location.search).get('grade'),
  );
  let count = 0;
  if (grade === 1) count = 6;
  else if (grade === 2) count = 5;
  else if (grade === 3) count = 3;

  for (let i = 1; i <= count; i++) {
    const button = document.createElement('button');
    button.classList.add('gradeButton');
    button.classList.add('contentText');
    button.onclick = () => {
      location.href = `/views/html/attendance.html?grade=${grade}&class=${i}`;
    };
    button.innerHTML = `<h2>🐤 ${i}반</h2>`;
    classDiv.appendChild(button);
  }
}

// 다큐먼트가 로드될 때까지 기다리고 wrapClass 함수 실행
document.addEventListener('DOMContentLoaded', wrapClass);
wrapClass();
