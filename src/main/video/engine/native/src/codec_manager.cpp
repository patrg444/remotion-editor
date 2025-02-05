#include "../include/codec_manager.h"
#include <iostream>

bool CodecManager::initialized = false;
CodecManager* CodecManager::instance = nullptr;

CodecManager::CodecManager() {
    std::cout << "CodecManager constructor called" << std::endl;
}

CodecManager::~CodecManager() {
    std::cout << "CodecManager destructor called" << std::endl;
    cleanupCodecs();
}

void CodecManager::Init() {
    if (!initialized) {
        getInstance().initializeCodecs();
        initialized = true;
    }
}

bool CodecManager::IsAvailable() {
    return initialized;
}

VideoMetadata CodecManager::LoadVideo(const std::string& path) {
    if (!initialized) {
        throw CodecManagerError("Codec manager not initialized");
    }

    // TODO: Implement actual video loading
    // For now, return dummy metadata
    return VideoMetadata{
        .duration = 60.0,  // 60 seconds
        .frameRate = 30.0, // 30 fps
        .width = 1920,     // 1080p
        .height = 1080
    };
}

std::string CodecManager::ExtractFrame(double time) {
    if (!initialized) {
        throw CodecManagerError("Codec manager not initialized");
    }

    // TODO: Implement actual frame extraction
    // For now, return empty string
    return "";
}

void CodecManager::Dispose() {
    if (initialized && instance) {
        delete instance;
        instance = nullptr;
        initialized = false;
    }
}

void CodecManager::initializeCodecs() {
    try {
        // TODO: Initialize video codecs
        std::cout << "Initializing video codecs..." << std::endl;
    } catch (const std::exception& e) {
        throw CodecManagerError(std::string("Failed to initialize codecs: ") + e.what());
    }
}

void CodecManager::cleanupCodecs() {
    try {
        // TODO: Cleanup video codecs
        std::cout << "Cleaning up video codecs..." << std::endl;
    } catch (const std::exception& e) {
        // Just log the error during cleanup
        std::cerr << "Error during codec cleanup: " << e.what() << std::endl;
    }
}
