#pragma once

#include <string>
#include <memory>
#include <stdexcept>

struct VideoMetadata {
    double duration;
    double frameRate;
    int width;
    int height;
};

class CodecManagerError : public std::runtime_error {
public:
    explicit CodecManagerError(const std::string& message) : std::runtime_error(message) {}
};

class CodecManager {
public:
    static void Init();
    static bool IsAvailable();
    static VideoMetadata LoadVideo(const std::string& path);
    static std::string ExtractFrame(double time);
    static void Dispose();

private:
    static bool initialized;
    static CodecManager* instance;

    CodecManager();
    ~CodecManager();
    CodecManager(const CodecManager&) = delete;
    CodecManager& operator=(const CodecManager&) = delete;
    CodecManager(CodecManager&&) = delete;
    CodecManager& operator=(CodecManager&&) = delete;

    void initializeCodecs();
    void cleanupCodecs();

    static CodecManager& getInstance() {
        if (!instance) {
            instance = new CodecManager();
        }
        return *instance;
    }
};
