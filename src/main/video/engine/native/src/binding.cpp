#include <napi.h>
#include "../include/codec_manager.h"

namespace {

Napi::Value Init(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    try {
        CodecManager::Init();
        return env.Undefined();
    } catch (const std::exception& e) {
        throw Napi::Error::New(env, e.what());
    }
}

Napi::Value IsAvailable(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    try {
        return Napi::Boolean::New(env, CodecManager::IsAvailable());
    } catch (const std::exception& e) {
        throw Napi::Error::New(env, e.what());
    }
}

Napi::Value LoadVideo(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();

    if (info.Length() < 1 || !info[0].IsString()) {
        throw Napi::TypeError::New(env, "String expected");
    }

    try {
        std::string path = info[0].As<Napi::String>().Utf8Value();
        VideoMetadata metadata = CodecManager::LoadVideo(path);

        Napi::Object result = Napi::Object::New(env);
        result.Set("duration", metadata.duration);
        result.Set("frameRate", metadata.frameRate);
        result.Set("width", metadata.width);
        result.Set("height", metadata.height);

        return result;
    } catch (const std::exception& e) {
        throw Napi::Error::New(env, e.what());
    }
}

Napi::Value ExtractFrame(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();

    if (info.Length() < 1 || !info[0].IsNumber()) {
        throw Napi::TypeError::New(env, "Number expected");
    }

    try {
        double time = info[0].As<Napi::Number>().DoubleValue();
        std::string frameData = CodecManager::ExtractFrame(time);
        return Napi::String::New(env, frameData);
    } catch (const std::exception& e) {
        throw Napi::Error::New(env, e.what());
    }
}

Napi::Value Dispose(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    try {
        CodecManager::Dispose();
        return env.Undefined();
    } catch (const std::exception& e) {
        throw Napi::Error::New(env, e.what());
    }
}

Napi::Object InitModule(Napi::Env env, Napi::Object exports) {
    exports.Set("init", Napi::Function::New(env, Init));
    exports.Set("isAvailable", Napi::Function::New(env, IsAvailable));
    exports.Set("loadVideo", Napi::Function::New(env, LoadVideo));
    exports.Set("extractFrame", Napi::Function::New(env, ExtractFrame));
    exports.Set("dispose", Napi::Function::New(env, Dispose));
    return exports;
}

} // namespace

NODE_API_MODULE(video_engine, InitModule)
