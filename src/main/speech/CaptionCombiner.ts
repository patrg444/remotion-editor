interface VoskCaption {
    text: string;
    start: number;
    end: number;
    conf: number;
}

interface SpeakerSegment {
    speaker: string;
    start: number;
    end: number;
}

interface ColoredCaption extends VoskCaption {
    speaker?: string;
    color?: string;
}

const defaultSpeakerColors = [
    '#4CAF50', // Green
    '#2196F3', // Blue
    '#F44336', // Red
    '#9C27B0', // Purple
    '#FF9800', // Orange
];

export class CaptionCombiner {
    /**
     * Combines Vosk transcriptions with pyannote speaker diarization data
     * @param captions Array of captions from Vosk
     * @param speakerSegments Array of speaker segments from pyannote
     * @param options Configuration options
     * @returns Array of captions with speaker information and colors
     */
    static combineCaptions(
        captions: VoskCaption[],
        speakerSegments: SpeakerSegment[],
        options: {
            minSpeakerOverlap?: number; // Minimum overlap required to assign speaker (seconds)
            speakerColors?: string[]; // Custom colors for speakers
            enableSpeakerColors?: boolean; // Whether to assign colors to speakers
        } = {}
    ): ColoredCaption[] {
        const {
            minSpeakerOverlap = 0.5,
            speakerColors = defaultSpeakerColors,
            enableSpeakerColors = true
        } = options;

        // Sort segments by start time for efficient processing
        const sortedSegments = [...speakerSegments].sort((a, b) => a.start - b.start);
        
        // Track speaker colors
        const speakerColorMap = new Map<string, string>();
        let nextColorIndex = 0;

        return captions.map(caption => {
            // Find all speaker segments that overlap with this caption
            const overlappingSegments = sortedSegments.filter(segment => 
                this.hasOverlap(caption, segment)
            );

            if (overlappingSegments.length === 0) {
                return caption; // No speaker found
            }

            // Calculate overlap duration for each speaker
            const speakerOverlaps = new Map<string, number>();
            for (const segment of overlappingSegments) {
                const overlap = this.calculateOverlap(caption, segment);
                const currentOverlap = speakerOverlaps.get(segment.speaker) || 0;
                speakerOverlaps.set(segment.speaker, currentOverlap + overlap);
            }

            // Find the dominant speaker (most overlap)
            let dominantSpeaker: string | undefined;
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
            let speakerColor: string | undefined;
            if (enableSpeakerColors) {
                if (!speakerColorMap.has(dominantSpeaker)) {
                    speakerColorMap.set(
                        dominantSpeaker,
                        speakerColors[nextColorIndex % speakerColors.length]
                    );
                    nextColorIndex++;
                }
                speakerColor = speakerColorMap.get(dominantSpeaker);
            }

            // Split caption if it spans multiple speakers with significant coverage
            const shouldSplit = this.shouldSplitCaption(caption, overlappingSegments, minSpeakerOverlap);
            if (shouldSplit) {
                return this.splitCaptionBySpeakers(
                    caption,
                    overlappingSegments,
                    speakerColorMap,
                    enableSpeakerColors
                );
            }

            // Return single caption with speaker info
            return {
                ...caption,
                speaker: dominantSpeaker,
                color: speakerColor
            };
        }).flat(); // Flatten because splitting might create multiple captions
    }

    private static hasOverlap(
        caption: VoskCaption,
        segment: SpeakerSegment
    ): boolean {
        return segment.start < caption.end && segment.end > caption.start;
    }

    private static calculateOverlap(
        caption: VoskCaption,
        segment: SpeakerSegment
    ): number {
        const overlapStart = Math.max(caption.start, segment.start);
        const overlapEnd = Math.min(caption.end, segment.end);
        return Math.max(0, overlapEnd - overlapStart);
    }

    private static shouldSplitCaption(
        caption: VoskCaption,
        segments: SpeakerSegment[],
        minOverlap: number
    ): boolean {
        // Check if multiple speakers have significant coverage
        const significantSpeakers = segments.filter(segment => 
            this.calculateOverlap(caption, segment) >= minOverlap
        );
        return significantSpeakers.length > 1;
    }

    private static splitCaptionBySpeakers(
        caption: VoskCaption,
        segments: SpeakerSegment[],
        colorMap: Map<string, string>,
        enableColors: boolean
    ): ColoredCaption[] {
        // Sort segments by start time
        const sortedSegments = segments.sort((a, b) => a.start - b.start);
        
        // Split caption text roughly by time proportion
        const captionDuration = caption.end - caption.start;
        const words = caption.text.split(' ');
        const wordsPerSecond = words.length / captionDuration;

        const splitCaptions: ColoredCaption[] = [];
        let currentWordIndex = 0;

        for (const segment of sortedSegments) {
            // Only process segments with actual overlap
            if (!this.hasOverlap(caption, segment)) continue;

            const segmentOverlap = this.calculateOverlap(caption, segment);
            if (segmentOverlap === 0) continue;

            // Calculate how many words should be in this segment
            const wordCount = Math.round(segmentOverlap * wordsPerSecond);
            if (wordCount === 0) continue;

            // Extract words for this segment
            const segmentWords = words.slice(
                currentWordIndex,
                currentWordIndex + wordCount
            );
            currentWordIndex += wordCount;

            if (segmentWords.length === 0) continue;

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
