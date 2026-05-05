"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const auth_1 = require("./routes/auth");
const jobs_1 = require("./routes/jobs");
const alertRules_1 = require("./routes/alertRules");
const prices_1 = require("./routes/prices");
const events_1 = require("./routes/events");
const authenticate_1 = require("./middleware/authenticate");
const priceFeed_service_1 = require("./services/priceFeed.service");
const alertWorker_service_1 = require("./services/alertWorker.service");
const alertProcessor_1 = require("./queues/alertProcessor");
const app = (0, express_1.default)();
const PORT = process.env.PORT || 4000;
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({ origin: process.env.CLIENT_URL || 'http://localhost:3000' }));
app.use((0, morgan_1.default)('dev'));
app.use(express_1.default.json());
// Public routes
app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
app.use('/api/auth', auth_1.authRouter);
// Protected routes
app.use('/api/jobs', authenticate_1.authenticate, jobs_1.jobRouter);
app.use('/api/alert-rules', authenticate_1.authenticate, alertRules_1.alertRulesRouter);
// Public price feed (read-only)
app.use('/api/prices', prices_1.pricesRouter);
// SSE — auth via ?token= query param (EventSource can't set headers)
app.use('/events', events_1.eventsRouter);
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    (0, priceFeed_service_1.startPriceFeed)();
    (0, alertWorker_service_1.startAlertWorker)();
    (0, alertProcessor_1.startAlertProcessor)();
});
exports.default = app;
//# sourceMappingURL=index.js.map