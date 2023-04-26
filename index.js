const submitBtn = document.getElementById("submitBtn");
const popupBtn = document.getElementById("popupBtn");
const modal = document.getElementById("modalWrap");
const closeBtn = document.getElementById("closeBtn");
const beforeDateBtn = document.getElementById("beforeDateBtn");
const afterDateBtn = document.getElementById("afterDateBtn");
const todayCon = document.getElementById("today_container");
const lastdayCon = document.getElementById("lastday_winner_container");
const filterBtn = document.querySelector(".filter-btn");
const filter = document.querySelector("#filter");
const popupImage = document.querySelector(".popupImage");

let articleTable = {};
let samhangsiDateTable = [];
let todaySamhangsi = "소마인";
let t = Date.now();

window.onscroll = function (e) {
  let [month, date] = getDate();
  let _date = month + "-" + date;
  let now = Math.floor((Date.now() - t) / 1000);
  if (
    now > 3 &&
    window.innerHeight + window.scrollY >= document.body.offsetHeight
  ) {
    requestList(_date);
    t = Date.now();
  }
};

window.onload = function () {
  modal.style.display = "none"; //팝업 끄기
  //if (날짜가 오늘 날짜이면)
  todayCon.style.display = "block";
  lastdayCon.style.display = "none";
  filter.textContent = "최신순";
  let [month, date] = getDate();
  let _date = month + "-" + date;

  divDate = document.getElementById("Date");
  divDate.textContent = month + "월 " + date + "일";
  //else
  //todayCon.style.display = "none";
  //lastdayCon.style.display = "block";

  initialize(_date);
  getSamhangsiDate();
};

async function request(url = "") {
  const response = await fetch(url, {
    method: "GET",
  });
  return await response.json();
}

async function patchData(url = "", data) {
  const response = await fetch(url, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
  return await response.json();
}

async function patchData(url = "", data) {
  const response = await fetch(url, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
  return await response.json();
}

async function postData(url = "", data = {}) {
  const response = await fetch(url, {
    method: "POST", // *GET, POST, PUT, DELETE 등
    mode: "cors", // no-cors, *cors, same-origin
    cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
    credentials: "same-origin", // include, *same-origin, omit
    headers: {
      "Content-Type": "application/json",
    },
    redirect: "follow", // manual, *follow, error
    referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
    body: JSON.stringify(data), // body의 데이터 유형은 반드시 "Content-Type" 헤더와 일치해야 함
  });
  return response.json(); // JSON 응답을 네이티브 JavaScript 객체로 파싱
}

beforeDateBtn.onclick = function () {
  const divDate = document.getElementById("Date");
  const divDateText = divDate.innerText;
  const dateList = divDateText.split(" ");
  const regex = /[^0-9]/g;
  let month = parseInt(dateList[0].replace(regex, ""));
  let date = parseInt(dateList[1].replace(regex, "")) - 1;

  let _date = month + "-" + date;
  if (!samhangsiDateTable.includes(_date)) {
    alert("잘못된 날짜 접근입니다.");
  } else {
    checkToday(month, date);
    getSamhangsi(_date);
    divDate.innerText = month + "월 " + date + "일";
  }
};

afterDateBtn.onclick = function () {
  const divDate = document.getElementById("Date");
  const divDateText = divDate.innerText;
  const dateList = divDateText.split(" ");
  const regex = /[^0-9]/g;
  let month = parseInt(dateList[0].replace(regex, ""));
  let date = parseInt(dateList[1].replace(regex, "")) + 1;
  let _date = month + "-" + date;

  if (checkFutureDay(month, date)) {
    alert("내일의 삼행시는 비밀!");
  } else if (!samhangsiDateTable.includes(_date)) {
    alert("잘못된 날짜 접근입니다.");
  } else {
    checkToday(month, date);
    getSamhangsi(_date);
    divDate.innerText = month + "월 " + date + "일";
  }
};

submitBtn.onclick = function () {
  //DB 연동 후 데이터 들어가도록 변경
  if (
    document.getElementById("text1").value[0] !=
      document.querySelector(".input-group-left-column1").innerHTML ||
    document.getElementById("text2").value[0] !=
      document.querySelector(".input-group-left-column2").innerHTML ||
    document.getElementById("text3").value[0] !=
      document.querySelector(".input-group-left-column3").innerHTML ||
    document.getElementById("text1").value == "" ||
    document.getElementById("text2").value == "" ||
    document.getElementById("text3").value == ""
  ) {
    alert("잘못된 텍스트입니다.");
  } else if (document.getElementById("name").value == "") {
    alert("닉네임을 입력해 주세요.");
  } else {
    const data = {
      like: 0,
      name: document.getElementById("name").value,
      number: document.getElementById("number").value,
      text1: document.getElementById("text1").value,
      text2: document.getElementById("text2").value,
      text3: document.getElementById("text3").value,
      timestamp: Date.now(),
    };

    let [month, date] = getDate();
    let _date = month + "-" + date;
    postData(
      "https://swm14samhangsi-default-rtdb.asia-southeast1.firebasedatabase.app/messages/" +
        _date +
        ".json",
      data
    ).then((result) => {
      alert("등록 완료!");
      initialize(_data);
    });
  }
};

//팝업 켜기
popupBtn.onclick = function () {
  popupImage.src = "images/00" + (Math.floor(Math.random() * 3) + 1) + ".png";
  modal.style.display = "block";
};

//팝업 끄기
closeBtn.onclick = function () {
  modal.style.display = "none";
};

filterBtn.onclick = function () {
  if (filter.textContent == "최신순") {
    filter.textContent = "추천순";
  } else if (filter.textContent == "추천순") {
    filter.textContent = "최신순";
  }
  let [month, date] = getDate();
  let _date = month + "-" + date;

  // 삼행시 리스트 request
  initList(_date);
};

// 오늘 날짜인지 체크
function checkToday(month, date) {
  let [todayMonth, todayDate] = getDate();

  if (month == todayMonth && date == todayDate) {
    todayCon.style.display = "block";
    lastdayCon.style.display = "none";
  } else {
    todayCon.style.display = "none";
    lastdayCon.style.display = "block";
  }
}

// 미래 날짜 체크
function checkFutureDay(month, date) {
  let [todayMonth, todayDate] = getDate();

  if (month == todayMonth && date > todayDate) {
    return true;
  }
  return false;
}

function clickLike(event) {
  let parentNode = this.parentNode.parentNode.parentNode;
  let guid = parentNode.getAttribute("guid");
  let lke = parseInt(parentNode.getAttribute("like")) + 1;
  let [month, date] = getDate();
  let _date = month + "-" + date;
  let url =
    "https://swm14samhangsi-default-rtdb.asia-southeast1.firebasedatabase.app/messages/" +
    _date +
    "/" +
    guid +
    ".json";
  data = {
    like: lke,
  };
  patchData(url, data).then((result) => {
    parentNode.setAttribute("like", lke);
    parentNode.querySelector(".like-count").innerHTML = lke;
  });
}
function samArticle(guid = "0", data) {
  if (
    "content" in document.createElement("template") &&
    articleTable[guid] === undefined
  ) {
    let name = "name";

    let articleTemplate = document.querySelector("#articleTemplate");
    let clone = articleTemplate.content.cloneNode(true);
    // let tempDiv=clone.querySelectorAll('div');

    const heartIcon = clone.querySelector(".myButton");
    heartIcon.addEventListener("click", clickLike);

    clone.querySelector(".like-count").innerHTML = data.like;
    clone.querySelector(".rank").innerHTML = rank;
    clone.querySelector(".contents-name").innerHTML = data.name;
    clone.querySelector(".contents-main-right1").innerHTML = data.text1;
    clone.querySelector(".contents-main-right2").innerHTML = data.text2;
    clone.querySelector(".contents-main-right3").innerHTML = data.text3;

    let parent = document.querySelector(".total-continer-body");
    parent.appendChild(clone);

    child = parent.lastElementChild;
    child.setAttribute("guid", guid);
    child.setAttribute("timestamp", data.timestamp);
    child.setAttribute("like", data.like);

    articleTable[guid] = data;
    rank++;
  }
}

let rank = 1;
function initialize(_date) {
  // 입력 폼 초기화
  document.getElementById("inputForm").reset();

  // 삼행시 주제 request
  getSamhangsi(_date);
}

function initList(_date) {
  // 삼행시 리스트 초기화
  articleTable = {};
  rank = 1;
  document.querySelector(".total-continer-body").textContent = "";
  requestList(_date);
}

function requestList(_date) {
  let option;
  if (filter.textContent == "최신순") option = "timestamp";
  else option = "like";
  request(
    "https://swm14samhangsi-default-rtdb.asia-southeast1.firebasedatabase.app/messages/" +
      _date +
      ".json" +
      sortOption(option)
  ).then((result) => {
    if (result !== null) {
      const sortedObj = sortData(result, option);

      for (const key in sortedObj) {
        if (sortedObj.hasOwnProperty(key)) {
          samArticle(key, sortedObj[key]);
        }
      }
    }
  });
}

function sortOption(option) {
  return '?orderBy="' + option + '"&limitToLast=10' + At(option);
}

function sortData(data, option) {
  if (option === "timestamp") {
    const sortedObj = Object.fromEntries(
      Object.entries(data).sort(([, a], [, b]) =>
        a.timestamp < b.timestamp ? 1 : -1
      )
    );
    return sortedObj;
  }

  if (option === "like") {
    const sortedObj = Object.fromEntries(
      Object.entries(data).sort(([, a], [, b]) => (a.like < b.like ? 1 : -1))
    );
    return sortedObj;
  }
}

function At(option) {
  let parent = document.querySelector(".total-continer-body");
  let lastChild = parent.lastElementChild;

  if (lastChild === null) return "&startAt=0";

  if (option == "like" && lastChild.getAttribute("like") !== 0)
    return "&endAt=" + lastChild.getAttribute("like");
  if (option == "timestamp")
    return "&endAt=" + lastChild.getAttribute("timestamp");
}

function getDate() {
  let today = new Date();
  let month = today.getMonth() + 1;
  let date = today.getDate();
  return [month, date];
}

function showBestSamhangsi(data) {
  lastdayCon.querySelector(".lastday_winner_item_circle1").innerText =
    todaySamhangsi[0];
  lastdayCon.querySelector(".lastday_winner_item_circle2").innerText =
    todaySamhangsi[1];
  lastdayCon.querySelector(".lastday_winner_item_circle3").innerText =
    todaySamhangsi[2];

  lastdayCon.querySelector(".lastday_winner_item_content1").innerHTML =
    data.text1;
  lastdayCon.querySelector(".lastday_winner_item_content2").innerHTML =
    data.text2;
  lastdayCon.querySelector(".lastday_winner_item_content3").innerHTML =
    data.text3;
}

function requestBestSamhangsi(date_) {
  request(
    "https://swm14samhangsi-default-rtdb.asia-southeast1.firebasedatabase.app/messages/" +
      date_ +
      ".json"
  ).then((result) => {
    if (result != null) {
      const sortedObj = sortData(result, "like");
      for (const key in sortedObj) {
        if (sortedObj.hasOwnProperty(key)) {
          showBestSamhangsi(sortedObj[key]);
          break;
        }
      }
    }
  });
}

function getSamhangsi(_date) {
  request(
    "https://swm14samhangsi-default-rtdb.asia-southeast1.firebasedatabase.app/samhangsi/" +
      _date +
      ".json"
  ).then((result) => {
    if (result != null) {
      todaySamhangsi = result;

      let [month, date] = getDate();
      if (_date == month + "-" + date) {
        document.querySelector(".input-group-left-column1").innerHTML =
          result[0];
        document.querySelector(".input-group-left-column2").innerHTML =
          result[1];
        document.querySelector(".input-group-left-column3").innerHTML =
          result[2];
      }
      // 삼행시 리스트 request
      rank = 1;
      initList(_date);
      requestBestSamhangsi(_date);
    }
  });
}

function getSamhangsiDate() {
  request(
    "https://swm14samhangsi-default-rtdb.asia-southeast1.firebasedatabase.app/samhangsi.json"
  ).then((result) => {
    if (result != null) {
      let idx = 0;
      for (const key in result) {
        samhangsiDateTable[idx++] = key.toString();
      }
    }
  });
}
