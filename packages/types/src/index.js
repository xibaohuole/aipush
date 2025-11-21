"use strict";
// ==================== Enums ====================
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationType = exports.UserRole = exports.ViewState = exports.Region = exports.NewsCategory = void 0;
var NewsCategory;
(function (NewsCategory) {
    NewsCategory["RESEARCH"] = "Research";
    NewsCategory["PRODUCT"] = "Product";
    NewsCategory["FINANCE"] = "Finance";
    NewsCategory["POLICY"] = "Policy";
    NewsCategory["ETHICS"] = "Ethics";
    NewsCategory["ROBOTICS"] = "Robotics";
    NewsCategory["LIFESTYLE"] = "Lifestyle";
    NewsCategory["ENTERTAINMENT"] = "Entertainment";
    NewsCategory["MEME"] = "Meme";
    NewsCategory["OTHER"] = "Other";
})(NewsCategory || (exports.NewsCategory = NewsCategory = {}));
var Region;
(function (Region) {
    Region["GLOBAL"] = "Global";
    Region["NORTH_AMERICA"] = "North America";
    Region["EUROPE"] = "Europe";
    Region["ASIA"] = "Asia";
    Region["OTHER"] = "Other";
})(Region || (exports.Region = Region = {}));
var ViewState;
(function (ViewState) {
    ViewState["DASHBOARD"] = "DASHBOARD";
    ViewState["TRENDING"] = "TRENDING";
    ViewState["DAILY_BRIEF"] = "DAILY_BRIEF";
    ViewState["SETTINGS"] = "SETTINGS";
})(ViewState || (exports.ViewState = ViewState = {}));
var UserRole;
(function (UserRole) {
    UserRole["USER"] = "user";
    UserRole["ADMIN"] = "admin";
    UserRole["MODERATOR"] = "moderator";
    UserRole["EDITOR"] = "editor";
})(UserRole || (exports.UserRole = UserRole = {}));
var NotificationType;
(function (NotificationType) {
    NotificationType["EMAIL"] = "email";
    NotificationType["PUSH"] = "push";
    NotificationType["IN_APP"] = "in_app";
})(NotificationType || (exports.NotificationType = NotificationType = {}));
//# sourceMappingURL=index.js.map