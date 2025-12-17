(() => {
    console.log('开始载入');
    const OVERLAY_ID = 'guide-diary-overlay';
    const STYLE_ID = 'guide-diary-overlay-style';
    const ROOT_ID = 'guide-diary-root';
    const ownerDocument = document;
    let hostDocument = ownerDocument;
    try {
        if (window.parent && window.parent !== window && window.parent.document) {
            hostDocument = window.parent.document;
        }
    } catch (error) {
        console.warn('父窗口文档不可用，改用当前文档', error);
    }

    const Version = 1.0;
    const GUIDE_DIARY_STORAGE_SCOPE = { type: 'chat' };
    const GUIDE_DIARY_STORAGE_KEY = 'guideDiaryData';
    const GUIDE_DIARY_RENDER_FLAG_KEY = 'guideDiaryRendered';
    const HAS_TAVERN_VARIABLE_API = typeof getVariables === 'function' && typeof insertOrAssignVariables === 'function';
    let tavernVariableWarningShown = false;

    const shouldSkipRender = (() => {
        if (typeof getVariables !== 'function') {
            return false;
        }
        try {
            const variables = getVariables(GUIDE_DIARY_STORAGE_SCOPE) || {};
            const raw = variables[GUIDE_DIARY_STORAGE_KEY];
            return Boolean(raw && typeof raw === 'object' && raw.norender === true);
        }
        catch (error) {
            console.warn('Guide Diary: failed to inspect norender flag', error);
            return false;
        }
    })();

    if (shouldSkipRender) {
        console.log('Guide Diary: rendering skipped due to norender flag');
        return;
    }

    const overlayCss = `
@import url("https://fontsapi.zeoseven.com/69/main/result.css");

#${OVERLAY_ID} hr {
  margin: 1rem 0;
  color: inherit;
  border: 0;
  border-top: 1px solid black;
}


#${OVERLAY_ID} {
	position: fixed;
	inset: 0;
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 24px;
	background-color: transparent;
	z-index: 2147483647;
	pointer-events: none;
       font-family: "Noto Sans CJK";
    font-weight: normal;
    font-feature-settings: "hwid";
    line-height: 1.5;
    color: #212529;
}

#${OVERLAY_ID} *,
#${OVERLAY_ID} *::before,
#${OVERLAY_ID} *::after {
    box-sizing: border-box;
}

#${OVERLAY_ID}.guide-diary-hidden {
	display: none;
}

#${OVERLAY_ID} .guide-diary-surface {
	width: 100%;
	height: 100%;
	display: flex;
	align-items: center;
	justify-content: center;
	background: transparent;
	pointer-events: none;
}

#${OVERLAY_ID} .guide-diary-scroll {
	position: relative;
	width: 100%;
	height: 100%;
	display: block;
	overflow: visible;
	pointer-events: none;
}

#${OVERLAY_ID} .guide-diary-scroll > .container {
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	margin: 0;
	pointer-events: all;
}

#${OVERLAY_ID} #${ROOT_ID} {
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	margin: 0;
	pointer-events: none;
	touch-action: none;
	will-change: transform;
}

#${OVERLAY_ID} .guide-diary-drag-handle {
	cursor: grab;
	user-select: none;
}

#${OVERLAY_ID} .guide-diary-card-dragging {
	user-select: none;
}

#${OVERLAY_ID} .container {
    width: 100%;
    max-width: 960px;
    margin-right: auto;
    margin-left: auto;
    padding-right: 1rem;
    padding-left: 1rem;
}

#${OVERLAY_ID} .mt-5 {
    margin-top: 3rem;
}

#${OVERLAY_ID} .my-3 {
    margin-top: 1rem;
    margin-bottom: 1rem;
}

#${OVERLAY_ID} .mb-3 {
    margin-bottom: 1rem;
}

#${OVERLAY_ID} .mb-4 {
    margin-bottom: 1.5rem;
}

#${OVERLAY_ID} .d-flex {
    display: flex;
}
    #${OVERLAY_ID} .leftflex {
    width: 50%;
    display: flex;
     align-items: center;
}

#${OVERLAY_ID} .flex-wrap {
    flex-wrap: wrap;
}

#${OVERLAY_ID} .justify-content-between {
    justify-content: space-between;
}

#${OVERLAY_ID} .justify-content-around {
    justify-content: space-around;
}

#${OVERLAY_ID} .justify-content-end {
    justify-content: flex-end;
}

#${OVERLAY_ID} .justify-content-center {
    justify-content: center;
}

#${OVERLAY_ID} .text-center {
    text-align: center;
}

#${OVERLAY_ID} .guide-diary-card-dragging .guide-diary-drag-handle {
	cursor: grabbing;
}

#${OVERLAY_ID} .guide-diary-minimize-button {
	position: absolute;
	right: 12px;
	top: 50%;
	transform: translateY(-50%);
	background: transparent;
	border: none;
	color: #ffffff;
	font-size: 1.5rem;
	line-height: 1;
	padding: 4px 8px;
	cursor: pointer;
	opacity: 0.9;
}

#${OVERLAY_ID} .guide-diary-minimize-button:hover {
	opacity: 1;
}

#${OVERLAY_ID} .guide-diary-minimized-panel {
	position: fixed;
	bottom: 24px;
	right: 24px;
	width: 140px;
	height: 96px;
	background-color: #f8d7da;
	border-radius: 12px;
	box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
	color: #000000;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	gap: 8px;
	padding: 12px;
	pointer-events: all;
    cursor: grab;
}

#${OVERLAY_ID} .guide-diary-minimized-panel[hidden] {
	display: none !important;
}

#${OVERLAY_ID} .guide-diary-minimized-panel.guide-diary-minimized-dragging {
    cursor: grabbing;
}

#${OVERLAY_ID} .guide-diary-minimized-panel button {
	background-color: #ffffff;
	border: none;
	border-radius: 6px;
	padding: 6px 12px;
	cursor: pointer;
	box-shadow: 0 3px 8px rgba(0, 0, 0, 0.15);
	font-size: 0.9rem;
}

#${OVERLAY_ID} .guide-diary-minimized-panel button:hover {
	background-color: #f5c6cb;
}

#${OVERLAY_ID} .guide-diary-minimized-label {
	font-weight: 600;
	text-align: center;
}

#${OVERLAY_ID} .guide-diary-card-hidden {
	display: none !important;
}

@media (max-width: 576px) {
	#${OVERLAY_ID} .guide-diary-minimized-panel {
		bottom: 16px;
		right: 16px;
		width: 120px;
		height: 84px;
		padding: 10px;
	}
	#${OVERLAY_ID} {
		padding: 12px;
	}
}

#${OVERLAY_ID} .align-items-center {
	align-items: center;
}

#${OVERLAY_ID} .shadow-sm {
	box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
}

#${OVERLAY_ID} .card {
	background-color: #ffffff;
	border: 1px solid rgba(0, 0, 0, 0.125);
	border-radius: 0.5rem;
	max-width: 600px;
	margin: auto;
}

#${OVERLAY_ID} .card-header,
#${OVERLAY_ID} .card-body {
    padding: 1.25rem;
}

#${OVERLAY_ID} .card-header {
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    padding-right: 3rem;
    color: #ffffff;
    border-bottom: 1px solid rgba(0, 0, 0, 0.125);
    background-color: #f8d7da;
    color: #ffffff;
    pointer-events: all;
}

#${OVERLAY_ID} .card-body {
    background-color: #ffffff;
    min-height: clamp(360px, calc(100vh - 150px), 792px);
    max-height: clamp(360px, calc(100vh - 150px), 792px);
    overflow-y: auto;
    overscroll-behavior: contain;
    pointer-events: all;

}

#${OVERLAY_ID} .card-body h2 {
    font-size: 1.5rem;
}

#${OVERLAY_ID} .card-title {
	margin: 0;
	font-size: 1.5rem;
	color: #000000;
}

#${OVERLAY_ID} .row {
	display: flex;
	flex-wrap: wrap;
	margin-right: -0.5rem;
	margin-left: -0.5rem;
}

#${OVERLAY_ID} .row > * {
	flex-shrink: 0;
	width: 100%;
	max-width: 100%;
	padding-right: 0.5rem;
	padding-left: 0.5rem;
}

#${OVERLAY_ID} .col-3,
#${OVERLAY_ID} .col-sm-3 {
	flex: 0 0 auto;
	width: 25%;
}

#${OVERLAY_ID} .col-9,
#${OVERLAY_ID} .col-sm-9 {
	flex: 0 0 auto;
	width: 75%;
}

@media (max-width: 576px) {
	#${OVERLAY_ID} .col-3,
	#${OVERLAY_ID} .col-9,
	#${OVERLAY_ID} .col-sm-3,
	#${OVERLAY_ID} .col-sm-9 {
		width: 100%;
	}
}

#${OVERLAY_ID} .col-form-label {
	padding-top: 0.375rem;
	padding-bottom: 0.375rem;
	margin-bottom: 0;
	font-weight: 500;
	color: #000000;
}

#${OVERLAY_ID} .form-control,
#${OVERLAY_ID} .form-control-plaintext {
	display: block;
	width: 100%;
	font-size: 1rem;
	line-height: 1.5;
}

#${OVERLAY_ID} .form-control {
	padding: 0.375rem 0.75rem;
	color: #212529;
	background-color: #ffffff;
	border: 1px solid #ced4da;
	border-radius: 0.375rem;
	transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
}

#${OVERLAY_ID} .form-control:focus {
	border-color: #86b7fe;
	outline: 0;
	box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.25);
}

#${OVERLAY_ID} .form-control-plaintext {
	padding: 0.375rem 0;
	color: #212529;
	border: none;
	background-color: transparent;
}

#${OVERLAY_ID} .progress {
	display: flex;
	height: 20px;
	overflow: hidden;
	background-color: #e9ecef;
	border-radius: 0.375rem;
     min-width: 80px;
  flex: 1 1 auto;
}

#${OVERLAY_ID} .progress-bar {
	display: flex;
	align-items: center;
	justify-content: center;
	color: #ffffff;
	white-space: nowrap;
	transition: width 0.4s ease;
}

#${OVERLAY_ID} .fade {
    transition: opacity 0.3s ease;
}

#${OVERLAY_ID} .modal {
	position: fixed;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 1rem;
	background-color: rgba(0, 0, 0, 0.5);
	opacity: 0;
	visibility: hidden;
	pointer-events: none;
	transition: opacity 0.3s ease;
	z-index: 1050;
}

#${OVERLAY_ID} .modal.show {
	opacity: 1;
	visibility: visible;
	pointer-events: auto;
}

#${OVERLAY_ID} .modal-dialog {
	width: 100%;
	max-width: 500px;
	margin: 1rem auto;
	transform: translateY(-10px);
	transition: transform 0.3s ease;
}

#${OVERLAY_ID} .modal.show .modal-dialog {
	transform: translateY(0);
}

#${OVERLAY_ID} .modal-content {
	background-color: #ffffff;
	border-radius: 0.5rem;
	overflow: hidden;
	box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
}

#${OVERLAY_ID} .modal-header,
#${OVERLAY_ID} .modal-footer {
	display: flex;
	align-items: center;
	padding: 1rem 1.25rem;
}

#${OVERLAY_ID} .modal-header {
	justify-content: space-between;
	border-bottom: 1px solid rgba(0, 0, 0, 0.1);
	gap: 0.5rem;
	background-color: #f8d7da;
}

#${OVERLAY_ID} .modal-footer {
	justify-content: flex-end;
	border-top: 1px solid rgba(0, 0, 0, 0.1);
	border-bottom: 0;
	gap: 0.5rem;
}

#${OVERLAY_ID} .modal-body {
	padding: 1.25rem;
}

#${OVERLAY_ID} .modal-title {
	margin: 0;
	font-size: 1.25rem;
}

#${OVERLAY_ID} .btn-close {
	position: relative;
	width: 1.25rem;
	height: 1.25rem;
	border: none;
	border-radius: 0.25rem;
	background-color: transparent;
	cursor: pointer;
	opacity: 0.6;
}

#${OVERLAY_ID} .btn-close::before,
#${OVERLAY_ID} .btn-close::after {
	content: '';
	position: absolute;
	top: 50%;
	left: 50%;
	width: 1.25rem;
	height: 0.125rem;
	background-color: #000000;
	transform-origin: center;
}

#${OVERLAY_ID} .btn-close::before {
	transform: translate(-50%, -50%) rotate(45deg);
}

#${OVERLAY_ID} .btn-close::after {
	transform: translate(-50%, -50%) rotate(-45deg);
}

#${OVERLAY_ID} .btn-close:hover {
	opacity: 1;
}

#${OVERLAY_ID} .modal-open {
    overflow: hidden;
}

#${OVERLAY_ID} .fade-out {
    opacity: 0;
    transition: opacity 0.5s ease;
}

#${OVERLAY_ID} .fade-in {
    opacity: 1;
    transition: opacity 0.5s ease;
}

#${OVERLAY_ID} .custom-button {
	background-color: #f8d7da;
	color: #000000;
	border: none;
	padding: 10px 20px;
	border-radius: 8px;
	box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
	cursor: pointer;
	transition: all 0.2s ease;
	margin-right: 10px;
}

#${OVERLAY_ID} .custom-button:hover {
	background-color: #f5c6cb;
	box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2);
}

#${OVERLAY_ID} .custom-button:disabled {
	background-color: #d6d6d6;
	color: #a1a1a1;
	cursor: not-allowed;
	box-shadow: none;
}
#${OVERLAY_ID} .leftmargin {
margin-left: 10px;
}


#${OVERLAY_ID} .progress-bar-custom {
	height: 20px;
	background-color: #f8d7da;
}

#${OVERLAY_ID} .progress-bar-custom1 {
	height: 20px;
	background-color: #b4d4ff;
}

#${OVERLAY_ID} .gif-image {
	width: 100px;
	height: 100px;
	background-color: #f8d7da;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 24px;
	color: #ffffff;
}

#${OVERLAY_ID} .applicant-button {
	background-color: #f8d7da;
	border: none;
	border-radius: 8px;
	box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
	color: #000000;
	padding: 15px;
	display: flex;
	justify-content: flex-start;
	align-items: center;
	width: 100%;
	text-align: left;
	cursor: pointer;
	margin-bottom: 15px;
}

#${OVERLAY_ID} .applicant-button:hover {
	background-color: #f5c6cb;
	box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2);
}

#${OVERLAY_ID} .applicant-button:disabled {
	background-color: #d6d6d6;
	color: #a1a1a1;
	cursor: not-allowed;
	box-shadow: none;
}

#${OVERLAY_ID} .applicant-info {
	margin-left: 15px;
}

#${OVERLAY_ID} .applicant-info div {
	margin-bottom: 5px;
}

#${OVERLAY_ID} .color-bar {
	position: relative;
	width: 200px;
	height: 10px;
	background-color: gray;
	margin: 40px auto 10px;
}

#${OVERLAY_ID} .color-bar .red-part {
	position: absolute;
	right: 0;
	height: 100%;
	background-color: #f8d7da;
}

#${OVERLAY_ID} .triangle {
	width: 0;
	height: 0;
	border-left: 15px solid transparent;
	border-right: 15px solid transparent;
	border-top: 30px solid #b4d4ff;
	position: absolute;
	top: -34px;
	left: 0;
}

#${OVERLAY_ID} .npc-container {
	display: flex;
	align-items: center;
	justify-content: center;
	text-align: center;
}

#${OVERLAY_ID} #npc-img {
	margin-right: 10px;
}

#${OVERLAY_ID} .help-button {
	width: 48px;
	height: 51px;
	margin-left: 8px;
	cursor: pointer;
	transition: filter 0.3s ease;
}

#${OVERLAY_ID} .help-button:hover {
	filter: brightness(0.7);
}

#${OVERLAY_ID} #bts {
	display: flex;
	flex-wrap: wrap;
	gap: 10px;
	justify-content: flex-start;
}

@keyframes guide-diary-fade-in-out {
	0% { opacity: 0; }
	30% { opacity: 1; }
	70% { opacity: 1; }
	100% { opacity: 0; }
}

#${OVERLAY_ID} .fade-text {
	position: fixed;
	top: 60%;
	left: 50%;
	transform: translate(-50%, -50%);
	opacity: 0;
	font-size: 16px;
	color: #000000;
	animation: guide-diary-fade-in-out 1s ease-in-out forwards;
	text-align: center;
	background-color: #ffffff;
	padding: 8px 12px;
	border-radius: 4px;
	box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}

#${OVERLAY_ID} #textcontent {
	color: #000000;
	white-space: pre-wrap;
	word-break: break-word;
}
`;

    const MODAL_IDS = {
        confirm: 'guide-diary-confirm-modal',
        room: 'guide-diary-room-modal',
    };

    const TEMPLATE_IDS = {
        main: 'guide-diary-template-main',
        text: 'guide-diary-template-text',
        setname: 'guide-diary-template-setname',
        game: 'guide-diary-template-game',
    };

    const attachOverlayStyles = () => {
        if (hostDocument.getElementById(STYLE_ID)) {
            return;
        }
        const style = hostDocument.createElement('style');
        style.id = STYLE_ID;
        style.textContent = overlayCss;
        hostDocument.head.appendChild(style);
    };

    const createElement = (tag, options = {}) => {
        const element = hostDocument.createElement(tag);
        if (options.id) {
            element.id = options.id;
        }
        if (options.className) {
            element.className = options.className;
        }
        if (options.textContent) {
            element.textContent = options.textContent;
        }
        if (options.dataset) {
            Object.entries(options.dataset).forEach(([key, value]) => {
                element.dataset[key] = value;
            });
        }
        if (options.attributes) {
            Object.entries(options.attributes).forEach(([key, value]) => {
                element.setAttribute(key, value);
            });
        }
        if (options.children) {
            options.children.forEach((child) => {
                element.appendChild(child);
            });
        }
        return element;
    };

    const isHostInstance = (value, ctor = null) => {
        if (!value) {
            return false;
        }
        const view = hostDocument.defaultView || window;
        if (!ctor) {
            return value instanceof view.HTMLElement;
        }
        if (typeof ctor === 'function') {
            const matchingCtor = typeof ctor.name === 'string' && ctor.name && view[ctor.name]
                ? view[ctor.name]
                : ctor;
            return value instanceof matchingCtor;
        }
        return false;
    };

    const buildCardSkeleton = () => {
        const title = createElement('h1', {
            className: 'card-title',
            textContent: '实习向导日记',
            attributes: { style: 'color: #ffffffff;' },
        });
        const minimizeButton = createElement('button', {
            className: 'guide-diary-minimize-button',
            attributes: { type: 'button', 'aria-label': '最小化界面' },
            textContent: '—',
        });
        const header = createElement('div', {
            className: 'card-header text-center guide-diary-drag-handle',
            children: [title, minimizeButton],
        });
        const body = createElement('div', { className: 'card-body' });
        const card = createElement('div', { className: 'card shadow-sm', children: [header, body] });
        return createElement('div', {
            className: 'container mt-5',
            id: ROOT_ID,
            attributes: { style: 'color: #000000;' },
            children: [card],
        });
    };

    const buildMinimizedPanel = () => {
        const restoreButton = createElement('button', {
            className: 'guide-diary-restore-button',
            attributes: { type: 'button' },
            textContent: '恢复',
        });

        return createElement('div', {
            className: 'guide-diary-minimized-panel',
            attributes: { hidden: '' },
            children: [
                createElement('div', {
                    className: 'guide-diary-minimized-label',
                    textContent: '向导日记',
                }),
                restoreButton,
            ],
        });
    };

    const buildRoomModal = () => {
        const confirmButton = createElement('button', {
            className: 'custom-button',
            id: 'confirm-button',
            textContent: '确定',
        });

        const closeButton = createElement('button', {
            className: 'btn-close',
            attributes: {
                type: 'button',
                'data-bs-dismiss': 'modal',
                'aria-label': 'Close',
            },
        });

        const modalTitle = createElement('h5', {
            className: 'modal-title',
            id: 'roomModalLabel',
            textContent: '标题',
        });

        const header = createElement('div', {
            className: 'modal-header',
            children: [modalTitle, closeButton],
        });

        const body = createElement('div', {
            className: 'modal-body',
            textContent: '文字内容',
        });

        const footer = createElement('div', {
            className: 'modal-footer',
            children: [confirmButton],
        });

        const content = createElement('div', {
            className: 'modal-content',
            children: [header, body, footer],
        });

        const dialog = createElement('div', {
            className: 'modal-dialog',
            children: [content],
        });

        return createElement('div', {
            className: 'modal fade',
            id: MODAL_IDS.room,
            attributes: {
                tabindex: '-1',
                'aria-labelledby': 'roomModalLabel',
                'aria-hidden': 'true',
            },
            children: [dialog],
        });
    };

    const buildConfirmModal = () => {
        const closeButton = createElement('button', {
            className: 'btn-close',
            attributes: {
                type: 'button',
                'data-bs-dismiss': 'modal',
                'aria-label': 'Close',
            },
        });

        const title = createElement('h5', {
            className: 'modal-title',
            id: 'confirmModalLabel',
            textContent: '确认操作',
        });

        const header = createElement('div', {
            className: 'modal-header',
            id: 'asktitle',
            children: [title, closeButton],
        });

        const body = createElement('div', {
            className: 'modal-body',
            textContent: '你确定要执行这个操作吗？',
        });

        const noButton = createElement('button', {
            className: 'custom-button',
            id: 'no-button',
            textContent: 'No',
        });

        const yesButton = createElement('button', {
            className: 'custom-button',
            id: 'yes-button',
            textContent: 'Yes',
        });

        const footer = createElement('div', {
            className: 'modal-footer',
            children: [noButton, yesButton],
        });

        const content = createElement('div', {
            className: 'modal-content',
            children: [header, body, footer],
        });

        const dialog = createElement('div', { className: 'modal-dialog', children: [content] });

        return createElement('div', {
            className: 'modal fade',
            id: MODAL_IDS.confirm,
            attributes: {
                tabindex: '-1',
                'aria-labelledby': 'confirmModalLabel',
                'aria-hidden': 'true',
            },
            children: [dialog],
        });
    };

    const buildTemplateMain = () => {
        const staminaBar = createElement('div', {
            id: 'stamina-bar',
            className: 'progress-bar progress-bar-custom',
            attributes: { role: 'progressbar', style: 'width: 50%' },
        });
        const mentalBar = createElement('div', {
            id: 'mental-bar',
            className: 'progress-bar progress-bar-custom',
            attributes: { role: 'progressbar', style: 'width: 50%' },
        });
        const waterBar = createElement('div', {
            id: 'water-bar',
            className: 'progress-bar progress-bar-custom',
            attributes: { role: 'progressbar', style: 'width: 50%' },
        });
        const expBar = createElement('div', {
            id: 'exp-bar',
            className: 'progress-bar progress-bar-custom',
            attributes: { role: 'progressbar', style: 'width: 50%' },
        });

        return createElement('div', {
            id: TEMPLATE_IDS.main,
            dataset: { template: 'true' },
            attributes: { hidden: '' },
            children: [
                createElement('div', {
                    className: 'd-flex justify-content-between',
                    children: [
                        createElement('div', {
                            children: [
                                createElement('strong', { id: 'username', textContent: '黛' }),
                                createElement('span', { id: 'par-name', textContent: ' ' }),
                            ],
                        }),
                        createElement('div', {
                            children: [createElement('strong', { id: 'date', textContent: '星历1135年9月1日' })],
                        }),
                    ],
                }),
                createElement('div', {
                    className: 'my-3',
                    children: [
                        createElement('div', {
                            className: 'row',
                            children: [
                                createElement('label', { className: 'col-3', textContent: '饱腹度' }),
                                createElement('div', {
                                    className: 'col-9',
                                    children: [createElement('div', { className: 'progress', children: [staminaBar] })],
                                }),
                            ],
                        }),
                    ],
                }),
                createElement('div', {
                    className: 'my-3',
                    children: [
                        createElement('div', {
                            className: 'row',
                            children: [
                                createElement('label', { className: 'col-3', textContent: '精神力' }),
                                createElement('div', {
                                    className: 'col-9',
                                    children: [createElement('div', { className: 'progress', children: [mentalBar] })],
                                }),
                            ],
                        }),
                    ],
                }),
                createElement('div', {
                    className: 'my-3',
                    children: [
                        createElement('div', {
                            className: 'row',
                            children: [
                                createElement('label', { className: 'col-3', textContent: '水分' }),
                                createElement('div', {
                                    className: 'col-9',
                                    children: [createElement('div', { className: 'progress', children: [waterBar] })],
                                }),
                            ],
                        }),
                    ],
                }),
                createElement('div', {
                    className: 'my-3',
                    children: [
                        createElement('div', {
                            className: 'd-flex justify-content-between align-items-center',
                            children: [
                                createElement('div', {
                                    className: 'leftflex',
                                   
                                    children: [
                                        document.createTextNode('向导等级 '),
                                        createElement('strong', { id: 'guide-level', textContent: 'D', className: 'leftmargin' }),
                                    ],
                                }),
                                createElement('div', {
                                     className: 'leftflex',
                                    
                                    children: [
                                        document.createTextNode('exp '),
                                        createElement('div', {
                                            className: 'progress',
                                            style: 'width: 100%; margin-bottom: 0; margin-left: 10px;',
                                            children: [
                                                createElement('div', {
                                                    id: 'exp-bar',
                                                    className: 'progress-bar progress-bar-custom  leftmargin',
                                                    role: 'progressbar',
                                                    style: 'width: 50%',
                                                }),
                                            ],
                                        }),
                                    ],
                                }),
                            ],
                        }),
                    ],
                }),
                createElement('div', {
                    className: 'my-3',
                    children: [createElement('div', {
                        children: [
                            document.createTextNode('积分 '),
                            createElement('strong', { id: 'score', textContent: '123456' }),
                        ],
                    })
                    ],
                }),
                createElement('div', {
                    className: 'my-3',
                    children: [
                        createElement('div', {
                            className: 'd-flex justify-content-around',
                            children: [
                                createElement('button', {
                                    className: 'custom-button',
                                    id: 'shop-button',
                                    textContent: '前往商店',
                                }),
                                createElement('button', {
                                    className: 'custom-button',
                                    id: 'room-button',
                                    textContent: '诊疗室详情',
                                }),
                            ],
                        }),
                    ],
                }),
                createElement('hr'),
                createElement('h4', { id: 'list-title', textContent: '精神疏导申请' }),
                createElement('div', { id: 'applicant-list' }),
                createElement('div', {
                    className: 'my-3 d-flex justify-content-end',
                    children: [
                        createElement('button', {
                            className: 'custom-button',
                            id: 'rest-button',
                            textContent: '今日休息',
                        }),
                    ],
                }),
            ],
        });
    };

    const buildTemplateText = () =>
        createElement('div', {
            id: TEMPLATE_IDS.text,
            dataset: { template: 'true' },
            attributes: { hidden: '' },
            children: [
                createElement('div', { id: 'textcontent', textContent: '显示文字' }),
                createElement('button', {
                    className: 'custom-button',
                    id: 'act00-button',
                    textContent: '回到诊疗室',
                }),
            ],
        });

    const buildTemplateSetname = () =>
        createElement('div', {
            id: TEMPLATE_IDS.setname,
            dataset: { template: 'true' },
            attributes: { hidden: '' },
            children: [
                createElement('h2', { className: 'text-center mb-4', textContent: '向导述职登录表' }),
                createElement('form', {
                    id: 'guide-form',
                    children: [
                        createElement('div', {
                            className: 'mb-3 row',
                            children: [
                                createElement('label', {
                                    className: 'col-sm-3 col-form-label',
                                    attributes: { for: 'name' },
                                    textContent: '姓名',
                                }),
                                createElement('div', {
                                    className: 'col-sm-9',
                                    children: [
                                        createElement('p', {
                                            className: 'form-control-plaintext',
                                            id: 'username',
                                            textContent: '黛',
                                        }),
                                    ],
                                }),
                            ],
                        }),
                        createElement('div', {
                            className: 'mb-3 row',
                            children: [
                                createElement('label', {
                                    className: 'col-sm-3 col-form-label',
                                    textContent: '基因',
                                }),
                                createElement('div', {
                                    className: 'col-sm-9',
                                    children: [
                                        createElement('p', {
                                            className: 'form-control-plaintext',
                                            textContent: '纯种人类，无外族基因融合，无基因修改',
                                        }),
                                    ],
                                }),
                            ],
                        }),
                        createElement('div', {
                            className: 'mb-3 row',
                            children: [
                                createElement('label', {
                                    className: 'col-sm-3 col-form-label',
                                    textContent: '年龄',
                                }),
                                createElement('div', {
                                    className: 'col-sm-9',
                                    children: [
                                        createElement('p', {
                                            className: 'form-control-plaintext',
                                            textContent: '22岁',
                                        }),
                                    ],
                                }),
                            ],
                        }),
                        createElement('div', {
                            className: 'mb-3 row',
                            children: [
                                createElement('label', {
                                    className: 'col-sm-3 col-form-label',
                                    textContent: '向导等级',
                                }),
                                createElement('div', {
                                    className: 'col-sm-9',
                                    children: [
                                        createElement('p', {
                                            className: 'form-control-plaintext',
                                            textContent: 'D',
                                        }),
                                    ],
                                }),
                            ],
                        }),
                        createElement('div', {
                            className: 'mb-3 row',
                            children: [
                                createElement('label', {
                                    className: 'col-sm-3 col-form-label',
                                    textContent: '履历',
                                }),
                                createElement('div', {
                                    className: 'col-sm-9',
                                    children: [
                                        createElement('p', {
                                            className: 'form-control-plaintext',
                                            textContent: '在国立向导中心完成了所有培训课程并获得合格',
                                        }),
                                    ],
                                }),
                            ],
                        }),
                        createElement('div', {
                            className: 'guide-diary-submit-row',
                            attributes: { style: 'display: flex; justify-content: center; margin-top: 16px;' },
                            children: [
                                createElement('button', {
                                    className: 'custom-button',
                                    attributes: { type: 'submit' },
                                    textContent: '提交',
                                }),
                            ],
                        }),
                    ],
                }),
            ],
        });

    const buildTemplateGame = () => {
        const buildProgressRow = (label, id, barClass = 'progress-bar progress-bar-custom') =>
            createElement('div', {
                className: 'my-3',
                children: [
                    createElement('div', {
                        className: 'row',
                        children: [
                            createElement('label', { className: 'col-3', textContent: label }),
                            createElement('div', {
                                className: 'col-9',
                                children: [
                                    createElement('div', {
                                        className: 'progress',
                                        children: [
                                            createElement('div', {
                                                id,
                                                className: barClass,
                                                attributes: { role: 'progressbar', style: 'width: 50%' },
                                            }),
                                        ],
                                    }),
                                ],
                            }),
                        ],
                    }),
                ],
            });

        const actionButtons = createElement('div', {
            id: 'bts',
            children: [
                createElement('button', { className: 'custom-button', id: 'act0-button', textContent: '安抚' }),
                createElement('button', { className: 'custom-button', id: 'act1-button', textContent: '进入精神海' }),
                createElement('button', { className: 'custom-button', id: 'act2-button', textContent: '精神净化' }),
                createElement('button', { className: 'custom-button', id: 'quit-button', textContent: '结束精神疏导' }),
            ],
        });

        const gameplayArea = createElement('div', {
            id: 'gameplay',
            className: 'container',
            attributes: { style: 'display: none;' },
            children: [
                createElement('div', {
                    className: 'color-bar',
                    children: [
                        createElement('div', { className: 'red-part', id: 'red-part', attributes: { style: 'width: 50%' } }),
                        createElement('div', { className: 'triangle', id: 'triangle' }),
                    ],
                }),
            ],
        });

        return createElement('div', {
            id: TEMPLATE_IDS.game,
            dataset: { template: 'true' },
            attributes: { hidden: '' },
            children: [
                createElement('div', {
                    className: 'npc-container',
                    children: [
                        createElement('div', {
                            children: [
                                createElement('img', {
                                    id: 'npc-img',
                                    attributes: {
                                        src: '',
                                        alt: 'NPC',
                                        width: '150',
                                        height: '150',
                                    },
                                }),
                            ],
                        }),
                        createElement('div', {
                            children: [
                                createElement('p', { children: [createElement('strong', { id: 'npc-name', textContent: '姓名' })] }),
                                createElement('p', { children: [createElement('strong', { id: 'npc-race', textContent: '种族' })] }),
                                createElement('p', { children: [createElement('strong', { id: 'npc-match', textContent: '匹配度' })] }),
                            ],
                        }),
                    ],
                }),
                buildProgressRow('污染度', 'pollution-bar'),
                buildProgressRow('服从度', 'obedience-bar'),
                buildProgressRow('舒适度', 'comfort-bar'),
                buildProgressRow('痛苦度', 'painLevel-bar'),
                buildProgressRow('向导精神力', 'mental-bar', 'progress-bar progress-bar-custom1'),
                createElement('hr'),
                actionButtons,
                gameplayArea,
                createElement('hr'),
                createElement('div', { id: 'log-container' }),
            ],
        });
    };

    const buildOverlay = () => {
        const overlay = createElement('div', { id: OVERLAY_ID });
        const surface = createElement('div', { className: 'guide-diary-surface' });
        const scrollArea = createElement('div', { className: 'guide-diary-scroll' });

        const cardSkeleton = buildCardSkeleton();
        const roomModal = buildRoomModal();
        const confirmModal = buildConfirmModal();
        const templateMain = buildTemplateMain();
        const templateText = buildTemplateText();
        const templateSetname = buildTemplateSetname();
        const templateGame = buildTemplateGame();
        const minimizedPanel = buildMinimizedPanel();

        scrollArea.appendChild(cardSkeleton);
        surface.appendChild(scrollArea);
        overlay.appendChild(surface);
        overlay.appendChild(roomModal);
        overlay.appendChild(confirmModal);
        overlay.appendChild(templateMain);
        overlay.appendChild(templateText);
        overlay.appendChild(templateSetname);
        overlay.appendChild(templateGame);
        overlay.appendChild(minimizedPanel);

        return overlay;
    };

    attachOverlayStyles();
    const overlayNode = buildOverlay();
    const existingOverlay = hostDocument.getElementById(OVERLAY_ID);
    if (existingOverlay) {
        existingOverlay.remove();
    }
    hostDocument.body.appendChild(overlayNode);

    const cleanupCallbacks = [];
    const registerCleanup = (callback) => {
        if (typeof callback === 'function') {
            cleanupCallbacks.push(callback);
        }
    };
    let overlayDestroyed = false;

    const rootCandidate = overlayNode.querySelector(`#${ROOT_ID}`);
    const cardRootElement = isHostInstance(rootCandidate, HTMLElement) ? rootCandidate : null;
    const headerCandidate = cardRootElement?.querySelector('.guide-diary-drag-handle');
    const headerElement = isHostInstance(headerCandidate, HTMLElement) ? headerCandidate : null;
    const minimizeCandidate = cardRootElement?.querySelector('.guide-diary-minimize-button');
    const minimizeButtonElement = isHostInstance(minimizeCandidate, HTMLButtonElement)
        ? minimizeCandidate
        : null;
    const minimizedPanelCandidate = overlayNode.querySelector('.guide-diary-minimized-panel');
    const minimizedPanelElement = isHostInstance(minimizedPanelCandidate, HTMLElement) ? minimizedPanelCandidate : null;
    const restoreCandidate = minimizedPanelElement?.querySelector('.guide-diary-restore-button');
    const restoreButtonElement = isHostInstance(restoreCandidate, HTMLButtonElement) ? restoreCandidate : null;

    if (minimizedPanelElement) {
        minimizedPanelElement.hidden = true;
    }

    const cardPosition = { x: 0, y: 0 };
    const minimizedPanelPosition = { left: null, top: null };
    const dragState = {
        active: false,
        startX: 0,
        startY: 0,
        baseX: 0,
        baseY: 0,
        pointerId: null,
        mode: 'none',
        target: 'none',
    };
    let isMinimized = false;
    const BASE_CARD_TRANSFORM = 'translate(-50%, -50%)';

    const applyCardPosition = () => {
        if (cardRootElement) {
            cardRootElement.style.transform = `${BASE_CARD_TRANSFORM} translate(${cardPosition.x}px, ${cardPosition.y}px)`;
        }
    };

    const applyMinimizedPanelPosition = () => {
        if (!minimizedPanelElement) {
            return;
        }
        const { left, top } = minimizedPanelPosition;
        if (typeof left === 'number' && typeof top === 'number') {
            minimizedPanelElement.style.left = `${left}px`;
            minimizedPanelElement.style.top = `${top}px`;
            minimizedPanelElement.style.right = 'auto';
            minimizedPanelElement.style.bottom = 'auto';
        }
        else {
            minimizedPanelElement.style.left = '';
            minimizedPanelElement.style.top = '';
            minimizedPanelElement.style.right = '';
            minimizedPanelElement.style.bottom = '';
        }
    };

    const clearDocumentDragListeners = () => {
        if (dragState.mode === 'pointer') {
            hostDocument.removeEventListener('pointermove', handlePointerMoveDocument);
            hostDocument.removeEventListener('pointerup', handlePointerUpDocument);
            hostDocument.removeEventListener('pointercancel', handlePointerUpDocument);
        }
        else if (dragState.mode === 'mouse') {
            hostDocument.removeEventListener('mousemove', handleMouseMoveDocument);
            hostDocument.removeEventListener('mouseup', handleMouseUpDocument);
        }
        else if (dragState.mode === 'touch') {
            hostDocument.removeEventListener('touchmove', handleTouchMoveDocument);
            hostDocument.removeEventListener('touchend', handleTouchEndDocument);
            hostDocument.removeEventListener('touchcancel', handleTouchEndDocument);
        }
    };

    const endDrag = () => {
        clearDocumentDragListeners();
        if (!dragState.active) {
            dragState.pointerId = null;
            dragState.mode = 'none';
            dragState.target = 'none';
            return;
        }
        dragState.active = false;
        dragState.pointerId = null;
        dragState.mode = 'none';
        if (dragState.target === 'card' && cardRootElement) {
            cardRootElement.classList.remove('guide-diary-card-dragging');
        }
        else if (dragState.target === 'panel' && minimizedPanelElement) {
            minimizedPanelElement.classList.remove('guide-diary-minimized-dragging');
        }
        dragState.target = 'none';
    };

    const updateActiveDragPosition = (clientX, clientY) => {
        if (dragState.target === 'card') {
            cardPosition.x = dragState.baseX + (clientX - dragState.startX);
            cardPosition.y = dragState.baseY + (clientY - dragState.startY);
            applyCardPosition();
        }
        else if (dragState.target === 'panel') {
            const nextLeft = dragState.baseX + (clientX - dragState.startX);
            const nextTop = dragState.baseY + (clientY - dragState.startY);
            minimizedPanelPosition.left = nextLeft;
            minimizedPanelPosition.top = nextTop;
            applyMinimizedPanelPosition();
        }
    };

    const handlePointerMoveDocument = (event) => {
        if (!dragState.active || dragState.mode !== 'pointer') {
            return;
        }
        if (dragState.pointerId !== null && dragState.pointerId !== (event.pointerId ?? null)) {
            return;
        }
        event.preventDefault();
        updateActiveDragPosition(event.clientX, event.clientY);
    };

    const handlePointerUpDocument = (event) => {
        if (dragState.mode !== 'pointer') {
            return;
        }
        if (dragState.pointerId !== null && dragState.pointerId !== (event.pointerId ?? null)) {
            return;
        }
        event.preventDefault();
        endDrag();
    };

    const handleMouseMoveDocument = (event) => {
        if (!dragState.active || dragState.mode !== 'mouse') {
            return;
        }
        event.preventDefault();
        updateActiveDragPosition(event.clientX, event.clientY);
    };

    const handleMouseUpDocument = (event) => {
        if (dragState.mode !== 'mouse') {
            return;
        }
        event.preventDefault();
        endDrag();
    };

    const findTouchById = (touchList, identifier) => {
        if (!touchList || identifier == null) {
            return null;
        }
        for (let index = 0; index < touchList.length; index += 1) {
            const touch = touchList.item(index);
            if (touch && touch.identifier === identifier) {
                return touch;
            }
        }
        return null;
    };

    const handleTouchMoveDocument = (event) => {
        if (!dragState.active || dragState.mode !== 'touch') {
            return;
        }
        const touch = findTouchById(event.touches, dragState.pointerId);
        if (!touch) {
            return;
        }
        event.preventDefault();
        updateActiveDragPosition(touch.clientX, touch.clientY);
    };

    const handleTouchEndDocument = (event) => {
        if (dragState.mode !== 'touch') {
            return;
        }
        const touch = findTouchById(event.changedTouches, dragState.pointerId);
        if (!touch) {
            return;
        }
        event.preventDefault();
        endDrag();
    };

    const beginCardDrag = (startX, startY, mode, pointerId = null) => {
        if (!cardRootElement || isMinimized) {
            return false;
        }
        dragState.active = true;
        dragState.startX = startX;
        dragState.startY = startY;
        dragState.baseX = cardPosition.x;
        dragState.baseY = cardPosition.y;
        dragState.pointerId = pointerId;
        dragState.mode = mode;
        dragState.target = 'card';
        cardRootElement.classList.add('guide-diary-card-dragging');
        return true;
    };

    const beginMinimizedDrag = (startX, startY, mode, pointerId = null) => {
        if (!minimizedPanelElement || !isMinimized) {
            return false;
        }
        const bounds = minimizedPanelElement.getBoundingClientRect();
        dragState.active = true;
        dragState.startX = startX;
        dragState.startY = startY;
        dragState.baseX = bounds.left;
        dragState.baseY = bounds.top;
        dragState.pointerId = pointerId;
        dragState.mode = mode;
        dragState.target = 'panel';
        minimizedPanelElement.classList.add('guide-diary-minimized-dragging');
        return true;
    };

    const handlePointerDown = (event) => {
        if (!headerElement) {
            return;
        }
        if (event.button !== undefined && event.button !== 0) {
            return;
        }
        if (event.target && event.target.closest('.guide-diary-minimize-button')) {
            return;
        }
        if (!beginCardDrag(event.clientX, event.clientY, 'pointer', event.pointerId ?? null)) {
            return;
        }
        event.preventDefault();
        hostDocument.addEventListener('pointermove', handlePointerMoveDocument);
        hostDocument.addEventListener('pointerup', handlePointerUpDocument);
        hostDocument.addEventListener('pointercancel', handlePointerUpDocument);
    };

    const handleMouseDown = (event) => {
        if (typeof window.PointerEvent === 'function') {
            return;
        }
        if (event.button !== undefined && event.button !== 0) {
            return;
        }
        if (event.target && event.target.closest('.guide-diary-minimize-button')) {
            return;
        }
        if (!beginCardDrag(event.clientX, event.clientY, 'mouse')) {
            return;
        }
        event.preventDefault();
        hostDocument.addEventListener('mousemove', handleMouseMoveDocument);
        hostDocument.addEventListener('mouseup', handleMouseUpDocument);
    };

    const handleTouchStart = (event) => {
        if (typeof window.PointerEvent === 'function') {
            return;
        }
        if (!event.touches || event.touches.length === 0) {
            return;
        }
        if (event.target && event.target.closest('.guide-diary-minimize-button')) {
            return;
        }
        const touch = event.touches[0];
        if (!beginCardDrag(touch.clientX, touch.clientY, 'touch', touch.identifier)) {
            return;
        }
        event.preventDefault();
        hostDocument.addEventListener('touchmove', handleTouchMoveDocument, { passive: false });
        hostDocument.addEventListener('touchend', handleTouchEndDocument, { passive: false });
        hostDocument.addEventListener('touchcancel', handleTouchEndDocument, { passive: false });
    };

    const isMinimizedPanelDragTarget = (target) => {
        if (!target) {
            return true;
        }
        if (typeof target.closest !== 'function') {
            return true;
        }
        return !target.closest('button');
    };

    const handlePanelPointerDown = (event) => {
        if (!minimizedPanelElement || !isMinimized) {
            return;
        }
        if (event.button !== undefined && event.button !== 0) {
            return;
        }
        if (!isMinimizedPanelDragTarget(event.target)) {
            return;
        }
        if (!beginMinimizedDrag(event.clientX, event.clientY, 'pointer', event.pointerId ?? null)) {
            return;
        }
        event.preventDefault();
        hostDocument.addEventListener('pointermove', handlePointerMoveDocument);
        hostDocument.addEventListener('pointerup', handlePointerUpDocument);
        hostDocument.addEventListener('pointercancel', handlePointerUpDocument);
    };

    const handlePanelMouseDown = (event) => {
        if (typeof window.PointerEvent === 'function') {
            return;
        }
        if (!minimizedPanelElement || !isMinimized) {
            return;
        }
        if (event.button !== undefined && event.button !== 0) {
            return;
        }
        if (!isMinimizedPanelDragTarget(event.target)) {
            return;
        }
        if (!beginMinimizedDrag(event.clientX, event.clientY, 'mouse')) {
            return;
        }
        event.preventDefault();
        hostDocument.addEventListener('mousemove', handleMouseMoveDocument);
        hostDocument.addEventListener('mouseup', handleMouseUpDocument);
    };

    const handlePanelTouchStart = (event) => {
        if (typeof window.PointerEvent === 'function') {
            return;
        }
        if (!minimizedPanelElement || !isMinimized) {
            return;
        }
        if (!event.touches || event.touches.length === 0) {
            return;
        }
        const touch = event.touches[0];
        if (!isMinimizedPanelDragTarget(event.target)) {
            return;
        }
        if (!beginMinimizedDrag(touch.clientX, touch.clientY, 'touch', touch.identifier)) {
            return;
        }
        event.preventDefault();
        hostDocument.addEventListener('touchmove', handleTouchMoveDocument, { passive: false });
        hostDocument.addEventListener('touchend', handleTouchEndDocument, { passive: false });
        hostDocument.addEventListener('touchcancel', handleTouchEndDocument, { passive: false });
    };

    const minimizeCard = () => {
        if (!cardRootElement || !minimizedPanelElement || isMinimized) {
            return;
        }
        endDrag();
        isMinimized = true;
        cardRootElement.classList.add('guide-diary-card-hidden');
        applyMinimizedPanelPosition();
        minimizedPanelElement.classList.remove('guide-diary-minimized-dragging');
        minimizedPanelElement.hidden = false;
    };

    const restoreCard = () => {
        if (!cardRootElement || !minimizedPanelElement || !isMinimized) {
            return;
        }
        isMinimized = false;
        minimizedPanelElement.classList.remove('guide-diary-minimized-dragging');
        minimizedPanelElement.hidden = true;
        cardRootElement.classList.remove('guide-diary-card-hidden');
        applyCardPosition();
    };

    const destroyOverlay = () => {
        if (overlayDestroyed) {
            return;
        }
        overlayDestroyed = true;
        try {
            endDrag();
        }
        catch (error) {
            console.error('Guide Diary: failed to finalize drag state during teardown', error);
        }
        while (cleanupCallbacks.length) {
            const callback = cleanupCallbacks.pop();
            try {
                callback();
            }
            catch (error) {
                console.error('Guide Diary: cleanup callback failed', error);
            }
        }
        if (overlayNode && overlayNode.parentNode) {
            overlayNode.remove();
        }
        const styleElement = hostDocument.getElementById(STYLE_ID);
        if (styleElement && styleElement.parentNode) {
            styleElement.parentNode.removeChild(styleElement);
        }
        if (window.guideDiaryOverlay) {
            window.guideDiaryOverlay.isDestroyed = true;
        }
    };

    if (cardRootElement) {
        applyCardPosition();
    }

    if (headerElement) {
        if (typeof window.PointerEvent === 'function') {
            headerElement.addEventListener('pointerdown', handlePointerDown);
        }
        else {
            headerElement.addEventListener('mousedown', handleMouseDown);
            headerElement.addEventListener('touchstart', handleTouchStart, { passive: false });
        }
    }

    if (minimizeButtonElement) {
        minimizeButtonElement.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();
            minimizeCard();
        });
    }

    if (restoreButtonElement) {
        restoreButtonElement.addEventListener('click', (event) => {
            event.preventDefault();
            restoreCard();
        });
    }

    if (minimizedPanelElement) {
        if (typeof window.PointerEvent === 'function') {
            minimizedPanelElement.addEventListener('pointerdown', handlePanelPointerDown);
        }
        else {
            minimizedPanelElement.addEventListener('mousedown', handlePanelMouseDown);
            minimizedPanelElement.addEventListener('touchstart', handlePanelTouchStart, { passive: false });
        }
    }

    const templateCache = {};
    const pageInitializers = {};

    Object.entries(TEMPLATE_IDS).forEach(([key, templateId]) => {
        const templateElement = overlayNode.querySelector(`#${templateId}`);
        if (isHostInstance(templateElement)) {
            templateCache[key] = templateElement.innerHTML;
            templateElement.remove();
        }
        else {
            console.warn('Guide Diary template missing:', templateId);
        }
    });

    const cardBodyElement = overlayNode.querySelector('.card-body');
    if (!isHostInstance(cardBodyElement)) {
        console.error('Guide Diary card body not found inside overlay');
    }

    const tavernWindow = window;
    const hadOwnLoadpage = Object.prototype.hasOwnProperty.call(tavernWindow, 'loadpage');
    const originalLoadpage = tavernWindow.loadpage;

    const renderTemplateIntoCard = (pageurl) => {
        if (!isHostInstance(cardBodyElement)) {
            return false;
        }
        const templateHtml = templateCache[pageurl];
        if (!templateHtml) {
            return false;
        }
        cardBodyElement.innerHTML = templateHtml;
        const initializer = pageInitializers[pageurl];
        if (typeof initializer === 'function') {
            initializer();
        }
        return true;
    };

    const injectedLoadpage = (pageurl) => {
        if (!renderTemplateIntoCard(pageurl) && typeof originalLoadpage === 'function') {
            originalLoadpage.call(tavernWindow, pageurl);
        }
    };

    tavernWindow.loadpage = injectedLoadpage;

    if (!hadOwnLoadpage) {
        Object.defineProperty(tavernWindow, 'loadpage', {
            configurable: true,
            enumerable: false,
            value: injectedLoadpage,
            writable: true,
        });
    }

    registerCleanup(() => {
        if (tavernWindow.loadpage === injectedLoadpage) {
            if (hadOwnLoadpage) {
                tavernWindow.loadpage = originalLoadpage;
            }
            else {
                delete tavernWindow.loadpage;
            }
        }
    });

    const registerPageInitializer = (page, initializer) => {
        if (typeof initializer === 'function') {
            pageInitializers[page] = initializer;
        }
    };

    const overlayQuery = (selector) => overlayNode.querySelector(selector);

    const requireOverlayElement = (selector, ctor = HTMLElement) => {
        const element = overlayQuery(selector);
        if (!isHostInstance(element, ctor)) {
            throw new Error(`Guide Diary element not found for selector: ${selector}`);
        }
        return element;
    };

    const requireElementById = (id, ctor = HTMLElement) => {
        const selector = `#${id}`;
        const element = overlayQuery(selector) || hostDocument.getElementById(id);
        if (!isHostInstance(element, ctor)) {
            throw new Error(`Guide Diary element not found: ${id}`);
        }
        return element;
    };

    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, Math.max(0, ms)));

    const fadeHost = overlayQuery('.guide-diary-surface') || overlayNode;

    class SimpleModal {
        constructor(element) {
            if (!isHostInstance(element)) {
                throw new Error('SimpleModal requires an HTMLElement');
            }
            this.element = element;
            this.isShown = false;
            this.handleBackdropClick = this.handleBackdropClick.bind(this);
            this.handleKeydown = this.handleKeydown.bind(this);
        }

        show() {
            if (this.isShown) {
                return;
            }
            this.isShown = true;
            this.element.classList.add('show');
            this.element.setAttribute('aria-hidden', 'false');
            hostDocument.body.classList.add('modal-open');
            this.element.addEventListener('click', this.handleBackdropClick);
            hostDocument.addEventListener('keydown', this.handleKeydown);
        }

        hide() {
            if (!this.isShown) {
                return;
            }
            this.isShown = false;
            this.element.classList.remove('show');
            this.element.setAttribute('aria-hidden', 'true');
            this.element.removeEventListener('click', this.handleBackdropClick);
            hostDocument.removeEventListener('keydown', this.handleKeydown);
            if (!hostDocument.querySelector('.modal.show')) {
                hostDocument.body.classList.remove('modal-open');
            }
        }

        handleBackdropClick(event) {
            if (event.target === this.element) {
                this.hide();
            }
        }

        handleKeydown(event) {
            if (event.key === 'Escape') {
                this.hide();
            }
        }
    }

    const getModalInstance = (element) => {
        if (!element.__guideDiaryModal) {
            element.__guideDiaryModal = new SimpleModal(element);
        }
        return element.__guideDiaryModal;
    };

    const showalert = (modalTitle, modalContent, callback = null) => {
        let title = modalTitle;
        let content = modalContent;
        if (content === undefined) {
            content = title;
            title = '向导中心';
        }

        const modalTitleElement = requireElementById('roomModalLabel', HTMLElement);
        const modalBodyElement = requireOverlayElement(`#${MODAL_IDS.room} .modal-body`, HTMLElement);
        modalTitleElement.textContent = title;
        modalBodyElement.innerHTML = content;

        const modalElement = requireElementById(MODAL_IDS.room, HTMLElement);
        const modal = getModalInstance(modalElement);
        const confirmButton = requireElementById('confirm-button', HTMLElement);

        const handleConfirm = () => {
            confirmButton.removeEventListener('click', handleConfirm);
            modal.hide();
            if (typeof callback === 'function') {
                callback();
            }
        };

        confirmButton.addEventListener('click', handleConfirm);
        modal.show();
    };

    const showask = (title, content, yesText, noText, yesCallback, noCallback, isDanger = false) => {
        const header = requireElementById('asktitle', HTMLElement);
        header.style.backgroundColor = isDanger ? '#ed4545' : '#f8d7da';

        const modalTitleElement = requireElementById('confirmModalLabel', HTMLElement);
        const modalBodyElement = requireOverlayElement(`#${MODAL_IDS.confirm} .modal-body`, HTMLElement);
        modalTitleElement.textContent = title;
        modalBodyElement.textContent = content;

        const yesButton = requireElementById('yes-button', HTMLElement);
        const noButton = requireElementById('no-button', HTMLElement);
        yesButton.innerText = yesText;
        noButton.innerText = noText;

        const modalElement = requireElementById(MODAL_IDS.confirm, HTMLElement);
        const modal = getModalInstance(modalElement);

        yesButton.onclick = () => {
            modal.hide();
            if (typeof yesCallback === 'function') {
                yesCallback();
            }
        };

        noButton.onclick = () => {
            modal.hide();
            if (typeof noCallback === 'function') {
                noCallback();
            }
        };

        modal.show();
    };

    const people = [
        { id: 0, name: '万泽', race: '犬系基因融合者', age: 22 },
        { id: 1, name: '柏斯', race: '猫系基因融合者', age: 19 },
        { id: 2, name: '山跃泉', race: '鹿系基因融合者', age: 28 },
        { id: 3, name: '阴烛', race: '蛇系基因融合者', age: 40 },
        { id: 4, name: '卡拉德罗斯', race: '人马系基因融合者', age: 35 },
        { id: 5, name: '青玉', race: '榕树系基因融合者', age: 23 },
        { id: 6, name: '蔓枝', race: '狐系基因融合者', age: 26 },
        { id: 7, name: '奈克萨里斯', race: '王虫系基因融合者', age: 20 },
        { id: 8, name: '埃本维尔', race: '人造亡灵', age: 21 },
        { id: 9, name: '月倾', race: '海妖', age: 19 },
        { id: 10, name: '艾洛温', race: '人造精灵', age: 25 },
        { id: 11, name: '维尔特', race: '人造血族', age: 37 },
        { id: 12, name: '艾尔菲尔', race: '人造天使', age: 24 },
        { id: 13, name: '卡尔德里克', race: '人造恶魔', age: 31 },
        { id: 14, name: '苍渊', race: '龙系基因融合者', age: 20 },
    ];

   

    const shoplist = [
        { name: '低级营养液', cost: 1, text: '恢复30%饱腹度和30%水分' },
        { name: '中级营养液', cost: 5, text: '恢复60%饱腹度、60%水分和10%精神力' },
        { name: '高级营养液', cost: 25, text: '恢复100%饱腹度、100%水分和20%精神力' },
        { name: '豪华营养液', cost: 50, text: '恢复100%饱腹度、100%水分和30%精神力' },
        { name: '有机食物', cost: 100, text: '恢复100%饱腹度、100%水分和100%精神力' },
        { name: 'C级精神突破剂', cost: 25, text: '可以让经验足以突破的D级向导升级为C级向导' },
        { name: 'B级精神突破剂', cost: 125, text: '可以让经验足以突破的C级向导升级为B级向导' },
        { name: 'A级精神突破剂', cost: 625, text: '可以让经验足以突破的B级向导升级为A级向导' },
        { name: 'S级精神突破剂', cost: 3125, text: '可以让经验足以突破的A级向导升级为S级向导' },
        { name: 'D级诊疗室', cost: 10, text: '能够禁锢住D级的暴走哨兵，避免在精神疏导时发生事故' },
        { name: 'C级诊疗室', cost: 50, text: '能够禁锢住C级的暴走哨兵，避免在精神疏导时发生事故' },
        { name: 'B级诊疗室', cost: 250, text: '能够禁锢住B级的暴走哨兵，避免在精神疏导时发生事故' },
        { name: 'A级诊疗室', cost: 1250, text: '能够禁锢住A级的暴走哨兵，避免在精神疏导时发生事故' },
        { name: 'S级诊疗室', cost: 6250, text: '能够禁锢住S级的暴走哨兵，避免在精神疏导时发生事故' },
        { name: '治疗躺椅', cost: 100, text: '比坐木头椅子强点，增加精神疏导中哨兵的舒适度' },
        { name: '柔软的诊疗床', cost: 1000, text: '很柔软，躺在上边更容易放松了。中幅增加精神疏导中哨兵的舒适度' },
        { name: 'King Size诊疗床', cost: 10000, text: '大到可以容纳两个人在上边滚来滚去的尺寸，大幅增加精神疏导中哨兵的舒适度' },
    ];

    const levelexpmax = [30, 150, 750, 3750, 17750];

    const roomitem0 = ['空房间', 'D级诊疗室', 'C级诊疗室', 'B级诊疗室', 'A级诊疗室', 'S级诊疗室'];
    const roomitem1 = ['木椅子', '治疗躺椅', '柔软的诊疗床', 'King Size诊疗床'];
    const prompt0 = `编写的剧情包裹在<content></content>里\n忠实无修饰且简洁的将编写的剧情总结成一百字以内的一行话放入<GDhistory></GDhistory>标签中,必须加入总结的内容：\n- 角色第一次认识某个人\n- 角色第一次知道某件事\n- 出现的特殊道具的名字\n- 出现的地名\n- 可能会成为两个角色间重要回忆的细节\n在剧情中出现了LocationDescription里没有提到的地点并且有详细描述的话，需要总结描述后用<GDpos></GDpos>包裹起来，确保总结里包含了本次剧情里提到的地点外观，有什么设施和家具等，用来在以后生成剧情时确保连续性。\n最终的输出格式为：<content>剧情内容</content><GDhistory>总结内容</GDhistory><GDpos>地点描述总结<GDpos>\n`;

    const getlvs = (num) => {
        switch (num) {
            case 0:
                return 'D';
            case 1:
                return 'C';
            case 2:
                return 'B';
            case 3:
                return 'A';
            case 4:
                return 'S';
            case 5:
                return 'SS';
            default:
                return '?';
        }
    };

    let tempid = -1;

    const requirePerson = (id) => {
        const profile = people[id];
        if (!profile || profile.id !== id) {
            throw new Error(`Guide Diary NPC profile missing: ${id}`);
        }
        return profile;
    };

    const formatNpcNames = (ids) =>
        ids
            .map((id, index) => {
                const profile = requirePerson(id);
                let connector = '';
                if (index === ids.length - 2) {
                    connector = '和';
                }
                else if (index < ids.length - 1) {
                    connector = '，';
                }
                return `${profile.race}哨兵${profile.name}${connector}`;
            })
            .join('');

    const profileOf = (npc) => requirePerson(npc.id);

    const cloneGuideDiaryData = (value) => JSON.parse(JSON.stringify(value));

    const defaultdata = () => ({
        v: Version,
        name: '黛',
        day: 1,
        stamina: 100,
        mental: 100,
        water: 100,
        guideLevel: 0,
        exp: 0,
        score: 5,
        killer: -1,
        dideat: false,
        roomlevel: 0,
        roomlevel1: 0,
        par: -1,
        curenum: 0,
        npcs: [],
        dayevent: [],
        history: [],
        isdate: false,
        isend: false,
        floornum: 0,
        ontext: false,
        norender: false
    });

    const createnpc = (id, level, pollution, match) => ({
        id,
        level,
        pollution,
        match,
        trust: 0,
        love: 0,
        hasProposed: false,
        inhome: true,
        curenum: 0,
        datenum: 0,
        isEvolution: false,
        savenum: 0,
        isInjured: false,
        injurednum: 0,
        isin: false,
        hsex: false,
        leavetime: 0,
    });

    const HAS_VARIABLE_FUNCTION = (name) => typeof window[name] === 'function';

    const hasGuideDiarySave = () => {
        if (!HAS_TAVERN_VARIABLE_API) {
            if (!tavernVariableWarningShown) {
                console.warn('Guide Diary: Tavern Helper variable API unavailable; persistence disabled');
                tavernVariableWarningShown = true;
            }
            return false;
        }
        try {
            if (!HAS_VARIABLE_FUNCTION('getVariables')) {
                return false;
            }
            const variables = getVariables(GUIDE_DIARY_STORAGE_SCOPE) || {};
            return Object.prototype.hasOwnProperty.call(variables, GUIDE_DIARY_STORAGE_KEY);
        }
        catch (error) {
            console.error('Guide Diary: failed to read Tavern Helper variables', error);
            return false;
        }
    };

    const loaddata = () => {
        if (!hasGuideDiarySave()) {
            return null;
        }
        try {
            const variables = getVariables(GUIDE_DIARY_STORAGE_SCOPE) || {};
            const raw = variables[GUIDE_DIARY_STORAGE_KEY];
            if (!raw) {
                return null;
            }
            return cloneGuideDiaryData(raw);
        }
        catch (error) {
            console.error('Guide Diary: failed to load data', error);
            return null;
        }
    };

    const savedata = (value) => {
        if (!HAS_TAVERN_VARIABLE_API) {
            return;
        }
        try {
            console.log('Guide Diary: ontext='+value.ontext);
            const snapshot = cloneGuideDiaryData(value);
            insertOrAssignVariables({ [GUIDE_DIARY_STORAGE_KEY]: snapshot }, GUIDE_DIARY_STORAGE_SCOPE);
        }
        catch (error) {
            console.error('Guide Diary: failed to save data', error);
        }
    };

    const markRendered = () => {
        if (!HAS_VARIABLE_FUNCTION('insertOrAssignVariables')) {
            return;
        }
        try {
            insertOrAssignVariables({ [GUIDE_DIARY_RENDER_FLAG_KEY]: true }, GUIDE_DIARY_STORAGE_SCOPE);
        }
        catch (error) {
            console.warn('Guide Diary: failed to mark render flag', error);
        }
    };

    const clearGuideDiarySave = () => {
        try {
            if (HAS_VARIABLE_FUNCTION('deleteVariable')) {
                deleteVariable(GUIDE_DIARY_STORAGE_KEY, GUIDE_DIARY_STORAGE_SCOPE);
                return;
            }
            if (HAS_VARIABLE_FUNCTION('updateVariablesWith')) {
                updateVariablesWith((variables) => {
                    if (variables && Object.prototype.hasOwnProperty.call(variables, GUIDE_DIARY_STORAGE_KEY)) {
                        delete variables[GUIDE_DIARY_STORAGE_KEY];
                    }
                    return variables;
                }, GUIDE_DIARY_STORAGE_SCOPE);
                return;
            }
            if (HAS_VARIABLE_FUNCTION('replaceVariables') && HAS_VARIABLE_FUNCTION('getVariables')) {
                const variables = getVariables(GUIDE_DIARY_STORAGE_SCOPE) || {};
                if (Object.prototype.hasOwnProperty.call(variables, GUIDE_DIARY_STORAGE_KEY)) {
                    delete variables[GUIDE_DIARY_STORAGE_KEY];
                    replaceVariables(variables, GUIDE_DIARY_STORAGE_SCOPE);
                }
            }
        }
        catch (error) {
            console.error('Guide Diary: failed to clear saved data', error);
        }
    };

    let data = defaultdata();

    const addhis = (text) => {
        if (!text) {
            return;
        }
        data.history.push(text);
    };

    const setBarWidth = (id, value) => {
        const element = overlayQuery(`#${id}`);
        if (isHostInstance(element)) {
            const clamped = Math.max(0, Math.min(100, Number.isFinite(value) ? value : 0));
            element.style.width = `${clamped}%`;
        }
    };

    const updateTextContent = (id, text) => {
        const element = overlayQuery(`#${id}`);
        if (isHostInstance(element)) {
            element.innerText = String(text);
        }
    };

    function getnpc(num) {
        return data.npcs.find((candidate) => candidate.id === num) || null;
    }

    function addscore(amount) {
        data.score += amount;
        if (data.score < 0) {
            data.score = 0;
        }
        else if (data.score > 10000000) {
            data.score = 10000000;
        }
        data.score = Math.floor(data.score);
        updateTextContent('score', data.score);
    }

    function addexp(amount) {
        data.exp += amount;
        const capIndex = Math.min(data.guideLevel, levelexpmax.length - 1);
        const cap = levelexpmax[capIndex] ?? levelexpmax[levelexpmax.length - 1];
        if (data.exp > cap) {
            data.exp = cap;
        }
    }

    function addwater(amount) {
        data.water = Math.max(0, Math.min(100, Math.floor(data.water + amount)));
        setBarWidth('water-bar', data.water);
    }

    function addmental(amount) {
        data.mental = Math.max(0, Math.min(100, Math.floor(data.mental + amount)));
        setBarWidth('mental-bar', data.mental);
    }

    function addstamina(amount) {
        data.stamina = Math.max(0, Math.min(100, Math.floor(data.stamina + amount)));
        setBarWidth('stamina-bar', data.stamina);
    }

    function addpollution(id, amount) {
        const npc = getnpc(id);
        if (!npc) {
            return;
        }
        npc.pollution += amount;
        if (npc.pollution < 0) {
            npc.pollution = 0;
        }
        else if (npc.pollution > 99) {
            npc.pollution = 99;
        }
        npc.pollution = Math.floor(npc.pollution);
    }

    function addmatch(id, amount) {
        const npc = getnpc(id);
        if (!npc) {
            return;
        }
        npc.match += amount;
        if (npc.match < 0) {
            npc.match = 0;
        }
        else if (npc.match > 100) {
            npc.match = 100;
        }
    }

    function addtrust(id, amount) {
        const npc = getnpc(id);
        if (!npc) {
            return;
        }
        npc.trust += amount;
        if (npc.trust < 0) {
            npc.trust = 0;
        }
        else if (npc.trust > 100) {
            npc.trust = 100;
        }
        npc.trust = Math.floor(npc.trust);
    }

    const getdays = (day) => {
        const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        let remaining = day;
        let month = 0;
        while (month < daysInMonth.length && remaining > daysInMonth[month]) {
            remaining -= daysInMonth[month];
            month++;
        }
        return `星历3123年${month + 1}月${remaining}日`;
    };

    const showevents = () => {
        if (!Array.isArray(data.dayevent) || data.dayevent.length === 0) {
            return;
        }
        const entry = data.dayevent.pop();
        if (!entry) {
            return;
        }
        const eventType = entry[0];
        switch (eventType) {
            case 0: {
                const npcId = entry[1];
                if (typeof npcId !== 'number') {
                    console.warn('Guide Diary: invalid proposal event payload', entry);
                    return;
                }
                tempid = npcId;
                const profile = requirePerson(npcId);
                showask('申请', `${profile.race}哨兵${profile.name}提出了和你的结婚申请`, '同意', '拒绝', marry, noaction, true);
                break;
            }
            case 1: {
                const npcId = entry[1];
                if (typeof npcId !== 'number') {
                    console.warn('Guide Diary: invalid date event payload', entry);
                    return;
                }
                tempid = npcId;
                const profile = requirePerson(npcId);
                showask('邀约', `${profile.race}哨兵${profile.name}邀请你今天与他约会`, '同意', '拒绝', godate, noaction);
                break;
            }
            case 2: {
                const [npcId, giftType, giftValue = 0] = [entry[1], entry[2], entry[3]];
                const profile = requirePerson(npcId);
                const next = () => showevents();
                switch (giftType) {
                    case 0:
                        showalert('礼物', `${profile.race}哨兵${profile.name}送来了一些手制小饼干，你吃了后饱腹度水分和精神力都恢复了`, next);
                        addmental(100);
                        addstamina(100);
                        addwater(100);
                        break;
                    case 1:
                        showalert('礼物', `${profile.race}哨兵${profile.name}送给你一些珠宝，你拿去兑换了${giftValue}积分`, next);
                        addscore(giftValue || 0);
                        break;
                    case 2:
                        showalert('礼物', `${profile.race}哨兵${profile.name}送给你一瓶无污染水，你喝了后身体里的水分恢复了`, next);
                        addwater(100);
                        break;
                    case 3:
                        showalert('礼物', `${profile.race}哨兵${profile.name}送了你一管精神补剂，你喝了后精神力恢复了一些`, next);
                        addmental(10);
                        break;
                    case 4:
                        showalert('礼物', `${profile.race}哨兵${profile.name}送了你一些小零食，你吃了后饱腹度和水分都恢复了一些`, next);
                        addstamina(30);
                        addwater(30);
                        break;
                    default:
                        console.warn('Guide Diary: unknown gift event type', entry);
                        showevents();
                        break;
                }
                break;
            }
            case 3: {
                const amount = entry[1] ?? 0;
                const partner = data.par !== -1 ? requirePerson(data.par) : null;
                const partnerName = partner ? partner.name : '配偶';
                showalert('配偶', `${partnerName}上交了工资${amount}积分`);
                break;
            }
            case 4: {
                const npcId = entry[1];
                if (typeof npcId !== 'number') {
                    console.warn('Guide Diary: invalid jealousy event payload', entry);
                    break;
                }
                if (data.par !== -1) {
                    jealous(npcId);
                }
                break;
            }
            default:
                console.warn('Guide Diary: unknown day event type', entry);
                break;
        }
    };

    const ensureStartingNpcs = () => {
        if (!Array.isArray(data.npcs)) {
            data.npcs = [];
        }
        if (data.npcs.length > 0) {
            return false;
        }
        data.npcs.push(createnpc(0, 0, 75, 99));
        data.npcs.push(createnpc(1, 0, 56, 95));
        data.npcs.push(createnpc(2, 0, 39, 93));
        return true;
    };

    function addtime(isdate = true) {
        addmental(30);
        if (!isdate) {
            addwater(-30);
            addstamina(-30);
        }
        else {
            addmental(100);
            addwater(100);
            addstamina(100);
        }

        if (data.stamina === 0) {
            if (data.guideLevel === 0) {
                showalert('Game Over', '长时间的饥饿令你明白向导可能并不是一个适合你的赛道，你决定转行去做营养液生产工人，从此过上了衣食无忧的生活……');
                gameover(1);
                return;
            }
            showalert('向导中心', '已为您紧急补充了营养液，扣除1点积分');
            addwater(30);
            addstamina(30);
            addscore(-1);
        }

        data.day += 1;
        if (data.day >= 181) {
            showalert('通关', '恭喜你成功的度过了做为向导的实习期！');
            gameover(3);
            return;
        }

        if (data.par !== -1) {
            const partnerNpc = getnpc(data.par);
            if (partnerNpc) {
                const smin = [1, 10, 30, 60, 100, 200];
                const smax = [10, 20, 50, 80, 150, 250];
                const min = smin[partnerNpc.level] ?? 0;
                const max = smax[partnerNpc.level] ?? min;
                const amount = min + Math.floor(Math.random() * Math.max(1, max - min));
                addscore(amount);
                data.dayevent.push([3, amount]);
            }
        }

        let proposalQueued = false;
        for (const npc of data.npcs) {
            if (Math.random() < 0.5) {
                npc.inhome = !npc.inhome;
            }
            if (npc.pollution >= 90) {
                npc.inhome = true;
            }
            else if (npc.pollution <= 20) {
                npc.inhome = false;
            }
            if (npc.inhome) {
                npc.leavetime = 0;
                if (data.par === -1 && !proposalQueued && npc.love >= 20 && !npc.hasProposed && Math.random() < 0.1) {
                    npc.hasProposed = true;
                    data.dayevent.push([0, npc.id]);
                    proposalQueued = true;
                }
            }
            else {
                const randomPollution = Math.floor(Math.random() * 25);
                addpollution(npc.id, randomPollution);
            }
        }

        if (!proposalQueued) {
            for (const npc of data.npcs) {
                if (!npc.inhome) {
                    continue;
                }
                if (npc.love > 0 && Math.random() < 0.1) {
                    if (data.par === -1 || data.par === npc.id) {
                        data.dayevent.push([1, npc.id]);
                        break;
                    }
                    data.dayevent.push([4, npc.id]);
                }
            }
        }

        for (const npc of data.npcs) {
            if (!npc.inhome) {
                continue;
            }
            if (npc.trust <= 70 || Math.random() >= 0.1) {
                continue;
            }
            let giftType = 2 + Math.floor(Math.random() * 3);
            let extraValue = 0;
            if (npc.id === 10) {
                giftType = 0;
            }
            else if (npc.level >= 4) {
                giftType = 1;
                extraValue = 100 + Math.floor(Math.random() * 100);
            }
            data.dayevent.push([2, npc.id, giftType, extraValue]);
            break;
        }

        data.isdate = false;
        data.dideat = false;
        savedata(data);
        loadmain();
        showevents();
    }
    function loadmain() {
        tavernWindow.loadpage('main');
        data.ontext = false;
    }
    function loadgame() {
        tavernWindow.loadpage('game');
        data.ontext = false;
    }
    function loadsetname() {
        tavernWindow.loadpage('setname');
        data.ontext = false;
    }

    function setname() {
        const formElement = requireElementById('guide-form', HTMLFormElement);
        const submitButton = formElement.querySelector('button[type="submit"]');
        if (isHostInstance(submitButton, HTMLButtonElement)) {
            submitButton.disabled = false;
        }

        data.name = username;
        //id username的地方显示username
        updateTextContent('username', data.name);

        formElement.onsubmit = (event) => {
            event.preventDefault();
            if (isHostInstance(submitButton, HTMLButtonElement)) {
                submitButton.disabled = true;
            }

            if (!Array.isArray(data.history)) {
                data.history = [];
            }
            addhis(getdays(data.day));
            addhis('主角在在国立向导中心毕业，向白塔提交了向导述职登录表，进入白塔内分配给主角的诊疗室开始工作。主角当前年龄22岁，向导等级D级');
            let narrativePrompt = `主角刚刚提交了向导述职登录表，内容：姓名：${data.name}，基因：纯种人类，无外族基因融合，无基因修改，年龄：22岁，向导等级：D，履历：在国立向导中心完成了所有培训课程并获得合格。\n主角正在前往诊疗室入职，开始为期半年的实习工作。主角的诊疗室为空房间，给前来进行精神梳理的患者使用的设备为木椅子。请扩写主角提交好数据进入自己办公室，准备进行向导的精神梳理工作的描写，最后一句以‘你开始查看桌面上的哨兵精神梳理申请’结束，不要额外增加任何角色和剧情。\n`;
            narrativePrompt += prompt0;
            sendToAI(narrativePrompt);
        };
    }

    function newgame() {
        clearGuideDiarySave();
        data = defaultdata();
        ensureStartingNpcs();
        tempid = -1;
        resetLocationDescriptionEntry();
        loadsetname();
    }
    let username = "";
    const initializeGuideDiary = () => {
        username = typeof window !== 'undefined' ? window.SillyTavern?.name1 ?? '' : '';
        const savedData = loaddata();
        if (savedData && savedData.norender === true) {
            destroyOverlay();
            return;
        }
        if (!savedData) {
            newgame();
            return;
        }
        let versionMismatch = false;
        if (savedData.v !== undefined) {
            versionMismatch = savedData.v !== Version;
        }
        else {
            versionMismatch = true;
        }
        if (versionMismatch) {
            console.warn('Guide Diary: save version mismatch, starting new game');
            newgame();
            return;
        }
        data = savedData;
        const addedNpcs = ensureStartingNpcs();
        tempid = -1;

        if (addedNpcs) {
            savedata(data);
        }
         console.log('Guide Diary: restoring text view'+data.ontext);
        if (data.ontext) {
           
            loadtext();
            let resolvedContent = null;
            try {
                const chatContext = tavernWindow?.SillyTavern;
                if (chatContext && Array.isArray(chatContext.chat)) {
                    for (let index = chatContext.chat.length - 1; index >= 0; index -= 1) {
                        const rawMessage = typeof readAssistantMessage === 'function' ? readAssistantMessage(index) : null;
                        if (!rawMessage) {
                            continue;
                        }
                        resolvedContent = typeof extractContentBlock === 'function' ? extractContentBlock(rawMessage) : null;
                        if (resolvedContent) {
                            break;
                        }
                    }
                }
            }
            catch (error) {
                console.error('Guide Diary: failed to restore text view content', error);
            }

            if (resolvedContent) {
                showtext(resolvedContent);
                if (data.isend) {
                    showerrbutton('结束游戏', () => endthegame());
                }
                else {
                    showerrbutton('继续工作', () => addtime(Boolean(data.isdate)));
                }
            }
            else {
                showtext('剧情生成失败，请点击重新发送按钮');
                showerrbutton('重新发送', () => sendToAI(data.lastprompt));
            }
        }
        else {
            loadmain();
            showevents();
        }
    };

    function showroom() {
        const content = `${roomitem0[Math.min(data.roomlevel, roomitem0.length - 1)]}    ${roomitem1[Math.min(data.roomlevel1, roomitem1.length - 1)]}`;
        showalert('诊疗室详情', content);
    }

    function buy(index) {
        if (index < 0 || index >= shoplist.length) {
            return;
        }
        const item = shoplist[index];
        if (data.score < item.cost) {
            showalert('商店', '积分不够……');
            return;
        }
        addscore(-item.cost);
        getitem(index);
        setshop();
    }

    function getitem(index) {
        if (index <= 4) {
            data.dideat = true;
            if (index === 0) {
                addhis('主角购买了并吃掉了低级营养液');
                addstamina(30);
                addwater(30);
            }
            else if (index === 1) {
                addhis('主角购买了并吃掉了中级营养液');
                addstamina(60);
                addwater(60);
                addmental(10);
            }
            else if (index === 2) {
                addhis('主角购买了并吃掉了高级营养液');
                addstamina(100);
                addwater(100);
                addmental(20);
            }
            else if (index === 3) {
                addhis('主角购买了并吃掉了豪华营养液');
                addstamina(100);
                addwater(100);
                addmental(30);
            }
            else if (index === 4) {
                addhis('主角购买了并吃掉了有机食物');
                addstamina(100);
                addwater(100);
                addmental(100);
            }
            return;
        }

        if (index >= 5 && index <= 8) {
            data.guideLevel++;
            data.exp = 0;
            addhis(`主角使用了${shoplist[index].name}，向导等级提升至${getlvs(data.guideLevel)}级`);
            updateTextContent('guide-level', getlvs(data.guideLevel));
            setBarWidth('exp-bar', (data.exp * 100) / (levelexpmax[data.guideLevel] || 1));
            if (data.guideLevel === 1) {
                data.npcs.push(createnpc(3, 1, 60, 70));
                data.npcs.push(createnpc(4, 1, 50, 75));
                data.npcs.push(createnpc(5, 1, 80, 69));
            }
            else if (data.guideLevel === 2) {
                data.npcs.push(createnpc(6, 2, 70, 71));
                data.npcs.push(createnpc(7, 2, 55, 63));
                data.npcs.push(createnpc(8, 2, 60, 55));
            }
            else if (data.guideLevel === 3) {
                data.npcs.push(createnpc(9, 3, 80, 66));
                data.npcs.push(createnpc(10, 3, 70, 59));
                data.npcs.push(createnpc(11, 3, 80, 48));
            }
            else if (data.guideLevel === 4) {
                data.npcs.push(createnpc(12, 4, 90, 51));
                data.npcs.push(createnpc(13, 4, 95, 35));
                data.npcs.push(createnpc(14, 4, 90, 40));
            }
            return;
        }

        if (index >= 9 && index <= 13) {
            data.roomlevel++;
            addhis(`主角将诊疗室装修为${shoplist[index].name}`);
            return;
        }

        if (index >= 14 && index <= 16) {
            data.roomlevel1++;
            addhis(`主角为诊疗室购买了${shoplist[index].name}`);
        }
    }
    function resolveNpcImage(npcid)
    {
        return "https://testingcf.jsdelivr.net/gh/HydrozoaWorks/HydrozoaWorks.github.io@v1.0.0/GuideDiary/npc"+npcid+".gif";
    }

    function buildApplicantButton(applicant) {
        const profile = profileOf(applicant);
        const button = hostDocument.createElement('button');
        button.className = 'applicant-button';
        button.type = 'button';
        button.onclick = () => {
            tempid = applicant.id;
            showask('向导中心', `确定今日安排为对${profile.name}进行精神疏导吗？`, '确定', '取消', cleanse, noaction);
        };

        const gifDiv = hostDocument.createElement('div');
        gifDiv.className = 'gif-image';

        const imgContainer = hostDocument.createElement('div');
        imgContainer.style.position = 'relative';

        const img = hostDocument.createElement('img');
        const imageSource = resolveNpcImage(applicant.id);
        img.src = imageSource || FALLBACK_NPC_IMAGE;
        img.alt = '申请人图像';
        img.style.width = '100%';
        img.style.height = 'auto';
        imgContainer.appendChild(img);

        if (!applicant.inhome) {
            const statusText = hostDocument.createElement('div');
            statusText.textContent = '出勤中';
            statusText.style.position = 'absolute';
            statusText.style.top = '5px';
            statusText.style.right = '5px';
            statusText.style.color = 'red';
            statusText.style.backgroundColor = 'rgba(255, 255, 255, 0.7)';
            statusText.style.padding = '2px 0px';
            statusText.style.fontSize = '12px';
            statusText.style.fontWeight = 'bold';
            imgContainer.appendChild(statusText);
        }

        gifDiv.appendChild(imgContainer);
        button.appendChild(gifDiv);

        const infoDiv = hostDocument.createElement('div');
        infoDiv.className = 'applicant-info';
        const partnerLine = applicant.id === data.par ? `<div>配偶 ${data.name}</div>` : '';
        infoDiv.innerHTML = `
			<div>${profile.name} ${profile.race} ${profile.age}岁</div>
			<div>哨兵等级 ${getlvs(applicant.level)} 匹配率 ${applicant.match}%</div>
			<div>污染度 ${applicant.pollution}% 信任度 ${applicant.trust}%</div>
			${partnerLine}
		`;
        button.appendChild(infoDiv);

        if (applicant.pollution === 0 || !applicant.inhome) {
            button.disabled = true;
        }

        return button;
    }

    function setshop() {
        const applicantList = requireElementById('applicant-list', HTMLElement);
        applicantList.innerHTML = '';
        requireElementById('list-title', HTMLElement).innerText = '商店';
        const shopButton = requireElementById('shop-button', HTMLElement);
        shopButton.innerText = '前往诊疗室';
        shopButton.onclick = () => {
            setmain();
        };

        shoplist.forEach((item, index) => {
            let availability = 0;
            if (index <= 4 && !data.dideat) {
                availability = data.stamina === 100 && data.water === 100 && data.mental === 100 ? 2 : 1;
            }
            else if (index <= 8) {
                if (index - 5 === data.guideLevel) {
                    availability = data.exp >= levelexpmax[data.guideLevel] ? 1 : 2;
                }
            }
            else if (index <= 13) {
                if (index - 9 === data.roomlevel) {
                    availability = 1;
                }
            }
            else if (index <= 16) {
                if (index - 14 === data.roomlevel1) {
                    availability = 1;
                }
            }

            if (availability === 0) {
                return;
            }

            const button = hostDocument.createElement('button');
            button.className = 'applicant-button';
            button.type = 'button';
            if (availability === 2) {
                button.disabled = true;
            }
            else {
                button.onclick = () => buy(index);
            }

            const infoDiv = hostDocument.createElement('div');
            infoDiv.className = 'applicant-info';
            infoDiv.innerHTML = `
				<div>${item.name}<div class="justify-content-end">积分 ${item.cost}</div></div>
				<div style="font-size: 0.8em;">${item.text}</div>
			`;
            button.appendChild(infoDiv);
            applicantList.appendChild(button);
        });
    }

    function noaction() { }

    function marry() {
        if (tempid === -1) {
            return;
        }
        const profile = requirePerson(tempid);
        if (!profile) {
            return;
        }
        data.par = tempid;
        data.isdate = true;

        data.dayevent = [];
        let narrativePrompt = `主角答应了${profile.name}的求婚。请查看下边的角色信息和过去履历，生成从${profile.name}求婚，主角答应求婚，两人去白塔民政中心登记配偶关系，到新婚之夜结束的剧情描述，最后一句必须是‘这一夜还很长……’，字数在2000字上下，要细腻浪漫。`;
        const rivals = [];
        for (const npc of data.npcs) {
            if (npc.inhome && npc.love >= 20 && npc.id !== tempid) {
                rivals.push(npc.id);
            }
        }
        if (rivals.length > 0) {
            narrativePrompt += '在剧情中，';
            for (const npcId of rivals) {
                const npcProfile = requirePerson(npcId);
                narrativePrompt += `${npcProfile.name},`;
            }
            narrativePrompt += `可以作为${profile.name}的情敌出现，描述他们醋意带来的行为和心理活动，但他们的行为不可以影响到主角和${profile.name}的结婚和新婚夜。`;
        }
        narrativePrompt += prompt0;
        narrativePrompt += getinfo();
        narrativePrompt += getnpcinfo(tempid);
        for (const npcId of rivals) {
            narrativePrompt += getnpcinfo(npcId);
        }
        narrativePrompt += gethistory();
        const marriedNpc = getnpc(tempid);
        if (marriedNpc) {
            marriedNpc.hsex = true;
        }
        sendToAI(narrativePrompt);
    }

    function godate() {
        if (tempid === -1) {
            return;
        }
        const npc = getnpc(tempid);
        if (!npc) {
            return;
        }
        npc.datenum += 1;
        npc.love += 2;
        data.isdate = true;
        data.dayevent = [];

        const profile = requirePerson(tempid);
        let narrativePrompt = `主角答应了${profile.name}的邀约。请查看下边的角色信息和过去履历，生成从${profile.name}邀约，主角答应邀约，两人一起约会度过一天，到约会结束的剧情描述，结尾必须干净的结束，因为剧情后用户将看到主角继续准备新的一天的工作，字数在2000字上下，要细腻浪漫。${profile.name}曾经和主角做爱的话，请在约会中加入一些两人亲密互动的细节描写。`;
        narrativePrompt += prompt0;
        narrativePrompt += getinfo();
        narrativePrompt += getnpcinfo(tempid);
        narrativePrompt += gethistory();
        sendToAI(narrativePrompt);
    }

    function jealous(npcId) {
        if (data.par === -1) {
            return;
        }
        const profile = requirePerson(npcId);
        const partnerProfile = requirePerson(data.par);
        const partnerNpc = getnpc(data.par);
        const partnerIsHome = partnerNpc ? partnerNpc.inhome : false;
        let narrativePrompt = '';
        if (partnerIsHome) {
            narrativePrompt = `在主角早上进入诊疗室准备开始一天的工作的时候，${profile.name}试图追求主角，被主角的丈夫${partnerProfile.name}看到，两个男人开始了争风吃醋闹了一整天。请编写这段修罗场剧情，主角的态度应该偏向丈夫。结尾必须干净的结束，因为剧情后用户将看到主角结束了旧的一天准备开始新的一天的工作，字数在2000字上下，要充满情感张力并诙谐有趣。`;
        }
        else {
            narrativePrompt = `在主角早上进入诊疗室准备开始一天的工作的时候，${profile.name}试图趁主角的丈夫${partnerProfile.name}不在家时追求主角，主角被他缠了一天。请编写这段追求剧情。结尾必须干净的结束，因为剧情后用户将看到主角结束了旧的一天准备开始新的一天的工作，字数在2000字上下，要充满情感张力并诙谐有趣。如果${profile.name}曾经和主角做爱的话，请在追求中加入一些两人亲密互动的细节描写和主角对于背着丈夫和情人做爱的背德心理活动。`;
        }
        data.dayevent = [];
        data.isdate = true;
        narrativePrompt += prompt0;
        narrativePrompt += getinfo();
        narrativePrompt += getnpcinfo(data.par);
        narrativePrompt += getnpcinfo(npcId);
        narrativePrompt += gethistory();
        sendToAI(narrativePrompt);
    }

    function cleanse() {
        if (typeof tavernWindow.loadpage === 'function') {
            loadgame();
        }
    }

    const handleRest = () => {
        addmental(40);
        addtime(false);
    };
    function loadtext() {
        tavernWindow.loadpage('text');
        data.ontext = true;
    }
    function showtext(text) {
        if (!data.ontext) {
            return;
        }
        try {

            const contentElement = requireElementById('textcontent', HTMLElement);
            const normalized = typeof text === 'string' ? text : String(text ?? '');
            const escapeHtml = (value) =>
                value.replace(/[&<>'"]/g, (char) => {
                    switch (char) {
                        case '&':
                            return '&amp;';
                        case '<':
                            return '&lt;';
                        case '>':
                            return '&gt;';
                        case "'":
                            return '&#39;';
                        case '"':
                            return '&quot;';
                        default:
                            return char;
                    }
                });
            let html = '';
            let lastIndex = 0;
            const pattern = /"([^"]*)"/g;
            let match;
            while ((match = pattern.exec(normalized)) !== null) {
                html += escapeHtml(normalized.slice(lastIndex, match.index));
                const quoted = match[0];
                html += `<span style="color:#4a0f0f;">${escapeHtml(quoted)}</span>`;
                lastIndex = match.index + quoted.length;
            }
            html += escapeHtml(normalized.slice(lastIndex));
            contentElement.innerHTML = html;
        }
        catch (error) {
            console.error('Guide Diary: failed to update text content page', error);
        }
    }

    const hasEventApi = typeof eventOn === 'function' && typeof tavern_events === 'object' && tavern_events !== null;
    const hasMessageIdHelper = typeof getLastMessageId === 'function';
    const hasWorldbookApi = typeof updateWorldbookWith === 'function';
    let lastContentMessageId = null;
    let pendingResponseTimer = null;
    let pendingResponseBaseline = null;
    const RESPONSE_TIMEOUT_MS = 15000;

    const clearPendingResponseTimer = () => {
        if (pendingResponseTimer !== null) {
            clearTimeout(pendingResponseTimer);
            pendingResponseTimer = null;
        }
        pendingResponseBaseline = null;
    };

    const schedulePendingResponseTimeout = (baselineId) => {
        clearPendingResponseTimer();
        pendingResponseBaseline = typeof baselineId === 'number' ? baselineId : null;
        pendingResponseTimer = setTimeout(() => {
            pendingResponseTimer = null;
            pendingResponseBaseline = null;
            showtext('请等待，若剧情生成失败，请点击重新发送按钮');
            showerrbutton('重新发送', () => sendToAI(data.lastprompt));
        }, RESPONSE_TIMEOUT_MS);
    };

    const readAssistantMessage = (messageId) => {
        if (typeof messageId !== 'number') {
            return null;
        }
        const context = tavernWindow.SillyTavern;
        if (!context || !Array.isArray(context.chat)) {
            return null;
        }
        const message = context.chat[messageId];
        if (!message || message.is_user || typeof message.mes !== 'string') {
            return null;
        }
        return message.mes;
    };

    const extractContentBlock = (text) => {
        if (typeof text !== 'string') {
            return null;
        }
        const match = text.match(/<content>([\s\S]*?)<\/content>/i);
        return match ? match[1].trim() : null;
    };

    const deleteLatestMessage = (messageId) => {
        if (typeof deleteChatMessages !== 'function') {
            console.warn('Guide Diary: deleteChatMessages unavailable; skipped removing message');
            return;
        }
        if (typeof messageId !== 'number') {
            console.warn('Guide Diary: invalid message id for deletion', messageId);
            return;
        }
        try {
            const result = deleteChatMessages([messageId], { refresh: 'none' });
            if (result && typeof result.then === 'function') {
                result.catch((error) => {
                    console.error('Guide Diary: failed to delete latest message', error);
                });
            }
        }
        catch (error) {
            console.error('Guide Diary: failed to delete latest message', error);
        }
    };

    if (hasEventApi) {
        // Pipe AI replies that carry <content> into the text page.
        const characterMessageHandle = eventOn(tavern_events.CHARACTER_MESSAGE_RENDERED, (messageId) => {
            try {
                if (typeof messageId === 'number' && typeof pendingResponseBaseline === 'number' && messageId <= pendingResponseBaseline) {
                    return;
                }

                clearPendingResponseTimer();

                if (hasMessageIdHelper && messageId !== getLastMessageId()) {
                    showtext('剧情生成失败，请点击重新发送按钮');
                    showerrbutton('重新发送', () => sendToAI(data.lastprompt));
                    return;
                }

                if (lastContentMessageId === messageId) {
                    showtext('剧情生成失败，请点击重新发送按钮');
                    showerrbutton('重新发送', () => sendToAI(data.lastprompt));
                    return;
                }

                const rawMessage = readAssistantMessage(messageId);
                if (!rawMessage) {
                    showtext('剧情生成失败，请点击重新发送按钮');
                    showerrbutton('重新发送', () => sendToAI(data.lastprompt));
                    return;
                }

                const contentBlock = extractContentBlock(rawMessage);
                if (!contentBlock) {
                    deleteLatestMessage(messageId);
                    showtext('剧情生成失败，请点击重新发送按钮');
                    showerrbutton('重新发送', () => sendToAI(data.lastprompt));
                    return;
                }

                lastContentMessageId = messageId;
                const historyMatch = rawMessage.match(/<GDhistory>([\s\S]*?)<\/GDhistory>/i);
                if (historyMatch) {
                    console.log('Guide Diary: history' + historyMatch[1].trim());
                    data.history.push(historyMatch[1].trim());
                }
                const posMatch = rawMessage.match(/<GDpos>([\s\S]*?)<\/GDpos>/i);
                if (posMatch) {
                    console.log('Guide Diary: pos' + posMatch[1].trim());
                    writeWorld(posMatch[1].trim());
                }

                showtext(contentBlock);
                if (data.isend) {
                    showerrbutton('结束游戏', () => endthegame());
                }
                else {
                    showerrbutton('继续工作', () => addtime(Boolean(data.isdate)));
                }
                  savedata(data);
            }
            catch (error) {
                console.error('Guide Diary: failed to surface AI reply content', error);
            }
        });
        if (characterMessageHandle && typeof characterMessageHandle.stop === 'function') {
            registerCleanup(() => characterMessageHandle.stop());
        }

        const chatChangedHandle = eventOn(tavern_events.CHAT_CHANGED, (chatFileName) => {
            try {
                const normalized = typeof chatFileName === 'string' ? chatFileName.trim() : chatFileName;
                if (!normalized || normalized === 'null' || normalized === '__null__') {
                    destroyOverlay();
                }
            }
            catch (error) {
                console.error('Guide Diary: failed to react to chat change', error);
            }
        });
        if (chatChangedHandle && typeof chatChangedHandle.stop === 'function') {
            registerCleanup(() => chatChangedHandle.stop());
        }

       

      
       
    }

    async function resetLocationDescriptionEntry() {
        if (!hasWorldbookApi) {
            return;
        }

        const worldbookName = '实习向导日记世界书';
        const entryName = '地点描述';
        const initialContent = '<LocationDescription></LocationDescription>';

        try {
            let found = false;
            await updateWorldbookWith(worldbookName, (entries) => {
                let updated = false;
                const nextEntries = entries.map((entry) => {
                    if (entry.name !== entryName) {
                        return entry;
                    }
                    found = true;
                    if (entry.content === initialContent) {
                        return entry;
                    }
                    updated = true;
                    return {
                        ...entry,
                        content: initialContent,
                    };
                });
                return updated ? nextEntries : entries;
            });

            if (!found) {
                console.warn(`Guide Diary: worldbook entry "${entryName}" not found when resetting`);
            }
        }
        catch (error) {
            console.error('Guide Diary: failed to reset worldbook location description', error);
        }
    }

    async function writeWorld(text) {
        if (!hasWorldbookApi) {
            console.warn('Guide Diary: worldbook API unavailable; skipped writeWorld');
            return;
        }

        const appendText = typeof text === 'string' ? text.trim() : '';
        if (!appendText) {
            return;
        }

        const worldbookName = '实习向导日记世界书';
        const entryName = '地点描述';
        let entryUpdated = false;

        try {
            await updateWorldbookWith(worldbookName, (entries) => {
                let touched = false;
                const locationTagPattern = /<LocationDescription>([\s\S]*?)<\/LocationDescription>/i;
                const nextEntries = entries.map((entry) => {
                    if (entry.name !== entryName) {
                        return entry;
                    }
                    touched = true;
                    const currentContent = typeof entry.content === 'string' ? entry.content : '';
                    const match = currentContent.match(locationTagPattern);
                    const innerRaw = match ? match[1] : currentContent.replace(/<\/?LocationDescription>/gi, '');
                    const innerWithoutTrailingBreaks = innerRaw.replace(/[\r\n]+$/g, '');
                    const hasExisting = innerWithoutTrailingBreaks.trim().length > 0;
                    const combinedInner = hasExisting
                        ? `${innerWithoutTrailingBreaks}\n${appendText}`
                        : appendText;
                    const locationBlock = `<LocationDescription>${combinedInner}</LocationDescription>`;
                    const updatedContent = match && typeof match.index === 'number'
                        ? `${currentContent.slice(0, match.index)}${locationBlock}${currentContent.slice(match.index + match[0].length)}`
                        : locationBlock;
                    if (updatedContent === currentContent) {
                        return entry;
                    }
                    return {
                        ...entry,
                        content: updatedContent,
                    };
                });
                if (touched) {
                    entryUpdated = true;
                }
                return nextEntries;
            });

            if (!entryUpdated) {
                console.warn(`Guide Diary: worldbook entry "${entryName}" not found in "${worldbookName}"`);
            }
        }
        catch (error) {
            console.error('Guide Diary: failed to append worldbook content', error);
        }
    }

    async function sendToAI(narrativePrompt) {

        if (!narrativePrompt || typeof narrativePrompt !== 'string') {
            return;
        }
        data.lastprompt = narrativePrompt;

        if (!HAS_TAVERN_VARIABLE_API) {
            showalert('向导中心', '数据提交失败，请刷新重来');
            return;
        }
        try {
            savedata(data);
            const slashInvoker = typeof tavernWindow.triggerSlash === 'function'
                ? tavernWindow.triggerSlash
                : typeof window.triggerSlash === 'function'
                    ? window.triggerSlash
                    : null;
            const createMessages = typeof tavernWindow.createChatMessages === 'function'
                ? tavernWindow.createChatMessages
                : typeof window.createChatMessages === 'function'
                    ? window.createChatMessages
                    : null;

            let promptDelivered = false;
            if (createMessages) {
                try {
                    await createMessages([{ role: 'user', message: narrativePrompt }]);
                    promptDelivered = true;
                }
                catch (error) {
                    console.error('Guide Diary: failed to enqueue narrative prompt message', error);
                }
            }

            if (promptDelivered) {
                if (slashInvoker) {
                    try {
                        await slashInvoker('/trigger');
                    }
                    catch (error) {
                        console.error('Guide Diary: failed to trigger AI response', error);
                    }
                }
                else {
                    console.warn('Guide Diary: triggerSlash function unavailable; narrative prompt enqueued without auto reply');
                }
            }
            else if (slashInvoker) {
                try {
                    await slashInvoker(`/send ${narrativePrompt}`);
                    promptDelivered = true;
                }
                catch (error) {
                    console.error('Guide Diary: failed to send narrative prompt via slash command', error);
                }
            }

            if (!promptDelivered) {
                console.warn('Guide Diary: messaging APIs unavailable; narrative prompt not delivered');
                clearPendingResponseTimer();
            }
            else {
                const baselineId = hasMessageIdHelper ? getLastMessageId() : null;
                schedulePendingResponseTimeout(baselineId);
            }
            loadtext();
            showtext('请等待剧情生成……');
            hidtextbutton();
        }
        catch (error) {
            console.error('Guide Diary: failed to send narrative prompt to AI', error);
            clearPendingResponseTimer();
            showtext('剧情生成失败，请点击重新发送按钮');
            showerrbutton('重新发送', () => sendToAI(narrativePrompt));
        }
    }
    function hidtextbutton() {
        //隐藏act00-button按钮
        const button = requireElementById('act00-button', HTMLButtonElement);
        if (button) {
            button.style.display = 'none';
        }
    }
    function showerrbutton(text, func) {
        //显示act00-button按钮,将text显示在按钮上，设置按钮为点击执行func
        const button = requireElementById('act00-button', HTMLButtonElement);
        if (button) {
            button.style.display = 'block';
            button.innerText = text;
            button.onclick = () => {
                func();
            };
        }
    }

    function gethistory() {
        let output = '\n<history>\n';
        for (const entry of data.history) {
            output += `${entry}\n`;
        }
        output += '</history>\n';
        return output;
    }

    function getparname() {
        if (data.par === -1) {
            return '无';
        }
        const profile = requirePerson(data.par);
        return profile ? profile.name : '无';
    }

    function getinfo() {
        const roomLabel = roomitem0[Math.min(data.roomlevel, roomitem0.length - 1)];
        const furnishingLabel = roomitem1[Math.min(data.roomlevel1, roomitem1.length - 1)];
        return `\n<info>基本信息\n时间：${getdays(data.day)}\n主角姓名：${data.name}主角向导等级:${getlvs(data.guideLevel)}\n主角积分:${data.score}\n主角精神力:${data.mental}\n主角性欲值:${data.water}\n主角体力:${data.stamina}\n主角配偶:${getparname()}\n主角一共为人进行过${data.curenum}次精神疏导 \n主角诊疗室:${roomLabel}，${furnishingLabel}\n</info>\n`;
    }

    function getnpcinfo(npcid) {
        const npc = getnpc(npcid);
        if (!npc) {
            return '';
        }
        const profile = requirePerson(npcid);
        return `\n<npc${npcid}info>\n角色姓名：${profile.name}\n哨兵等级：${getlvs(npc.level)}\n对主角信赖度：${npc.trust}\n和主角契合度：${npc.match}\n对主角爱慕度：${npc.love}\n精神污染度：${npc.pollution}\n被主角精神疏导过的次数：${npc.curenum}\n和主角约会过的次数：${npc.datenum}\n被主角彻底净化过的次数：${npc.savenum}\n是否曾经和主角做爱：${npc.hsex}\n陷入暴走状态的次数：${npc.injurednum}</npc${npcid}info>\n`;
    }

    function gameover(resultCode) {
        let narrativePrompt = '用下述信息编写主角的后日谈：\n';
        narrativePrompt += `${getinfo()}<afterlifeinfo>\n`;
        if (resultCode === 1) {
            narrativePrompt += `长时间的饥饿令主角明白向导可能并不是一个适合她的赛道，她决定转行去做营养液生产工人，从此过上了衣食无忧的生活……`;
            narrativePrompt += `\n主角在向导的职位上共工作了${data.day}天,共进行了${data.curenum}次精神疏导`;
        }
        else if (resultCode === 2) {
            narrativePrompt += '主角被狂暴化的哨兵袭击后，精神海受到了无法修复的损坏，再也无法从事向导这一职业。';
            narrativePrompt += `\n主角在向导的职位上共工作了${data.day}天,共进行了${data.curenum}次精神疏导`;
        }
        else {
            narrativePrompt += `主角成功的度过了做为向导的实习期，成为了一名正式向导。角在历时半年的向导实习工作中共进行了${data.curenum}次精神疏导。`;
        }

        let mostCuredId = -1;
        let mostCuredCount = 0;
        for (const npc of data.npcs) {
            if (npc.curenum > mostCuredCount) {
                mostCuredId = npc.id;
                mostCuredCount = npc.curenum;
            }
        }
        if (mostCuredId !== -1) {
            const profile = requirePerson(mostCuredId);
            narrativePrompt += `被主角进行过最多次精神疏导的哨兵是${profile.race}哨兵${profile.name}，主角共为他进行了${mostCuredCount}次精神疏导\n`;
        }

        if (resultCode === 3 && data.guideLevel > 0) {
            if (data.guideLevel === 4) {
                narrativePrompt += '这半年中主角成功的突破为了极为罕见的S级向导，现在的主角已经不再是刚刚毕业的菜鸟向导，而是帝国的珍宝\n';
            }
            else {
                narrativePrompt += `这半年中主角成功的突破为了${getlvs(data.guideLevel)}级向导\n`;
            }
        }

        const evolvedIds = [];
        let ssId = -1;
        for (const npc of data.npcs) {
            if (npc.isEvolution) {
                evolvedIds.push(npc.id);
            }
            if (npc.level >= 5 && data.killer !== npc.id) {
                ssId = npc.id;
            }
        }
        if (evolvedIds.length > 0) {
            let text = '令人震惊的是，在主角的净化下，';
            for (const id of evolvedIds) {
                const evolvedNpc = getnpc(id);
                if (!evolvedNpc) {
                    continue;
                }
                const profile = requirePerson(id);
                text += `${profile.race}哨兵${profile.name}突破为了${getlvs(evolvedNpc.level)}级哨兵，`;
            }
            if (resultCode === 3) {
                text += '主角这神奇的能力引起了国立向导中心研究部门的注意，主角很高兴的接住了他们伸来的橄榄枝，在继续向导工作的同时也将作为编内学者进行相关原理的研究\n';
            }
            else {
                text += '主角这神奇的能力引起了国立向导中心研究部门的注意，主角很高兴的接住了他们伸来的橄榄枝，专职成为了编内学者进行相关原理的研究\n';
            }
            narrativePrompt += text;
            if (ssId !== -1) {
                const ssProfile = requirePerson(ssId);
                narrativePrompt += `宇宙第一位SS级哨兵${ssProfile.name}的出现令这场绵延千年的战争战局出现了巨大的变化，或许再过不久，大家就能过上不用再打仗的日子了吧。而这一切，都是主角的功劳\n`;
            }
        }

        const affectionIds = data.npcs
            .filter((npc) => npc.love >= 20 && npc.id !== data.killer)
            .map((npc) => npc.id);
        if (resultCode === 3) {
            if (affectionIds.length === 1) {
                const soleId = affectionIds[0];
                const profile = requirePerson(soleId);
                if (data.par === soleId) {
                    narrativePrompt += `在半年的向导实习期结束后，主角和主角的配偶${profile.race}哨兵${profile.name}搬到了一起住，他们有了更多独处的时间。而他对主角的迷恋似乎永远不会随着时间而减淡。${profile.name}一直试图让主角成为他的独属向导，但对主角来说，用自己的力量尽可能帮助更多人才是最重要的\n`;
                }
                else {
                    narrativePrompt += `在半年的向导实习期结束后，${profile.race}哨兵${profile.name}向主角发出了希望主角成为他的独属向导的申请，目前他还在使出浑身解数来向主角展示他各方面的优点以冀换取主角的同意\n`;
                }
            }
            else if (affectionIds.length > 1) {
                let text = '在半年的向导实习期结束后，';
                if (data.par !== -1 && data.killer !== data.par) {
                    const partnerProfile = requirePerson(data.par);
                    text += `主角和主角的配偶${partnerProfile.race}哨兵${partnerProfile.name}搬到了一起住，他对主角的迷恋似乎永远不会随着时间而减淡。主角本以为同居后他们会有更多的时间独处，但`;
                    const others = affectionIds.filter((id) => id !== data.par);
                    text += formatNpcNames(others);
                    const pronoun = others.length > 1 ? '他们' : '他';
                    text += `总是会以各种理由出现在主角的生活中，${pronoun}显然还没有放弃给自己争取机会的想法……\n`;
                }
                else {
                    text += formatNpcNames(affectionIds);
                    text += '各自向主角发出了希望主角成为他的独属向导的申请，在主角做出决定前，他们每天都在为谁能占用主角更多时间相互较劲竞争着\n';
                }
                narrativePrompt += text;
            }
        }
        else {
            let remainingAffections = affectionIds;
            if (data.par !== -1 && data.killer !== data.par) {
                const partnerProfile = requirePerson(data.par);
                narrativePrompt += `不再担任向导后，主角的配偶${partnerProfile.race}哨兵${partnerProfile.name}对于主角有更多时间陪他一事很是开心，甚至在主角辞职后的一周里都缠着主角没有让主角出门\n`;
                remainingAffections = remainingAffections.filter((id) => id !== data.par);
            }
            if (remainingAffections.length > 0) {
                let text = '';
                text += formatNpcNames(remainingAffections);
                text += '在主角不再担任向导后也时常前来拜访主角，他们过度的热情导致有些时候主角被他们的精神体缠得没有办法，只能躲出去几天来休息一下\n';
                narrativePrompt += text;
            }
        }

        const trustIds = data.npcs
            .filter((npc) => npc.trust === 100)
            .map((npc) => npc.id)
            .filter((id) => !affectionIds.includes(id) && id !== data.par && id !== data.killer);
        if (trustIds.length > 0) {
            let text = '';
            text += formatNpcNames(trustIds);
            if (resultCode === 3) {
                text += '依然维系着和主角之间深厚的友情，有主角做他们的后盾，他们在前线的战斗也可以更加安心了\n';
            }
            else {
                text += '时时会和主角在通讯器上聊天，他们的友谊并没有随着主角退出这个行业而减淡\n';
            }
            narrativePrompt += text;
        }

        if (resultCode === 3) {
            narrativePrompt += '而结束了实习期的主角，也将继续向着了不起的向导这条路上继续大步前进吧\n';
        }

        if (data.killer !== -1) {
            narrativePrompt += '有天晚上，主角在深夜中醒来，突然发现床边有一座巨大的黑影笼在主角的身上。主角不知道那是谁……或者是什么，只能感到对方的视线一寸寸舔过主角的身体。许久之后，黑影沉默的离开了，主角发现主角的枕边有一块流光溢彩的晶石，可能是这位深夜来客为主角留下的最后一个礼物\n';
        }

        if (resultCode !== 3) {
            narrativePrompt += '经历过各种各样的事情后，虽然主角的向导生涯结束了，但主角的人生道路还远未结束，无限的未来依然等待着主角的探索\n';
        }

        data.dayevent = [];
        data.isend = true;
        narrativePrompt += gethistory();
        narrativePrompt += '</afterlifeinfo>\n后日谈内容大约写2000字上下，最后加上‘【全剧终】，请关闭现在的对话并开启新的对话。’，后日谈文本请包裹在<content></content>标签中，结尾绝对不要添加<GDUI/>标签。\n';
        sendToAI(narrativePrompt);
    }
    function endthegame() {
        data.norender = true;
        savedata(data);
        destroyOverlay();
    }

    function setmain() {
     
        updateTextContent('username', data.name);
        updateTextContent('date', getdays(data.day));
        setBarWidth('stamina-bar', data.stamina);
        setBarWidth('mental-bar', data.mental);
        setBarWidth('water-bar', data.water);
        updateTextContent('guide-level', getlvs(data.guideLevel));
        setBarWidth('exp-bar', (data.exp * 100) / (levelexpmax[data.guideLevel] || 1));
        updateTextContent('score', data.score);
        updateTextContent('list-title', '精神疏导申请');

        const parNameElement = overlayQuery('#par-name');
        if (isHostInstance(parNameElement)) {
            if (data.par !== -1) {
                const partnerProfile = requirePerson(data.par);
                parNameElement.innerText = `配偶 ${partnerProfile.name}`;
            }
            else {
                parNameElement.innerText = '';
            }
        }

        const applicantList = requireElementById('applicant-list', HTMLElement);
        applicantList.innerHTML = '';
        data.npcs.forEach((applicant) => {
            applicantList.appendChild(buildApplicantButton(applicant));
        });

        const shopButton = requireElementById('shop-button', HTMLElement);
        shopButton.innerText = '前往商店';
        shopButton.onclick = () => setshop();

        requireElementById('room-button', HTMLElement).onclick = () => showroom();
        requireElementById('rest-button', HTMLElement).onclick = () => handleRest();
    }

    const game = {
        obedience: 0,
        comfort: 0,
        painLevel: 0,
    };
    let curehistory = '';
    const addhis1 = (text) => {
        if (!text) {
            return;
        }
        curehistory += `\n${text}`;
    };
    const getlog = () => `<log>${curehistory}/n</log>/n`;
    let currentNpc = null;
    let didevent = false;
    let askcomfort = false;
    let showpain = false;
    let tempsex = false;
    let action = -1;
    let opollution = 0;
    let isin = false;
    let triangleTimer = null;
    let triangleClickRemovers = [];
    const fadeQueue = [];
    let fadeActive = false;

    const processFadeQueue = async () => {
        while (fadeQueue.length > 0) {
            const text = fadeQueue.shift();
            const element = hostDocument.createElement('div');
            element.className = 'fade-text';
            element.innerHTML = text;
            fadeHost.appendChild(element);
            await delay(10);
            await delay(1000);
            if (element.parentNode) {
                element.parentNode.removeChild(element);
            }
        }
        fadeActive = false;
    };

    const showFadingText = (text) => {
        if (!text) {
            return;
        }
        fadeQueue.push(text);
        if (!fadeActive) {
            fadeActive = true;
            processFadeQueue().catch((error) => console.error('Guide Diary fade queue error', error));
        }
    };


    const addlog = (text) => {
        if (!text) {
            return;
        }
        const sanitized = text.replace(/你/g, data.name).replace(/<\/?div>/g, '');
        addhis1(sanitized);
        showFadingText(text);
        const logContainer = requireElementById('log-container', HTMLElement);
        const infoDiv = hostDocument.createElement('div');
        infoDiv.innerHTML = text;
        logContainer.appendChild(infoDiv);
        logContainer.scrollTop = logContainer.scrollHeight;
    };

    function addcomfort(amount) {
        game.comfort = Math.max(0, Math.min(100, Math.floor(game.comfort + amount)));
        setBarWidth('comfort-bar', game.comfort);
    }

    function addpainLevel(npc, amount) {
        const modifier = 3 - (npc.match || 0) / 50;
        const delta = amount * modifier;
        game.painLevel = Math.max(0, Math.min(100, Math.floor(game.painLevel + delta)));
        setBarWidth('painLevel-bar', game.painLevel);
    }

    function addpollutionongame(npc, amount) {
        npc.pollution = Math.max(0, Math.min(100, Math.floor(npc.pollution + amount)));
        setBarWidth('pollution-bar', npc.pollution);
    }

    function stopTriangleMovement() {
        if (triangleTimer !== null) {
            clearInterval(triangleTimer);
            triangleTimer = null;
        }
        while (triangleClickRemovers.length > 0) {
            const remover = triangleClickRemovers.pop();
            try {
                if (typeof remover === 'function') {
                    remover();
                }
            }
            catch (error) {
                console.error('Guide Diary: failed to detach triangle input listener', error);
            }
        }
    }

    function startTriangleMovement(moveSpeed, redRatio, onComplete) {
        stopTriangleMovement();
        const gameplayDiv = requireElementById('gameplay', HTMLElement);
        const colorBar = gameplayDiv.querySelector('.color-bar');
        const redPart = requireElementById('red-part', HTMLElement);
        const triangle = requireElementById('triangle', HTMLElement);
        if (!isHostInstance(colorBar)) {
            onComplete(false);
            return;
        }

        const totalWidth = colorBar.offsetWidth || 200;
        const triangleWidth = triangle.offsetWidth || 30;
        const clampedRatio = Math.max(0.05, Math.min(0.95, redRatio));
        const redWidth = Math.max(1, Math.min(totalWidth - 1, totalWidth * clampedRatio));
        redPart.style.width = `${redWidth}px`;
        const grayWidth = totalWidth - redWidth;

        let currentLeft = -triangleWidth;
        let direction = 1;
        triangle.style.left = `${currentLeft}px`;
        const step = Math.max(0.05, moveSpeed);

        triangleTimer = window.setInterval(() => {
            currentLeft += direction * step;
            if (currentLeft <= -triangleWidth) {
                currentLeft = -triangleWidth;
                direction = 1;
            }
            else if (currentLeft >= totalWidth) {
                currentLeft = totalWidth;
                direction = -1;
            }
            triangle.style.left = `${currentLeft}px`;
        }, 10);

        const handleInteraction = () => {
            stopTriangleMovement();
            const center = currentLeft + triangleWidth / 2;
            const success = center > grayWidth;
            onComplete(!!success);
        };

        triangleClickRemovers = [];
        let triggered = false;
        const runOnce = (event) => {
            if (triggered) {
                return;
            }
            triggered = true;
            if (event && typeof event.preventDefault === 'function') {
                event.preventDefault();
            }
            handleInteraction();
        };

        const registerListener = (element, eventName, listener, options) => {
            if (!element || typeof element.addEventListener !== 'function') {
                return;
            }
            element.addEventListener(eventName, listener, options);
            triangleClickRemovers.push(() => element.removeEventListener(eventName, listener));
        };

        const overlayRoot = overlayQuery(`#${ROOT_ID}`) || hostDocument.getElementById(ROOT_ID);
        const cardBody = overlayRoot && overlayRoot.querySelector('.card-body');
        const cardContainer = overlayRoot && overlayRoot.querySelector('.card');
        const interactionTargets = [];
        const pushTarget = (target) => {
            if (!isHostInstance(target) || interactionTargets.includes(target)) {
                return;
            }
            interactionTargets.push(target);
        };
        pushTarget(colorBar);
        pushTarget(gameplayDiv);
        pushTarget(triangle);
        pushTarget(cardBody);
        pushTarget(cardContainer);
        pushTarget(overlayRoot);

        const shouldHandleCommon = (event) => {
            if (!isHostInstance(gameplayDiv) || gameplayDiv.style.display === 'none') {
                return false;
            }
            const target = event?.target || null;
            if (overlayRoot && target && !overlayRoot.contains(target)) {
                return false;
            }
            if (target && typeof target.closest === 'function' && target.closest('#bts')) {
                return false;
            }
            return true;
        };

        const attachInteractionHandlers = () => {
            if (typeof window.PointerEvent === 'function') {
                const pointerListener = (event) => {
                    if (event.button !== undefined && event.button !== 0) {
                        return;
                    }
                    if (!shouldHandleCommon(event)) {
                        return;
                    }
                    runOnce(event);
                };
                interactionTargets.forEach((target) => {
                    registerListener(target, 'pointerdown', pointerListener, { passive: false });
                    registerListener(target, 'pointerup', pointerListener, { passive: false });
                    registerListener(target, 'click', pointerListener, { passive: false });
                });
                if (hostDocument && typeof hostDocument.addEventListener === 'function') {
                    registerListener(hostDocument, 'pointerdown', pointerListener, { passive: false, capture: true });
                    registerListener(hostDocument, 'pointerup', pointerListener, { passive: false, capture: true });
                    registerListener(hostDocument, 'click', pointerListener, { passive: false, capture: true });
                }
            }
            else {
                const mouseListener = (event) => {
                    if (event.button !== undefined && event.button !== 0) {
                        return;
                    }
                    if (!shouldHandleCommon(event)) {
                        return;
                    }
                    runOnce(event);
                };
                const touchListener = (event) => {
                    if (!shouldHandleCommon(event)) {
                        return;
                    }
                    runOnce(event);
                };
                interactionTargets.forEach((target) => {
                    registerListener(target, 'mousedown', mouseListener, { passive: false });
                    registerListener(target, 'touchstart', touchListener, { passive: false });
                    registerListener(target, 'mouseup', mouseListener, { passive: false });
                    registerListener(target, 'touchend', touchListener, { passive: false });
                    registerListener(target, 'click', mouseListener, { passive: false });
                });
                if (hostDocument && typeof hostDocument.addEventListener === 'function') {
                    registerListener(hostDocument, 'mousedown', mouseListener, { passive: false, capture: true });
                    registerListener(hostDocument, 'mouseup', mouseListener, { passive: false, capture: true });
                    registerListener(hostDocument, 'click', mouseListener, { passive: false, capture: true });
                    registerListener(hostDocument, 'touchstart', touchListener, { passive: false, capture: true });
                    registerListener(hostDocument, 'touchend', touchListener, { passive: false, capture: true });
                }
            }
        };

        attachInteractionHandlers();
    }

    function win(npc) {
        stopTriangleMovement();
        const gameplayDiv = requireElementById('gameplay', HTMLElement);
        const btsDiv = requireElementById('bts', HTMLElement);
        btsDiv.style.display = 'flex';
        gameplayDiv.style.display = 'none';

        const profile = requirePerson(npc.id);
        if (action === 0) {
            let num1 = data.guideLevel - npc.level;
            if (num1 < 0) {
                num1 = 0;
            }
            num1 += 1;
            addcomfort(num1 * 10);
            addpainLevel(npc, num1 * -30);
            addmental(-5);
            if (askcomfort) {
                addcomfort(num1 * 10);
                addlog(`<div>你给了${profile.name}期待已久的安抚，他黏黏糊糊的蹭着你，表示自己感觉好多了</div>`);
                askcomfort = false;
            }
            else {
                addlog(`<div>你用一些温柔的肢体接触安抚了${profile.name}，他对你放松了身体</div>`);
            }
        }
        else if (action === 1) {
            isin = true;
            addmental(-15);
            addpainLevel(npc, 5);
            requireElementById('act1-button', HTMLButtonElement).disabled = true;
            requireElementById('act2-button', HTMLButtonElement).disabled = false;
            addlog(`<div>你成功进入了${profile.name}的精神海，这一瞬的刺激令${profile.name}全身都绷紧了</div>`);
        }
        else if (action === 2) {
            addmental(-8);
            let num1 = data.guideLevel - npc.level;
            if (num1 < 0) {
                num1 = 0;
            }
            num1 += 1;
            addpollutionongame(npc, -10 * num1);
            addpainLevel(npc, 5);
            addlog(`<div>你成功净化了${profile.name}精神海的一小片区域</div>`);
            if (npc.pollution < 1) {
                npc.savenum += 1;
                if (data.guideLevel === npc.level && npc.savenum >= 10 && !npc.isInjured && npc.trust === 100) {
                    npc.savenum = 0;
                    npc.level += 1;
                    npc.pollution = 0;
                    npc.match = 100;
                    npc.love = 20;
                    npc.isEvolution = true;
                    addmental(-100);
                    addwater(-100);
                    showalert('医学奇迹', `${profile.name}的精神等级从${getlvs(npc.level - 1)}级升到了${getlvs(npc.level)}级`);
                    addlog(`<div>你彻底净化${profile.name}精神海中的所有污染的瞬间，他的精神海反过来包裹住了你的伸入其中的精神触角，你试图逃离，却被${profile.name}和他的精神体一起拥入怀中，精神触角传来的强烈刺激令你失去了意识，等你醒过来时，${profile.name}的精神等级竟从${getlvs(npc.level - 1)}级升到了${getlvs(npc.level)}级</div>`);
                }
                else {
                    addlog(`<div>你彻底净化了${profile.name}精神海中的所有污染，他对此非常感激</div>`);
                    addmatch(npc.id, 1);
                    addtrust(npc.id, 10);
                }
                endgame(npc);
                return;
            }
        }

        if (game.painLevel === 100) {
            if (data.roomlevel > npc.level) {
                npc.trust = 0;
                addmatch(npc.id, -5);
                npc.isInjured = true;
                npc.injurednum += 1;
                addlog(`<div>${profile.name}陷入了暴走状态，所幸被治疗室的禁锢装置控制了行动，失控哨兵管理中心派人来带走了他。他会被注射一些虽然有效但远比精神疏导粗暴的净化药物来强迫他恢复神智，这些药物能够救他的命，但也会让他的精神海受到一些不可逆的损伤</div>`);
                if (npc.injurednum >= 3 && npc.level > 0) {
                    npc.injurednum = 0;
                    npc.level -= 1;
                    addlog(`<div>${profile.name}的哨兵等级从${getlvs(npc.level + 1)}级降到了${getlvs(npc.level)}级</div>`);
                    showalert('医疗事故', `${profile.name}的哨兵等级从${getlvs(npc.level + 1)}级降到了${getlvs(npc.level)}级`);
                }
            }
            else if (data.water >= 50) {
                addwater(-50);
                npc.love = 20;
                tempsex = true;
                addlog(`<div>${profile.name}陷入了暴走状态，他挣脱束缚将你扑在了身下</div>`);
                addlog(`<div>${profile.name}摄取了你的水分，理智逐渐回归，他充满歉意的将已经昏迷的你安置好后离开了</div>`);
            }
            else {
                tempsex = true;
                addlog(`<div>${profile.name}在袭击你后堕化为异兽离开了，你的精神海受到了无法修复的损坏，再也无法从事向导这一职业</div>`);
                endgame(npc, false);
                return;
            }
            endgame(npc);
            return;
        }
        if (game.painLevel >= 80 && !showpain) {
            showpain = true;
            addlog(`<div>${profile.name}的獠牙露了出来，他死死的盯着你，已经快要无法控制自己的理智</div>`);
        }

        if (action === 0 || action === 2) {
            if (Math.random() < 0.2) {
                if (!didevent) {
                    npc.love += 1;
                }
                didevent = true;
                if (npc.love > 5 && Math.random() < 0.3) {
                    askcomfort = true;
                    addlog(`<div>${profile.name}依恋的表示想要得到你更多的安抚</div>`);
                }
                else {
                    const eventlogs = [
                        `<div>${profile.name}的精神体在哼哼唧唧的蹭你的膝盖</div>`,
                        `<div>${profile.name}的精神体扑到你怀里舔了你的脸</div>`,
                        `<div>${profile.name}的精神体舒服的喵喵叫了起来</div>`,
                        `<div>${profile.name}的精神体在你的膝盖上发出了呼噜呼噜的声音</div>`,
                        `<div>${profile.name}的精神体用它的鹿角轻轻蹭了蹭你的脸颊</div>`,
                        `<div>${profile.name}的精神体静静的趴在你怀里，时不时扬起脖颈舔一舔你的脸来为你鼓劲</div>`,
                        `<div>${profile.name}的尾巴缠住了你的脚踝</div>`,
                        `<div>${profile.name}的精神体舔舐了你的手指</div>`,
                        `<div>${profile.name}在失神中将你抱入了怀里，他意识到后有点害羞，却依然没有松开手</div>`,
                        `<div>${profile.name}将你抱起来，让你的额头贴上他的额头来方便你接近他的精神海</div>`,
                        `<div>${profile.name}柔软的树枝围绕着你编织成了一个笼子</div>`,
                        `<div>${profile.name}被精神相接的刺激弄得眼眶通红，无法忍受的用枝条束缚了你的四肢</div>`,
                        `<div>${profile.name}和他的精神体将你夹在中间挨挨蹭蹭的和你分享彼此的体温</div>`,
                        `<div>${profile.name}精神体毛茸茸的大尾巴在你怀里摇来摇去</div>`,
                        `<div>精神相接的刺激让${profile.name}的镰爪无法控制的从身体上冒了出来，他意识到了这点，颤抖着努力收起镰爪以免割伤你</div>`,
                        `<div>随着精神交接的深入，你的气味对${profile.name}的诱惑力逐渐变得无法抵挡，一晃神间，被本能操纵的他已经将你抱在怀里，弯下腰埋首在你颈间蹭来蹭去的攫取着你的味道</div>`,
                        `<div>${profile.name}冰冷的手指碰触了你的每一片皮肤</div>`,
                        `<div>${profile.name}冰冷的体温令你流出了战栗的泪水，他被此吸引，情不自禁的一点点舔掉了你的泪水</div>`,
                        `<div>${profile.name}在你耳边吟唱着勾魂摄魄的歌曲，你担心自己的精神力被他消耗，快速捂住了他的嘴</div>`,
                        `<div>和${profile.name}精神海的纠缠令你产生了没入深海的幻觉，就在你觉得自己已经无法呼吸的时候，${profile.name}靠近你为你渡了一口气，而幻觉也就此消失了</div>`,
                        `<div>精神相接的刺激令${profile.name}全身都泛起了粉红色，他害羞的颤抖着，几乎不敢直视你的眼睛</div>`,
                        `<div>${profile.name}无法承受过多的刺激想要逃开一点距离，却被你牢牢抓住了手腕，那双在战场上可以徒手撕毁星舰的双手此时却柔顺的任你束缚，丝毫无法推拒你</div>`,
                        `<div>${profile.name}反复舔舐着你的颈部，以此抑制他咬下去的冲动，你想要推开他，却发现根本无法抵抗他的巨力</div>`,
                        `<div>${profile.name}将你拢在怀里，他冰冷的体温令你分神，而这点神智立刻又被他海潮般的精神力拽了回来被他的精神海挤压揉搓</div>`,
                        `<div>${profile.name}的翅膀拢住了你，将你紧紧拥在他的怀中，他蒙住眼睛的脸上表情却依然如此圣洁，仿佛这一切都不是他做的一样</div>`,
                        `<div>${profile.name}的精神体光球们挨挨挤挤的停在你的肩上，哪个都不愿意离开</div>`,
                        `<div>${profile.name}扬起脖颈舒出了一口气，这仿若呻吟一样的声音令你有些不好意思，他却似笑非笑的看着你，俯身在你耳边吹了一口气</div>`,
                        `<div>${profile.name}的尾巴卷在了你的腰上，尾尖一点一点划过你的皮肤，你想要抓开它，却被他轻轻束住了双手</div>`,
                        `<div>${profile.name}的呼吸有些急促，而他的精神体不知何时攀上了你的身体，一寸寸的摩挲过你的皮肤，让你甚至有点担心自己会被束紧到无法呼吸。你略带责备的看了${profile.name}一眼，他努力平息着呼吸，放松了对你的束缚</div>`,
                        `<div>${profile.name}精神体的龙身突然变大，将你含入了它的口中，${profile.name}耳根薄红，匆匆忙忙的将你抱了出来</div>`,
                    ];
                    const index = npc.id * 2 + Math.floor(Math.random() * 2);
                    if (eventlogs[index]) {
                        addlog(eventlogs[index]);
                    }
                }
            }
        }

        if (Math.random() < 0.1) {
            addwater(-10);
            addlog(`<div>精神过于集中导致的流汗让你失去了一些水分</div>`);
        }
        if (data.mental === 0) {
            addlog(`<div>你的精神力已经枯竭，不得不结束了此次精神疏导</div>`);
            endgame(npc);
        }
    }

    function lose(npc) {
        stopTriangleMovement();
        const gameplayDiv = requireElementById('gameplay', HTMLElement);
        const btsDiv = requireElementById('bts', HTMLElement);
        btsDiv.style.display = 'flex';
        gameplayDiv.style.display = 'none';

        const profile = requirePerson(npc.id);
        if (action === 0) {
            addmental(-5);
            if (askcomfort) {
                askcomfort = false;
                addlog(`<div>虽然你的安抚失败了，但你愿意倾听他声音的态度令${profile.name}无视了精神海的刺痛感</div>`);
            }
            else {
                addpainLevel(npc, 5);
                addlog(`<div>你的安抚失败了，${profile.name}更加躁动不安起来</div>`);
            }
        }
        else if (action === 1) {
            addmental(-15);
            addpainLevel(npc, 20);
            addlog(`<div>你未能成功进入${profile.name}的精神海，这次失败的侵入令${profile.name}感到了剧烈的疼痛</div>`);
        }
        else if (action === 2) {
            addmental(-8);
            addpainLevel(npc, 10);
            addlog(`<div>你净化的尝试失败了，${profile.name}露出痛苦的表情</div>`);
        }

        if (game.painLevel === 100) {
            if (data.roomlevel > npc.level) {
                npc.trust = 0;
                addmatch(npc.id, -5);
                npc.isInjured = true;
                npc.injurednum += 1;
                addlog(`<div>${profile.name}陷入了暴走状态，所幸被治疗室的禁锢装置控制了行动，失控哨兵管理中心派人来带走了他。他会被注射一些虽然有效但远比精神疏导粗暴的净化药物来强迫他恢复神智，这些药物能够救他的命，但也会让他的精神海受到一些不可逆的损伤</div>`);
                if (npc.injurednum >= 3 && npc.level > 0) {
                    npc.injurednum = 0;
                    npc.level -= 1;
                    showalert('医疗事故', `${profile.name}的哨兵等级从${getlvs(npc.level + 1)}级降到了${getlvs(npc.level)}级`);
                    addlog(`<div>${profile.name}的哨兵等级从${getlvs(npc.level + 1)}级降到了${getlvs(npc.level)}级</div>`);
                }
            }
            else if (data.water >= 50) {
                addwater(-50);
                npc.love = 20;
                addlog(`<div>${profile.name}陷入了暴走状态，他挣脱束缚将你扑在了身下</div>`);
                addlog(`<div>${profile.name}摄取了你的水分，理智逐渐回归，他充满歉意的将已经昏迷的你安置好后离开了</div>`);
            }
            else {
                addlog(`<div>${profile.name}在袭击你后堕化为异兽离开了，你的精神海受到了无法修复的损坏，再也无法从事向导这一职业</div>`);
                endgame(npc, false);
                return;
            }
            endgame(npc);
            return;
        }
        if (game.painLevel >= 80 && !showpain) {
            showpain = true;
            addlog(`<div>${profile.name}的獠牙露了出来，他死死的盯着你，已经快要无法控制自己的理智</div>`);
        }
        if (Math.random() < 0.1) {
            addwater(-10);
            addlog(`<div>精神过于集中导致的流汗让你失去了一些水分</div>`);
        }
        if (data.mental === 0) {
            addlog(`<div>你的精神力已经枯竭，不得不结束了此次精神疏导</div>`);
            endgame(npc);
        }
    }

    function endgame(npc, checkscore = true) {
        stopTriangleMovement();
        const gameplayDiv = requireElementById('gameplay', HTMLElement);
        const btsDiv = requireElementById('bts', HTMLElement);
        gameplayDiv.style.display = 'none';
        btsDiv.style.display = 'none';
        const logContainer = requireElementById('log-container', HTMLElement);
        const profile = requirePerson(npc.id);

        if (checkscore) {
            const delta = Math.max(0, opollution - npc.pollution);
            addtrust(npc.id, delta / 2);
            const rewardTable = [0.1, 0.3, 1, 4, 16, 70];
            const base = rewardTable[Math.min(npc.level, rewardTable.length - 1)];
            const gained = Math.floor(base * delta);
            addscore(gained);
            addexp(gained);
            addlog(`<div>在本次精神疏导中获得积分${gained}</div>`);
            const exitButton = hostDocument.createElement('button');
            exitButton.className = 'custom-button';
            exitButton.textContent = '离开诊疗室';
            exitButton.onclick = () => {

                data.dayevent = [];
                let narrativePrompt = `主角在一众精神疏导申请中选择了为${profile.name}进行精神疏导。<log></log>里是精神疏导的按顺序发生的事情的整个过程，请为这个过程编写整个精神疏导的剧情，中间可以增加事件细节，但结尾部分要干净，要能够自然衔接后续主角结束了这一天开始新的一天的工作，字数在2000字上下，要细腻浪漫。`;
                narrativePrompt += prompt0;
                narrativePrompt += getlog();
                narrativePrompt += getinfo();
                narrativePrompt += getnpcinfo(npc.id);
                narrativePrompt += gethistory();
                const targetNpc = getnpc(npc.id);
                if (tempsex && targetNpc) {
                    targetNpc.hsex = true;
                }
                sendToAI(narrativePrompt);
            };
            logContainer.appendChild(exitButton);
        }
        else {
            data.killer = npc.id;
            const exitButton = hostDocument.createElement('button');
            exitButton.className = 'custom-button';
            exitButton.textContent = '结束';
            exitButton.onclick = () => {
                showalert('Game Over', '请确保治疗室等级足够禁锢前来治疗的哨兵');
                gameover(2);
            };
            logContainer.appendChild(exitButton);
            addlog(`<div>${profile.name}离开了诊疗室，空气中仍残留着危险的气息</div>`);
        }
        currentNpc = null;
        savedata(data);
    }

    function setgameplay() {
        stopTriangleMovement();
        didevent = false;
        askcomfort = false;
        showpain = false;
        action = -1;
        isin = false;
        tempsex = false;

        const logContainer = requireElementById('log-container', HTMLElement);
        logContainer.innerHTML = '';
        const gameplayDiv = requireElementById('gameplay', HTMLElement);
        const btsDiv = requireElementById('bts', HTMLElement);
        btsDiv.style.display = 'flex';
        gameplayDiv.style.display = 'none';
        requireElementById('act1-button', HTMLButtonElement).disabled = false;
        requireElementById('act2-button', HTMLButtonElement).disabled = true;

        data.curenum += 1;
        let npc = tempid !== -1 ? getnpc(tempid) : null;
        if (!npc) {
            showalert('向导中心', '今日暂无可进行精神疏导的哨兵');
            setmain();
            return;
        }

        const candidate = data.npcs.find((npc0) =>
            npc0.id !== npc.id &&
            npc0.love >= 5 &&
            npc0.inhome &&
            npc0.pollution > 30 &&
            npc0.level > npc.level &&
            npc0.level >= 3 &&
            Math.random() < 0.1
        );
        if (candidate) {
            const forcedProfile = requirePerson(candidate.id);
            showalert('向导中心', `${getlvs(candidate.level)}级哨兵${forcedProfile.name}使用高级哨兵的权利要求您今日为他服务`);
            npc = candidate;
            tempid = npc.id;
        }

        currentNpc = npc;
        opollution = npc.pollution;
        npc.curenum += 1;

        const profile = requirePerson(npc.id);
        requireElementById('npc-img', HTMLImageElement).src = resolveNpcImage(npc.id) || FALLBACK_NPC_IMAGE;
        requireElementById('npc-name', HTMLElement).textContent = profile.name;
        requireElementById('npc-race', HTMLElement).textContent = profile.race;
        requireElementById('npc-match', HTMLElement).textContent = `匹配度 ${npc.match}%`;

        setBarWidth('pollution-bar', npc.pollution);
        const trusts = [70, 50, 60, 40, 45, 20, 30, 50, 0, 10, 30, 0, 10, 0, 10];
        let num1 = data.guideLevel - npc.level;
        if (num1 < 0) {
            num1 = 0;
        }
        game.obedience = npc.trust + (trusts[npc.id] ?? 0) + num1 * 10;
        if (game.obedience > 100) {
            game.obedience = 100;
        }
        setBarWidth('obedience-bar', game.obedience);
        game.comfort = Math.min(100, data.roomlevel1 * 5);
        setBarWidth('comfort-bar', game.comfort);
        game.painLevel = Math.max(0, Math.min(100, npc.pollution));
        setBarWidth('painLevel-bar', game.painLevel);
        setBarWidth('mental-bar', data.mental);

        const beginAction = (type) => {
            action = type;
            let speed;
            let redRatio;
            if (type === 0) {
                speed = (1.5 + npc.level * 0.5 - game.obedience / 100) * (1 - game.comfort / 200);
                redRatio = 0.5 - game.painLevel / 400;
            }
            else if (type === 1) {
                speed = (2.5 + npc.level * 0.5 - game.obedience / 100) * (1 - game.comfort / 200);
                redRatio = 0.3 - game.painLevel / 400;
            }
            else {
                speed = (2 + npc.level * 0.5 - game.obedience / 100) * (1 - game.comfort / 200);
                redRatio = 0.35 - game.painLevel / 400;
            }
            speed = Math.max(0.1, speed);
            redRatio = Math.max(0.01, redRatio);
            btsDiv.style.display = 'none';
            gameplayDiv.style.display = 'block';
            startTriangleMovement(speed, redRatio, (success) => {
                if (!currentNpc) {
                    return;
                }
                if (success) {
                    win(currentNpc);
                }
                else {
                    lose(currentNpc);
                }
            });
        };

        requireElementById('act0-button', HTMLButtonElement).onclick = () => beginAction(0);
        requireElementById('act1-button', HTMLButtonElement).onclick = () => beginAction(1);
        requireElementById('act2-button', HTMLButtonElement).onclick = () => beginAction(2);
        requireElementById('quit-button', HTMLButtonElement).onclick = () => {
            addlog(`<div>你认为自己无法完成这次精神疏导，在事情还没有恶化前结束了本次治疗</div>`);
            endgame(npc);
        };

        if (npc.trust < 70) {
            if ([0, 2, 7, 10, 14].includes(npc.id)) {
                addlog(`<div>${profile.name}进入诊疗室并礼貌的和你打了招呼</div>`);
            }
            else if ([1, 4, 6].includes(npc.id)) {
                addlog(`<div>${profile.name}进入诊疗室并热情的和你打了招呼</div>`);
            }
            else if (npc.id === 8) {
                addlog(`<div>${profile.name}进入诊疗室后一言不发，只是直勾勾的盯着你</div>`);
            }
            else if (npc.id === 11) {
                addlog(`<div>${profile.name}进入诊疗室后不耐烦的和你打了招呼</div>`);
            }
            else if ([5, 12, 3].includes(npc.id)) {
                addlog(`<div>${profile.name}进入诊疗室后一言不发，只是静静地坐在那里</div>`);
            }
            else if ([9, 13].includes(npc.id)) {
                addlog(`<div>${profile.name}进入诊疗室，漫不经心的和你打了招呼</div>`);
            }
        }
        else {
            if (npc.id === 0) {
                addlog(`<div>${profile.name}进入诊疗室坐下，礼貌的和你打了招呼，他的精神体想要扑到你身上，被他拦住了</div>`);
            }
            else if (npc.id === 1) {
                addlog(`<div>${profile.name}进入诊疗室后，他的精神体轻巧地跳到你的膝盖上翻出了肚皮</div>`);
            }
            else if (npc.id === 2) {
                addlog(`<div>${profile.name}进入诊疗室坐下。他的精神体走到你身边温柔的舔了舔你的脸颊</div>`);
            }
            else if (npc.id === 3) {
                addlog(`<div>${profile.name}沉默的在你的对面坐下，但他的精神体却缓缓的缠上了你的小腿</div>`);
            }
            else if (npc.id === 4) {
                addlog(`<div>${profile.name}给了你一个大大的拥抱后快乐的在你对面坐下</div>`);
            }
            else if (npc.id === 5) {
                addlog(`<div>${profile.name}进入诊疗室坐下，你感到他精神体的树枝轻抚了一下你的头顶</div>`);
            }
            else if (npc.id === 6) {
                addlog(`<div>${profile.name}进入诊疗室后，他的精神体先于他凑到你身边撒娇了起来</div>`);
            }
            else if (npc.id === 7) {
                addlog(`<div>${profile.name}进入诊疗室，向你行了军礼后端端正正的坐下，淡色的眼睛一瞬不瞬的看着你</div>`);
            }
            else if (npc.id === 8) {
                addlog(`<div>${profile.name}沉默的在你对面坐下，向你挤出了一个生涩的笑容</div>`);
            }
            else if (npc.id === 9) {
                addlog(`<div>${profile.name}摇曳着进入诊疗室，用令人神魂颠倒的声音向你打了招呼，你对他说别夹，他冲你做了个鬼脸</div>`);
            }
            else if (npc.id === 10) {
                addlog(`<div>${profile.name}进入诊疗室，快活的和你打了招呼，还分了你一些他手制的小饼干</div>`);
            }
            else if (npc.id === 11) {
                addlog(`<div>${profile.name}飘进诊疗室，放松的躺在了你面前，还热情地邀请你躺到他怀里，你礼貌的拒绝了</div>`);
            }
            else if (npc.id === 12) {
                addlog(`<div>${profile.name}一言不发的进入诊疗室坐下，但他的精神体光球很不稳重的在你面前蹦蹦跳跳，似乎是在快乐的向你打招呼</div>`);
            }
            else if (npc.id === 13) {
                addlog(`<div>${profile.name}气定神闲的在诊疗室里坐下，而他带着尖头的尾巴在你的脚踝上绕来绕去</div>`);
            }
            else if (npc.id === 14) {
                addlog(`<div>${profile.name}进入诊疗室，礼貌的和你打了招呼，而他的精神体却毫不客气地缩小了体型像是占领领地一样盘在了你的头顶</div>`);
            }
        }
    }

    registerPageInitializer('setname', setname);
    registerPageInitializer('main', setmain);
    registerPageInitializer('game', setgameplay);
    initializeGuideDiary();

    window.guideDiaryOverlay = window.guideDiaryOverlay || {};
    window.guideDiaryOverlay.mount = () => {
        if (overlayDestroyed || !overlayNode.isConnected) {
            return;
        }
        overlayNode.classList.remove('guide-diary-hidden');
    };
    window.guideDiaryOverlay.unmount = () => {
        if (overlayDestroyed || !overlayNode.isConnected) {
            return;
        }
        overlayNode.classList.add('guide-diary-hidden');
    };
    window.guideDiaryOverlay.minimize = () => {
        if (!overlayDestroyed) {
            minimizeCard();
        }
    };
    window.guideDiaryOverlay.restore = () => {
        if (!overlayDestroyed) {
            restoreCard();
        }
    };
    window.guideDiaryOverlay.cardPosition = () => ({ x: cardPosition.x, y: cardPosition.y });
    window.guideDiaryOverlay.registerPageInitializer = registerPageInitializer;
    window.guideDiaryOverlay.requireElementById = requireElementById;
    window.guideDiaryOverlay.showalert = showalert;
    window.guideDiaryOverlay.showask = showask;
    window.guideDiaryOverlay.loaddata = loaddata;
    window.guideDiaryOverlay.savedata = savedata;
    window.guideDiaryOverlay.clearGuideDiarySave = clearGuideDiarySave;
    window.guideDiaryOverlay.data = () => data;
    window.guideDiaryOverlay.game = () => game;
    window.guideDiaryOverlay.people = people;
    window.guideDiaryOverlay.requirePerson = requirePerson;
    window.guideDiaryOverlay.writeWorld = writeWorld;
    window.guideDiaryOverlay.destroy = destroyOverlay;
    tavernWindow.formatNpcNames = formatNpcNames;
    tavernWindow.profileOf = profileOf;
    tavernWindow.showalert = showalert;
    tavernWindow.showask = showask;
    tavernWindow.writeWorld = writeWorld;
})();
