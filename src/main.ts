import { Shape } from "@penpot/plugin-types";
import "./style.css";
import { ConnectorSettings } from "./types/ConnectorSettings";
import { ShapeSide } from "./types/ShapeSide";

// get the current theme from the URL
const searchParams = new URLSearchParams(window.location.search);
document.body.dataset.theme = searchParams.get("theme") ?? "light";

const settings: ConnectorSettings = {
  color: "#000000",
  opacity: 100,
  strokeWidth: 2,
  position: "center",
  style: "solid",
  startArrow: "none",
  endArrow: "none",
  drawOnSelection: false,
  startAnchor: null,
  endAnchor: null,
  connectorType: "direct",
  offset: 0,
  selectionType: "connector"
};

function updateUI(s: ConnectorSettings) {
	const strokeInput = document.getElementById("strokeInput") as HTMLInputElement;
	strokeInput.value = s.strokeWidth.toString();

	const offsetInput = document.getElementById("offsetInput") as HTMLInputElement;
	offsetInput.value = s.offset.toString();

	const styleDropdown = document.getElementById("styleSelect") as HTMLSelectElement;
	styleDropdown.value = s.style;

	const startArrowDropdown = document.getElementById("startCapSelect") as HTMLSelectElement;
	startArrowDropdown.value = s.startArrow;

	const endArrowDropdown = document.getElementById("endCapSelect") as HTMLSelectElement;
	endArrowDropdown.value = s.endArrow;

	const connectorTypeDropdown = document.getElementById("connectorTypeSelect") as HTMLSelectElement;
	connectorTypeDropdown.value = s.connectorType;

	const colorInput = document.getElementById("colorInput") as HTMLInputElement;
	colorInput.value = s.color.slice(1);

	const colorPreview = document.getElementById("colorPreview") as HTMLDivElement;
	colorPreview.style.backgroundColor = s.color;

	const opacityInput = document.getElementById("opacityInput") as HTMLInputElement;
	opacityInput.value = s.opacity.toString();
}

// Event listeners for UI controls

document.getElementById("colorInput")?.addEventListener("input", event => {
	const inputElement = event.target as HTMLInputElement;

	if (!inputElement.checkValidity()) {
		return;
	}

	settings.color = `#${inputElement.value}`;
	updateUI(settings);
	parent.postMessage({ type: "settings-changed", settings }, "*");
});

document.getElementById("opacityInput")?.addEventListener("input", event => {
	const inputElement = event.target as HTMLInputElement;

	if (!inputElement.checkValidity()) {
		return;
	}

	settings.opacity = parseInt(inputElement.value);
	updateUI(settings);
	parent.postMessage({ type: "settings-changed", settings }, "*");
});

document.querySelectorAll(".dropdown").forEach(dropdown => {
  dropdown.addEventListener("change", (e) => {
    const target = e.target as HTMLSelectElement;
    const setting = target.dataset.setting as keyof ConnectorSettings;
    if (setting) {
      (settings as any)[setting] = target.value;
      parent.postMessage({ type: "settings-changed", settings }, "*");
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
    parent.postMessage({ type: "settings-changed", settings }, "*");
  } else if (target.value === '') {
    // Si el campo está vacío, no actualizar settings pero permitir el estado vacío temporalmente
    return;
  } else {
    // Si el valor está fuera del rango, ajustarlo
    const clampedValue = Math.max(1, Math.min(100, value || 1));
    target.value = clampedValue.toString();
    settings.strokeWidth = clampedValue;
    parent.postMessage({ type: "settings-changed", settings }, "*");
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
    parent.postMessage({ type: "settings-changed", settings }, "*");
  } else if (target.value === '') {
    // Si el campo está vacío, usar 0 como valor por defecto
    settings.offset = 0;
    parent.postMessage({ type: "settings-changed", settings }, "*");
  } else {
    // Si el valor está fuera del rango, ajustarlo
    const clampedValue = Math.max(0, Math.min(200, value || 0));
    target.value = clampedValue.toString();
    settings.offset = clampedValue;
    parent.postMessage({ type: "settings-changed", settings }, "*");
  }
});

document.getElementById("drawOnSelectionInput")?.addEventListener("change", (e) => {
  const target = e.target as HTMLInputElement;
  settings.drawOnSelection = target.checked;
  parent.postMessage({ type: "settings-changed", settings }, "*");
});

document.getElementById("generateButton")?.addEventListener("click", () => {
  parent.postMessage({ type: "generate-connector", settings }, "*");
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
			settings[key] = anchorPoint.value as ShapeSide;
			parent.postMessage({ type: "settings-changed", settings }, "*");
		});
	});
}

// Listen plugin.ts messages
window.addEventListener("message", (event) => {
  if (event.data.source === "penpot") {
    document.body.dataset.theme = event.data.theme;
  } else if (event.data.type === "notification") {
    // Show notification to user
    showNotification(event.data.message);
  } else if (event.data.type === "selection-update") {
    // Update preview elements with selected element names
    updatePreviewElements(event.data.selection);
		updateAnchorPointsVisualState("startAnchor");
		updateAnchorPointsVisualState("endAnchor");
  }
});

function updatePreviewElements(selection: Shape[]) {
	const leftPreviewText = document.getElementById("leftPreviewText") as HTMLElement;
	const rightPreviewText = document.getElementById("rightPreviewText") as HTMLElement;

	const defaultRightText = "then another element holding [Shift]";

	if (selection.length === 0) {
		leftPreviewText.textContent = "Select an element";
		leftPreviewText.classList.remove("preview-text--selected");
		rightPreviewText.textContent = defaultRightText;
		rightPreviewText.classList.remove("preview-text--selected");

		settings.startAnchor = null;
		settings.endAnchor = null;
		return;
	}

	if (selection.length === 1) {
		leftPreviewText.textContent = selection[0].name;
		leftPreviewText.classList.add("preview-text--selected");
		rightPreviewText.textContent = defaultRightText;
		rightPreviewText.classList.remove("preview-text--selected");

		settings.endAnchor = null;
		return;
	}

	if (selection.length >= 2) {
		leftPreviewText.textContent = selection[0].name;
		leftPreviewText.classList.add("preview-text--selected");
		rightPreviewText.textContent = selection[1].name;
		rightPreviewText.classList.add("preview-text--selected");
	}
}

function updateAnchorPointsVisualState(key: "startAnchor" | "endAnchor") {
	const anchorPoints = document.querySelectorAll<HTMLInputElement>(`[data-setting="${key}"]`);

	anchorPoints.forEach(point => {
    point.checked = settings[key] === point.value;
  });
}

function showNotification(message: string) {
  const notification = document.createElement('div');
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 16px;
    right: 16px;
    background-color: #333;
    color: white;
    padding: 12px 16px;
    border-radius: 8px;
    font-size: 14px;
    z-index: 1000;
    max-width: 300px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
  `;

  document.body.appendChild(notification);

  // Remove after 3 seconds
  setTimeout(() => {
    if (notification.parentNode) {
      notification.parentNode.removeChild(notification);
    }
  }, 3000);
}

// Initialize UI on load
document.addEventListener('DOMContentLoaded', () => {
  updateUI(settings);
  setupAnchorPointListeners("startAnchor");
  setupAnchorPointListeners("endAnchor");
});
