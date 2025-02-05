{
  "targets": [
    {
      "target_name": "video_engine",
      "sources": [
        "src/binding.cpp",
        "src/codec_manager.cpp",
        "src/gpu_manager.cpp"
      ],
      "include_dirs": [
        "include",
        "<!@(node -p \"require('node-addon-api').include\")"
      ],
      "dependencies": [
        "<!(node -p \"require('node-addon-api').gyp\")"
      ],
      "defines": [ "NAPI_DISABLE_CPP_EXCEPTIONS" ],
      "conditions": [
        ['OS=="mac"', {
          "xcode_settings": {
            "GCC_ENABLE_CPP_EXCEPTIONS": "YES",
            "CLANG_CXX_LIBRARY": "libc++",
            "MACOSX_DEPLOYMENT_TARGET": "10.15",
            "OTHER_CPLUSPLUSFLAGS": ["-std=c++17", "-stdlib=libc++"],
            "OTHER_LDFLAGS": ["-stdlib=libc++"]
          },
          "link_settings": {
            "libraries": [
              "-framework Metal",
              "-framework MetalKit",
              "-framework CoreGraphics",
              "-framework Foundation"
            ]
          }
        }],
        ['OS=="linux"', {
          "cflags_cc": ["-std=c++17"],
          "cflags": ["-fexceptions"],
          "ldflags": ["-fexceptions"],
          "libraries": [
            "-lvulkan",
            "-lX11"
          ],
          "include_dirs": [
            "/usr/include/vulkan"
          ]
        }],
        ['OS=="win"', {
          "msvs_settings": {
            "VCCLCompilerTool": {
              "ExceptionHandling": 1,
              "AdditionalOptions": ["/std:c++17"]
            }
          },
          "libraries": [
            "-ld3d11.lib",
            "-ldxgi.lib"
          ],
          "include_dirs": [
            "$(WindowsSdkDir)Include/$(WindowsTargetPlatformVersion)/um",
            "$(WindowsSdkDir)Include/$(WindowsTargetPlatformVersion)/shared"
          ]
        }]
      ]
    }
  ]
}
