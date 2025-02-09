"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CaptionCombiner = void 0;
const defaultSpeakerColors = [
    '#4CAF50',
    '#2196F3',
    '#F44336',
    '#9C27B0',
    '#FF9800', // Orange
];
class CaptionCombiner {
    /**
     * Combines Vosk transcriptions with pyannote speaker diarization data
     * @param captions Array of captions from Vosk
     * @param speakerSegments Array of speaker segments from pyannote
     * @param options Configuration options
     * @returns Array of captions with speaker information and colors
     */
    static combineCaptions(captions, speakerSegments, options = {}) {
        const { minSpeakerOverlap = 0.5, speakerColors = defaultSpeakerColors, enableSpeakerColors = true } = options;
        // Sort segments by start time for efficient processing
        const sortedSegments = [...speakerSegments].sort((a, b) => a.start - b.start);
        // Track speaker colors
        const speakerColorMap = new Map();
        let nextColorIndex = 0;
        return captions.map(caption => {
            // Find all speaker segments that overlap with this caption
            const overlappingSegments = sortedSegments.filter(segment => this.hasOverlap(caption, segment));
            if (overlappingSegments.length === 0) {
                return caption; // No speaker found
            }
            // Calculate overlap duration for each speaker
            const speakerOverlaps = new Map();
            for (const segment of overlappingSegments) {
                const overlap = this.calculateOverlap(caption, segment);
                const currentOverlap = speakerOverlaps.get(segment.speaker) || 0;
                speakerOverlaps.set(segment.speaker, currentOverlap + overlap);
            }
            // Find the dominant speaker (most overlap)
            let dominantSpeaker;
            let maxOverlap = 0;
            speakerOverlaps.forEach((overlap, speaker) => {
                if (overlap > maxOverlap && overlap >= minSpeakerOverlap) {
                    maxOverlap = overlap;
                    dominantSpeaker = speaker;
                }
            });
            if (!dominantSpeaker) {
                return caption; // No speaker with sufficient overlap
            }
            // Assign color to speaker if enabled
            let speakerColor;
            if (enableSpeakerColors) {
                if (!speakerColorMap.has(dominantSpeaker)) {
                    speakerColorMap.set(dominantSpeaker, speakerColors[nextColorIndex % speakerColors.length]);
                    nextColorIndex++;
                }
                speakerColor = speakerColorMap.get(dominantSpeaker);
            }
            // Split caption if it spans multiple speakers with significant coverage
            const shouldSplit = this.shouldSplitCaption(caption, overlappingSegments, minSpeakerOverlap);
            if (shouldSplit) {
                return this.splitCaptionBySpeakers(caption, overlappingSegments, speakerColorMap, enableSpeakerColors);
            }
            // Return single caption with speaker info
            return {
                ...caption,
                speaker: dominantSpeaker,
                color: speakerColor
            };
        }).flat(); // Flatten because splitting might create multiple captions
    }
    static hasOverlap(caption, segment) {
        return segment.start < caption.end && segment.end > caption.start;
    }
    static calculateOverlap(caption, segment) {
        const overlapStart = Math.max(caption.start, segment.start);
        const overlapEnd = Math.min(caption.end, segment.end);
        return Math.max(0, overlapEnd - overlapStart);
    }
    static shouldSplitCaption(caption, segments, minOverlap) {
        // Check if multiple speakers have significant coverage
        const significantSpeakers = segments.filter(segment => this.calculateOverlap(caption, segment) >= minOverlap);
        return significantSpeakers.length > 1;
    }
    static splitCaptionBySpeakers(caption, segments, colorMap, enableColors) {
        // Sort segments by start time
        const sortedSegments = segments.sort((a, b) => a.start - b.start);
        // Split caption text roughly by time proportion
        const captionDuration = caption.end - caption.start;
        const words = caption.text.split(' ');
        const wordsPerSecond = words.length / captionDuration;
        const splitCaptions = [];
        let currentWordIndex = 0;
        for (const segment of sortedSegments) {
            // Only process segments with actual overlap
            if (!this.hasOverlap(caption, segment))
                continue;
            const segmentOverlap = this.calculateOverlap(caption, segment);
            if (segmentOverlap === 0)
                continue;
            // Calculate how many words should be in this segment
            const wordCount = Math.round(segmentOverlap * wordsPerSecond);
            if (wordCount === 0)
                continue;
            // Extract words for this segment
            const segmentWords = words.slice(currentWordIndex, currentWordIndex + wordCount);
            currentWordIndex += wordCount;
            if (segmentWords.length === 0)
                continue;
            // Create new caption for this segment
            splitCaptions.push({
                text: segmentWords.join(' '),
                start: Math.max(caption.start, segment.start),
                end: Math.min(caption.end, segment.end),
                conf: caption.conf,
                speaker: segment.speaker,
                color: enableColors ? colorMap.get(segment.speaker) : undefined
            });
        }
        // Add any remaining words to the last segment
        if (currentWordIndex < words.length && splitCaptions.length > 0) {
            const remainingWords = words.slice(currentWordIndex).join(' ');
            splitCaptions[splitCaptions.length - 1].text += ' ' + remainingWords;
        }
        return splitCaptions;
    }
}
exports.CaptionCombiner = CaptionCombiner;
