function addRow() {

    let table = document.querySelector("#studentTable tbody");

    let count = table.rows.length + 1;

    let row = document.createElement("tr");

    row.innerHTML = `

    <td class="serial">${count}</td>

    <td>
        <input name="name[]" required>
    </td>

    <td>
        <input
        name="attended[]"
        type="number"
        min="0"
        oninput="calculate(this)"
        required>
    </td>

    <td>
        <span class="percent">0%</span>
    </td>

    <td>
        <button
        type="button"
        class="delete-btn"
        onclick="deleteRow(this)">
        <i class="fa-solid fa-xmark"></i>
        </button>
    </td>

    `;

    table.appendChild(row);

    updateStats();

}


function deleteRow(btn) {

    btn.closest("tr").remove();

    updateSerial();

    updateStats();

}


function updateSerial() {

    document.querySelectorAll(".serial").forEach((el, i) => {

        el.innerText = i + 1;

    });

}


function calculate(el) {

    let total = Number(
        document.getElementById("totalClasses").value
    );

    let attended = Number(el.value);

    if (attended < 0) {

        alert("Attendance cannot be negative.");

        el.value = "";

        return;

    }

    if (attended > total) {

        alert("Attended classes cannot exceed total classes.");

        el.value = "";

        el.closest("tr")
        .querySelector(".percent")
        .innerText = "0%";

        return;

    }

    let percent = total > 0

        ? (attended / total) * 100

        : 0;

    el.closest("tr")
    .querySelector(".percent")
    .innerText = percent.toFixed(1) + "%";

    updateStats();

}


function updateAll() {

    document.querySelectorAll(

        'input[name="attended[]"]'

    ).forEach(el => calculate(el));

}


function updateStats() {

    let percents = [];

    document.querySelectorAll(".percent")

    .forEach(el => {

        percents.push(

            parseFloat(

                el.innerText

            ) || 0

        );

    });

    let totalStudents = percents.length;

    let avg = 0;

    let highest = 0;

    let lowest = 0;

    if (percents.length > 0) {

        avg = percents.reduce(

            (a, b) => a + b, 0

        ) / percents.length;

        highest = Math.max(...percents);

        lowest = Math.min(...percents);

    }

    document.getElementById(

        "studentCount"

    ).innerText = totalStudents;

    document.getElementById(

        "avgAttendance"

    ).innerText = avg.toFixed(1) + "%";

    document.getElementById(

        "highestAttendance"

    ).innerText = highest.toFixed(1) + "%";

    document.getElementById(

        "lowestAttendance"

    ).innerText = lowest.toFixed(1) + "%";

}


function searchStudent() {

    let input = document

    .getElementById("searchStudent")

    .value

    .toLowerCase();

    let rows = document.querySelectorAll(

        "#studentTable tbody tr"

    );

    rows.forEach(row => {

        let name = row

        .querySelector(

            'input[name="name[]"]'

        )

        .value

        .toLowerCase();

        row.style.display =

            name.includes(input)

            ? ""

            : "none";

    });

}


function loading(btn) {

    btn.innerHTML = "Generating PDF...";

    btn.disabled = true;

}

