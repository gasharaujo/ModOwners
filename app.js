// ===== Config =====
const CONFIG = {
	"SCRIPT_URL": "https://script.google.com/macros/s/AKfycbz1OiVNmLordGKCda9ODB_eXLhnP-3LtVoG0S3BzJvZGItReHQSQKTBuSm1EOTXZ7atvA/exec" // ex.: https://script.google.com/macros/s/XXX/exec
};

const KEY = "abaSelecionada";

// ===== UI =====
const $ = (sel) => document["querySelector"](sel);
const $switch = $("#switch");
const $status = $("#status");
const $container = $("#container");
const $refresh = $("#refresh");

// Carrega aba salva ou padrão
function getCurrentSheet() {
	return localStorage["getItem"](KEY) || "Arbok";
}

function setCurrentSheet(val) {
	localStorage["setItem"](KEY, val);
}

// Renderiza em grupos de 3
function renderGroups(rows) {
	$container["innerHTML"] = "";
	for (let i = 0; i < rows["length"]; i += 3) {
		const chunk = rows["slice"](i, i + 3);
		const div = document["createElement"]("div");
		div["className"] = "group";
		div["innerHTML"] = chunk
			.map((r) => `<div class="row">${r["map"]((c) => `<div>${String(c)}</div>`).join("")}</div>`)
			.join("");
		$container["appendChild"](div);
	}
}

async function fetchSheet(sheetName) {
	$status["textContent"] = "Carregando...";
	try {
		const url = `${CONFIG["SCRIPT_URL"]}?sheet=${encodeURIComponent(sheetName)}`;
		const res = await fetch(url);
		if (!res["ok"]) throw new Error(`HTTP ${res["status"]}`);
		const data = await res["json"]();
		renderGroups(data["rows"] || []);
		$status["textContent"] = `Mostrando: ${data["sheet"]} (${(data["rows"]||[])["length"]} linhas)`;
	} catch (err) {
		console["error"](err);
		$status["textContent"] = "Erro ao carregar. Veja o console.";
	}
}

function init() {
	const initial = getCurrentSheet();
	$switch["value"] = initial;
	fetchSheet(initial);

	$switch["addEventListener"]("change", () => {
		const val = $switch["value"];
		setCurrentSheet(val);
		fetchSheet(val);
	});

	$refresh["addEventListener"]("click", () => fetchSheet($switch["value"]));
}

document["addEventListener"]("DOMContentLoaded", init);
