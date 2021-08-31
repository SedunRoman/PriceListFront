let allList = JSON.parse(localStorage.getItem('tasks')) || [];
let valueString = '';
let valueNumber = 0;
let valueDate = moment().format('DD-MM-YYYY');
let addString = null;
let addNumber = null;
const clearAll = document.getElementById('content-clear');

window.onload = async () => {
  addString = document.getElementById('add-string');
  addNumber = document.getElementById('add-number');
  addString.addEventListener('change', updateAddString);
  addNumber.addEventListener('change', updateAddNumber);
  const resp = await fetch('http://localhost:8000/allLists', {
    method: 'GET'
  });
  const result = await resp.json();
  allList = result.data;
  render();
};

const calculateSummCosts = () => {
  const redElem = allList.reduce((a, b) => a + b.number, 0);
  const redResult = document.getElementById('end-result');
  redResult.innerText = `${+redElem}`;
}

const onClickBtn = async () => {
  if (valueString.length && valueNumber.length) {
    const resp = await fetch('http://localhost:8000/createList', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        text: valueString,
        number: valueNumber,
        date: valueDate
      })
    });
    const result = await resp.json();
    allList = result.data;
    localStorage.setItem('tasks', JSON.stringify(allList));
    valueString = '';
    valueNumber = '';
    addString.value = '';
    addNumber.value = '';
    render();
  } else {
    addString.style.border = "2px solid rgba(255, 0, 0, 0.4)";
    addNumber.style.border = "2px solid rgba(255, 0, 0, 0.4)";
  }
};

const updateAddString = (event) => {
  valueString = event.target.value;
};

const updateAddNumber = (event2) => {
  valueNumber = event2.target.value;
};

const render = async () => {
  const content = document.getElementById('content-page');
  while (content.firstChild) {
    content.removeChild(content.firstChild);
  }
  calculateSummCosts();
  if (!content.length) {
    content.style.display = "none";
    clearAll.style.display = "none";
  }

  allList.map((item, index) => {
    const container = document.createElement('div');
    container.id = `task-${index}`;
    container.className = 'main-bottom-elem';
    container.innerHTML = `
      <div class="main-bottom-elem-item main-bottom-elem-item__left">
        <span class="main-bottom-elem-item-number">${index + 1})</span>
        <span class="main-bottom-elem-item-title" id="add-text${index}">${item.text}</span>
        <span class="main-bottom-elem-item-date">${item.date}</span>
      </div>
      <div class="main-bottom-elem-item main-bottom-elem-item__middle">
        <span class="main-bottom-elem-item-price"> 
          <span id="add-num${index}">${item.number}</span>
          р.
        </span>
      </div>
      <div class="main-bottom-elem-item main-bottom-elem-item__right">
        <div class="main-bottom-elem-item-button_change">
          <button type="button" id="${index}" onclick="onClickEdit(${index})"></button>
        </div>
        <div class="main-bottom-elem-item-button_delete">
          <button type="button" onclick="onClickDel(${index})"></button>
        </div>
      </div>
    `

    onClickEdit = async (index) => {
      onclicBtnEdit(index);
    };

    onClickDel = async (index) => {
      onclicBtnDel(index);
    };

    content.style.display = "block";
    clearAll.style.display = "block";
    content.appendChild(container);
  });
};


const clickEdit = async (index) => {
  const title_add = document.getElementById(`add-title${index}`);
  const price_add = document.getElementById(`add-price${index}`);
  const addText = document.getElementById(`add-text${index}`);
  const addNum = document.getElementById(`add-num${index}`);
  addText.innerText = title_add.value;
  addNum.innerText = price_add.value;

  document.getElementById(`edit-block-${index}`).remove();
  document.getElementById(`${index}`).style.display = 'block';
  const resp = await fetch('http://localhost:8000/updateList', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      _id: allList[index]._id,
      text: addText.innerText,
      number: addNum.innerText
    })
  });
  const result = await resp.json();
  allList = result.data;
  localStorage.setItem('tasks', JSON.stringify(allList));
  render();
};

const onclicBtnEdit = async (index) => {
  const { text, number } = allList[index];
  const container = document.querySelector(`#task-${index}`);
  const test_Edit = document.createElement('div');
  test_Edit.id = `edit-block-${index}`;
  const btEdit = document.getElementById(`${index}`);
  test_Edit.className = 'test_edit';
  test_Edit.innerHTML = `
    <input type="text" class="title-add" id="add-title${index}" value='${text}'/>
    <input type="number" class="price-add" id="add-price${index}" value='${number}'/>
    <button type="button" class="btn-add" onclick='clickEdit(${index})'>Add</button>
    <button type="button" class="btn-cancel" onclick="clickCancel(${index})">Back</button>
  `;

  btEdit.style.display = 'none';

  container.appendChild(test_Edit);
};

const clickCancel = (index) => {
  document.getElementById(`edit-block-${index}`).remove();
  document.getElementById(`${index}`).style.display = 'block';
}

const onclicBtnDel = async (index) => {
  const container = document.querySelector(`#task-${index}`);
  const resp = await fetch(`http://localhost:8000/deleteList?_id=${allList[index]._id}`, {
    method: 'DELETE',
  });
  const result = await resp.json();
  allList = result.data;
  localStorage.setItem('tasks', JSON.stringify(allList));
  render();
};

const onClickBtnClear = async (index) => {
  const resp = await fetch(`http://localhost:8000/deleteAllList`, {
    method: 'DELETE',
  });
  const result = await resp.json();
  allList = result.data;
  localStorage.setItem('tasks', JSON.stringify(allList));
  render();
};
