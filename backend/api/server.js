const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const { authMiddleware, requireRole, optionalAuth } = require('../../security/firebase-auth/authMiddleware');
const { errorHandler, notFoundHandler, asyncHandler, logInfo } = require('./middleware/errorHandler');
const { validateDistrictQuery } = require('./middleware/validation');
const rateLimiter = require('./middleware/rateLimiter');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true
}));
app.use(express.json());
app.use(rateLimiter()); // Apply rate limiting globally

const analyticsPath = path.join(__dirname, '..', 'analytics');

function loadJsonFile(filename) {
    try {
        const filePath = path.join(analyticsPath, filename);
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error(`Error loading ${filename}:`, error.message);
        return null;
    }
}

function loadCsvAsJson(filename) {
    try {
        const filePath = path.join(analyticsPath, filename);
        const data = fs.readFileSync(filePath, 'utf8');
        const lines = data.trim().split('\n');
        const headers = lines[0].split(',');
        const result = [];
        
        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',');
            const obj = {};
            headers.forEach((header, index) => {
                let value = values[index];
                if (!isNaN(value) && value !== '') {
                    value = parseFloat(value);
                }
                obj[header.trim()] = value;
            });
            result.push(obj);
        }
        return result;
    } catch (error) {
        console.error(`Error loading ${filename}:`, error.message);
        return null;
    }
}

// Public routes (no authentication required)
app.get('/api/health', asyncHandler(async (req, res) => {
    res.json({ 
        success: true,
        status: 'healthy', 
        timestamp: new Date().toISOString() 
    });
}));

// Protected routes (authentication required)
app.get('/api/summary', optionalAuth, asyncHandler(async (req, res) => {
    const summary = loadJsonFile('summary.json');
    const predSummary = loadJsonFile('prediction_summary.json');
    
    if (!summary) {
        return res.status(500).json({ 
            success: false,
            error: { message: 'Failed to load summary data' }
        });
    }
    
    res.json({
        success: true,
        lifecycle: summary,
        predictions: predSummary,
        user: req.user ? { uid: req.user.uid, email: req.user.email } : null
    });
}));

app.get('/api/districts', validateDistrictQuery, asyncHandler(async (req, res) => {
    const ulsData = loadCsvAsJson('uls_scores.csv');
    
    if (!ulsData) {
        return res.status(500).json({ 
            success: false,
            error: { message: 'Failed to load district data' }
        });
    }
    
    const { state, risk, limit = 100, offset = 0 } = req.query;
    
    let filtered = ulsData;
    
    if (state) {
        filtered = filtered.filter(d => d.state === state);
    }
    
    if (risk) {
        filtered = filtered.filter(d => d.risk_classification === risk);
    }
    
    filtered.sort((a, b) => a.uls_score - b.uls_score);
    
    const paginated = filtered.slice(parseInt(offset), parseInt(offset) + parseInt(limit));
    
    res.json({
        success: true,
        total: filtered.length,
        limit: parseInt(limit),
        offset: parseInt(offset),
        data: paginated
    });
}));

app.get('/api/districts/:districtId', asyncHandler(async (req, res) => {
    const ulsData = loadCsvAsJson('uls_scores.csv');
    const recommendations = loadJsonFile('recommendations.json');
    const predictions = loadJsonFile('ml_predictions.json');
    
    const district = ulsData?.find(d => d.district_id === req.params.districtId);
    
    if (!district) {
        return res.status(404).json({ 
            success: false,
            error: { message: 'District not found' }
        });
    }
    
    const districtRecs = recommendations?.find(r => r.district_id === req.params.districtId);
    const districtPred = predictions?.find(p => p.district_id === req.params.districtId);
    
    res.json({
        success: true,
        ...district,
        recommendations: districtRecs?.recommendations || [],
        prediction: districtPred
    });
}));

app.get('/api/high-risk', asyncHandler(async (req, res) => {
    const highRisk = loadJsonFile('high_risk_districts.json');
    const highRiskPred = loadJsonFile('high_risk_predictions.json');
    
    res.json({
        success: true,
        lifecycle_high_risk: highRisk || [],
        prediction_high_risk: highRiskPred || []
    });
}));

app.get('/api/recommendations', asyncHandler(async (req, res) => {
    const recommendations = loadJsonFile('recommendations.json');
    
    if (!recommendations) {
        return res.status(500).json({ 
            success: false,
            error: { message: 'Failed to load recommendations' }
        });
    }
    
    const { type, priority } = req.query;
    
    let filtered = recommendations;
    
    if (type || priority) {
        filtered = recommendations.map(district => ({
            ...district,
            recommendations: district.recommendations.filter(rec => {
                if (type && rec.type !== type) return false;
                if (priority && rec.priority !== priority) return false;
                return true;
            })
        })).filter(d => d.recommendations.length > 0);
    }
    
    res.json({
        success: true,
        data: filtered
    });
}));

app.get('/api/trends', asyncHandler(async (req, res) => {
    const trends = loadJsonFile('trends.json');
    
    if (!trends) {
        return res.status(500).json({ 
            success: false,
            error: { message: 'Failed to load trends data' }
        });
    }
    
    res.json({
        success: true,
        data: trends
    });
}));

app.get('/api/states', asyncHandler(async (req, res) => {
    const stateSummary = loadJsonFile('state_summary.json');
    
    if (!stateSummary) {
        return res.status(500).json({ 
            success: false,
            error: { message: 'Failed to load state summary' }
        });
    }
    
    res.json({
        success: true,
        data: stateSummary
    });
}));

app.get('/api/predictions', asyncHandler(async (req, res) => {
    const predictions = loadJsonFile('ml_predictions.json');
    
    if (!predictions) {
        return res.status(500).json({ 
            success: false,
            error: { message: 'Failed to load predictions' }
        });
    }
    
    const { risk_category } = req.query;
    
    let filtered = predictions;
    if (risk_category) {
        filtered = predictions.filter(p => p.risk_category === risk_category);
    }
    
    res.json({
        success: true,
        data: filtered
    });
}));

app.get('/api/heatmap', asyncHandler(async (req, res) => {
    const ulsData = loadCsvAsJson('uls_scores.csv');
    const stateSummary = loadJsonFile('state_summary.json');
    
    if (!stateSummary) {
        return res.status(500).json({ 
            success: false,
            error: { message: 'Failed to load heatmap data' }
        });
    }
    
    const heatmapData = stateSummary.map(state => ({
        state: state.state,
        value: state.avg_uls_score,
        risk_level: state.risk_level,
        district_count: state.district_count,
        avg_coverage: state.avg_coverage,
        avg_bio_freshness: state.avg_bio_freshness
    }));
    
    res.json({
        success: true,
        data: heatmapData
    });
}));

app.get('/api/child-vulnerability', asyncHandler(async (req, res) => {
    const ulsData = loadCsvAsJson('uls_scores.csv');
    
    if (!ulsData) {
        return res.status(500).json({ 
            success: false,
            error: { message: 'Failed to load data' }
        });
    }
    
    const vulnerable = ulsData
        .filter(d => d.child_vulnerability_score > 50)
        .sort((a, b) => b.child_vulnerability_score - a.child_vulnerability_score)
        .slice(0, 50)
        .map(d => ({
            district_id: d.district_id,
            district_name: d.district_name,
            state: d.state,
            child_vulnerability_score: d.child_vulnerability_score,
            child_refresh_gap_months: d.child_refresh_gap_months,
            uls_score: d.uls_score
        }));
    
    res.json({
        success: true,
        data: vulnerable
    });
}));

app.get('/api/statistics', asyncHandler(async (req, res) => {
    const summary = loadJsonFile('summary.json');
    const predSummary = loadJsonFile('prediction_summary.json');
    const stateSummary = loadJsonFile('state_summary.json');
    
    const stats = {
        total_districts: summary?.total_districts || 0,
        stable_districts: summary?.stable_count || 0,
        watchlist_districts: summary?.watchlist_count || 0,
        high_risk_districts: summary?.high_risk_count || 0,
        avg_uls_score: summary?.avg_uls_score || 0,
        avg_auth_failure_prob: summary?.avg_auth_failure_prob || 0,
        total_states: stateSummary?.length || 0,
        ml_predictions: {
            low_risk: predSummary?.low_risk_count || 0,
            medium_risk: predSummary?.medium_risk_count || 0,
            high_risk: predSummary?.high_risk_count || 0,
            avg_failure_prob: predSummary?.avg_predicted_failure_prob || 0
        },
        generated_at: summary?.generated_at
    };
    
    res.json({
        success: true,
        data: stats
    });
}));

// 404 handler - must be after all routes
app.use(notFoundHandler);

// Error handler - must be last
app.use(errorHandler);

app.listen(PORT, () => {
    logInfo(`ALIS Backend API running on port ${PORT}`, {
        port: PORT,
        analyticsPath,
        environment: process.env.NODE_ENV || 'development'
    });
});
