cmake_minimum_required(VERSION 3.16)
project(MarketPredictor LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Поиск зависимостей
find_package(Threads REQUIRED)

# Включаем директории
include_directories(${CMAKE_SOURCE_DIR})

# Создаем исполняемый файл
add_executable(market_predictor_server server.cpp)

# Линкуем библиотеки
target_link_libraries(market_predictor_server PRIVATE Threads::Threads)

# Настройки компиляции
if(MSVC)
    target_compile_options(market_predictor_server PRIVATE /W4)
else()
    target_compile_options(market_predictor_server PRIVATE -Wall -Wextra -O2)
endif()

# Инструкции по установке зависимостей
message(STATUS "Для сборки проекта необходимо:")
message(STATUS "1. Установить nlohmann/json: https://github.com/nlohmann/json")
message(STATUS "2. Установить cpp-httplib: https://github.com/yhirose/cpp-httplib")
message(STATUS "3. Скопировать json.hpp и httplib.h в папку проекта")
