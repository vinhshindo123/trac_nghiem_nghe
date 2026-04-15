let data = [];
let current = 0;
let answers = {};
let reviewMode = false;

const hpSelect = document.getElementById("hp-select");
const quizSelect = document.getElementById("quiz-select");

// Load danh sách bài theo học phần
hpSelect.onchange = async () => {
    const hp = hpSelect.value;
    quizSelect.innerHTML = `<option value="">-- Đang tải danh sách bài... --</option>`;

    if (!hp) {
        quizSelect.innerHTML = `<option value="">-- Chọn bài --</option>`;
        return;
    }

    let options = `<option value="">-- Chọn bài --</option>`;

    // Giả định bài thi được đánh số liên tục từ 1, 
    // chúng ta kiểm tra lần lượt cho đến khi file không tồn tại
    let i = 1;
    while (true) {
        const filePath = `data/${hp}/bai_${i}.txt`;
        try {
            const response = await fetch(filePath, { method: 'HEAD' });
            if (response.ok) {
                options += `<option value="${filePath}">Bài ${i}</option>`;
                i++;
            } else {
                break; // Dừng khi không tìm thấy file tiếp theo
            }
        } catch (e) {
            break;
        }
    }

    quizSelect.innerHTML = options;
};

// Load file TXT
quizSelect.onchange = async () => {
    const file = quizSelect.value;
    console.log("Loading file:", file);
    if (!file) return;

    try {
        const res = await fetch(file);
        if (!res.ok) throw new Error("Không thể tải file");
        
        const text = await res.text();
        
        // Kiểm tra xem text có rỗng không trước khi parse
        if (!text.trim()) {
            throw new Error("File rỗng!");
        }

        data = JSON.parse(text); 
        
        // Kiểm tra xem data có phải là mảng không
        if (!Array.isArray(data) || data.length === 0) {
            throw new Error("Dữ liệu không đúng định dạng (cần là mảng JSON)");
        }

        start();
    } catch (e) {
        alert("❌ Lỗi: " + e.message);
        console.error(e);
        // Reset app nếu lỗi
        document.getElementById("app").classList.add("hidden");
    }
};

function start() {
    document.getElementById("app").classList.remove("hidden");
    document.getElementById("palette").classList.remove("hidden");

    current = 0;
    answers = {};
    reviewMode = false;

    render();
}

function render() {
    const q = data[current];
    const card = document.getElementById("card");

    // reset animation
    card.style.animation = "none";
    card.offsetHeight; // trigger reflow
    card.style.animation = "slideFade 0.4s";
    document.getElementById("question-number").innerText =
        `Câu ${current + 1}/${data.length}`;

    document.getElementById("question-text").innerText = q.question;

    const box = document.getElementById("answers");
    box.innerHTML = "";

    q.answers.forEach((a, i) => {
        const div = document.createElement("div");
        div.className = "answer";
        div.innerText = a;

        if (answers[current] === i) div.classList.add("selected");

        if (reviewMode) {
            if (i === q.correct) div.classList.add("correct");
            if (i === answers[current] && i !== q.correct) div.classList.add("wrong");
        }

        div.onclick = (e) => {
            if (reviewMode) return;

            // ripple effect
            const ripple = document.createElement("span");
            ripple.style.position = "absolute";
            ripple.style.width = "100px";
            ripple.style.height = "100px";
            ripple.style.background = "rgba(255,255,255,0.5)";
            ripple.style.borderRadius = "50%";
            ripple.style.left = e.offsetX - 50 + "px";
            ripple.style.top = e.offsetY - 50 + "px";
            ripple.style.pointerEvents = "none";
            ripple.style.animation = "ripple 0.6s linear";

            div.appendChild(ripple);

            setTimeout(() => ripple.remove(), 600);

            // chọn đáp án
            answers[current] = i;

            // delay để thấy animation
            setTimeout(() => render(), 120);
        };

        box.appendChild(div);
    });

    renderPalette();

    document.getElementById("submit")
        .classList.toggle("hidden", current !== data.length - 1);
}

function renderPalette() {
    const p = document.getElementById("palette");
    p.innerHTML = "";

    data.forEach((_, i) => {
        const b = document.createElement("button");
        b.className = "p-btn";
        b.innerText = i + 1;

        if (answers[i] !== undefined) b.classList.add("done");
        if (i === current) b.classList.add("current");

        b.onclick = () => {
            current = i;
            render();
        };

        p.appendChild(b);
    });
}

document.getElementById("next").onclick = () => {
    if (current < data.length - 1) {
        current++;
        render();
    }
};

document.getElementById("prev").onclick = () => {
    if (current > 0) {
        current--;
        render();
    }
};

document.getElementById("submit").onclick = () => {
    if (Object.keys(answers).length < data.length) {
        alert("Chưa làm hết!");
        return;
    }

    let score = 0;
    data.forEach((q, i) => {
        if (answers[i] === q.correct) score++;
    });

    document.getElementById("score").innerText =
        `Bạn đúng ${score}/${data.length}`;

    document.getElementById("modal").classList.remove("hidden");
};

document.getElementById("review").onclick = () => {
    reviewMode = true;
    document.getElementById("modal").classList.add("hidden");
    render();
};
