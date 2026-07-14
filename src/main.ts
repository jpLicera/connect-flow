import { Shape } from "@penpot/plugin-types";
import "./style.css";
import { Settings } from "./types/Settings";
import { ShapeSide } from "./types/ShapeSide";
import { default_settings } from "./settings";

const searchParams = new URLSearchParams(window.location.search);
document.body.dataset.theme = searchParams.get("theme") ?? "light";

const settings: Settings = {...default_settings};

function loadSettings(s: Settings) {
	const strokeInput = document.getElementById("strokeInput") as HTMLInputElement;
	strokeInput.value = s.strokeWidth.toString();

	const offsetInput = document.getElementById("offsetInput") as HTMLInputElement;
	offsetInput.value = s.offset.toString();

	const styleDropdown = document.getElementById("styleSelect") as HTMLSelectElement;
	styleDropdown.value = s.style;

	const startCapDropdown = document.getElementById("startCapSelect") as HTMLSelectElement;
	startCapDropdown.value = s.startCap;

	const endCapDropdown = document.getElementById("endCapSelect") as HTMLSelectElement;
	endCapDropdown.value = s.endCap;

	const connectorTypeDropdown = document.getElementById("connectorTypeSelect") as HTMLSelectElement;
	connectorTypeDropdown.value = s.connectorType;

	const colorInput = document.getElementById("colorInput") as HTMLInputElement;
	colorInput.value = s.color.slice(1);

	const colorPreview = document.getElementById("colorPreview") as HTMLDivElement;
	colorPreview.style.backgroundColor = s.color;

	const opacityInput = document.getElementById("opacityInput") as HTMLInputElement;
	opacityInput.value = s.opacity.toString();
}

document.getElementById("colorInput")?.addEventListener("input", event => {
	const inputElement = event.target as HTMLInputElement;

	if (!inputElement.checkValidity()) {
		return;
	}

	settings.color = `#${inputElement.value}`;
	document.getElementById("colorPreview")!.style.backgroundColor = settings.color;
});

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

// Prevenir entrada de caracteres no numéricos en el input de stroke-width
document.getElementById("strokeInput")?.addEventListener("keydown", (e) => {
  const key = (e as KeyboardEvent).key;
  // Permitir: backspace, delete, tab, escape, enter, home, end, left, right, up, down
  if ([
    'Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'Home', 'End',
    'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'
  ].includes(key)) {
    return;
  }
  // Permitir Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X, Ctrl+Z
  if ((e as KeyboardEvent).ctrlKey && ['a', 'c', 'v', 'x', 'z'].includes(key.toLowerCase())) {
    return;
  }
  // Bloquear si no es un número
  if (!/^[0-9]$/.test(key)) {
    e.preventDefault();
  }
});

document.getElementById("strokeInput")?.addEventListener("input", (e) => {
  const target = e.target as HTMLInputElement;

  // Remover cualquier carácter que no sea número
  target.value = target.value.replace(/[^0-9]/g, '');

  const value = parseInt(target.value);
  if (!isNaN(value) && value >= 1 && value <= 100) {
    settings.strokeWidth = value;
  } else if (target.value === '') {
    // Si el campo está vacío, no actualizar settings pero permitir el estado vacío temporalmente
    return;
  } else {
    // Si el valor está fuera del rango, ajustarlo
    const clampedValue = Math.max(1, Math.min(100, value || 1));
    target.value = clampedValue.toString();
    settings.strokeWidth = clampedValue;
  }
});

// Prevenir entrada de caracteres no numéricos en el input de offset
document.getElementById("offsetInput")?.addEventListener("keydown", (e) => {
  const key = (e as KeyboardEvent).key;
  // Permitir: backspace, delete, tab, escape, enter, home, end, left, right, up, down
  if ([
    'Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'Home', 'End',
    'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'
  ].includes(key)) {
    return;
  }
  // Permitir Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X, Ctrl+Z
  if ((e as KeyboardEvent).ctrlKey && ['a', 'c', 'v', 'x', 'z'].includes(key.toLowerCase())) {
    return;
  }
  // Bloquear si no es un número
  if (!/^[0-9]$/.test(key)) {
    e.preventDefault();
  }
});

document.getElementById("offsetInput")?.addEventListener("input", (e) => {
  const target = e.target as HTMLInputElement;

  // Remover cualquier carácter que no sea número
  target.value = target.value.replace(/[^0-9]/g, '');

  const value = parseInt(target.value);
  if (!isNaN(value) && value >= 0 && value <= 200) {
    settings.offset = value;
  } else if (target.value === '') {
    // Si el campo está vacío, usar 0 como valor por defecto
    settings.offset = 0;
  } else {
    // Si el valor está fuera del rango, ajustarlo
    const clampedValue = Math.max(0, Math.min(200, value || 0));
    target.value = clampedValue.toString();
    settings.offset = clampedValue;
  }
});

document.getElementById("drawOnSelectionInput")?.addEventListener("change", (e) => {
  const target = e.target as HTMLInputElement;
  settings.drawOnSelection = target.checked;
});

document.getElementById("generateButton")?.addEventListener("click", () => {
  parent.postMessage({ type: "generate-connector", settings }, "*");
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

	if (event.data.type === "theme-change") {
		document.body.dataset.theme = event.data.theme;
		return;
	}

	if (event.data.type === "notification") {
		showNotification(event.data.message, event.data.notificationType);
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
