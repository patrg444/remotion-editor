#pragma once

#include <napi.h>
#include <memory>
#include <string>
#include <vector>

#ifdef __APPLE__
#include <Metal/Metal.h>
#elif _WIN32
#include <d3d11.h>
#else
#include <vulkan/vulkan.h>
#endif

namespace video_engine {

class GPUManager {
public:
    GPUManager();
    ~GPUManager();

    // Initialize GPU context
    bool Initialize();

    // Frame processing
    bool UploadFrame(const uint8_t* data, size_t width, size_t height, size_t stride);
    bool ProcessFrame(const std::string& effect);
    bool DownloadFrame(uint8_t* output, size_t width, size_t height, size_t stride);

    // Resource management
    void ReleaseResources();
    bool IsInitialized() const;

    // Hardware capabilities
    struct GPUCapabilities {
        bool hardwareDecoding;
        bool hardwareEncoding;
        std::vector<std::string> supportedEffects;
        size_t maxTextureSize;
        size_t availableMemory;
    };
    GPUCapabilities GetCapabilities() const;

private:
    class Impl;
    std::unique_ptr<Impl> impl_;

    // Platform-specific initialization
    bool InitializePlatformAPI();
    
    #ifdef __APPLE__
    id<MTLDevice> metalDevice_;
    id<MTLCommandQueue> commandQueue_;
    #elif _WIN32
    ID3D11Device* d3dDevice_;
    ID3D11DeviceContext* d3dContext_;
    #else
    VkInstance vkInstance_;
    VkPhysicalDevice vkPhysicalDevice_;
    VkDevice vkDevice_;
    VkQueue vkQueue_;
    #endif

    // Common resources
    bool initialized_;
    GPUCapabilities capabilities_;

    // Prevent copying
    GPUManager(const GPUManager&) = delete;
    GPUManager& operator=(const GPUManager&) = delete;
};

// Node.js binding helpers
Napi::Object Init(Napi::Env env, Napi::Object exports);
Napi::Object CreateGPUManager(const Napi::CallbackInfo& info);

} // namespace video_engine
