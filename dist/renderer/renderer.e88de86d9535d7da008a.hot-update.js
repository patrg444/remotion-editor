"use strict";
self["webpackHotUpdateremotion_editor"]("renderer",{

/***/ "./src/renderer/contexts/MediaBinContext.tsx":
/*!***************************************************!*\
  !*** ./src/renderer/contexts/MediaBinContext.tsx ***!
  \***************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   MediaBinProvider: () => (/* binding */ MediaBinProvider),
/* harmony export */   useMediaBin: () => (/* binding */ useMediaBin)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _utils_logger__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils/logger */ "./src/renderer/utils/logger.ts");


const MediaBinContext = (0,react__WEBPACK_IMPORTED_MODULE_0__.createContext)(undefined);
const MediaBinProvider = ({ children }) => {
    const [items, setItems] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)([]);
    const [selectedItem, setSelectedItem] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(null);
    const addItems = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)((newItems) => {
        _utils_logger__WEBPACK_IMPORTED_MODULE_1__.logger.debug('Adding media items:', newItems);
        setItems(current => {
            const updatedItems = [...current, ...newItems];
            // Sync with timeline state
            if (window.timelineDispatch) {
                window.timelineDispatch({
                    type: 'SET_STATE',
                    payload: {
                        ...window.timelineState,
                        mediaBin: {
                            ...(window.timelineState?.mediaBin || {}),
                            items: updatedItems
                        }
                    }
                });
            }
            return updatedItems;
        });
    }, []);
    const removeItem = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)((id) => {
        _utils_logger__WEBPACK_IMPORTED_MODULE_1__.logger.debug('Removing media item:', id);
        setItems(current => current.filter(item => item.id !== id));
        setSelectedItem(current => current?.id === id ? null : current);
    }, []);
    const selectItem = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)((item) => {
        _utils_logger__WEBPACK_IMPORTED_MODULE_1__.logger.debug('Selecting media item:', item);
        setSelectedItem(item);
    }, []);
    const value = {
        items,
        selectedItem,
        addItems,
        removeItem,
        selectItem
    };
    // Sync with timeline state
    react__WEBPACK_IMPORTED_MODULE_0___default().useEffect(() => {
        const timelineState = window.timelineState;
        if (timelineState?.mediaBin?.items) {
            setItems(timelineState.mediaBin.items);
        }
    }, [window.timelineState?.mediaBin?.items]);
    // Expose context for testing
    react__WEBPACK_IMPORTED_MODULE_0___default().useEffect(() => {
        if (true) {
            window.mediaBinContext = value;
        }
    }, [value]);
    return (react__WEBPACK_IMPORTED_MODULE_0___default().createElement(MediaBinContext.Provider, { value: value }, children));
};
const useMediaBin = () => {
    const context = (0,react__WEBPACK_IMPORTED_MODULE_0__.useContext)(MediaBinContext);
    if (!context) {
        throw new Error('useMediaBin must be used within a MediaBinProvider');
    }
    return context;
};


/***/ })

},
/******/ function(__webpack_require__) { // webpackRuntimeModules
/******/ /* webpack/runtime/getFullHash */
/******/ (() => {
/******/ 	__webpack_require__.h = () => ("e388e1282ed2c329fe10")
/******/ })();
/******/ 
/******/ }
);
//# sourceMappingURL=renderer.e88de86d9535d7da008a.hot-update.js.map