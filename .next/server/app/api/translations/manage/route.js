/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(() => {
var exports = {};
exports.id = "app/api/translations/manage/route";
exports.ids = ["app/api/translations/manage/route"];
exports.modules = {

/***/ "(rsc)/./app/api/translations/manage/route.ts":
/*!**********************************************!*\
  !*** ./app/api/translations/manage/route.ts ***!
  \**********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   GET: () => (/* binding */ GET),\n/* harmony export */   POST: () => (/* binding */ POST),\n/* harmony export */   PUT: () => (/* binding */ PUT)\n/* harmony export */ });\n/* harmony import */ var next_server__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/server */ \"(rsc)/./node_modules/next/dist/api/server.js\");\n/* harmony import */ var next_auth__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next-auth */ \"(rsc)/./node_modules/next-auth/index.js\");\n/* harmony import */ var next_auth__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(next_auth__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var _lib_auth__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @/lib/auth */ \"(rsc)/./lib/auth.ts\");\n/* harmony import */ var _lib_prisma__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @/lib/prisma */ \"(rsc)/./lib/prisma.ts\");\n\n\n\n\nasync function GET(request) {\n    try {\n        const session = await (0,next_auth__WEBPACK_IMPORTED_MODULE_1__.getServerSession)(_lib_auth__WEBPACK_IMPORTED_MODULE_2__.authOptions);\n        if (!session || session.user.role !== 'ADMIN') {\n            return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n                error: 'No autorizado'\n            }, {\n                status: 401\n            });\n        }\n        const { searchParams } = new URL(request.url);\n        const category = searchParams.get('category');\n        // Get all translations from database\n        const where = category ? {\n            category\n        } : {};\n        const translations = await _lib_prisma__WEBPACK_IMPORTED_MODULE_3__.prisma.translation.findMany({\n            where,\n            orderBy: [\n                {\n                    category: 'asc'\n                },\n                {\n                    englishText: 'asc'\n                }\n            ]\n        });\n        // Group by category\n        const groupedTranslations = translations.reduce((acc, translation)=>{\n            if (!acc[translation.category]) {\n                acc[translation.category] = {};\n            }\n            acc[translation.category][translation.englishText] = translation.spanishText;\n            return acc;\n        }, {});\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            success: true,\n            translations: groupedTranslations\n        });\n    } catch (error) {\n        console.error('Error getting translations:', error);\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            error: 'Error interno del servidor'\n        }, {\n            status: 500\n        });\n    }\n}\nasync function POST(request) {\n    try {\n        const session = await (0,next_auth__WEBPACK_IMPORTED_MODULE_1__.getServerSession)(_lib_auth__WEBPACK_IMPORTED_MODULE_2__.authOptions);\n        if (!session || session.user.role !== 'ADMIN') {\n            return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n                error: 'No autorizado'\n            }, {\n                status: 401\n            });\n        }\n        const body = await request.json();\n        const { category, englishText, spanishText, action } = body;\n        if (!category || !englishText) {\n            return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n                error: 'Categoría y texto en inglés son requeridos'\n            }, {\n                status: 400\n            });\n        }\n        if (action === 'add' || action === 'update') {\n            if (!spanishText) {\n                return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n                    error: 'Texto en español es requerido'\n                }, {\n                    status: 400\n                });\n            }\n            const translation = await _lib_prisma__WEBPACK_IMPORTED_MODULE_3__.prisma.translation.upsert({\n                where: {\n                    category_englishText: {\n                        category,\n                        englishText\n                    }\n                },\n                update: {\n                    spanishText,\n                    updatedAt: new Date()\n                },\n                create: {\n                    category,\n                    englishText,\n                    spanishText\n                }\n            });\n            return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n                success: true,\n                translation,\n                message: action === 'add' ? 'Traducción agregada' : 'Traducción actualizada'\n            });\n        }\n        if (action === 'delete') {\n            await _lib_prisma__WEBPACK_IMPORTED_MODULE_3__.prisma.translation.delete({\n                where: {\n                    category_englishText: {\n                        category,\n                        englishText\n                    }\n                }\n            });\n            return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n                success: true,\n                message: 'Traducción eliminada'\n            });\n        }\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            error: 'Acción inválida'\n        }, {\n            status: 400\n        });\n    } catch (error) {\n        console.error('Error managing translation:', error);\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            error: 'Error interno del servidor'\n        }, {\n            status: 500\n        });\n    }\n}\nasync function PUT(request) {\n    try {\n        const session = await (0,next_auth__WEBPACK_IMPORTED_MODULE_1__.getServerSession)(_lib_auth__WEBPACK_IMPORTED_MODULE_2__.authOptions);\n        if (!session || session.user.role !== 'ADMIN') {\n            return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n                error: 'No autorizado'\n            }, {\n                status: 401\n            });\n        }\n        const body = await request.json();\n        const { translations } = body;\n        if (!translations || !Array.isArray(translations)) {\n            return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n                error: 'Debe proporcionar un array de traducciones'\n            }, {\n                status: 400\n            });\n        }\n        // Bulk update translations\n        const results = [];\n        for (const translation of translations){\n            const { category, englishText, spanishText } = translation;\n            if (!category || !englishText || !spanishText) {\n                continue;\n            }\n            const result = await _lib_prisma__WEBPACK_IMPORTED_MODULE_3__.prisma.translation.upsert({\n                where: {\n                    category_englishText: {\n                        category,\n                        englishText\n                    }\n                },\n                update: {\n                    spanishText,\n                    updatedAt: new Date()\n                },\n                create: {\n                    category,\n                    englishText,\n                    spanishText\n                }\n            });\n            results.push(result);\n        }\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            success: true,\n            updated: results.length,\n            message: `${results.length} traducciones actualizadas`\n        });\n    } catch (error) {\n        console.error('Error bulk updating translations:', error);\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            error: 'Error interno del servidor'\n        }, {\n            status: 500\n        });\n    }\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9hcHAvYXBpL3RyYW5zbGF0aW9ucy9tYW5hZ2Uvcm91dGUudHMiLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFBdUQ7QUFDWDtBQUNKO0FBQ0g7QUFFOUIsZUFBZUksSUFBSUMsT0FBb0I7SUFDNUMsSUFBSTtRQUNGLE1BQU1DLFVBQVUsTUFBTUwsMkRBQWdCQSxDQUFDQyxrREFBV0E7UUFFbEQsSUFBSSxDQUFDSSxXQUFXQSxRQUFRQyxJQUFJLENBQUNDLElBQUksS0FBSyxTQUFTO1lBQzdDLE9BQU9SLHFEQUFZQSxDQUFDUyxJQUFJLENBQUM7Z0JBQUVDLE9BQU87WUFBZ0IsR0FBRztnQkFBRUMsUUFBUTtZQUFJO1FBQ3JFO1FBRUEsTUFBTSxFQUFFQyxZQUFZLEVBQUUsR0FBRyxJQUFJQyxJQUFJUixRQUFRUyxHQUFHO1FBQzVDLE1BQU1DLFdBQVdILGFBQWFJLEdBQUcsQ0FBQztRQUVsQyxxQ0FBcUM7UUFDckMsTUFBTUMsUUFBUUYsV0FBVztZQUFFQTtRQUFTLElBQUksQ0FBQztRQUN6QyxNQUFNRyxlQUFlLE1BQU1mLCtDQUFNQSxDQUFDZ0IsV0FBVyxDQUFDQyxRQUFRLENBQUM7WUFDckRIO1lBQ0FJLFNBQVM7Z0JBQ1A7b0JBQUVOLFVBQVU7Z0JBQU07Z0JBQ2xCO29CQUFFTyxhQUFhO2dCQUFNO2FBQ3RCO1FBQ0g7UUFFQSxvQkFBb0I7UUFDcEIsTUFBTUMsc0JBQXNCTCxhQUFhTSxNQUFNLENBQUMsQ0FBQ0MsS0FBS047WUFDcEQsSUFBSSxDQUFDTSxHQUFHLENBQUNOLFlBQVlKLFFBQVEsQ0FBQyxFQUFFO2dCQUM5QlUsR0FBRyxDQUFDTixZQUFZSixRQUFRLENBQUMsR0FBRyxDQUFDO1lBQy9CO1lBQ0FVLEdBQUcsQ0FBQ04sWUFBWUosUUFBUSxDQUFDLENBQUNJLFlBQVlHLFdBQVcsQ0FBQyxHQUFHSCxZQUFZTyxXQUFXO1lBQzVFLE9BQU9EO1FBQ1QsR0FBRyxDQUFDO1FBRUosT0FBT3pCLHFEQUFZQSxDQUFDUyxJQUFJLENBQUM7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T2xCLHFEQUFZQSxDQUFDUyxJQUFJLENBQUM7Z0JBQUVDLE9BQU87WUFBNkMsR0FBRztnQkFBRUMsUUFBUTtZQUFJO1FBQ2xHO1FBRUEsMkJBQTJCO1FBQzNCLE1BQU1nQyxVQUFVLEVBQUU7UUFDbEIsS0FBSyxNQUFNeEIsZUFBZUQsYUFBYztZQUN0QyxNQUFNLEVBQUVILFFBQVEsRUFBRU8sV0FBVyxFQUFFSSxXQUFXLEVBQUUsR0FBR1A7WUFFL0MsSUFBSSxDQUFDSixZQUFZLENBQUNPLGVBQWUsQ0FBQ0ksYUFBYTtnQkFDN0M7WUFDRjtZQUVBLE1BQU1rQixTQUFTLE1BQU16QywrQ0FBTUEsQ0FBQ2dCLFdBQVcsQ0FBQ2EsTUFBTSxDQUFDO2dCQUM3Q2YsT0FBTztvQkFDTGdCLHNCQUFzQjt3QkFDcEJsQjt3QkFDQU87b0JBQ0Y7Z0JBQ0Y7Z0JBQ0FZLFFBQVE7b0JBQ05SO29CQUNBUyxXQUFXLElBQUlDO2dCQUNqQjtnQkFDQUMsUUFBUTtvQkFDTnRCO29CQUNBTztvQkFDQUk7Z0JBQ0Y7WUFDRjtZQUVBaUIsUUFBUUUsSUFBSSxDQUFDRDtRQUNmO1FBRUEsT0FBTzVDLHFEQUFZQSxDQUFDUyxJQUFJLENBQUM7WUFDdkJrQixTQUFTO1lBQ1RtQixTQUFTSCxRQUFRSSxNQUFNO1lBQ3ZCVCxTQUFTLEdBQUdLLFFBQVFJLE1BQU0sQ0FBQywwQkFBMEIsQ0FBQztRQUN4RDtJQUNGLEVBQUUsT0FBT3JDLE9BQU87UUFDZGtCLFFBQVFsQixLQUFLLENBQUMscUNBQXFDQTtRQUNuRCxPQUFPVixxREFBWUEsQ0FBQ1MsSUFBSSxDQUFDO1lBQUVDLE9BQU87UUFBNkIsR0FBRztZQUFFQyxRQUFRO1FBQUk7SUFDbEY7QUFDRiIsInNvdXJjZXMiOlsiL1VzZXJzL3BhdWxvL0RvY3VtZW50cy9Qcm95ZWN0b3MvQ2xpZW50ZXMvQmxvb20gTWFyYmVsbGEvYmxvb21tYXJiZWxsYS1uZXh0anMvYXBwL2FwaS90cmFuc2xhdGlvbnMvbWFuYWdlL3JvdXRlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IE5leHRSZXF1ZXN0LCBOZXh0UmVzcG9uc2UgfSBmcm9tICduZXh0L3NlcnZlcidcbmltcG9ydCB7IGdldFNlcnZlclNlc3Npb24gfSBmcm9tICduZXh0LWF1dGgnXG5pbXBvcnQgeyBhdXRoT3B0aW9ucyB9IGZyb20gJ0AvbGliL2F1dGgnXG5pbXBvcnQgeyBwcmlzbWEgfSBmcm9tICdAL2xpYi9wcmlzbWEnXG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBHRVQocmVxdWVzdDogTmV4dFJlcXVlc3QpIHtcbiAgdHJ5IHtcbiAgICBjb25zdCBzZXNzaW9uID0gYXdhaXQgZ2V0U2VydmVyU2Vzc2lvbihhdXRoT3B0aW9ucylcbiAgICBcbiAgICBpZiAoIXNlc3Npb24gfHwgc2Vzc2lvbi51c2VyLnJvbGUgIT09ICdBRE1JTicpIHtcbiAgICAgIHJldHVybiBOZXh0UmVzcG9uc2UuanNvbih7IGVycm9yOiAnTm8gYXV0b3JpemFkbycgfSwgeyBzdGF0dXM6IDQwMSB9KVxuICAgIH1cblxuICAgIGNvbnN0IHsgc2VhcmNoUGFyYW1zIH0gPSBuZXcgVVJMKHJlcXVlc3QudXJsKVxuICAgIGNvbnN0IGNhdGVnb3J5ID0gc2VhcmNoUGFyYW1zLmdldCgnY2F0ZWdvcnknKVxuXG4gICAgLy8gR2V0IGFsbCB0cmFuc2xhdGlvbnMgZnJvbSBkYXRhYmFzZVxuICAgIGNvbnN0IHdoZXJlID0gY2F0ZWdvcnkgPyB7IGNhdGVnb3J5IH0gOiB7fVxuICAgIGNvbnN0IHRyYW5zbGF0aW9ucyA9IGF3YWl0IHByaXNtYS50cmFuc2xhdGlvbi5maW5kTWFueSh7XG4gICAgICB3aGVyZSxcbiAgICAgIG9yZGVyQnk6IFtcbiAgICAgICAgeyBjYXRlZ29yeTogJ2FzYycgfSxcbiAgICAgICAgeyBlbmdsaXNoVGV4dDogJ2FzYycgfVxuICAgICAgXVxuICAgIH0pXG5cbiAgICAvLyBHcm91cCBieSBjYXRlZ29yeVxuICAgIGNvbnN0IGdyb3VwZWRUcmFuc2xhdGlvbnMgPSB0cmFuc2xhdGlvbnMucmVkdWNlKChhY2MsIHRyYW5zbGF0aW9uKSA9PiB7XG4gICAgICBpZiAoIWFjY1t0cmFuc2xhdGlvbi5jYXRlZ29yeV0pIHtcbiAgICAgICAgYWNjW3RyYW5zbGF0aW9uLmNhdGVnb3J5XSA9IHt9XG4gICAgICB9XG4gICAgICBhY2NbdHJhbnNsYXRpb24uY2F0ZWdvcnldW3RyYW5zbGF0aW9uLmVuZ2xpc2hUZXh0XSA9IHRyYW5zbGF0aW9uLnNwYW5pc2hUZXh0XG4gICAgICByZXR1cm4gYWNjXG4gICAgfSwge30gYXMgUmVjb3JkPHN0cmluZywgUmVjb3JkPHN0cmluZywgc3RyaW5nPj4pXG5cbiAgICByZXR1cm4gTmV4dFJlc3BvbnNlLmpzb24oe1xuICAgICAgc3VjY2VzczogdHJ1ZSxcbiAgICAgIHRyYW5zbGF0aW9uczogZ3JvdXBlZFRyYW5zbGF0aW9uc1xuICAgIH0pXG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgY29uc29sZS5lcnJvcignRXJyb3IgZ2V0dGluZyB0cmFuc2xhdGlvbnM6JywgZXJyb3IpXG4gICAgcmV0dXJuIE5leHRSZXNwb25zZS5qc29uKHsgZXJyb3I6ICdFcnJvciBpbnRlcm5vIGRlbCBzZXJ2aWRvcicgfSwgeyBzdGF0dXM6IDUwMCB9KVxuICB9XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBQT1NUKHJlcXVlc3Q6IE5leHRSZXF1ZXN0KSB7XG4gIHRyeSB7XG4gICAgY29uc3Qgc2Vzc2lvbiA9IGF3YWl0IGdldFNlcnZlclNlc3Npb24oYXV0aE9wdGlvbnMpXG4gICAgXG4gICAgaWYgKCFzZXNzaW9uIHx8IHNlc3Npb24udXNlci5yb2xlICE9PSAnQURNSU4nKSB7XG4gICAgICByZXR1cm4gTmV4dFJlc3BvbnNlLmpzb24oeyBlcnJvcjogJ05vIGF1dG9yaXphZG8nIH0sIHsgc3RhdHVzOiA0MDEgfSlcbiAgICB9XG5cbiAgICBjb25zdCBib2R5ID0gYXdhaXQgcmVxdWVzdC5qc29uKClcbiAgICBjb25zdCB7IGNhdGVnb3J5LCBlbmdsaXNoVGV4dCwgc3BhbmlzaFRleHQsIGFjdGlvbiB9ID0gYm9keVxuXG4gICAgaWYgKCFjYXRlZ29yeSB8fCAhZW5nbGlzaFRleHQpIHtcbiAgICAgIHJldHVybiBOZXh0UmVzcG9uc2UuanNvbih7IGVycm9yOiAnQ2F0ZWdvcsOtYSB5IHRleHRvIGVuIGluZ2zDqXMgc29uIHJlcXVlcmlkb3MnIH0sIHsgc3RhdHVzOiA0MDAgfSlcbiAgICB9XG5cbiAgICBpZiAoYWN0aW9uID09PSAnYWRkJyB8fCBhY3Rpb24gPT09ICd1cGRhdGUnKSB7XG4gICAgICBpZiAoIXNwYW5pc2hUZXh0KSB7XG4gICAgICAgIHJldHVybiBOZXh0UmVzcG9uc2UuanNvbih7IGVycm9yOiAnVGV4dG8gZW4gZXNwYcOxb2wgZXMgcmVxdWVyaWRvJyB9LCB7IHN0YXR1czogNDAwIH0pXG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHRyYW5zbGF0aW9uID0gYXdhaXQgcHJpc21hLnRyYW5zbGF0aW9uLnVwc2VydCh7XG4gICAgICAgIHdoZXJlOiB7XG4gICAgICAgICAgY2F0ZWdvcnlfZW5nbGlzaFRleHQ6IHtcbiAgICAgICAgICAgIGNhdGVnb3J5LFxuICAgICAgICAgICAgZW5nbGlzaFRleHRcbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIHVwZGF0ZToge1xuICAgICAgICAgIHNwYW5pc2hUZXh0LFxuICAgICAgICAgIHVwZGF0ZWRBdDogbmV3IERhdGUoKVxuICAgICAgICB9LFxuICAgICAgICBjcmVhdGU6IHtcbiAgICAgICAgICBjYXRlZ29yeSxcbiAgICAgICAgICBlbmdsaXNoVGV4dCxcbiAgICAgICAgICBzcGFuaXNoVGV4dFxuICAgICAgICB9XG4gICAgICB9KVxuXG4gICAgICByZXR1cm4gTmV4dFJlc3BvbnNlLmpzb24oe1xuICAgICAgICBzdWNjZXNzOiB0cnVlLFxuICAgICAgICB0cmFuc2xhdGlvbixcbiAgICAgICAgbWVzc2FnZTogYWN0aW9uID09PSAnYWRkJyA/ICdUcmFkdWNjacOzbiBhZ3JlZ2FkYScgOiAnVHJhZHVjY2nDs24gYWN0dWFsaXphZGEnXG4gICAgICB9KVxuICAgIH1cblxuICAgIGlmIChhY3Rpb24gPT09ICdkZWxldGUnKSB7XG4gICAgICBhd2FpdCBwcmlzbWEudHJhbnNsYXRpb24uZGVsZXRlKHtcbiAgICAgICAgd2hlcmU6IHtcbiAgICAgICAgICBjYXRlZ29yeV9lbmdsaXNoVGV4dDoge1xuICAgICAgICAgICAgY2F0ZWdvcnksXG4gICAgICAgICAgICBlbmdsaXNoVGV4dFxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSlcblxuICAgICAgcmV0dXJuIE5leHRSZXNwb25zZS5qc29uKHtcbiAgICAgICAgc3VjY2VzczogdHJ1ZSxcbiAgICAgICAgbWVzc2FnZTogJ1RyYWR1Y2Npw7NuIGVsaW1pbmFkYSdcbiAgICAgIH0pXG4gICAgfVxuXG4gICAgcmV0dXJuIE5leHRSZXNwb25zZS5qc29uKHsgZXJyb3I6ICdBY2Npw7NuIGludsOhbGlkYScgfSwgeyBzdGF0dXM6IDQwMCB9KVxuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIG1hbmFnaW5nIHRyYW5zbGF0aW9uOicsIGVycm9yKVxuICAgIHJldHVybiBOZXh0UmVzcG9uc2UuanNvbih7IGVycm9yOiAnRXJyb3IgaW50ZXJubyBkZWwgc2Vydmlkb3InIH0sIHsgc3RhdHVzOiA1MDAgfSlcbiAgfVxufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gUFVUKHJlcXVlc3Q6IE5leHRSZXF1ZXN0KSB7XG4gIHRyeSB7XG4gICAgY29uc3Qgc2Vzc2lvbiA9IGF3YWl0IGdldFNlcnZlclNlc3Npb24oYXV0aE9wdGlvbnMpXG4gICAgXG4gICAgaWYgKCFzZXNzaW9uIHx8IHNlc3Npb24udXNlci5yb2xlICE9PSAnQURNSU4nKSB7XG4gICAgICByZXR1cm4gTmV4dFJlc3BvbnNlLmpzb24oeyBlcnJvcjogJ05vIGF1dG9yaXphZG8nIH0sIHsgc3RhdHVzOiA0MDEgfSlcbiAgICB9XG5cbiAgICBjb25zdCBib2R5ID0gYXdhaXQgcmVxdWVzdC5qc29uKClcbiAgICBjb25zdCB7IHRyYW5zbGF0aW9ucyB9ID0gYm9keVxuXG4gICAgaWYgKCF0cmFuc2xhdGlvbnMgfHwgIUFycmF5LmlzQXJyYXkodHJhbnNsYXRpb25zKSkge1xuICAgICAgcmV0dXJuIE5leHRSZXNwb25zZS5qc29uKHsgZXJyb3I6ICdEZWJlIHByb3BvcmNpb25hciB1biBhcnJheSBkZSB0cmFkdWNjaW9uZXMnIH0sIHsgc3RhdHVzOiA0MDAgfSlcbiAgICB9XG5cbiAgICAvLyBCdWxrIHVwZGF0ZSB0cmFuc2xhdGlvbnNcbiAgICBjb25zdCByZXN1bHRzID0gW11cbiAgICBmb3IgKGNvbnN0IHRyYW5zbGF0aW9uIG9mIHRyYW5zbGF0aW9ucykge1xuICAgICAgY29uc3QgeyBjYXRlZ29yeSwgZW5nbGlzaFRleHQsIHNwYW5pc2hUZXh0IH0gPSB0cmFuc2xhdGlvblxuICAgICAgXG4gICAgICBpZiAoIWNhdGVnb3J5IHx8ICFlbmdsaXNoVGV4dCB8fCAhc3BhbmlzaFRleHQpIHtcbiAgICAgICAgY29udGludWVcbiAgICAgIH1cblxuICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgcHJpc21hLnRyYW5zbGF0aW9uLnVwc2VydCh7XG4gICAgICAgIHdoZXJlOiB7XG4gICAgICAgICAgY2F0ZWdvcnlfZW5nbGlzaFRleHQ6IHtcbiAgICAgICAgICAgIGNhdGVnb3J5LFxuICAgICAgICAgICAgZW5nbGlzaFRleHRcbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIHVwZGF0ZToge1xuICAgICAgICAgIHNwYW5pc2hUZXh0LFxuICAgICAgICAgIHVwZGF0ZWRBdDogbmV3IERhdGUoKVxuICAgICAgICB9LFxuICAgICAgICBjcmVhdGU6IHtcbiAgICAgICAgICBjYXRlZ29yeSxcbiAgICAgICAgICBlbmdsaXNoVGV4dCxcbiAgICAgICAgICBzcGFuaXNoVGV4dFxuICAgICAgICB9XG4gICAgICB9KVxuXG4gICAgICByZXN1bHRzLnB1c2gocmVzdWx0KVxuICAgIH1cblxuICAgIHJldHVybiBOZXh0UmVzcG9uc2UuanNvbih7XG4gICAgICBzdWNjZXNzOiB0cnVlLFxuICAgICAgdXBkYXRlZDogcmVzdWx0cy5sZW5ndGgsXG4gICAgICBtZXNzYWdlOiBgJHtyZXN1bHRzLmxlbmd0aH0gdHJhZHVjY2lvbmVzIGFjdHVhbGl6YWRhc2BcbiAgICB9KVxuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGJ1bGsgdXBkYXRpbmcgdHJhbnNsYXRpb25zOicsIGVycm9yKVxuICAgIHJldHVybiBOZXh0UmVzcG9uc2UuanNvbih7IGVycm9yOiAnRXJyb3IgaW50ZXJubyBkZWwgc2Vydmlkb3InIH0sIHsgc3RhdHVzOiA1MDAgfSlcbiAgfVxufSJdLCJuYW1lcyI6WyJOZXh0UmVzcG9uc2UiLCJnZXRTZXJ2ZXJTZXNzaW9uIiwiYXV0aE9wdGlvbnMiLCJwcmlzbWEiLCJHRVQiLCJyZXF1ZXN0Iiwic2Vzc2lvbiIsInVzZXIiLCJyb2xlIiwianNvbiIsImVycm9yIiwic3RhdHVzIiwic2VhcmNoUGFyYW1zIiwiVVJMIiwidXJsIiwiY2F0ZWdvcnkiLCJnZXQiLCJ3aGVyZSIsInRyYW5zbGF0aW9ucyIsInRyYW5zbGF0aW9uIiwiZmluZE1hbnkiLCJvcmRlckJ5IiwiZW5nbGlzaFRleHQiLCJncm91cGVkVHJhbnNsYXRpb25zIiwicmVkdWNlIiwiYWNjIiwic3BhbmlzaFRleHQiLCJzdWNjZXNzIiwiY29uc29sZSIsIlBPU1QiLCJib2R5IiwiYWN0aW9uIiwidXBzZXJ0IiwiY2F0ZWdvcnlfZW5nbGlzaFRleHQiLCJ1cGRhdGUiLCJ1cGRhdGVkQXQiLCJEYXRlIiwiY3JlYXRlIiwibWVzc2FnZSIsImRlbGV0ZSIsIlBVVCIsIkFycmF5IiwiaXNBcnJheSIsInJlc3VsdHMiLCJyZXN1bHQiLCJwdXNoIiwidXBkYXRlZCIsImxlbmd0aCJdLCJpZ25vcmVMaXN0IjpbXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(rsc)/./app/api/translations/manage/route.ts\n");

/***/ }),

/***/ "(rsc)/./lib/auth.ts":
/*!*********************!*\
  !*** ./lib/auth.ts ***!
  \*********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   authOptions: () => (/* binding */ authOptions)\n/* harmony export */ });\n/* harmony import */ var next_auth_providers_credentials__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next-auth/providers/credentials */ \"(rsc)/./node_modules/next-auth/providers/credentials.js\");\n/* harmony import */ var _auth_prisma_adapter__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @auth/prisma-adapter */ \"(rsc)/./node_modules/@auth/prisma-adapter/index.js\");\n/* harmony import */ var bcryptjs__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! bcryptjs */ \"(rsc)/./node_modules/bcryptjs/index.js\");\n/* harmony import */ var _lib_prisma__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @/lib/prisma */ \"(rsc)/./lib/prisma.ts\");\n\n\n\n\nconst authOptions = {\n    adapter: (0,_auth_prisma_adapter__WEBPACK_IMPORTED_MODULE_1__.PrismaAdapter)(_lib_prisma__WEBPACK_IMPORTED_MODULE_3__.prisma),\n    session: {\n        strategy: 'jwt'\n    },\n    providers: [\n        (0,next_auth_providers_credentials__WEBPACK_IMPORTED_MODULE_0__[\"default\"])({\n            name: 'credentials',\n            credentials: {\n                email: {\n                    label: 'Email',\n                    type: 'email'\n                },\n                password: {\n                    label: 'Password',\n                    type: 'password'\n                }\n            },\n            async authorize (credentials) {\n                if (!credentials?.email || !credentials?.password) {\n                    throw new Error('Invalid credentials');\n                }\n                const user = await _lib_prisma__WEBPACK_IMPORTED_MODULE_3__.prisma.user.findUnique({\n                    where: {\n                        email: credentials.email\n                    }\n                });\n                if (!user || !user.password) {\n                    throw new Error('User not found');\n                }\n                const isPasswordValid = await (0,bcryptjs__WEBPACK_IMPORTED_MODULE_2__.compare)(credentials.password, user.password);\n                if (!isPasswordValid) {\n                    throw new Error('Invalid password');\n                }\n                if (!user.isActive) {\n                    throw new Error('User account is deactivated');\n                }\n                return {\n                    id: user.id,\n                    email: user.email,\n                    name: user.name,\n                    role: user.role\n                };\n            }\n        })\n    ],\n    callbacks: {\n        async session ({ token, session }) {\n            if (token) {\n                session.user.id = token.id;\n                session.user.name = token.name;\n                session.user.email = token.email;\n                session.user.role = token.role;\n            }\n            return session;\n        },\n        async jwt ({ token, user }) {\n            if (user) {\n                token.id = user.id;\n                token.email = user.email;\n                token.name = user.name;\n                token.role = user.role;\n            }\n            return token;\n        }\n    },\n    pages: {\n        signIn: '/auth/login',\n        signOut: '/auth/logout',\n        error: '/auth/error'\n    },\n    secret: process.env.NEXTAUTH_SECRET\n};\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9saWIvYXV0aC50cyIsIm1hcHBpbmdzIjoiOzs7Ozs7OztBQUNpRTtBQUNiO0FBQ2xCO0FBQ0c7QUFFOUIsTUFBTUksY0FBK0I7SUFDMUNDLFNBQVNKLG1FQUFhQSxDQUFDRSwrQ0FBTUE7SUFDN0JHLFNBQVM7UUFDUEMsVUFBVTtJQUNaO0lBQ0FDLFdBQVc7UUFDVFIsMkVBQW1CQSxDQUFDO1lBQ2xCUyxNQUFNO1lBQ05DLGFBQWE7Z0JBQ1hDLE9BQU87b0JBQUVDLE9BQU87b0JBQVNDLE1BQU07Z0JBQVE7Z0JBQ3ZDQyxVQUFVO29CQUFFRixPQUFPO29CQUFZQyxNQUFNO2dCQUFXO1lBQ2xEO1lBQ0EsTUFBTUUsV0FBVUwsV0FBVztnQkFDekIsSUFBSSxDQUFDQSxhQUFhQyxTQUFTLENBQUNELGFBQWFJLFVBQVU7b0JBQ2pELE1BQU0sSUFBSUUsTUFBTTtnQkFDbEI7Z0JBRUEsTUFBTUMsT0FBTyxNQUFNZCwrQ0FBTUEsQ0FBQ2MsSUFBSSxDQUFDQyxVQUFVLENBQUM7b0JBQ3hDQyxPQUFPO3dCQUNMUixPQUFPRCxZQUFZQyxLQUFLO29CQUMxQjtnQkFDRjtnQkFFQSxJQUFJLENBQUNNLFFBQVEsQ0FBQ0EsS0FBS0gsUUFBUSxFQUFFO29CQUMzQixNQUFNLElBQUlFLE1BQU07Z0JBQ2xCO2dCQUVBLE1BQU1JLGtCQUFrQixNQUFNbEIsaURBQU9BLENBQUNRLFlBQVlJLFFBQVEsRUFBRUcsS0FBS0gsUUFBUTtnQkFFekUsSUFBSSxDQUFDTSxpQkFBaUI7b0JBQ3BCLE1BQU0sSUFBSUosTUFBTTtnQkFDbEI7Z0JBRUEsSUFBSSxDQUFDQyxLQUFLSSxRQUFRLEVBQUU7b0JBQ2xCLE1BQU0sSUFBSUwsTUFBTTtnQkFDbEI7Z0JBRUEsT0FBTztvQkFDTE0sSUFBSUwsS0FBS0ssRUFBRTtvQkFDWFgsT0FBT00sS0FBS04sS0FBSztvQkFDakJGLE1BQU1RLEtBQUtSLElBQUk7b0JBQ2ZjLE1BQU1OLEtBQUtNLElBQUk7Z0JBQ2pCO1lBQ0Y7UUFDRjtLQUNEO0lBQ0RDLFdBQVc7UUFDVCxNQUFNbEIsU0FBUSxFQUFFbUIsS0FBSyxFQUFFbkIsT0FBTyxFQUFFO1lBQzlCLElBQUltQixPQUFPO2dCQUNUbkIsUUFBUVcsSUFBSSxDQUFDSyxFQUFFLEdBQUdHLE1BQU1ILEVBQUU7Z0JBQzFCaEIsUUFBUVcsSUFBSSxDQUFDUixJQUFJLEdBQUdnQixNQUFNaEIsSUFBSTtnQkFDOUJILFFBQVFXLElBQUksQ0FBQ04sS0FBSyxHQUFHYyxNQUFNZCxLQUFLO2dCQUNoQ0wsUUFBUVcsSUFBSSxDQUFDTSxJQUFJLEdBQUdFLE1BQU1GLElBQUk7WUFDaEM7WUFDQSxPQUFPakI7UUFDVDtRQUNBLE1BQU1vQixLQUFJLEVBQUVELEtBQUssRUFBRVIsSUFBSSxFQUFFO1lBQ3ZCLElBQUlBLE1BQU07Z0JBQ1JRLE1BQU1ILEVBQUUsR0FBR0wsS0FBS0ssRUFBRTtnQkFDbEJHLE1BQU1kLEtBQUssR0FBR00sS0FBS04sS0FBSztnQkFDeEJjLE1BQU1oQixJQUFJLEdBQUdRLEtBQUtSLElBQUk7Z0JBQ3RCZ0IsTUFBTUYsSUFBSSxHQUFHTixLQUFLTSxJQUFJO1lBQ3hCO1lBQ0EsT0FBT0U7UUFDVDtJQUNGO0lBQ0FFLE9BQU87UUFDTEMsUUFBUTtRQUNSQyxTQUFTO1FBQ1RDLE9BQU87SUFDVDtJQUNBQyxRQUFRQyxRQUFRQyxHQUFHLENBQUNDLGVBQWU7QUFDckMsRUFBQyIsInNvdXJjZXMiOlsiL1VzZXJzL3BhdWxvL0RvY3VtZW50cy9Qcm95ZWN0b3MvQ2xpZW50ZXMvQmxvb20gTWFyYmVsbGEvYmxvb21tYXJiZWxsYS1uZXh0anMvbGliL2F1dGgudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgTmV4dEF1dGhPcHRpb25zIH0gZnJvbSAnbmV4dC1hdXRoJ1xuaW1wb3J0IENyZWRlbnRpYWxzUHJvdmlkZXIgZnJvbSAnbmV4dC1hdXRoL3Byb3ZpZGVycy9jcmVkZW50aWFscydcbmltcG9ydCB7IFByaXNtYUFkYXB0ZXIgfSBmcm9tICdAYXV0aC9wcmlzbWEtYWRhcHRlcidcbmltcG9ydCB7IGNvbXBhcmUgfSBmcm9tICdiY3J5cHRqcydcbmltcG9ydCB7IHByaXNtYSB9IGZyb20gJ0AvbGliL3ByaXNtYSdcblxuZXhwb3J0IGNvbnN0IGF1dGhPcHRpb25zOiBOZXh0QXV0aE9wdGlvbnMgPSB7XG4gIGFkYXB0ZXI6IFByaXNtYUFkYXB0ZXIocHJpc21hKSBhcyBhbnksXG4gIHNlc3Npb246IHtcbiAgICBzdHJhdGVneTogJ2p3dCcsXG4gIH0sXG4gIHByb3ZpZGVyczogW1xuICAgIENyZWRlbnRpYWxzUHJvdmlkZXIoe1xuICAgICAgbmFtZTogJ2NyZWRlbnRpYWxzJyxcbiAgICAgIGNyZWRlbnRpYWxzOiB7XG4gICAgICAgIGVtYWlsOiB7IGxhYmVsOiAnRW1haWwnLCB0eXBlOiAnZW1haWwnIH0sXG4gICAgICAgIHBhc3N3b3JkOiB7IGxhYmVsOiAnUGFzc3dvcmQnLCB0eXBlOiAncGFzc3dvcmQnIH0sXG4gICAgICB9LFxuICAgICAgYXN5bmMgYXV0aG9yaXplKGNyZWRlbnRpYWxzKSB7XG4gICAgICAgIGlmICghY3JlZGVudGlhbHM/LmVtYWlsIHx8ICFjcmVkZW50aWFscz8ucGFzc3dvcmQpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgY3JlZGVudGlhbHMnKVxuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgdXNlciA9IGF3YWl0IHByaXNtYS51c2VyLmZpbmRVbmlxdWUoe1xuICAgICAgICAgIHdoZXJlOiB7XG4gICAgICAgICAgICBlbWFpbDogY3JlZGVudGlhbHMuZW1haWwsXG4gICAgICAgICAgfSxcbiAgICAgICAgfSlcblxuICAgICAgICBpZiAoIXVzZXIgfHwgIXVzZXIucGFzc3dvcmQpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1VzZXIgbm90IGZvdW5kJylcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGlzUGFzc3dvcmRWYWxpZCA9IGF3YWl0IGNvbXBhcmUoY3JlZGVudGlhbHMucGFzc3dvcmQsIHVzZXIucGFzc3dvcmQpXG5cbiAgICAgICAgaWYgKCFpc1Bhc3N3b3JkVmFsaWQpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgcGFzc3dvcmQnKVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCF1c2VyLmlzQWN0aXZlKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdVc2VyIGFjY291bnQgaXMgZGVhY3RpdmF0ZWQnKVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBpZDogdXNlci5pZCxcbiAgICAgICAgICBlbWFpbDogdXNlci5lbWFpbCxcbiAgICAgICAgICBuYW1lOiB1c2VyLm5hbWUsXG4gICAgICAgICAgcm9sZTogdXNlci5yb2xlLFxuICAgICAgICB9XG4gICAgICB9LFxuICAgIH0pLFxuICBdLFxuICBjYWxsYmFja3M6IHtcbiAgICBhc3luYyBzZXNzaW9uKHsgdG9rZW4sIHNlc3Npb24gfSkge1xuICAgICAgaWYgKHRva2VuKSB7XG4gICAgICAgIHNlc3Npb24udXNlci5pZCA9IHRva2VuLmlkXG4gICAgICAgIHNlc3Npb24udXNlci5uYW1lID0gdG9rZW4ubmFtZVxuICAgICAgICBzZXNzaW9uLnVzZXIuZW1haWwgPSB0b2tlbi5lbWFpbFxuICAgICAgICBzZXNzaW9uLnVzZXIucm9sZSA9IHRva2VuLnJvbGVcbiAgICAgIH1cbiAgICAgIHJldHVybiBzZXNzaW9uXG4gICAgfSxcbiAgICBhc3luYyBqd3QoeyB0b2tlbiwgdXNlciB9KSB7XG4gICAgICBpZiAodXNlcikge1xuICAgICAgICB0b2tlbi5pZCA9IHVzZXIuaWRcbiAgICAgICAgdG9rZW4uZW1haWwgPSB1c2VyLmVtYWlsXG4gICAgICAgIHRva2VuLm5hbWUgPSB1c2VyLm5hbWVcbiAgICAgICAgdG9rZW4ucm9sZSA9IHVzZXIucm9sZVxuICAgICAgfVxuICAgICAgcmV0dXJuIHRva2VuXG4gICAgfSxcbiAgfSxcbiAgcGFnZXM6IHtcbiAgICBzaWduSW46ICcvYXV0aC9sb2dpbicsXG4gICAgc2lnbk91dDogJy9hdXRoL2xvZ291dCcsXG4gICAgZXJyb3I6ICcvYXV0aC9lcnJvcicsXG4gIH0sXG4gIHNlY3JldDogcHJvY2Vzcy5lbnYuTkVYVEFVVEhfU0VDUkVULFxufSJdLCJuYW1lcyI6WyJDcmVkZW50aWFsc1Byb3ZpZGVyIiwiUHJpc21hQWRhcHRlciIsImNvbXBhcmUiLCJwcmlzbWEiLCJhdXRoT3B0aW9ucyIsImFkYXB0ZXIiLCJzZXNzaW9uIiwic3RyYXRlZ3kiLCJwcm92aWRlcnMiLCJuYW1lIiwiY3JlZGVudGlhbHMiLCJlbWFpbCIsImxhYmVsIiwidHlwZSIsInBhc3N3b3JkIiwiYXV0aG9yaXplIiwiRXJyb3IiLCJ1c2VyIiwiZmluZFVuaXF1ZSIsIndoZXJlIiwiaXNQYXNzd29yZFZhbGlkIiwiaXNBY3RpdmUiLCJpZCIsInJvbGUiLCJjYWxsYmFja3MiLCJ0b2tlbiIsImp3dCIsInBhZ2VzIiwic2lnbkluIiwic2lnbk91dCIsImVycm9yIiwic2VjcmV0IiwicHJvY2VzcyIsImVudiIsIk5FWFRBVVRIX1NFQ1JFVCJdLCJpZ25vcmVMaXN0IjpbXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(rsc)/./lib/auth.ts\n");

/***/ }),

/***/ "(rsc)/./lib/prisma.ts":
/*!***********************!*\
  !*** ./lib/prisma.ts ***!
  \***********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   prisma: () => (/* binding */ prisma)\n/* harmony export */ });\n/* harmony import */ var _prisma_client__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @prisma/client */ \"@prisma/client\");\n/* harmony import */ var _prisma_client__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_prisma_client__WEBPACK_IMPORTED_MODULE_0__);\n\nconst globalForPrisma = globalThis;\nconst prisma = globalForPrisma.prisma ?? new _prisma_client__WEBPACK_IMPORTED_MODULE_0__.PrismaClient();\nif (true) globalForPrisma.prisma = prisma;\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9saWIvcHJpc21hLnRzIiwibWFwcGluZ3MiOiI7Ozs7OztBQUE2QztBQUU3QyxNQUFNQyxrQkFBa0JDO0FBSWpCLE1BQU1DLFNBQVNGLGdCQUFnQkUsTUFBTSxJQUFJLElBQUlILHdEQUFZQSxHQUFFO0FBRWxFLElBQUlJLElBQXFDLEVBQUVILGdCQUFnQkUsTUFBTSxHQUFHQSIsInNvdXJjZXMiOlsiL1VzZXJzL3BhdWxvL0RvY3VtZW50cy9Qcm95ZWN0b3MvQ2xpZW50ZXMvQmxvb20gTWFyYmVsbGEvYmxvb21tYXJiZWxsYS1uZXh0anMvbGliL3ByaXNtYS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBQcmlzbWFDbGllbnQgfSBmcm9tICdAcHJpc21hL2NsaWVudCdcblxuY29uc3QgZ2xvYmFsRm9yUHJpc21hID0gZ2xvYmFsVGhpcyBhcyB1bmtub3duIGFzIHtcbiAgcHJpc21hOiBQcmlzbWFDbGllbnQgfCB1bmRlZmluZWRcbn1cblxuZXhwb3J0IGNvbnN0IHByaXNtYSA9IGdsb2JhbEZvclByaXNtYS5wcmlzbWEgPz8gbmV3IFByaXNtYUNsaWVudCgpXG5cbmlmIChwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nKSBnbG9iYWxGb3JQcmlzbWEucHJpc21hID0gcHJpc21hIl0sIm5hbWVzIjpbIlByaXNtYUNsaWVudCIsImdsb2JhbEZvclByaXNtYSIsImdsb2JhbFRoaXMiLCJwcmlzbWEiLCJwcm9jZXNzIl0sImlnbm9yZUxpc3QiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./lib/prisma.ts\n");

/***/ }),

/***/ "(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Ftranslations%2Fmanage%2Froute&page=%2Fapi%2Ftranslations%2Fmanage%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Ftranslations%2Fmanage%2Froute.ts&appDir=%2FUsers%2Fpaulo%2FDocuments%2FProyectos%2FClientes%2FBloom%20Marbella%2Fbloommarbella-nextjs%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Fpaulo%2FDocuments%2FProyectos%2FClientes%2FBloom%20Marbella%2Fbloommarbella-nextjs&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!":
/*!*******************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Ftranslations%2Fmanage%2Froute&page=%2Fapi%2Ftranslations%2Fmanage%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Ftranslations%2Fmanage%2Froute.ts&appDir=%2FUsers%2Fpaulo%2FDocuments%2FProyectos%2FClientes%2FBloom%20Marbella%2Fbloommarbella-nextjs%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Fpaulo%2FDocuments%2FProyectos%2FClientes%2FBloom%20Marbella%2Fbloommarbella-nextjs&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D! ***!
  \*******************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   patchFetch: () => (/* binding */ patchFetch),\n/* harmony export */   routeModule: () => (/* binding */ routeModule),\n/* harmony export */   serverHooks: () => (/* binding */ serverHooks),\n/* harmony export */   workAsyncStorage: () => (/* binding */ workAsyncStorage),\n/* harmony export */   workUnitAsyncStorage: () => (/* binding */ workUnitAsyncStorage)\n/* harmony export */ });\n/* harmony import */ var next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/dist/server/route-modules/app-route/module.compiled */ \"(rsc)/./node_modules/next/dist/server/route-modules/app-route/module.compiled.js\");\n/* harmony import */ var next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_dist_server_route_kind__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/dist/server/route-kind */ \"(rsc)/./node_modules/next/dist/server/route-kind.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/dist/server/lib/patch-fetch */ \"(rsc)/./node_modules/next/dist/server/lib/patch-fetch.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var _Users_paulo_Documents_Proyectos_Clientes_Bloom_Marbella_bloommarbella_nextjs_app_api_translations_manage_route_ts__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./app/api/translations/manage/route.ts */ \"(rsc)/./app/api/translations/manage/route.ts\");\n\n\n\n\n// We inject the nextConfigOutput here so that we can use them in the route\n// module.\nconst nextConfigOutput = \"\"\nconst routeModule = new next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__.AppRouteRouteModule({\n    definition: {\n        kind: next_dist_server_route_kind__WEBPACK_IMPORTED_MODULE_1__.RouteKind.APP_ROUTE,\n        page: \"/api/translations/manage/route\",\n        pathname: \"/api/translations/manage\",\n        filename: \"route\",\n        bundlePath: \"app/api/translations/manage/route\"\n    },\n    resolvedPagePath: \"/Users/paulo/Documents/Proyectos/Clientes/Bloom Marbella/bloommarbella-nextjs/app/api/translations/manage/route.ts\",\n    nextConfigOutput,\n    userland: _Users_paulo_Documents_Proyectos_Clientes_Bloom_Marbella_bloommarbella_nextjs_app_api_translations_manage_route_ts__WEBPACK_IMPORTED_MODULE_3__\n});\n// Pull out the exports that we need to expose from the module. This should\n// be eliminated when we've moved the other routes to the new format. These\n// are used to hook into the route.\nconst { workAsyncStorage, workUnitAsyncStorage, serverHooks } = routeModule;\nfunction patchFetch() {\n    return (0,next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__.patchFetch)({\n        workAsyncStorage,\n        workUnitAsyncStorage\n    });\n}\n\n\n//# sourceMappingURL=app-route.js.map//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9ub2RlX21vZHVsZXMvbmV4dC9kaXN0L2J1aWxkL3dlYnBhY2svbG9hZGVycy9uZXh0LWFwcC1sb2FkZXIvaW5kZXguanM/bmFtZT1hcHAlMkZhcGklMkZ0cmFuc2xhdGlvbnMlMkZtYW5hZ2UlMkZyb3V0ZSZwYWdlPSUyRmFwaSUyRnRyYW5zbGF0aW9ucyUyRm1hbmFnZSUyRnJvdXRlJmFwcFBhdGhzPSZwYWdlUGF0aD1wcml2YXRlLW5leHQtYXBwLWRpciUyRmFwaSUyRnRyYW5zbGF0aW9ucyUyRm1hbmFnZSUyRnJvdXRlLnRzJmFwcERpcj0lMkZVc2VycyUyRnBhdWxvJTJGRG9jdW1lbnRzJTJGUHJveWVjdG9zJTJGQ2xpZW50ZXMlMkZCbG9vbSUyME1hcmJlbGxhJTJGYmxvb21tYXJiZWxsYS1uZXh0anMlMkZhcHAmcGFnZUV4dGVuc2lvbnM9dHN4JnBhZ2VFeHRlbnNpb25zPXRzJnBhZ2VFeHRlbnNpb25zPWpzeCZwYWdlRXh0ZW5zaW9ucz1qcyZyb290RGlyPSUyRlVzZXJzJTJGcGF1bG8lMkZEb2N1bWVudHMlMkZQcm95ZWN0b3MlMkZDbGllbnRlcyUyRkJsb29tJTIwTWFyYmVsbGElMkZibG9vbW1hcmJlbGxhLW5leHRqcyZpc0Rldj10cnVlJnRzY29uZmlnUGF0aD10c2NvbmZpZy5qc29uJmJhc2VQYXRoPSZhc3NldFByZWZpeD0mbmV4dENvbmZpZ091dHB1dD0mcHJlZmVycmVkUmVnaW9uPSZtaWRkbGV3YXJlQ29uZmlnPWUzMCUzRCEiLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7QUFBK0Y7QUFDdkM7QUFDcUI7QUFDa0U7QUFDL0k7QUFDQTtBQUNBO0FBQ0Esd0JBQXdCLHlHQUFtQjtBQUMzQztBQUNBLGNBQWMsa0VBQVM7QUFDdkI7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBLFlBQVk7QUFDWixDQUFDO0FBQ0Q7QUFDQTtBQUNBO0FBQ0EsUUFBUSxzREFBc0Q7QUFDOUQ7QUFDQSxXQUFXLDRFQUFXO0FBQ3RCO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDMEY7O0FBRTFGIiwic291cmNlcyI6WyIiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQXBwUm91dGVSb3V0ZU1vZHVsZSB9IGZyb20gXCJuZXh0L2Rpc3Qvc2VydmVyL3JvdXRlLW1vZHVsZXMvYXBwLXJvdXRlL21vZHVsZS5jb21waWxlZFwiO1xuaW1wb3J0IHsgUm91dGVLaW5kIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvcm91dGUta2luZFwiO1xuaW1wb3J0IHsgcGF0Y2hGZXRjaCBhcyBfcGF0Y2hGZXRjaCB9IGZyb20gXCJuZXh0L2Rpc3Qvc2VydmVyL2xpYi9wYXRjaC1mZXRjaFwiO1xuaW1wb3J0ICogYXMgdXNlcmxhbmQgZnJvbSBcIi9Vc2Vycy9wYXVsby9Eb2N1bWVudHMvUHJveWVjdG9zL0NsaWVudGVzL0Jsb29tIE1hcmJlbGxhL2Jsb29tbWFyYmVsbGEtbmV4dGpzL2FwcC9hcGkvdHJhbnNsYXRpb25zL21hbmFnZS9yb3V0ZS50c1wiO1xuLy8gV2UgaW5qZWN0IHRoZSBuZXh0Q29uZmlnT3V0cHV0IGhlcmUgc28gdGhhdCB3ZSBjYW4gdXNlIHRoZW0gaW4gdGhlIHJvdXRlXG4vLyBtb2R1bGUuXG5jb25zdCBuZXh0Q29uZmlnT3V0cHV0ID0gXCJcIlxuY29uc3Qgcm91dGVNb2R1bGUgPSBuZXcgQXBwUm91dGVSb3V0ZU1vZHVsZSh7XG4gICAgZGVmaW5pdGlvbjoge1xuICAgICAgICBraW5kOiBSb3V0ZUtpbmQuQVBQX1JPVVRFLFxuICAgICAgICBwYWdlOiBcIi9hcGkvdHJhbnNsYXRpb25zL21hbmFnZS9yb3V0ZVwiLFxuICAgICAgICBwYXRobmFtZTogXCIvYXBpL3RyYW5zbGF0aW9ucy9tYW5hZ2VcIixcbiAgICAgICAgZmlsZW5hbWU6IFwicm91dGVcIixcbiAgICAgICAgYnVuZGxlUGF0aDogXCJhcHAvYXBpL3RyYW5zbGF0aW9ucy9tYW5hZ2Uvcm91dGVcIlxuICAgIH0sXG4gICAgcmVzb2x2ZWRQYWdlUGF0aDogXCIvVXNlcnMvcGF1bG8vRG9jdW1lbnRzL1Byb3llY3Rvcy9DbGllbnRlcy9CbG9vbSBNYXJiZWxsYS9ibG9vbW1hcmJlbGxhLW5leHRqcy9hcHAvYXBpL3RyYW5zbGF0aW9ucy9tYW5hZ2Uvcm91dGUudHNcIixcbiAgICBuZXh0Q29uZmlnT3V0cHV0LFxuICAgIHVzZXJsYW5kXG59KTtcbi8vIFB1bGwgb3V0IHRoZSBleHBvcnRzIHRoYXQgd2UgbmVlZCB0byBleHBvc2UgZnJvbSB0aGUgbW9kdWxlLiBUaGlzIHNob3VsZFxuLy8gYmUgZWxpbWluYXRlZCB3aGVuIHdlJ3ZlIG1vdmVkIHRoZSBvdGhlciByb3V0ZXMgdG8gdGhlIG5ldyBmb3JtYXQuIFRoZXNlXG4vLyBhcmUgdXNlZCB0byBob29rIGludG8gdGhlIHJvdXRlLlxuY29uc3QgeyB3b3JrQXN5bmNTdG9yYWdlLCB3b3JrVW5pdEFzeW5jU3RvcmFnZSwgc2VydmVySG9va3MgfSA9IHJvdXRlTW9kdWxlO1xuZnVuY3Rpb24gcGF0Y2hGZXRjaCgpIHtcbiAgICByZXR1cm4gX3BhdGNoRmV0Y2goe1xuICAgICAgICB3b3JrQXN5bmNTdG9yYWdlLFxuICAgICAgICB3b3JrVW5pdEFzeW5jU3RvcmFnZVxuICAgIH0pO1xufVxuZXhwb3J0IHsgcm91dGVNb2R1bGUsIHdvcmtBc3luY1N0b3JhZ2UsIHdvcmtVbml0QXN5bmNTdG9yYWdlLCBzZXJ2ZXJIb29rcywgcGF0Y2hGZXRjaCwgIH07XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWFwcC1yb3V0ZS5qcy5tYXAiXSwibmFtZXMiOltdLCJpZ25vcmVMaXN0IjpbXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Ftranslations%2Fmanage%2Froute&page=%2Fapi%2Ftranslations%2Fmanage%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Ftranslations%2Fmanage%2Froute.ts&appDir=%2FUsers%2Fpaulo%2FDocuments%2FProyectos%2FClientes%2FBloom%20Marbella%2Fbloommarbella-nextjs%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Fpaulo%2FDocuments%2FProyectos%2FClientes%2FBloom%20Marbella%2Fbloommarbella-nextjs&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!\n");

/***/ }),

/***/ "(rsc)/./node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?server=true!":
/*!******************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?server=true! ***!
  \******************************************************************************************************/
/***/ (() => {



/***/ }),

/***/ "(ssr)/./node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?server=true!":
/*!******************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?server=true! ***!
  \******************************************************************************************************/
/***/ (() => {



/***/ }),

/***/ "../app-render/after-task-async-storage.external":
/*!***********************************************************************************!*\
  !*** external "next/dist/server/app-render/after-task-async-storage.external.js" ***!
  \***********************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/server/app-render/after-task-async-storage.external.js");

/***/ }),

/***/ "../app-render/work-async-storage.external":
/*!*****************************************************************************!*\
  !*** external "next/dist/server/app-render/work-async-storage.external.js" ***!
  \*****************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/server/app-render/work-async-storage.external.js");

/***/ }),

/***/ "./work-unit-async-storage.external":
/*!**********************************************************************************!*\
  !*** external "next/dist/server/app-render/work-unit-async-storage.external.js" ***!
  \**********************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/server/app-render/work-unit-async-storage.external.js");

/***/ }),

/***/ "@prisma/client":
/*!*********************************!*\
  !*** external "@prisma/client" ***!
  \*********************************/
/***/ ((module) => {

"use strict";
module.exports = require("@prisma/client");

/***/ }),

/***/ "assert":
/*!*************************!*\
  !*** external "assert" ***!
  \*************************/
/***/ ((module) => {

"use strict";
module.exports = require("assert");

/***/ }),

/***/ "buffer":
/*!*************************!*\
  !*** external "buffer" ***!
  \*************************/
/***/ ((module) => {

"use strict";
module.exports = require("buffer");

/***/ }),

/***/ "crypto":
/*!*************************!*\
  !*** external "crypto" ***!
  \*************************/
/***/ ((module) => {

"use strict";
module.exports = require("crypto");

/***/ }),

/***/ "events":
/*!*************************!*\
  !*** external "events" ***!
  \*************************/
/***/ ((module) => {

"use strict";
module.exports = require("events");

/***/ }),

/***/ "http":
/*!***********************!*\
  !*** external "http" ***!
  \***********************/
/***/ ((module) => {

"use strict";
module.exports = require("http");

/***/ }),

/***/ "https":
/*!************************!*\
  !*** external "https" ***!
  \************************/
/***/ ((module) => {

"use strict";
module.exports = require("https");

/***/ }),

/***/ "next/dist/compiled/next-server/app-page.runtime.dev.js":
/*!*************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-page.runtime.dev.js" ***!
  \*************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/compiled/next-server/app-page.runtime.dev.js");

/***/ }),

/***/ "next/dist/compiled/next-server/app-route.runtime.dev.js":
/*!**************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-route.runtime.dev.js" ***!
  \**************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/compiled/next-server/app-route.runtime.dev.js");

/***/ }),

/***/ "querystring":
/*!******************************!*\
  !*** external "querystring" ***!
  \******************************/
/***/ ((module) => {

"use strict";
module.exports = require("querystring");

/***/ }),

/***/ "url":
/*!**********************!*\
  !*** external "url" ***!
  \**********************/
/***/ ((module) => {

"use strict";
module.exports = require("url");

/***/ }),

/***/ "util":
/*!***********************!*\
  !*** external "util" ***!
  \***********************/
/***/ ((module) => {

"use strict";
module.exports = require("util");

/***/ }),

/***/ "zlib":
/*!***********************!*\
  !*** external "zlib" ***!
  \***********************/
/***/ ((module) => {

"use strict";
module.exports = require("zlib");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../../../../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/next","vendor-chunks/next-auth","vendor-chunks/@babel","vendor-chunks/jose","vendor-chunks/openid-client","vendor-chunks/bcryptjs","vendor-chunks/oauth","vendor-chunks/preact","vendor-chunks/uuid","vendor-chunks/yallist","vendor-chunks/preact-render-to-string","vendor-chunks/cookie","vendor-chunks/@auth","vendor-chunks/oidc-token-hash","vendor-chunks/@panva"], () => (__webpack_exec__("(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Ftranslations%2Fmanage%2Froute&page=%2Fapi%2Ftranslations%2Fmanage%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Ftranslations%2Fmanage%2Froute.ts&appDir=%2FUsers%2Fpaulo%2FDocuments%2FProyectos%2FClientes%2FBloom%20Marbella%2Fbloommarbella-nextjs%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Fpaulo%2FDocuments%2FProyectos%2FClientes%2FBloom%20Marbella%2Fbloommarbella-nextjs&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!")));
module.exports = __webpack_exports__;

})();