import { Shape } from "@penpot/plugin-types";
import "./style.css";
import { Settings } from "./types/Settings";
import { ShapeSide } from "./types/ShapeSide";
import { default_settings } from "./settings";

const searchParams = new URLSearchParams(window.location.search);
document.body.dataset.theme = searchParams.get("theme") ?? "light";

let settings: Settings = {...default_settings};

function loadSettings(s: Settings) {
	(document.getElementById("selectionTypeSelect") as HTMLSelectElement).value = s.selectionType;
	(document.getElementById("drawOnSelectionInput") as HTMLInputElement).checked = s.drawOnSelection;
	(document.getElementById("strokeInput") as HTMLInputElement).value = s.strokeWidth.toString();
	(document.getElementById("offsetInput") as HTMLInputElement).value = s.offset.toString();
	(document.getElementById("styleSelect") as HTMLSelectElement).value = s.style;
	(document.getElementById("startCapSelect") as HTMLSelectElement).value = s.startCap;
	(document.getElementById("endCapSelect") as HTMLSelectElement).value = s.endCap;
	(document.getElementById("connectorTypeSelect") as HTMLSelectElement).value = s.connectorType;
	(document.getElementById("colorInput") as HTMLInputElement).value = s.color;
	(document.getElementById("colorPreview") as HTMLDivElement).style.backgroundColor = `#${s.color}`;
	(document.getElementById("opacityInput") as HTMLInputElement).value = s.opacity.toString();
	(document.querySelectorAll("[data-setting='startAnchor']") as NodeListOf<HTMLInputElement>).forEach(i => i.checked = i.value === settings.startAnchor);
	(document.querySelectorAll("[data-setting='endAnchor']") as NodeListOf<HTMLInputElement>).forEach(i => i.checked = i.value === settings.endAnchor);
}

function onIntegerInput(event: InputEvent, key: "offset" | "strokeWidth"): void {
	const target = event.target as HTMLInputElement;

	target.value = target.value.replace(/[^0-9]/g, '');

	if (target.value.length === 0) {
		return;
	}

	settings[key] = parseInt(target.value);
}

function setDefaultIfEmpty(e: FocusEvent): void {
	const input = e.target as HTMLInputElement;

	if(input.value.length !== 0) {
		return;
	}

	input.value = default_settings[input.dataset.setting as keyof Settings]!.toString();
	input.dispatchEvent(new Event("input"));
}

function onInputKeydown(e: KeyboardEvent): void {
	if ([
		"Backspace", "Delete", "Tab", "Escape", "Enter", "Home", "End",
		"ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"
	].includes(e.key)) {
		return;
	}

	// Allow Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X, Ctrl+Z
	if (e.ctrlKey && ["a", "c", "v", "x", "z"].includes(e.key.toLowerCase())) {
		return;
	}

	if (!/^[0-9]$/.test(e.key)) {
		e.preventDefault();
	}
}

document.getElementById("colorInput")?.addEventListener("input", event => {
	const inputElement = event.target as HTMLInputElement;

	if (!inputElement.checkValidity()) {
		return;
	}

	settings.color = inputElement.value;
	document.getElementById("colorPreview")!.style.backgroundColor = `#${settings.color}`;
});

document.getElementById("colorInput")!.addEventListener("blur", e => setDefaultIfEmpty(e));

document.getElementById("opacityInput")!.addEventListener("blur", e => setDefaultIfEmpty(e));

document.getElementById("opacityInput")?.addEventListener("input", event => {
	const inputElement = event.target as HTMLInputElement;

	if (!inputElement.checkValidity()) {
		return;
	}

	settings.opacity = parseInt(inputElement.value);
});

document.querySelectorAll("select").forEach(dropdown => {
  dropdown.addEventListener("change", (e) => {
    const target = e.target as HTMLSelectElement;
    const setting = target.dataset.setting as keyof Settings;
    if (setting) {
      (settings as any)[setting] = target.value;
    }
  });
});

document.getElementById("strokeInput")?.addEventListener("keydown", e => onInputKeydown(e));

document.getElementById("strokeInput")!.addEventListener("blur", e => setDefaultIfEmpty(e));

document.getElementById("strokeInput")!.addEventListener("input", (e) => onIntegerInput(e as InputEvent, "strokeWidth"));

document.getElementById("offsetInput")?.addEventListener("keydown", e => onInputKeydown(e));

document.getElementById("offsetInput")?.addEventListener("input", e => onIntegerInput(e as InputEvent, "offset"));

document.getElementById("offsetInput")?.addEventListener("blur", e => setDefaultIfEmpty(e));

document.getElementById("drawOnSelectionInput")?.addEventListener("change", (e) => {
  const target = e.target as HTMLInputElement;
  settings.drawOnSelection = target.checked;
});

document.getElementById("generateButton")?.addEventListener("click", () => {
	parent.postMessage({ type: "generate-connector", settings }, "*");
});

document.getElementById("restoreButton")?.addEventListener("click", () => {
	settings = {...default_settings};
	loadSettings(settings);
});

document.getElementById("switchCapsButton")?.addEventListener("click", () => {
	const initialValue = settings.startCap;
	settings.startCap = settings.endCap;
	settings.endCap = initialValue;
	(document.getElementById("startCapSelect") as HTMLInputElement).value = settings.startCap;
	(document.getElementById("endCapSelect") as HTMLInputElement).value = settings.endCap;
});

function setupAnchorPointListeners(key: "endAnchor" | "startAnchor") {
	const anchorPoints = document.querySelectorAll<HTMLInputElement>(`[data-setting="${key}"]`);

	anchorPoints.forEach(anchorPoint => {
		anchorPoint.addEventListener("input", () => {
			anchorPoints.forEach(ap => {
				if(anchorPoint.value !== ap.value) {
					ap.checked = false;
				}
			});
			settings[key] = anchorPoint.checked ? anchorPoint.value as ShapeSide : null;
		});
	});
}

window.addEventListener("message", (event) => {

	if (event.data.type === "selection-update") {
		updatePreviewElements(event.data.selection);

		if(settings.drawOnSelection && event.data.selection.length === 2) {
			parent.postMessage({ type: "generate-connector", settings }, "*");
		}

		return;
	}

	if (event.data.type === "notification") {
		showNotification(event.data.message, event.data.notificationType);
		return;
	}

	if (event.data.type === "initialize") {
		updatePreviewElements(event.data.selection);
		return;
	}

	if (event.data.type === "theme-change") {
		document.body.dataset.theme = event.data.theme;
		return;
	}

});

function updatePreviewElements(selection: Shape[]): void {
	const leftPreviewText = document.getElementById("leftPreviewText") as HTMLElement;
	const rightPreviewText = document.getElementById("rightPreviewText") as HTMLElement;

	const defaultRightText = "then another element holding [Shift]";

	if (selection.length === 0) {
		leftPreviewText.textContent = "Select an element";
		leftPreviewText.classList.remove("preview-text--selected");
		rightPreviewText.textContent = defaultRightText;
		rightPreviewText.classList.remove("preview-text--selected");
		return;
	}

	if (selection.length === 1) {
		leftPreviewText.textContent = selection[0].name;
		leftPreviewText.classList.add("preview-text--selected");
		rightPreviewText.textContent = defaultRightText;
		rightPreviewText.classList.remove("preview-text--selected");
		return;
	}

	if (selection.length >= 2) {
		leftPreviewText.textContent = selection[0].name;
		leftPreviewText.classList.add("preview-text--selected");
		rightPreviewText.textContent = selection[1].name;
		rightPreviewText.classList.add("preview-text--selected");
	}
}

function showNotification(message: string, type: string) {
	const output = document.getElementById("output") as HTMLDivElement;
	output.textContent = message;
	const typeClass = type === "success" ? "output--success" : "output--error";
	output.classList.add("output--visible", typeClass);
	setTimeout(() => output.classList.remove("output--visible", typeClass), 3000);
}

document.addEventListener('DOMContentLoaded', () => {
	loadSettings(settings);
	setupAnchorPointListeners("startAnchor");
	setupAnchorPointListeners("endAnchor");
});
