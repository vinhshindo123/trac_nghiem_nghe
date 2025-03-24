const quizTimer = document.querySelector("#timer");
const quizProgress = document.querySelector("#progress");
const quizProgressText = document.querySelector("#progress_text");
const quizSubmit = document.querySelector("#quiz_submit");
const quizPrev = document.querySelector("#quiz_prev");
const quizNext = document.querySelector("#quiz_next");
const quizCount = document.querySelector(".quiz_question h5");
const quizAnswers = document.querySelectorAll(".quiz_question ul li");
let quizQuestions = document.querySelectorAll(".quiz_numbers ul li");
const quizQuestionList = document.querySelector(".quiz_numbers ul");
const quizAnswersItem = document.querySelectorAll(".quiz_answer_item");
const quizTitle = document.querySelector("#quiz_title");
const quizIncorrect = document.querySelector('#quiz_incorrect')
const testSelect = document.getElementById('test_select');
let currentIndex = 0;
let listSubmit = []; // Lưu index đáp án đã chọn
let listResults = []; // Lưu index kết quả đúng, theo mảng đã random
let isSubmit = false;
let countQuestion = 0;
let correct = 0;
let savedAnswers = {
  "answer6": {},
  "answer17": {}
};
let savedColor = {
  "answer6": {},
  "answer17": {}
}
let saved_incorrect_text = {}
let dataSelect;

testSelect.addEventListener('change', function () {
  const selectedTest = this.value;

  fetch(`${selectedTest}.txt`)
    .then(response => response.text())
    .then(data => {
      dataSelect = JSON.parse(data);
      console.log(dataSelect)
      isSubmit = false;
      currentIndex = 0;
      listSubmit = [];
      listResults = [];
      countQuestion = 0;
      savedAnswers = {
        "answer6": {},
        "answer17": {}
      };
      savedColor = {
        "answer6": {},
        "answer17": {}
      }
      correct = 0;
      saved_incorrect_text = {}
      quizQuestions.forEach((item) => item.classList.remove("active"));
      document.querySelector(".quiz_question ul").style.display = 'flex';
      quizAnswers.forEach((item) => {
        item.classList.remove("active");
        item.classList.remove("incorrect");
      });
      quizIncorrect.style.display = 'none'
      renderQuestion(dataSelect);
    })
    .catch(error => console.error('Error loading file:', error));
});

function renderQuestion(lists) {
  let render = "";
  lists = lists["quizz"]
  lists.forEach((question, index) => {
    render += `<li>${index + 1}</li>`;
    countQuestion++;
  });
  quizQuestionList.innerHTML = render;
  quizQuestions = document.querySelectorAll(".quiz_numbers ul li");
  quizQuestions[0].classList.add("active");

  if (currentIndex + 1 >= 1 && currentIndex + 1 <= 5) {
    quizCount.innerText = `Question ${currentIndex + 1} of ${lists.length}`;
    let text_qs = lists[currentIndex].question.split(',')[1];
    let link = lists[currentIndex].question.split(',')[0];
    let text_image = `<img src="${link}" alt="" class="img_question">`;
    text_qs = text_image + text_qs.replace(/\n/g, "<br>");

    quizTitle.innerHTML = text_qs;

    quizAnswersItem.forEach((answer, index) => {
      answer.innerText = lists[currentIndex].answers[index];
    });
  } else {
    quizCount.innerText = `Question ${currentIndex + 1} of ${lists.length}`;
    quizTitle.innerText = lists[currentIndex].question;
    quizAnswersItem.forEach((answer, index) => {
      answer.innerText = lists[currentIndex].answers[index];
    });
  }

  quizProgress.style = `stroke-dasharray: 0 9999;`;
  quizProgressText.innerText = `0/${lists.length}`;
  handleQuestionList();
  handleAnswer();
}

function checkInputsFilled() {
  const inputs = document.querySelectorAll(".finish_input");
  return Array.from(inputs).every(input => input.value.trim() !== "");
}

function highlightInputBorders(correct, i) {
  const correctAnswers = correct.split(',');
  const inputs = document.querySelectorAll(`.finish_input.index_${i}`)
  let incorrect_text = ""
  let j = 0;
  if (inputs && inputs.length > 0) {
    if (i == 17) {
      j = 21;
    } else if (i == 6) {
      j = 6
    }
    inputs.forEach((input, index) => {
      if (input.value.trim() === correctAnswers[index]) {
        input.style.borderColor = "green";
        savedColor[`answer${i}`][index] = "green"
      } else {
        console.log(`Cấu thứ ${index + j} đáp án đúng là ${correctAnswers[index]}`)
        incorrect_text += `Cấu thứ ${index + j} đáp án đúng là ${correctAnswers[index]}\n`
        input.style.borderColor = "red";
        savedColor[`answer${i}`][index] = "red";
      }
    });
    saved_incorrect_text[`answer${i}`] = incorrect_text
  } else {
    if (i == 17) {
      j = 21;
    } else if (i == 6) {
      j = 6
    }
    const list_answer = savedAnswers[`answer${i}`];
    Object.entries(list_answer).forEach(([index, input]) => {
      if (input.trim() === correctAnswers[parseInt(index)]) {
        savedColor[`answer${i}`][parseInt(index)] = "green"
      } else {
        console.log(`Câu thứ ${parseInt(index) + j} đáp án đúng là ${correctAnswers[parseInt(index)]}`)
        incorrect_text += `Cấu thứ ${parseInt(index) + j} đáp án đúng là ${correctAnswers[parseInt(index)]}\n`
        savedColor[`answer${i}`][parseInt(index)] = "red";
      }
    });
    saved_incorrect_text[`answer${i}`] = incorrect_text
  }

  if (i == 6 || i == 17) {
    quizIncorrect.innerText = incorrect_text
    quizIncorrect.style.display = 'block'
  }
}

function saveInputValues(i) {
  const inputs = document.querySelectorAll(`.finish_input.index_${i}`);
  inputs.forEach((input, index) => {
    savedAnswers[`answer${i}`][index] = input.value.trim();
  });
}

function restoreInputValues(i) {
  const inputs = document.querySelectorAll(`.finish_input.index_${i}`);
  inputs.forEach((input, index) => {
    if (savedAnswers[`answer${i}`][index]) {
      input.value = savedAnswers[`answer${i}`][index];
    }
  });
}

function renderCurrentQuestion(lists) {
  lists = lists["quizz"]
  if (currentIndex + 1 == 6 || currentIndex + 1 == 17) {
    quizCount.innerText = `Question ${currentIndex + 1} of ${lists.length}`;
    let text_input = lists[currentIndex].question.replace(/__________/g, `<input type="text" class="finish_input index_${currentIndex + 1}"></input>`);
    text_input = text_input.replace(/\n/g, "<br>").replace("\t", "&nbsp; &nbsp; &nbsp; &nbsp; &nbsp;");

    quizTitle.innerHTML = text_input;
    document.querySelector(".quiz_question ul").style.display = 'none';

    restoreInputValues(currentIndex + 1);

    const inputs = document.querySelectorAll(".finish_input");
    inputs.forEach(input => {
      input.addEventListener("input", function () {
        saveInputValues(currentIndex + 1);
        // console.log(savedAnswers)
        if (checkInputsFilled()) {
          quizQuestions[currentIndex].classList.add("selected");
          listSubmit[currentIndex] = 0;
          handleProgress();
        } else {
          quizQuestions[currentIndex].classList.remove("selected");
          listSubmit.splice(currentIndex, 1);
          handleProgress();
        }
      });
    });
  } else if (currentIndex + 1 >= 1 && currentIndex + 1 <= 5) {
    document.querySelector(".quiz_question ul").style.display = 'flex';
    quizCount.innerText = `Question ${currentIndex + 1} of ${lists.length}`;
    let text_qs = lists[currentIndex].question.split(',')[1];
    let link = lists[currentIndex].question.split(',')[0];
    let text_image = `<img src="${link}" alt="" class="img_question">`;
    text_qs = text_image + text_qs.replace(/\n/g, "<br>");

    quizTitle.innerHTML = text_qs;

    quizAnswersItem.forEach((answer, index) => {
      answer.innerText = lists[currentIndex].answers[index];
    });
  } else {
    document.querySelector(".quiz_question ul").style.display = 'flex';
    quizCount.innerText = `Question ${currentIndex + 1} of ${lists.length}`;
    quizTitle.innerText = lists[currentIndex].question;

    quizAnswersItem.forEach((answer, index) => {
      answer.innerText = lists[currentIndex].answers[index];
    });
  }
}

function handleQuestionList() {
  quizQuestions.forEach((item, index) => {
    item.addEventListener("click", () => {
      item.scrollIntoView({
        behavior: "smooth",
        inline: "center",
      });

      quizQuestions.forEach((item) => item.classList.remove("active"));
      item.classList.add("active");
      currentIndex = index;

      renderCurrentQuestion(dataSelect);

      quizAnswers.forEach((item) => item.classList.remove("active"));

      const selected = listSubmit[currentIndex];
      console.log(listSubmit);
      selected >= 0 && quizAnswers[selected].click();

      if (isSubmit) {
        renderResults();
        handleProgress(correct);
      } else {
        handleProgress();
      }
    });
  });
}

quizNext.addEventListener("click", () => {
  ++currentIndex;
  if (currentIndex > countQuestion - 1) {
    currentIndex = 0;
  }

  quizQuestions[currentIndex].scrollIntoView({
    behavior: "smooth",
    inline: "center",
  });

  quizQuestions.forEach((item) => item.classList.remove("active"));
  quizQuestions[currentIndex].classList.add("active");

  renderCurrentQuestion(dataSelect);

  quizAnswers.forEach((item) => item.classList.remove("active"));

  const selected = listSubmit[currentIndex];
  console.log(listSubmit);
  selected >= 0 && quizAnswers[selected].click();

  if (isSubmit) {
    renderResults();
    handleProgress(correct);
  } else {
    handleProgress();
  }
});

quizPrev.addEventListener("click", () => {
  --currentIndex;
  if (currentIndex < 0) {
    currentIndex = countQuestion - 1;
  }

  quizQuestions[currentIndex].scrollIntoView({
    behavior: "smooth",
    inline: "center",
  });

  quizQuestions.forEach((item) => item.classList.remove("active"));
  quizQuestions[currentIndex].classList.add("active");

  renderCurrentQuestion(dataSelect);

  quizAnswers.forEach((item) => item.classList.remove("active"));

  const selected = listSubmit[currentIndex];
  console.log(listSubmit);
  selected >= 0 && quizAnswers[selected].click();

  if (isSubmit) {
    renderResults();
    handleProgress(correct);
  } else {
    handleProgress();
  }
});

function handleProgress(correct) {
  const r = quizProgress.getAttribute("r");
  if (!isSubmit) {
    const progressLen = listSubmit.filter((item) => item >= 0);
    quizProgress.style = `stroke-dasharray: ${(2 * Math.PI * r * progressLen.length) / countQuestion
      } 9999;`;
    quizProgressText.innerText = `${progressLen.length}/${countQuestion}`;
  } else {
    quizProgress.style = `stroke-dasharray: ${(2 * Math.PI * r * correct) / countQuestion
      } 9999;`;
    quizProgressText.innerText = `${correct}/${countQuestion}`;
  }
}

function handleAnswer() {
  quizAnswers.forEach((answer, index) => {
    answer.addEventListener("click", () => {
      if (!isSubmit) {
        quizAnswers.forEach((item) => item.classList.remove("active"));
        answer.classList.add("active");
        quizQuestions[currentIndex].classList.add("selected");
        listSubmit[currentIndex] = index;
        handleProgress();
      } else {
        return;
      }
    });
  });
}

quizSubmit.addEventListener("click", () => {
  const progressLen = listSubmit.filter((item) => item >= 0);
  if (progressLen.length === countQuestion) {
    handleCheckResults(dataSelect);
    renderResults();
  } else {
    alert("Bạn chưa chọn hết đáp án");
  }
})

function handleCheckResults(lists) {
  correct = 0;
  lists["quizz"].forEach((item, index) => {
    if (index + 1 === 6 || index + 1 === 17) {
      if (checkInputsFilled()) {
        const correctAnswers = lists["results"].find(r => String(r.quiz_id) === String(item.id)).answer;
        highlightInputBorders(correctAnswers, index + 1);
        listResults[index] = listSubmit[index];
        correct++;
      } else {
        alert("Bạn chưa điền đầy đủ câu trả lời.");
      }
    } else {
      const result = lists["results"].find((r) => String(r.quiz_id) === String(item.id));

      if (item.answers[listSubmit[index]] === result.answer) {
        listResults[index] = listSubmit[index];
        correct++;
      } else {
        quizQuestions[index].classList.add("incorrect");
        listResults[index] = item.answers.indexOf(result.answer);
      }
    }
  });
  isSubmit = true;
  handleProgress(correct);
}

function renderResults() {
  if (currentIndex + 1 === 6 || currentIndex + 1 === 17) {
    const inputs = document.querySelectorAll(`.finish_input.index_${currentIndex + 1}`);
    const inputArray = Array.from(inputs);

    quizIncorrect.innerText = saved_incorrect_text[`answer${currentIndex + 1}`]
    quizIncorrect.style.display = 'block'

    Object.entries(savedColor[`answer${currentIndex + 1}`]).forEach(([index, colors]) => {
      const inputIndex = parseInt(index);
      if (inputIndex >= 0 && inputIndex < inputArray.length) {
        inputArray[inputIndex].style.borderColor = colors;
      }
    });
  } else {
    quizIncorrect.style.display = 'none'
    if (listResults[currentIndex] === listSubmit[currentIndex]) {
      quizAnswers.forEach((item) => {
        item.classList.remove("incorrect");
      });
      quizAnswers[listResults[currentIndex]].classList.add("active");
    } else {
      quizAnswers.forEach((item) => {
        item.classList.remove("active");
        item.classList.remove("incorrect");
      });
      quizAnswers[listResults[currentIndex]].classList.add("active");
      quizAnswers[listSubmit[currentIndex]].classList.add("incorrect");
    }
  }
}
