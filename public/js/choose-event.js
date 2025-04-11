async function wrapClass() {
  const classDiv = document.getElementById('wrapClass');
  // query string에서 grade를 가져옴
  const data = await fetch(`/event/getAllEvent`);
  const response = await data.json();

  response.data.forEach((item) => {
    const button = document.createElement('button');
    button.classList.add('gradeButton');
    button.classList.add('contentText');
    button.onclick = () => {
      location.href = `/check-event?event=${item.id}`;
    };
    button.innerHTML = `<h2>🐤 ${item.name}</h2>`;
    classDiv.appendChild(button);
  });
}

// 다큐먼트가 로드될 때까지 기다리고 wrapClass 함수 실행
document.addEventListener('DOMContentLoaded', async () => {
  await wrapClass();
});
