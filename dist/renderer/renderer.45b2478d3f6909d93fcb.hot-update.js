"use strict";
self["webpackHotUpdateremotion_editor"]("renderer",{

/***/ "./src/renderer/contexts/TimelineContext.tsx":
/*!***************************************************!*\
  !*** ./src/renderer/contexts/TimelineContext.tsx ***!
  \***************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   TimelineProvider: () => (/* binding */ TimelineProvider),
/* harmony export */   useTimelineContext: () => (/* binding */ useTimelineContext)
/* harmony export */ });
// ... (previous code remains the same until TimelineProvider)
const TimelineProvider = ({ children }) => {
    console.log('[TimelineProvider] Mounting...');
    const [state, dispatch] = useReducer(timelineReducer, {
        ...initialTimelineState,
        history: {
            entries: [],
            currentIndex: -1
        }
    });
    const [isInitialized, setIsInitialized] = React.useState(false);
    // One-time initialization effect
    useEffect(() => {
        console.log('[TimelineProvider] Mounting (one-time)...');
        try {
            // Step 1: Dispatch initializing event
            window.dispatchEvent(new CustomEvent('timeline:initializing'));
            // Step 2: Set up window properties
            window.timelineDispatch = dispatch;
            window.timelineState = state;
            // Step 3: Dispatch ready event
            window.dispatchEvent(new CustomEvent('timeline:dispatchReady'));
            // Step 4: Set ready flag and dispatch initialized event
            window.timelineReady = true;
            window.dispatchEvent(new CustomEvent('timeline:initialized'));
            setIsInitialized(true);
            logger.debug('[Timeline] Initialization complete');
            // No cleanup to avoid race conditions
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            logger.error('[TimelineProvider] Error initializing timeline:', new Error(errorMessage));
            window.dispatchEvent(new CustomEvent('timeline:error', {
                detail: { error: new Error(errorMessage) }
            }));
        }
    }, []); // Empty deps array for one-time initialization
    // Optional sync effect for development/testing
    if (true) {
        useEffect(() => {
            // Keep window.timelineState and window.timelineDispatch separate
            window.timelineState = state;
            window.timelineDispatch = dispatch;
        }, [state, dispatch]);
    }
    // Separate effect for state validation
    useEffect(() => {
        try {
            const validationErrors = validateTimelineState(state);
            if (validationErrors.length > 0) {
                logger.warn('[Timeline] State validation errors:', validationErrors);
            }
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            logger.error('[Timeline] State validation failed:', new Error(errorMessage));
        }
    }, [state]);
    return (React.createElement(TimelineContext.Provider, { value: { state, dispatch } }, children));
};
const useTimelineContext = () => {
    const context = useContext(TimelineContext);
    if (!context) {
        throw new Error('useTimelineContext must be used within a TimelineProvider');
    }
    return context;
};


/***/ })

},
/******/ function(__webpack_require__) { // webpackRuntimeModules
/******/ /* webpack/runtime/getFullHash */
/******/ (() => {
/******/ 	__webpack_require__.h = () => ("30778020738abb89a6ca")
/******/ })();
/******/ 
/******/ }
);
//# sourceMappingURL=renderer.45b2478d3f6909d93fcb.hot-update.js.map