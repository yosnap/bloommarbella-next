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
exports.id = "app/api/favorites/route";
exports.ids = ["app/api/favorites/route"];
exports.modules = {

/***/ "(rsc)/./app/api/favorites/route.ts":
/*!************************************!*\
  !*** ./app/api/favorites/route.ts ***!
  \************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   DELETE: () => (/* binding */ DELETE),\n/* harmony export */   GET: () => (/* binding */ GET),\n/* harmony export */   POST: () => (/* binding */ POST)\n/* harmony export */ });\n/* harmony import */ var next_server__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/server */ \"(rsc)/./node_modules/next/dist/api/server.js\");\n/* harmony import */ var next_auth__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next-auth */ \"(rsc)/./node_modules/next-auth/index.js\");\n/* harmony import */ var next_auth__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(next_auth__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var _lib_auth__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @/lib/auth */ \"(rsc)/./lib/auth.ts\");\n/* harmony import */ var _lib_prisma__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @/lib/prisma */ \"(rsc)/./lib/prisma.ts\");\n\n\n\n\nasync function GET() {\n    try {\n        const session = await (0,next_auth__WEBPACK_IMPORTED_MODULE_1__.getServerSession)(_lib_auth__WEBPACK_IMPORTED_MODULE_2__.authOptions);\n        if (!session?.user?.id) {\n            return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n                error: 'Not authenticated'\n            }, {\n                status: 401\n            });\n        }\n        const favorites = await _lib_prisma__WEBPACK_IMPORTED_MODULE_3__.prisma.favorite.findMany({\n            where: {\n                userId: session.user.id\n            },\n            include: {\n                product: {\n                    select: {\n                        id: true,\n                        nieuwkoopId: true,\n                        sku: true,\n                        slug: true,\n                        name: true,\n                        description: true,\n                        category: true,\n                        subcategory: true,\n                        basePrice: true,\n                        stock: true,\n                        images: true,\n                        specifications: true,\n                        active: true,\n                        createdAt: true,\n                        updatedAt: true\n                    }\n                }\n            },\n            orderBy: {\n                createdAt: 'desc'\n            }\n        });\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            favorites: favorites.map((favorite)=>({\n                    id: favorite.id,\n                    createdAt: favorite.createdAt,\n                    product: favorite.product\n                }))\n        });\n    } catch (error) {\n        console.error('Error fetching favorites:', error);\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            error: 'Internal server error'\n        }, {\n            status: 500\n        });\n    }\n}\nasync function POST(request) {\n    try {\n        const session = await (0,next_auth__WEBPACK_IMPORTED_MODULE_1__.getServerSession)(_lib_auth__WEBPACK_IMPORTED_MODULE_2__.authOptions);\n        if (!session?.user?.id) {\n            return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n                error: 'Not authenticated'\n            }, {\n                status: 401\n            });\n        }\n        const { productId } = await request.json();\n        if (!productId) {\n            return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n                error: 'Product ID is required'\n            }, {\n                status: 400\n            });\n        }\n        // Check if product exists\n        const product = await _lib_prisma__WEBPACK_IMPORTED_MODULE_3__.prisma.product.findUnique({\n            where: {\n                id: productId\n            }\n        });\n        if (!product) {\n            return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n                error: 'Product not found'\n            }, {\n                status: 404\n            });\n        }\n        // Check if already favorited\n        const existingFavorite = await _lib_prisma__WEBPACK_IMPORTED_MODULE_3__.prisma.favorite.findUnique({\n            where: {\n                userId_productId: {\n                    userId: session.user.id,\n                    productId: productId\n                }\n            }\n        });\n        if (existingFavorite) {\n            return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n                error: 'Product already in favorites'\n            }, {\n                status: 400\n            });\n        }\n        // Add to favorites\n        const favorite = await _lib_prisma__WEBPACK_IMPORTED_MODULE_3__.prisma.favorite.create({\n            data: {\n                userId: session.user.id,\n                productId: productId\n            },\n            include: {\n                product: {\n                    select: {\n                        id: true,\n                        name: true,\n                        basePrice: true,\n                        images: true\n                    }\n                }\n            }\n        });\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            message: 'Product added to favorites',\n            favorite: {\n                id: favorite.id,\n                createdAt: favorite.createdAt,\n                product: favorite.product\n            }\n        });\n    } catch (error) {\n        console.error('Error adding to favorites:', error);\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            error: 'Internal server error'\n        }, {\n            status: 500\n        });\n    }\n}\nasync function DELETE(request) {\n    try {\n        const session = await (0,next_auth__WEBPACK_IMPORTED_MODULE_1__.getServerSession)(_lib_auth__WEBPACK_IMPORTED_MODULE_2__.authOptions);\n        if (!session?.user?.id) {\n            return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n                error: 'Not authenticated'\n            }, {\n                status: 401\n            });\n        }\n        const { productId } = await request.json();\n        if (!productId) {\n            return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n                error: 'Product ID is required'\n            }, {\n                status: 400\n            });\n        }\n        // Find and delete the favorite\n        const favorite = await _lib_prisma__WEBPACK_IMPORTED_MODULE_3__.prisma.favorite.findUnique({\n            where: {\n                userId_productId: {\n                    userId: session.user.id,\n                    productId: productId\n                }\n            }\n        });\n        if (!favorite) {\n            return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n                error: 'Product not in favorites'\n            }, {\n                status: 404\n            });\n        }\n        await _lib_prisma__WEBPACK_IMPORTED_MODULE_3__.prisma.favorite.delete({\n            where: {\n                id: favorite.id\n            }\n        });\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            message: 'Product removed from favorites'\n        });\n    } catch (error) {\n        console.error('Error removing from favorites:', error);\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            error: 'Internal server error'\n        }, {\n            status: 500\n        });\n    }\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,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TVQsK0NBQU1BLENBQUNTLFFBQVEsQ0FBQzJCLFVBQVUsQ0FBQztZQUNoRHpCLE9BQU87Z0JBQ0wyQixrQkFBa0I7b0JBQ2hCMUIsUUFBUVYsUUFBUUMsSUFBSSxDQUFDQyxFQUFFO29CQUN2QitCLFdBQVdBO2dCQUNiO1lBQ0Y7UUFDRjtRQUVBLElBQUksQ0FBQzFCLFVBQVU7WUFDYixPQUFPWixxREFBWUEsQ0FBQ1EsSUFBSSxDQUFDO2dCQUFFQyxPQUFPO1lBQTJCLEdBQUc7Z0JBQUVDLFFBQVE7WUFBSTtRQUNoRjtRQUVBLE1BQU1QLCtDQUFNQSxDQUFDUyxRQUFRLENBQUNrQyxNQUFNLENBQUM7WUFDM0JoQyxPQUFPO2dCQUFFUCxJQUFJSyxTQUFTTCxFQUFFO1lBQUM7UUFDM0I7UUFFQSxPQUFPUCxxREFBWUEsQ0FBQ1EsSUFBSSxDQUFDO1lBQ3ZCb0MsU0FBUztRQUNYO0lBQ0YsRUFBRSxPQUFPbkMsT0FBTztRQUNkMEIsUUFBUTFCLEtBQUssQ0FBQyxrQ0FBa0NBO1FBQ2hELE9BQU9ULHFEQUFZQSxDQUFDUSxJQUFJLENBQUM7WUFBRUMsT0FBTztRQUF3QixHQUFHO1lBQUVDLFFBQVE7UUFBSTtJQUM3RTtBQUNGIiwic291cmNlcyI6WyIvVXNlcnMvcGF1bG8vRG9jdW1lbnRzL1Byb3llY3Rvcy9DbGllbnRlcy9CbG9vbSBNYXJiZWxsYS9ibG9vbW1hcmJlbGxhLW5leHRqcy9hcHAvYXBpL2Zhdm9yaXRlcy9yb3V0ZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBOZXh0UmVxdWVzdCwgTmV4dFJlc3BvbnNlIH0gZnJvbSAnbmV4dC9zZXJ2ZXInXG5pbXBvcnQgeyBnZXRTZXJ2ZXJTZXNzaW9uIH0gZnJvbSAnbmV4dC1hdXRoJ1xuaW1wb3J0IHsgYXV0aE9wdGlvbnMgfSBmcm9tICdAL2xpYi9hdXRoJ1xuaW1wb3J0IHsgcHJpc21hIH0gZnJvbSAnQC9saWIvcHJpc21hJ1xuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gR0VUKCkge1xuICB0cnkge1xuICAgIGNvbnN0IHNlc3Npb24gPSBhd2FpdCBnZXRTZXJ2ZXJTZXNzaW9uKGF1dGhPcHRpb25zKVxuICAgIFxuICAgIGlmICghc2Vzc2lvbj8udXNlcj8uaWQpIHtcbiAgICAgIHJldHVybiBOZXh0UmVzcG9uc2UuanNvbih7IGVycm9yOiAnTm90IGF1dGhlbnRpY2F0ZWQnIH0sIHsgc3RhdHVzOiA0MDEgfSlcbiAgICB9XG5cbiAgICBjb25zdCBmYXZvcml0ZXMgPSBhd2FpdCBwcmlzbWEuZmF2b3JpdGUuZmluZE1hbnkoe1xuICAgICAgd2hlcmU6IHsgdXNlcklkOiBzZXNzaW9uLnVzZXIuaWQgfSxcbiAgICAgIGluY2x1ZGU6IHtcbiAgICAgICAgcHJvZHVjdDoge1xuICAgICAgICAgIHNlbGVjdDoge1xuICAgICAgICAgICAgaWQ6IHRydWUsXG4gICAgICAgICAgICBuaWV1d2tvb3BJZDogdHJ1ZSxcbiAgICAgICAgICAgIHNrdTogdHJ1ZSxcbiAgICAgICAgICAgIHNsdWc6IHRydWUsXG4gICAgICAgICAgICBuYW1lOiB0cnVlLFxuICAgICAgICAgICAgZGVzY3JpcHRpb246IHRydWUsXG4gICAgICAgICAgICBjYXRlZ29yeTogdHJ1ZSxcbiAgICAgICAgICAgIHN1YmNhdGVnb3J5OiB0cnVlLFxuICAgICAgICAgICAgYmFzZVByaWNlOiB0cnVlLFxuICAgICAgICAgICAgc3RvY2s6IHRydWUsXG4gICAgICAgICAgICBpbWFnZXM6IHRydWUsXG4gICAgICAgICAgICBzcGVjaWZpY2F0aW9uczogdHJ1ZSxcbiAgICAgICAgICAgIGFjdGl2ZTogdHJ1ZSxcbiAgICAgICAgICAgIGNyZWF0ZWRBdDogdHJ1ZSxcbiAgICAgICAgICAgIHVwZGF0ZWRBdDogdHJ1ZVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIG9yZGVyQnk6IHtcbiAgICAgICAgY3JlYXRlZEF0OiAnZGVzYydcbiAgICAgIH1cbiAgICB9KVxuXG4gICAgcmV0dXJuIE5leHRSZXNwb25zZS5qc29uKHtcbiAgICAgIGZhdm9yaXRlczogZmF2b3JpdGVzLm1hcChmYXZvcml0ZSA9PiAoe1xuICAgICAgICBpZDogZmF2b3JpdGUuaWQsXG4gICAgICAgIGNyZWF0ZWRBdDogZmF2b3JpdGUuY3JlYXRlZEF0LFxuICAgICAgICBwcm9kdWN0OiBmYXZvcml0ZS5wcm9kdWN0XG4gICAgICB9KSlcbiAgICB9KVxuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGZldGNoaW5nIGZhdm9yaXRlczonLCBlcnJvcilcbiAgICByZXR1cm4gTmV4dFJlc3BvbnNlLmpzb24oeyBlcnJvcjogJ0ludGVybmFsIHNlcnZlciBlcnJvcicgfSwgeyBzdGF0dXM6IDUwMCB9KVxuICB9XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBQT1NUKHJlcXVlc3Q6IE5leHRSZXF1ZXN0KSB7XG4gIHRyeSB7XG4gICAgY29uc3Qgc2Vzc2lvbiA9IGF3YWl0IGdldFNlcnZlclNlc3Npb24oYXV0aE9wdGlvbnMpXG4gICAgXG4gICAgaWYgKCFzZXNzaW9uPy51c2VyPy5pZCkge1xuICAgICAgcmV0dXJuIE5leHRSZXNwb25zZS5qc29uKHsgZXJyb3I6ICdOb3QgYXV0aGVudGljYXRlZCcgfSwgeyBzdGF0dXM6IDQwMSB9KVxuICAgIH1cblxuICAgIGNvbnN0IHsgcHJvZHVjdElkIH0gPSBhd2FpdCByZXF1ZXN0Lmpzb24oKVxuXG4gICAgaWYgKCFwcm9kdWN0SWQpIHtcbiAgICAgIHJldHVybiBOZXh0UmVzcG9uc2UuanNvbih7IGVycm9yOiAnUHJvZHVjdCBJRCBpcyByZXF1aXJlZCcgfSwgeyBzdGF0dXM6IDQwMCB9KVxuICAgIH1cblxuICAgIC8vIENoZWNrIGlmIHByb2R1Y3QgZXhpc3RzXG4gICAgY29uc3QgcHJvZHVjdCA9IGF3YWl0IHByaXNtYS5wcm9kdWN0LmZpbmRVbmlxdWUoe1xuICAgICAgd2hlcmU6IHsgaWQ6IHByb2R1Y3RJZCB9XG4gICAgfSlcblxuICAgIGlmICghcHJvZHVjdCkge1xuICAgICAgcmV0dXJuIE5leHRSZXNwb25zZS5qc29uKHsgZXJyb3I6ICdQcm9kdWN0IG5vdCBmb3VuZCcgfSwgeyBzdGF0dXM6IDQwNCB9KVxuICAgIH1cblxuICAgIC8vIENoZWNrIGlmIGFscmVhZHkgZmF2b3JpdGVkXG4gICAgY29uc3QgZXhpc3RpbmdGYXZvcml0ZSA9IGF3YWl0IHByaXNtYS5mYXZvcml0ZS5maW5kVW5pcXVlKHtcbiAgICAgIHdoZXJlOiB7XG4gICAgICAgIHVzZXJJZF9wcm9kdWN0SWQ6IHtcbiAgICAgICAgICB1c2VySWQ6IHNlc3Npb24udXNlci5pZCxcbiAgICAgICAgICBwcm9kdWN0SWQ6IHByb2R1Y3RJZFxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSlcblxuICAgIGlmIChleGlzdGluZ0Zhdm9yaXRlKSB7XG4gICAgICByZXR1cm4gTmV4dFJlc3BvbnNlLmpzb24oeyBlcnJvcjogJ1Byb2R1Y3QgYWxyZWFkeSBpbiBmYXZvcml0ZXMnIH0sIHsgc3RhdHVzOiA0MDAgfSlcbiAgICB9XG5cbiAgICAvLyBBZGQgdG8gZmF2b3JpdGVzXG4gICAgY29uc3QgZmF2b3JpdGUgPSBhd2FpdCBwcmlzbWEuZmF2b3JpdGUuY3JlYXRlKHtcbiAgICAgIGRhdGE6IHtcbiAgICAgICAgdXNlcklkOiBzZXNzaW9uLnVzZXIuaWQsXG4gICAgICAgIHByb2R1Y3RJZDogcHJvZHVjdElkXG4gICAgICB9LFxuICAgICAgaW5jbHVkZToge1xuICAgICAgICBwcm9kdWN0OiB7XG4gICAgICAgICAgc2VsZWN0OiB7XG4gICAgICAgICAgICBpZDogdHJ1ZSxcbiAgICAgICAgICAgIG5hbWU6IHRydWUsXG4gICAgICAgICAgICBiYXNlUHJpY2U6IHRydWUsXG4gICAgICAgICAgICBpbWFnZXM6IHRydWVcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KVxuXG4gICAgcmV0dXJuIE5leHRSZXNwb25zZS5qc29uKHtcbiAgICAgIG1lc3NhZ2U6ICdQcm9kdWN0IGFkZGVkIHRvIGZhdm9yaXRlcycsXG4gICAgICBmYXZvcml0ZToge1xuICAgICAgICBpZDogZmF2b3JpdGUuaWQsXG4gICAgICAgIGNyZWF0ZWRBdDogZmF2b3JpdGUuY3JlYXRlZEF0LFxuICAgICAgICBwcm9kdWN0OiBmYXZvcml0ZS5wcm9kdWN0XG4gICAgICB9XG4gICAgfSlcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBjb25zb2xlLmVycm9yKCdFcnJvciBhZGRpbmcgdG8gZmF2b3JpdGVzOicsIGVycm9yKVxuICAgIHJldHVybiBOZXh0UmVzcG9uc2UuanNvbih7IGVycm9yOiAnSW50ZXJuYWwgc2VydmVyIGVycm9yJyB9LCB7IHN0YXR1czogNTAwIH0pXG4gIH1cbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIERFTEVURShyZXF1ZXN0OiBOZXh0UmVxdWVzdCkge1xuICB0cnkge1xuICAgIGNvbnN0IHNlc3Npb24gPSBhd2FpdCBnZXRTZXJ2ZXJTZXNzaW9uKGF1dGhPcHRpb25zKVxuICAgIFxuICAgIGlmICghc2Vzc2lvbj8udXNlcj8uaWQpIHtcbiAgICAgIHJldHVybiBOZXh0UmVzcG9uc2UuanNvbih7IGVycm9yOiAnTm90IGF1dGhlbnRpY2F0ZWQnIH0sIHsgc3RhdHVzOiA0MDEgfSlcbiAgICB9XG5cbiAgICBjb25zdCB7IHByb2R1Y3RJZCB9ID0gYXdhaXQgcmVxdWVzdC5qc29uKClcblxuICAgIGlmICghcHJvZHVjdElkKSB7XG4gICAgICByZXR1cm4gTmV4dFJlc3BvbnNlLmpzb24oeyBlcnJvcjogJ1Byb2R1Y3QgSUQgaXMgcmVxdWlyZWQnIH0sIHsgc3RhdHVzOiA0MDAgfSlcbiAgICB9XG5cbiAgICAvLyBGaW5kIGFuZCBkZWxldGUgdGhlIGZhdm9yaXRlXG4gICAgY29uc3QgZmF2b3JpdGUgPSBhd2FpdCBwcmlzbWEuZmF2b3JpdGUuZmluZFVuaXF1ZSh7XG4gICAgICB3aGVyZToge1xuICAgICAgICB1c2VySWRfcHJvZHVjdElkOiB7XG4gICAgICAgICAgdXNlcklkOiBzZXNzaW9uLnVzZXIuaWQsXG4gICAgICAgICAgcHJvZHVjdElkOiBwcm9kdWN0SWRcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pXG5cbiAgICBpZiAoIWZhdm9yaXRlKSB7XG4gICAgICByZXR1cm4gTmV4dFJlc3BvbnNlLmpzb24oeyBlcnJvcjogJ1Byb2R1Y3Qgbm90IGluIGZhdm9yaXRlcycgfSwgeyBzdGF0dXM6IDQwNCB9KVxuICAgIH1cblxuICAgIGF3YWl0IHByaXNtYS5mYXZvcml0ZS5kZWxldGUoe1xuICAgICAgd2hlcmU6IHsgaWQ6IGZhdm9yaXRlLmlkIH1cbiAgICB9KVxuXG4gICAgcmV0dXJuIE5leHRSZXNwb25zZS5qc29uKHtcbiAgICAgIG1lc3NhZ2U6ICdQcm9kdWN0IHJlbW92ZWQgZnJvbSBmYXZvcml0ZXMnXG4gICAgfSlcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBjb25zb2xlLmVycm9yKCdFcnJvciByZW1vdmluZyBmcm9tIGZhdm9yaXRlczonLCBlcnJvcilcbiAgICByZXR1cm4gTmV4dFJlc3BvbnNlLmpzb24oeyBlcnJvcjogJ0ludGVybmFsIHNlcnZlciBlcnJvcicgfSwgeyBzdGF0dXM6IDUwMCB9KVxuICB9XG59Il0sIm5hbWVzIjpbIk5leHRSZXNwb25zZSIsImdldFNlcnZlclNlc3Npb24iLCJhdXRoT3B0aW9ucyIsInByaXNtYSIsIkdFVCIsInNlc3Npb24iLCJ1c2VyIiwiaWQiLCJqc29uIiwiZXJyb3IiLCJzdGF0dXMiLCJmYXZvcml0ZXMiLCJmYXZvcml0ZSIsImZpbmRNYW55Iiwid2hlcmUiLCJ1c2VySWQiLCJpbmNsdWRlIiwicHJvZHVjdCIsInNlbGVjdCIsIm5pZXV3a29vcElkIiwic2t1Iiwic2x1ZyIsIm5hbWUiLCJkZXNjcmlwdGlvbiIsImNhdGVnb3J5Iiwic3ViY2F0ZWdvcnkiLCJiYXNlUHJpY2UiLCJzdG9jayIsImltYWdlcyIsInNwZWNpZmljYXRpb25zIiwiYWN0aXZlIiwiY3JlYXRlZEF0IiwidXBkYXRlZEF0Iiwib3JkZXJCeSIsIm1hcCIsImNvbnNvbGUiLCJQT1NUIiwicmVxdWVzdCIsInByb2R1Y3RJZCIsImZpbmRVbmlxdWUiLCJleGlzdGluZ0Zhdm9yaXRlIiwidXNlcklkX3Byb2R1Y3RJZCIsImNyZWF0ZSIsImRhdGEiLCJtZXNzYWdlIiwiREVMRVRFIiwiZGVsZXRlIl0sImlnbm9yZUxpc3QiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./app/api/favorites/route.ts\n");

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

/***/ "(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Ffavorites%2Froute&page=%2Fapi%2Ffavorites%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Ffavorites%2Froute.ts&appDir=%2FUsers%2Fpaulo%2FDocuments%2FProyectos%2FClientes%2FBloom%20Marbella%2Fbloommarbella-nextjs%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Fpaulo%2FDocuments%2FProyectos%2FClientes%2FBloom%20Marbella%2Fbloommarbella-nextjs&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!":
/*!*******************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Ffavorites%2Froute&page=%2Fapi%2Ffavorites%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Ffavorites%2Froute.ts&appDir=%2FUsers%2Fpaulo%2FDocuments%2FProyectos%2FClientes%2FBloom%20Marbella%2Fbloommarbella-nextjs%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Fpaulo%2FDocuments%2FProyectos%2FClientes%2FBloom%20Marbella%2Fbloommarbella-nextjs&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D! ***!
  \*******************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   patchFetch: () => (/* binding */ patchFetch),\n/* harmony export */   routeModule: () => (/* binding */ routeModule),\n/* harmony export */   serverHooks: () => (/* binding */ serverHooks),\n/* harmony export */   workAsyncStorage: () => (/* binding */ workAsyncStorage),\n/* harmony export */   workUnitAsyncStorage: () => (/* binding */ workUnitAsyncStorage)\n/* harmony export */ });\n/* harmony import */ var next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/dist/server/route-modules/app-route/module.compiled */ \"(rsc)/./node_modules/next/dist/server/route-modules/app-route/module.compiled.js\");\n/* harmony import */ var next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_dist_server_route_kind__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/dist/server/route-kind */ \"(rsc)/./node_modules/next/dist/server/route-kind.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/dist/server/lib/patch-fetch */ \"(rsc)/./node_modules/next/dist/server/lib/patch-fetch.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var _Users_paulo_Documents_Proyectos_Clientes_Bloom_Marbella_bloommarbella_nextjs_app_api_favorites_route_ts__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./app/api/favorites/route.ts */ \"(rsc)/./app/api/favorites/route.ts\");\n\n\n\n\n// We inject the nextConfigOutput here so that we can use them in the route\n// module.\nconst nextConfigOutput = \"\"\nconst routeModule = new next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__.AppRouteRouteModule({\n    definition: {\n        kind: next_dist_server_route_kind__WEBPACK_IMPORTED_MODULE_1__.RouteKind.APP_ROUTE,\n        page: \"/api/favorites/route\",\n        pathname: \"/api/favorites\",\n        filename: \"route\",\n        bundlePath: \"app/api/favorites/route\"\n    },\n    resolvedPagePath: \"/Users/paulo/Documents/Proyectos/Clientes/Bloom Marbella/bloommarbella-nextjs/app/api/favorites/route.ts\",\n    nextConfigOutput,\n    userland: _Users_paulo_Documents_Proyectos_Clientes_Bloom_Marbella_bloommarbella_nextjs_app_api_favorites_route_ts__WEBPACK_IMPORTED_MODULE_3__\n});\n// Pull out the exports that we need to expose from the module. This should\n// be eliminated when we've moved the other routes to the new format. These\n// are used to hook into the route.\nconst { workAsyncStorage, workUnitAsyncStorage, serverHooks } = routeModule;\nfunction patchFetch() {\n    return (0,next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__.patchFetch)({\n        workAsyncStorage,\n        workUnitAsyncStorage\n    });\n}\n\n\n//# sourceMappingURL=app-route.js.map//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9ub2RlX21vZHVsZXMvbmV4dC9kaXN0L2J1aWxkL3dlYnBhY2svbG9hZGVycy9uZXh0LWFwcC1sb2FkZXIvaW5kZXguanM/bmFtZT1hcHAlMkZhcGklMkZmYXZvcml0ZXMlMkZyb3V0ZSZwYWdlPSUyRmFwaSUyRmZhdm9yaXRlcyUyRnJvdXRlJmFwcFBhdGhzPSZwYWdlUGF0aD1wcml2YXRlLW5leHQtYXBwLWRpciUyRmFwaSUyRmZhdm9yaXRlcyUyRnJvdXRlLnRzJmFwcERpcj0lMkZVc2VycyUyRnBhdWxvJTJGRG9jdW1lbnRzJTJGUHJveWVjdG9zJTJGQ2xpZW50ZXMlMkZCbG9vbSUyME1hcmJlbGxhJTJGYmxvb21tYXJiZWxsYS1uZXh0anMlMkZhcHAmcGFnZUV4dGVuc2lvbnM9dHN4JnBhZ2VFeHRlbnNpb25zPXRzJnBhZ2VFeHRlbnNpb25zPWpzeCZwYWdlRXh0ZW5zaW9ucz1qcyZyb290RGlyPSUyRlVzZXJzJTJGcGF1bG8lMkZEb2N1bWVudHMlMkZQcm95ZWN0b3MlMkZDbGllbnRlcyUyRkJsb29tJTIwTWFyYmVsbGElMkZibG9vbW1hcmJlbGxhLW5leHRqcyZpc0Rldj10cnVlJnRzY29uZmlnUGF0aD10c2NvbmZpZy5qc29uJmJhc2VQYXRoPSZhc3NldFByZWZpeD0mbmV4dENvbmZpZ091dHB1dD0mcHJlZmVycmVkUmVnaW9uPSZtaWRkbGV3YXJlQ29uZmlnPWUzMCUzRCEiLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7QUFBK0Y7QUFDdkM7QUFDcUI7QUFDd0Q7QUFDckk7QUFDQTtBQUNBO0FBQ0Esd0JBQXdCLHlHQUFtQjtBQUMzQztBQUNBLGNBQWMsa0VBQVM7QUFDdkI7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBLFlBQVk7QUFDWixDQUFDO0FBQ0Q7QUFDQTtBQUNBO0FBQ0EsUUFBUSxzREFBc0Q7QUFDOUQ7QUFDQSxXQUFXLDRFQUFXO0FBQ3RCO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDMEY7O0FBRTFGIiwic291cmNlcyI6WyIiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQXBwUm91dGVSb3V0ZU1vZHVsZSB9IGZyb20gXCJuZXh0L2Rpc3Qvc2VydmVyL3JvdXRlLW1vZHVsZXMvYXBwLXJvdXRlL21vZHVsZS5jb21waWxlZFwiO1xuaW1wb3J0IHsgUm91dGVLaW5kIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvcm91dGUta2luZFwiO1xuaW1wb3J0IHsgcGF0Y2hGZXRjaCBhcyBfcGF0Y2hGZXRjaCB9IGZyb20gXCJuZXh0L2Rpc3Qvc2VydmVyL2xpYi9wYXRjaC1mZXRjaFwiO1xuaW1wb3J0ICogYXMgdXNlcmxhbmQgZnJvbSBcIi9Vc2Vycy9wYXVsby9Eb2N1bWVudHMvUHJveWVjdG9zL0NsaWVudGVzL0Jsb29tIE1hcmJlbGxhL2Jsb29tbWFyYmVsbGEtbmV4dGpzL2FwcC9hcGkvZmF2b3JpdGVzL3JvdXRlLnRzXCI7XG4vLyBXZSBpbmplY3QgdGhlIG5leHRDb25maWdPdXRwdXQgaGVyZSBzbyB0aGF0IHdlIGNhbiB1c2UgdGhlbSBpbiB0aGUgcm91dGVcbi8vIG1vZHVsZS5cbmNvbnN0IG5leHRDb25maWdPdXRwdXQgPSBcIlwiXG5jb25zdCByb3V0ZU1vZHVsZSA9IG5ldyBBcHBSb3V0ZVJvdXRlTW9kdWxlKHtcbiAgICBkZWZpbml0aW9uOiB7XG4gICAgICAgIGtpbmQ6IFJvdXRlS2luZC5BUFBfUk9VVEUsXG4gICAgICAgIHBhZ2U6IFwiL2FwaS9mYXZvcml0ZXMvcm91dGVcIixcbiAgICAgICAgcGF0aG5hbWU6IFwiL2FwaS9mYXZvcml0ZXNcIixcbiAgICAgICAgZmlsZW5hbWU6IFwicm91dGVcIixcbiAgICAgICAgYnVuZGxlUGF0aDogXCJhcHAvYXBpL2Zhdm9yaXRlcy9yb3V0ZVwiXG4gICAgfSxcbiAgICByZXNvbHZlZFBhZ2VQYXRoOiBcIi9Vc2Vycy9wYXVsby9Eb2N1bWVudHMvUHJveWVjdG9zL0NsaWVudGVzL0Jsb29tIE1hcmJlbGxhL2Jsb29tbWFyYmVsbGEtbmV4dGpzL2FwcC9hcGkvZmF2b3JpdGVzL3JvdXRlLnRzXCIsXG4gICAgbmV4dENvbmZpZ091dHB1dCxcbiAgICB1c2VybGFuZFxufSk7XG4vLyBQdWxsIG91dCB0aGUgZXhwb3J0cyB0aGF0IHdlIG5lZWQgdG8gZXhwb3NlIGZyb20gdGhlIG1vZHVsZS4gVGhpcyBzaG91bGRcbi8vIGJlIGVsaW1pbmF0ZWQgd2hlbiB3ZSd2ZSBtb3ZlZCB0aGUgb3RoZXIgcm91dGVzIHRvIHRoZSBuZXcgZm9ybWF0LiBUaGVzZVxuLy8gYXJlIHVzZWQgdG8gaG9vayBpbnRvIHRoZSByb3V0ZS5cbmNvbnN0IHsgd29ya0FzeW5jU3RvcmFnZSwgd29ya1VuaXRBc3luY1N0b3JhZ2UsIHNlcnZlckhvb2tzIH0gPSByb3V0ZU1vZHVsZTtcbmZ1bmN0aW9uIHBhdGNoRmV0Y2goKSB7XG4gICAgcmV0dXJuIF9wYXRjaEZldGNoKHtcbiAgICAgICAgd29ya0FzeW5jU3RvcmFnZSxcbiAgICAgICAgd29ya1VuaXRBc3luY1N0b3JhZ2VcbiAgICB9KTtcbn1cbmV4cG9ydCB7IHJvdXRlTW9kdWxlLCB3b3JrQXN5bmNTdG9yYWdlLCB3b3JrVW5pdEFzeW5jU3RvcmFnZSwgc2VydmVySG9va3MsIHBhdGNoRmV0Y2gsICB9O1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1hcHAtcm91dGUuanMubWFwIl0sIm5hbWVzIjpbXSwiaWdub3JlTGlzdCI6W10sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Ffavorites%2Froute&page=%2Fapi%2Ffavorites%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Ffavorites%2Froute.ts&appDir=%2FUsers%2Fpaulo%2FDocuments%2FProyectos%2FClientes%2FBloom%20Marbella%2Fbloommarbella-nextjs%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Fpaulo%2FDocuments%2FProyectos%2FClientes%2FBloom%20Marbella%2Fbloommarbella-nextjs&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!\n");

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
var __webpack_require__ = require("../../../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/next","vendor-chunks/next-auth","vendor-chunks/@babel","vendor-chunks/jose","vendor-chunks/openid-client","vendor-chunks/bcryptjs","vendor-chunks/oauth","vendor-chunks/preact","vendor-chunks/uuid","vendor-chunks/yallist","vendor-chunks/preact-render-to-string","vendor-chunks/cookie","vendor-chunks/@auth","vendor-chunks/oidc-token-hash","vendor-chunks/@panva"], () => (__webpack_exec__("(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Ffavorites%2Froute&page=%2Fapi%2Ffavorites%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Ffavorites%2Froute.ts&appDir=%2FUsers%2Fpaulo%2FDocuments%2FProyectos%2FClientes%2FBloom%20Marbella%2Fbloommarbella-nextjs%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Fpaulo%2FDocuments%2FProyectos%2FClientes%2FBloom%20Marbella%2Fbloommarbella-nextjs&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!")));
module.exports = __webpack_exports__;

})();