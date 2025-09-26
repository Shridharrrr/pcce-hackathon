'use client';

import React, { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/config/firebase';
import { generateRecommendations } from '@/lib/recommendationEngine';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';

// --- MAIN PROJECTIONS PAGE COMPONENT ---
const ProjectionsPage = () => {
    const [userData, setUserData] = useState(null);
    const [recommendations, setRecommendations] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const user = auth.currentUser;
                if (user) {
                    const docRef = doc(db, 'userProfiles', user.uid);
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists()) {
                        const data = docSnap.data();
                        setUserData(data);
                        const recs = generateRecommendations(data);
                        setRecommendations(recs);
                    }
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
            } finally {
                setLoading(false);
            }
        };

        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) {
                fetchData();
            } else {
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500"></div>
            </div>
        );
    }

    if (!userData || !recommendations) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-700">Could not load projections data.</h2>
                    <a href="/dashboard" className="text-blue-600 hover:underline mt-4 inline-block">Return to Dashboard</a>
                </div>
            </div>
        );
    }

    const { analysis } = recommendations;

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold text-gray-800">Projections & Strategies</h1>
                    <a href="/dashboard" className="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 border border-gray-300 rounded-lg shadow-sm">
                        ← Back to Dashboard
                    </a>
                </div>

                {/* --- Projections Section --- */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <CollegeCostProjection analysis={analysis} />
                    <SavingsGapAnalysis analysis={analysis} />
                </div>

                {/* --- Strategies Section --- */}
                <div className="space-y-8">
                    <ContributionOptimizer analysis={analysis} userData={userData} />
                    <RiskAssessmentChart analysis={analysis} />
                </div>
            </div>
        </div>
    );
};

// --- SUB-COMPONENTS for Projections & Strategies ---

const CollegeCostProjection = ({ analysis }) => (
    <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-semibold mb-4">4-Year College Cost Projection</h3>
        <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analysis.tuitionProjections.yearByCost}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" tickFormatter={(value) => `Year ${value}`} />
                <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Tuition Cost']} />
                <Bar dataKey="cost" fill="#EF4444" />
            </BarChart>
        </ResponsiveContainer>
        <div className="mt-4 text-center">
            <div className="text-2xl font-bold text-gray-800">
                ${analysis.tuitionProjections.totalCollegeCost.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Total 4-Year Cost</div>
        </div>
    </div>
);

const SavingsGapAnalysis = ({ analysis }) => (
    <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-semibold mb-4">Savings Gap Analysis</h3>
        <ResponsiveContainer width="100%" height={300}>
            <PieChart>
                <Pie
                    data={[
                        { name: 'Covered', value: Math.min(analysis.gapAnalysis.savingsGoal, analysis.savingsProjections.plan529.finalBalance) },
                        { name: 'Gap', value: Math.max(0, analysis.gapAnalysis.shortfall529) }
                    ]}
                    cx="50%" cy="50%" outerRadius={80} fill="#8884d8" dataKey="value" label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                >
                    <Cell fill="#10B981" />
                    <Cell fill="#EF4444" />
                </Pie>
                <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, '']} />
                <Legend />
            </PieChart>
        </ResponsiveContainer>
        <div className="mt-4 space-y-2">
            <div className="flex justify-between">
                <span className="text-gray-600">Coverage Percentage:</span>
                <span className="font-semibold">{Math.round(analysis.gapAnalysis.coverage529)}%</span>
            </div>
            <div className="flex justify-between">
                <span className="text-gray-600">Remaining Gap:</span>
                <span className="font-semibold text-red-600">
                    ${analysis.gapAnalysis.shortfall529.toLocaleString()}
                </span>
            </div>
        </div>
    </div>
);

const RiskAssessmentChart = ({ analysis }) => {
    const riskScenarios = [
        { scenario: 'Conservative (5%)', finalAmount: analysis.savingsProjections.plan529.finalBalance * 0.9 },
        { scenario: 'Expected (7%)', finalAmount: analysis.savingsProjections.plan529.finalBalance },
        { scenario: 'Optimistic (9%)', finalAmount: analysis.savingsProjections.plan529.finalBalance * 1.2 },
        { scenario: 'Market Downturn (2%)', finalAmount: analysis.savingsProjections.plan529.finalBalance * 0.7 }
    ];

    return (
        <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold mb-4">Risk Scenario Analysis</h3>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={riskScenarios}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="scenario" />
                    <YAxis tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`} />
                    <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                    <Bar dataKey="finalAmount" fill="#8B5CF6" />
                    <ReferenceLine y={analysis.gapAnalysis.savingsGoal} stroke="#10B981" strokeDasharray="3 3" label={{ value: "Goal", position: "insideTopRight" }} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

const ContributionOptimizer = ({ analysis, userData }) => {
    const currentMonthly = parseFloat(userData.monthlyContribution) || 0;
    const shortfall = analysis.gapAnalysis.shortfall529;
    const yearsLeft = analysis.timeline.yearsToCollege;

    const scenarios = [
        { name: 'Current Plan', monthly: currentMonthly, coverage: analysis.gapAnalysis.coverage529 },
        { name: 'Recommended', monthly: currentMonthly + Math.round(shortfall / (yearsLeft * 12)), coverage: parseFloat(userData.savingsGoalPercentage) },
        { name: 'Aggressive', monthly: currentMonthly + Math.round(shortfall * 1.2 / (yearsLeft * 12)), coverage: parseFloat(userData.savingsGoalPercentage) * 1.2 }
    ];

    return (
        <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold mb-4">Contribution Optimization</h3>
            <div className="space-y-4">
                {scenarios.map((scenario, index) => (
                    <div key={index} className={`border rounded-lg p-4 ${index === 1 ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <div className="font-semibold text-gray-800">{scenario.name}</div>
                                {index === 1 && <div className="text-xs text-blue-600 font-medium">RECOMMENDED</div>}
                            </div>
                            <div className="text-right">
                                <div className="text-lg font-bold">${scenario.monthly.toLocaleString()}/mo</div>
                            </div>
                        </div>
                        <div className="bg-gray-200 rounded-full h-2 mt-3">
                            <div className={`h-2 rounded-full ${scenario.coverage >= 100 ? 'bg-green-500' : 'bg-blue-500'}`} style={{ width: `${Math.min(100, scenario.coverage)}%` }}></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ProjectionsPage;