#include "../include/gpu_manager.h"
#include <stdexcept>
#include <iostream>

namespace video_engine {

// Platform-specific implementation details
class GPUManager::Impl {
public:
    Impl() {}
    ~Impl() {}

    bool Initialize() {
        #ifdef __APPLE__
        return InitializeMetal();
        #elif _WIN32
        return InitializeDirectX();
        #else
        return InitializeVulkan();
        #endif
    }

private:
    #ifdef __APPLE__
    bool InitializeMetal() {
        // Get default Metal device
        metalDevice_ = MTLCreateSystemDefaultDevice();
        if (!metalDevice_) {
            std::cerr << "Failed to create Metal device" << std::endl;
            return false;
        }

        // Create command queue
        commandQueue_ = [metalDevice_ newCommandQueue];
        if (!commandQueue_) {
            std::cerr << "Failed to create Metal command queue" << std::endl;
            return false;
        }

        return true;
    }
    #elif _WIN32
    bool InitializeDirectX() {
        // Create D3D11 device and context
        UINT createDeviceFlags = D3D11_CREATE_DEVICE_BGRA_SUPPORT;
        #ifdef _DEBUG
        createDeviceFlags |= D3D11_CREATE_DEVICE_DEBUG;
        #endif

        D3D_FEATURE_LEVEL featureLevels[] = {
            D3D_FEATURE_LEVEL_11_1,
            D3D_FEATURE_LEVEL_11_0,
            D3D_FEATURE_LEVEL_10_1,
            D3D_FEATURE_LEVEL_10_0
        };

        HRESULT hr = D3D11CreateDevice(
            nullptr,                    // Default adapter
            D3D_DRIVER_TYPE_HARDWARE,   // Hardware acceleration
            nullptr,                    // No software rasterizer
            createDeviceFlags,          // Flags
            featureLevels,             // Feature levels
            ARRAYSIZE(featureLevels),   // Number of feature levels
            D3D11_SDK_VERSION,          // SDK version
            &d3dDevice_,               // Device
            nullptr,                    // Actual feature level
            &d3dContext_               // Device context
        );

        if (FAILED(hr)) {
            std::cerr << "Failed to create D3D11 device" << std::endl;
            return false;
        }

        return true;
    }
    #else
    bool InitializeVulkan() {
        // Create Vulkan instance
        VkApplicationInfo appInfo = {};
        appInfo.sType = VK_STRUCTURE_TYPE_APPLICATION_INFO;
        appInfo.pApplicationName = "Video Editor";
        appInfo.applicationVersion = VK_MAKE_VERSION(1, 0, 0);
        appInfo.pEngineName = "No Engine";
        appInfo.engineVersion = VK_MAKE_VERSION(1, 0, 0);
        appInfo.apiVersion = VK_API_VERSION_1_0;

        VkInstanceCreateInfo createInfo = {};
        createInfo.sType = VK_STRUCTURE_TYPE_INSTANCE_CREATE_INFO;
        createInfo.pApplicationInfo = &appInfo;

        if (vkCreateInstance(&createInfo, nullptr, &vkInstance_) != VK_SUCCESS) {
            std::cerr << "Failed to create Vulkan instance" << std::endl;
            return false;
        }

        // Select physical device (GPU)
        uint32_t deviceCount = 0;
        vkEnumeratePhysicalDevices(vkInstance_, &deviceCount, nullptr);
        if (deviceCount == 0) {
            std::cerr << "Failed to find GPUs with Vulkan support" << std::endl;
            return false;
        }

        std::vector<VkPhysicalDevice> devices(deviceCount);
        vkEnumeratePhysicalDevices(vkInstance_, &deviceCount, devices.data());
        vkPhysicalDevice_ = devices[0]; // Just take the first one for now

        // Create logical device
        float queuePriority = 1.0f;
        VkDeviceQueueCreateInfo queueCreateInfo = {};
        queueCreateInfo.sType = VK_STRUCTURE_TYPE_DEVICE_QUEUE_CREATE_INFO;
        queueCreateInfo.queueFamilyIndex = 0;
        queueCreateInfo.queueCount = 1;
        queueCreateInfo.pQueuePriorities = &queuePriority;

        VkDeviceCreateInfo deviceCreateInfo = {};
        deviceCreateInfo.sType = VK_STRUCTURE_TYPE_DEVICE_CREATE_INFO;
        deviceCreateInfo.queueCreateInfoCount = 1;
        deviceCreateInfo.pQueueCreateInfos = &queueCreateInfo;

        if (vkCreateDevice(vkPhysicalDevice_, &deviceCreateInfo, nullptr, &vkDevice_) != VK_SUCCESS) {
            std::cerr << "Failed to create Vulkan logical device" << std::endl;
            return false;
        }

        vkGetDeviceQueue(vkDevice_, 0, 0, &vkQueue_);
        return true;
    }
    #endif
};

// Main class implementation
GPUManager::GPUManager() : impl_(new Impl()), initialized_(false) {}

GPUManager::~GPUManager() {
    ReleaseResources();
}

bool GPUManager::Initialize() {
    if (initialized_) return true;
    
    if (!impl_->Initialize()) {
        std::cerr << "Failed to initialize GPU manager" << std::endl;
        return false;
    }

    initialized_ = true;
    return true;
}

bool GPUManager::UploadFrame(const uint8_t* data, size_t width, size_t height, size_t stride) {
    if (!initialized_) return false;
    // Platform-specific implementation to be added
    return true;
}

bool GPUManager::ProcessFrame(const std::string& effect) {
    if (!initialized_) return false;
    // Platform-specific implementation to be added
    return true;
}

bool GPUManager::DownloadFrame(uint8_t* output, size_t width, size_t height, size_t stride) {
    if (!initialized_) return false;
    // Platform-specific implementation to be added
    return true;
}

void GPUManager::ReleaseResources() {
    if (!initialized_) return;

    #ifdef __APPLE__
    [commandQueue_ release];
    [metalDevice_ release];
    #elif _WIN32
    if (d3dContext_) d3dContext_->Release();
    if (d3dDevice_) d3dDevice_->Release();
    #else
    if (vkDevice_) vkDestroyDevice(vkDevice_, nullptr);
    if (vkInstance_) vkDestroyInstance(vkInstance_, nullptr);
    #endif

    initialized_ = false;
}

bool GPUManager::IsInitialized() const {
    return initialized_;
}

GPUManager::GPUCapabilities GPUManager::GetCapabilities() const {
    GPUCapabilities caps;
    // Platform-specific capability detection to be added
    return caps;
}

// Node.js binding implementation
Napi::Object Init(Napi::Env env, Napi::Object exports) {
    exports.Set("createGPUManager", Napi::Function::New(env, CreateGPUManager));
    return exports;
}

Napi::Object CreateGPUManager(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    Napi::Object obj = Napi::Object::New(env);
    
    GPUManager* manager = new GPUManager();
    if (!manager->Initialize()) {
        throw Napi::Error::New(env, "Failed to initialize GPU manager");
    }

    // Wrap native object
    obj.Set("_native", Napi::External<GPUManager>::New(env, manager));

    // Add methods
    obj.Set("uploadFrame", Napi::Function::New(env, [](const Napi::CallbackInfo& info) {
        // Implementation to be added
        return info.Env().Undefined();
    }));

    obj.Set("processFrame", Napi::Function::New(env, [](const Napi::CallbackInfo& info) {
        // Implementation to be added
        return info.Env().Undefined();
    }));

    obj.Set("downloadFrame", Napi::Function::New(env, [](const Napi::CallbackInfo& info) {
        // Implementation to be added
        return info.Env().Undefined();
    }));

    return obj;
}

} // namespace video_engine
