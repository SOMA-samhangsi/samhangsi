const submitBtn = document.getElementById('submitBtn');
const popupBtn = document.getElementById('popupBtn');
const modal = document.getElementById('modalWrap');
const closeBtn = document.getElementById('closeBtn');
const beforeDateBtn = document.getElementById('beforeDateBtn');
const afterDateBtn = document.getElementById('afterDateBtn');
const todayCon = document.getElementById('today_container');
const lastdayCon = document.getElementById('lastday_winner_container');
const clickCount = document.querySelector('#click-count');
const articleTable = {};

let t = Date.now()
window.onscroll = function(e) {
  let now =  Math.floor((Date.now() - t)/1000);
  if(now > 3 && (window.innerHeight + window.scrollY) >= document.body.offsetHeight) {
      requestList();   
      t = Date.now();     
  }
};

window.onload = function () {
  modal.style.display = 'none'; //팝업 끄기
  //if (날짜가 오늘 날짜이면)
  todayCon.style.display = 'block';
  lastdayCon.style.display = 'none';

  let [month, date] = getDate(); 

  divDate = document.getElementById('Date');
  divDate.textContent = month+"월 "+date+"일";
  //else
  //todayCon.style.display = "none";
  //lastdayCon.style.display = "block";

  initialize();


};

async function request(url = '') {
  const response = await fetch(url,
  {
    method: 'GET',
  });
  return await response.json();
}

async function postData(url = '', data = {}) {
  const response = await fetch(url, {
    method: 'POST', // *GET, POST, PUT, DELETE 등
    mode: 'cors', // no-cors, *cors, same-origin
    cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
    credentials: 'same-origin', // include, *same-origin, omit
    headers: {
      'Content-Type': 'application/json',
    },
    redirect: 'follow', // manual, *follow, error
    referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
    body: JSON.stringify(data), // body의 데이터 유형은 반드시 "Content-Type" 헤더와 일치해야 함
  });
  return response.json(); // JSON 응답을 네이티브 JavaScript 객체로 파싱
}

beforeDateBtn.onclick = function () {
  const divDate = document.getElementById('Date');
  const divDateText = divDate.innerText;
  const dateList = divDateText.split(" ");
  const regex = /[^0-9]/g;
  let month = parseInt(dateList[0].replace(regex, ""));
  let date = parseInt(dateList[1].replace(regex, ""));
  divDate.innerText = month + "월 " + (date - 1) + "일";
}

afterDateBtn.onclick = function () {
  const divDate = document.getElementById('Date');
  const divDateText = divDate.innerText;
  const dateList = divDateText.split(" ");
  const regex = /[^0-9]/g;
  let month = parseInt(dateList[0].replace(regex, ""));
  let date = parseInt(dateList[1].replace(regex, ""));
  divDate.innerText = month + "월 " + (date + 1) + "일";
}

submitBtn.onclick = function () {
  //DB 연동 후 데이터 들어가도록 변경

  const data = {
    like : 0,
    name : document.getElementById('name').value,
    number : document.getElementById('number').value,
    text1 : document.getElementById('text1').value,
    text2 : document.getElementById('text2').value,
    text3 : document.getElementById('text3').value,
    timestamp : Date.now()
  }

  let [month, date] = getDate(); 
  let date_ = month+"-"+date
  postData("https://swm14samhangsi-default-rtdb.asia-southeast1.firebasedatabase.app/messages/"+ date_ +".json", data)
  .then(
    (result)=> {
      alert('등록 완료!');
      initialize();
    }
  );
};

//팝업 켜기
popupBtn.onclick = function () {
  modal.style.display = 'block';
 
};

//팝업 끄기
closeBtn.onclick = function () {
  modal.style.display = 'none';
};

let counter = 0;


function samArticle(guid = "0", data)
{
  if ('content' in document.createElement('template') && articleTable[guid] === undefined) {
    let name ="name";

    let articleTemplate=document.querySelector('#articleTemplate');
    let clone=articleTemplate.content.cloneNode(true);
   // let tempDiv=clone.querySelectorAll('div');

    const heartIcon = clone.querySelector('.myButton');
    heartIcon.addEventListener('click', () => {
      //DB 연동 후 게시글별 하트 수 올라가도록 변경
      counter++;
      clickCount.textContent = counter;
    });

    clone.querySelector('.rank').innerHTML = rank;
    clone.querySelector('.contents-name').innerHTML = data.name;
    clone.querySelector('.contents-main-right1').innerHTML = data.text1;
    clone.querySelector('.contents-main-right2').innerHTML = data.text2;
    clone.querySelector('.contents-main-right3').innerHTML = data.text3;

    let parent=document.querySelector('.total-continer-body');
    parent.appendChild(clone);

    child = parent.lastElementChild;
    child.setAttribute("guid", guid)
    child.setAttribute("timestamp", data.timestamp)
    child.setAttribute("like", data.like)

    articleTable[guid] = data;
    rank++;
    }
}

let rank = 1;
function initialize()
{
  // 삼행시 리스트 초기화
  document.querySelector('.total-continer-body').textContent = '';

  // 입력 폼 초기화
  document.getElementById('inputForm').reset();


  // 삼행시 리스트 request
  rank = 1;
  requestList();
}

function requestList()
{
  let [month, date] = getDate(); 
  let date_ = month+"-"+date;
  request('https://swm14samhangsi-default-rtdb.asia-southeast1.firebasedatabase.app/messages/'+date_+'.json'+sortOption("timestamp"))
  .then(
    (result)=> {
    const sortedObj = sortData(result, "timestamp")

      for (const key in sortedObj) {
        if (sortedObj.hasOwnProperty(key)) {
          samArticle(key, sortedObj[key]);
        }
      }
    }
  );
}

function sortOption(option)
{
  return '?orderBy="'+ option+ '"&limitToLast=5'+ At(option);
}

function sortData(data, option)
{
  if(option == "timestamp")
  {
    const sortedObj = Object.fromEntries(
      Object.entries(data).sort(([,a], [,b]) => a.timestamp < b.timestamp ? 1 : -1)
    );

    return sortedObj;
  }

  if(option == "like")
  {
    const sortedObj = Object.fromEntries(
      Object.entries(data).sort(([,a], [,b]) => a.like < b.like ? 1 : -1)
    );

    return sortedObj;
  }
}

function At(option)
{
  let parent=document.querySelector('.total-continer-body');
  let lastChild = parent.lastElementChild;

  if(lastChild === null)
    return '&startAt=0'

  if(option == "like" && lastChild.getAttribute("like") !== 0)
    return '&endAt='+lastChild.getAttribute("like")
  if(option == "timestamp")
    return '&endAt='+lastChild.getAttribute("timestamp")
}

function getDate()
{
  let today = new Date();   
  let month = today.getMonth() + 1; 
  let date = today.getDate(); 
  return [month, date];
}