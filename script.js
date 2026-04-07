const appliances = [
    { name: "Холодильник (150 Вт)", watts: 150 },
    { name: "WiFi роутер (20 Вт)", watts: 20 },
    { name: "Зарядка телефону (10 Вт)", watts: 10 },
    { name: "Світло (LED, 15 Вт)", watts: 15 },
    { name: "Електрочайник (2000 Вт)", watts: 2000 },
    { name: "Обігрівач (1500 Вт)", watts: 1500 },
    { name: "Водяний насос (800 Вт)", watts: 800 }
];

const applianceList = document.getElementById("applianceList");

appliances.forEach((appliance, index) => {
    const div = document.createElement("div");
    div.className = "appliance";

    div.innerHTML = `
        <input type="checkbox" id="appliance${index}" value="${appliance.watts}">
        <label for="appliance${index}">${appliance.name}</label>
    `;

    applianceList.appendChild(div);
});

document.addEventListener("change", calculateLoad);

function calculateLoad() {
    const generatorPower = parseInt(document.getElementById("generatorPower").value) || 0;
    const checkboxes = document.querySelectorAll("input[type=checkbox]");

    let total = 0;

    checkboxes.forEach(box => {
        if (box.checked) {
            total += parseInt(box.value);
        }
    });

    document.getElementById("totalLoad").innerText = total;

    const status = document.getElementById("status");
    const results = document.querySelector(".results");

    if (generatorPower === 0) {
        status.innerText = "Введіть потужність генератора.";
        results.className = "results";
        return;
    }

    if (total <= generatorPower) {
        status.innerText = "Безпечно ✅";
        results.className = "results safe";
    } else {
        status.innerText = "Перевантаження ⚠️";
        results.className = "results danger";
    }
}