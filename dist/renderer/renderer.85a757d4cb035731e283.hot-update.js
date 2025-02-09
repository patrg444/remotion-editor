"use strict";
self["webpackHotUpdateremotion_editor"]("renderer",{

/***/ "./src/renderer/components/MediaBin.tsx":
/*!**********************************************!*\
  !*** ./src/renderer/components/MediaBin.tsx ***!
  \**********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _hooks_useFileOperations__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../hooks/useFileOperations */ "./src/renderer/hooks/useFileOperations.ts");
/* harmony import */ var _utils_logger__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../utils/logger */ "./src/renderer/utils/logger.ts");
/* harmony import */ var _contexts_MediaBinContext__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../contexts/MediaBinContext */ "./src/renderer/contexts/MediaBinContext.tsx");
/* harmony import */ var _styles_media_bin_css__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../styles/media-bin.css */ "./src/renderer/styles/media-bin.css");





const MediaItemComponent = ({ item, onDragStart, onDragEnd, onClick, }) => {
    const handleDragStart = (e) => {
        if (e.dataTransfer) {
            try {
                const data = {
                    type: item.type,
                    name: item.name,
                    path: item.path,
                    src: item.path,
                    duration: item.duration,
                    originalDuration: item.duration,
                    initialDuration: item.duration,
                    maxDuration: item.duration
                };
                _utils_logger__WEBPACK_IMPORTED_MODULE_2__.logger.debug('Starting drag with data:', data);
                e.dataTransfer.setData('application/json', JSON.stringify(data));
                e.dataTransfer.effectAllowed = 'copy';
                e.currentTarget.classList.add('dragging');
                onDragStart(item);
            }
            catch (error) {
                console.error('Error setting drag data:', error);
            }
        }
    };
    const handleDragEnd = (e) => {
        e.currentTarget.classList.remove('dragging');
        onDragEnd();
    };
    return (react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", { className: "media-asset-item", draggable: "true", onDragStart: handleDragStart, onDragEnd: handleDragEnd, onClick: () => onClick?.(item), "data-testid": "media-bin-item", "data-item-id": item.id, "data-type": item.type },
        react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", { className: "media-asset-thumbnail" }, item.thumbnail ? (react__WEBPACK_IMPORTED_MODULE_0___default().createElement("img", { src: item.thumbnail, alt: item.name })) : (react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", { className: "media-asset-placeholder" }, item.type === 'video' ? '🎥' : item.type === 'audio' ? '🔊' : '🖼️'))),
        react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", { className: "media-asset-info" },
            react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", { className: "media-asset-name" }, item.name),
            react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", { className: "media-asset-duration" }, item.duration ? formatDuration(item.duration) : ''))));
};
const MediaBin = ({ className = '', }) => {
    const { items, selectedItem, addItems: onImport, selectItem: onSelect } = (0,_contexts_MediaBinContext__WEBPACK_IMPORTED_MODULE_3__.useMediaBin)();
    const [isDragOver, setIsDragOver] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(false);
    const [errorMessage, setErrorMessage] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(null);
    const { validateFile, processFile } = (0,_hooks_useFileOperations__WEBPACK_IMPORTED_MODULE_1__.useFileOperations)();
    const objectUrls = react__WEBPACK_IMPORTED_MODULE_0___default().useRef([]);
    (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
        const urls = objectUrls.current;
        return () => {
            urls.forEach(url => {
                try {
                    URL.revokeObjectURL(url);
                }
                catch (error) {
                    console.error('Error revoking object URL:', error);
                }
            });
        };
    }, []);
    const showError = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)((text) => {
        if (errorMessage?.timeout) {
            clearTimeout(errorMessage.timeout);
        }
        const timeout = setTimeout(() => setErrorMessage(null), 3000);
        setErrorMessage({ text, timeout });
    }, [errorMessage]);
    const validateAndProcessFile = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)(async (file) => {
        // Check for duplicates first
        if (items.some(item => item.name === file.name)) {
            showError(`${file.name} has already been imported`);
            return null;
        }
        // Then validate file
        try {
            await validateFile(file);
        }
        catch (error) {
            showError(error instanceof Error ? error.message : 'Error validating file');
            return null;
        }
        // Process file
        try {
            const processedFile = await processFile(file);
            const objectUrl = URL.createObjectURL(file);
            objectUrls.current.push(objectUrl);
            const type = processedFile.type.startsWith('video/') ? 'video' :
                processedFile.type.startsWith('audio/') ? 'audio' :
                    'image';
            _utils_logger__WEBPACK_IMPORTED_MODULE_2__.logger.debug('Processed file:', {
                id: processedFile.id,
                name: processedFile.name,
                type,
                duration: processedFile.metadata.duration
            });
            const duration = processedFile.metadata.duration || 0;
            return {
                id: processedFile.id,
                name: processedFile.name,
                type,
                path: objectUrl,
                duration,
                originalDuration: duration,
                initialDuration: duration,
                maxDuration: duration
            };
        }
        catch (error) {
            showError(error instanceof Error ? error.message : 'Error processing file');
            return null;
        }
    }, [items, validateFile, processFile, showError]);
    const handleFiles = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)(async (files) => {
        const newItems = [];
        for (const file of files) {
            const item = await validateAndProcessFile(file);
            if (item) {
                newItems.push(item);
            }
        }
        if (newItems.length > 0) {
            onImport(newItems);
        }
    }, [onImport, validateAndProcessFile]);
    const handleDragEnter = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)((e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(true);
    }, []);
    const handleDragOver = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)((e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(true);
    }, []);
    const handleDragLeave = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)((e) => {
        e.preventDefault();
        e.stopPropagation();
        const rect = e.currentTarget.getBoundingClientRect();
        if (e.clientX <= rect.left ||
            e.clientX >= rect.right ||
            e.clientY <= rect.top ||
            e.clientY >= rect.bottom) {
            setIsDragOver(false);
        }
    }, []);
    const handleDrop = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)(async (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);
        await handleFiles(Array.from(e.dataTransfer.files));
    }, [handleFiles]);
    const handleFileChange = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)(async (e) => {
        const files = e.target.files;
        if (files) {
            await handleFiles(Array.from(files));
            // Reset input value to allow selecting the same file again
            e.target.value = '';
        }
    }, [handleFiles]);
    return (react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", { className: `media-bin ${className} ${isDragOver ? 'drag-over' : ''}`, "data-testid": "media-bin", onDragEnter: handleDragEnter, onDragOver: handleDragOver, onDragLeave: handleDragLeave, onDrop: handleDrop },
        errorMessage && (react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", { className: "media-bin-error", role: "alert", "data-testid": "error-message" }, errorMessage.text)),
        react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", { className: "media-bin-header" },
            react__WEBPACK_IMPORTED_MODULE_0___default().createElement("h2", null, "Media"),
            react__WEBPACK_IMPORTED_MODULE_0___default().createElement("button", { className: "media-bin-import-button", "data-testid": "media-bin-import-button", onClick: () => document.getElementById('media-import-input')?.click() }, "Import Media")),
        react__WEBPACK_IMPORTED_MODULE_0___default().createElement("input", { type: "file", id: "media-import-input", "data-testid": "media-import-input", style: { display: 'none' }, multiple: true, accept: "video/*,audio/*,image/*,.srt,.vtt", onChange: handleFileChange }),
        react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", { className: "media-bin-content", "data-testid": "media-bin-content" }, items.length > 0 ? (react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", { className: "media-bin-items" }, items.map((item) => (react__WEBPACK_IMPORTED_MODULE_0___default().createElement(MediaItemComponent, { key: item.id, item: item, onDragStart: (item) => {
                _utils_logger__WEBPACK_IMPORTED_MODULE_2__.logger.debug('Drag started:', item);
            }, onDragEnd: () => {
                _utils_logger__WEBPACK_IMPORTED_MODULE_2__.logger.debug('Drag ended');
            }, onClick: (item) => onSelect?.(item) }))))) : (react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", { className: "media-bin-empty", "data-testid": "media-bin-empty" },
            react__WEBPACK_IMPORTED_MODULE_0___default().createElement("p", null, "No media assets"),
            react__WEBPACK_IMPORTED_MODULE_0___default().createElement("p", null, "Click Import Media to add files"))))));
};
const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (MediaBin);


/***/ })

},
/******/ function(__webpack_require__) { // webpackRuntimeModules
/******/ /* webpack/runtime/getFullHash */
/******/ (() => {
/******/ 	__webpack_require__.h = () => ("b67f32f4f1276031f3b9")
/******/ })();
/******/ 
/******/ }
);
//# sourceMappingURL=renderer.85a757d4cb035731e283.hot-update.js.map