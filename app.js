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

function renderGroups(rows) {
	$container["innerHTML"] = "";
	const nCols = rows[0] ? rows[0]["length"] : 0;
	const nPairs = Math.ceil(nCols / 2);
	const isTruthy = (v) => {
		const s = String(v).trim().toLowerCase();
		return s === "true" || s === "1" || s === "yes" || s === "sim";
	};

	for (let i = 0; i < rows["length"]; i += 3) {
		const chunk = rows["slice"](i, i + 3);
		const group = document["createElement"]("div");
		group["className"] = "group";

		chunk["forEach"]((r, j) => {
			const rowEl = document["createElement"]("div");
			rowEl["className"] = "row";
			rowEl["style"]["display"] = "grid";
			rowEl["style"]["gap"] = "8px";
			rowEl["style"]["gridTemplateColumns"] = `repeat(${nPairs}, minmax(0,1fr))`;

			for (let c = 0; c < r["length"]; c += 2) {
				const name = r[c];
				const flag = r[c + 1];

				const pair = document["createElement"]("div");
				pair["className"] = "pair";
				pair["style"]["background"] = isTruthy(flag) ? "#ccffcc" : "#fff7b3";

				const elName = document["createElement"]("div");
				elName["className"] = "cell";
				elName["textContent"] = String(name ?? "");

				const elFlag = document["createElement"]("div");
				elFlag["className"] = "cell";

				const chk = document["createElement"]("input");
				chk["type"] = "checkbox";
				chk["className"] = "toggle";
				chk["checked"] = isTruthy(flag);

				// rowNumber: pula cabeçalho (+2); i = offset do grupo; j = índice na janela 0..2
				const rowNumber = (i + j) + 2;
				const colNumber = (c + 2); // 1-based

				chk["addEventListener"]("change", async () => {
					const newVal = chk["checked"];
					try {
						await updateFlag($switch["value"], rowNumber, colNumber, newVal);
						pair["style"]["background"] = newVal ? "#ccffcc" : "#fff7b3";
					} catch (e) {
						console["error"](e);
						// desfaz se falhar
						chk["checked"] = !newVal;
						alert("Falha ao atualizar na planilha.");
					}
				});

				elFlag["appendChild"](chk);
				pair["appendChild"](elName);
				pair["appendChild"](elFlag);
				rowEl["appendChild"](pair);
			}

			group["appendChild"](rowEl);
		});

		$container["appendChild"](group);
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

async function updateFlag(sheet, row, col, value) {
	const params = new URLSearchParams({
		sheet,
		row: String(row),
		col: String(col),
		value: value ? "true" : "false"
	});
	const url = "https://corsproxy.io/?" + encodeURIComponent(`${CONFIG["SCRIPT_URL"]}?${params.toString()}`);
	const res = await fetch(url);
	if (!res["ok"]) throw new Error(`HTTP ${res["status"]}`);
	const data = await res["json"]();
	if (!data || data["ok"] !== true) throw new Error(data && data["error"] || "Erro desconhecido");
	return data;
}


