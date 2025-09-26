"use client";

import React, { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/config/firebase";
import { generateRecommendations } from "@/lib/recommendationEngine";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

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
          const docRef = doc(db, "userProfiles", user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setUserData(data);
            const recs = generateRecommendations(data);
            setRecommendations(recs);
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
      </div>
    );
  }

  if (!userData || !recommendations) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-700">
            Could not load projections data.
          </h2>
          <a
            href="/dashboard"
            className="text-blue-600 hover:underline mt-4 inline-block"
          >
            Return to Dashboard
          </a>
        </div>
      </div>
    );
  }

  const { analysis } = recommendations;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800">
            Projections & Strategies
          </h1>
          <a
            href="/dashboard"
            className="group flex items-center gap-2 border-2 border-gray-300 hover:border-blue-500 text-gray-700 hover:text-blue-600 font-semibold py-2.5 px-5 rounded-lg transition-all duration-200 hover:shadow-md"
          >
            <svg
              className="w-4 h-4 transform group-hover:-translate-x-0.5 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Dashboard
          </a>
        </div>

        {/* --- Projections Section --- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <CollegeCostProjection analysis={analysis} />
          <SavingsGapAnalysis analysis={analysis} />
        </div>

        {/* --- EFC (Expected Family Contribution) Section --- */}
        <EFCSection analysis={analysis} userData={userData} />

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
    <h3 className="text-xl font-semibold mb-4 text-black">
      4-Year College Cost Projection
    </h3>
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={analysis.tuitionProjections.yearByCost}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="year" tickFormatter={(value) => `Year ${value}`} />
        <YAxis tickFormatter={(value) => `₹${(value / 100000).toFixed(1)}L`} />
        <Tooltip
          formatter={(value) => [
            `₹${value.toLocaleString("en-IN")}`,
            "Tuition Cost",
          ]}
        />
        <Bar dataKey="cost" fill="#EF4444" barSize={50} />{" "}
        {/* 👈 adjust thickness */}
      </BarChart>
    </ResponsiveContainer>

    <div className="mt-4 text-center">
      <div className="text-2xl font-bold text-black">
        ₹{analysis.tuitionProjections.totalCollegeCost.toLocaleString("en-IN")}
      </div>
      <div className="text-sm text-black">Total 4-Year Cost</div>
    </div>
  </div>
);

const SavingsGapAnalysis = ({ analysis }) => (
  <div className="bg-white rounded-xl shadow-lg p-6">
    <h3 className="text-xl font-semibold mb-4 text-black">
      Savings Gap Analysis
    </h3>
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={[
            {
              name: "Covered",
              value: Math.min(
                analysis.gapAnalysis.savingsGoal,
                analysis.savingsProjections.plan529.finalBalance
              ),
            },
            {
              name: "Gap",
              value: Math.max(0, analysis.gapAnalysis.shortfall529),
            },
          ]}
          cx="50%"
          cy="50%"
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
          label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
        >
          <Cell fill="#10B981" />
          <Cell fill="#EF4444" />
        </Pie>
        <Tooltip
          formatter={(value) => [`₹${value.toLocaleString("en-IN")}`, ""]}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
    <div className="mt-4 space-y-2">
      <div className="flex justify-between">
        <span className="text-black">Coverage Percentage:</span>
        <span className="font-semibold text-black">
          {Math.round(analysis.gapAnalysis.coverage529)}%
        </span>
      </div>
      <div className="flex justify-between">
        <span className="text-black">Remaining Gap:</span>
        <span className="font-semibold text-red-600">
          ₹{analysis.gapAnalysis.shortfall529.toLocaleString("en-IN")}
        </span>
      </div>
    </div>
  </div>
);

const RiskAssessmentChart = ({ analysis }) => {
  const riskScenarios = [
    {
      scenario: "Conservative (5%)",
      finalAmount: analysis.savingsProjections.plan529.finalBalance * 0.9,
    },
    {
      scenario: "Expected (7%)",
      finalAmount: analysis.savingsProjections.plan529.finalBalance,
    },
    {
      scenario: "Optimistic (9%)",
      finalAmount: analysis.savingsProjections.plan529.finalBalance * 1.2,
    },
    {
      scenario: "Market Downturn (2%)",
      finalAmount: analysis.savingsProjections.plan529.finalBalance * 0.7,
    },
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-xl font-semibold mb-4 text-black">
        Risk Scenario Analysis
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={riskScenarios}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="scenario" />
          <YAxis
            tickFormatter={(value) => `₹${(value / 100000).toFixed(1)}L`}
          />
          <Tooltip formatter={(value) => `₹${value.toLocaleString("en-IN")}`} />
          <Bar dataKey="finalAmount" fill="#8B5CF6 " barSize={90} />
          <ReferenceLine
            y={analysis.gapAnalysis.savingsGoal}
            stroke="#10B981"
            strokeDasharray="3 3"
            label={{ value: "Goal", position: "insideTopRight" }}
          />
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
    {
      name: "Current Plan",
      monthly: currentMonthly,
      coverage: analysis.gapAnalysis.coverage529,
    },
    {
      name: "Recommended",
      monthly: currentMonthly + Math.round(shortfall / (yearsLeft * 12)),
      coverage: parseFloat(userData.savingsGoalPercentage),
    },
    {
      name: "Aggressive",
      monthly:
        currentMonthly + Math.round((shortfall * 1.2) / (yearsLeft * 12)),
      coverage: parseFloat(userData.savingsGoalPercentage) * 1.2,
    },
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-xl font-semibold mb-4 text-black">
        Contribution Optimization
      </h3>
      <div className="space-y-4">
        {scenarios.map((scenario, index) => (
          <div
            key={index}
            className={`border rounded-lg p-4 ${
              index === 1
                ? "border-green-400 bg-green-50"
                : "border-orange-400 bg-orange-50"
            }`}
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <div className="font-semibold text-black">{scenario.name}</div>
                {index === 1 && (
                  <div className="text-xs text-green-700 font-medium">
                    RECOMMENDED
                  </div>
                )}
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-black">
                  ₹{scenario.monthly.toLocaleString("en-IN")}/mo
                </div>
              </div>
            </div>
            <div className="bg-gray-200 rounded-full h-2 mt-3">
              <div
                className={`h-2 rounded-full ${
                  index === 1 ? "bg-green-600" : "bg-orange-500"
                }`}
                style={{ width: `${Math.min(100, scenario.coverage)}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectionsPage;

// --- EFC Section ---
const EFCSection = ({ analysis, userData }) => {
  const efc = analysis.financialAid;
  if (!efc) return null;
  const academic = (userData?.academicPerformance || "").toLowerCase();
  const meritEligible = academic === "excellent" || academic === "good";
  const grantEligible =
    meritEligible || efc.financialAidEligibility.pellGrantEligible;

  // Fallback for estimated financial need if 0
  const tuitionTotal = analysis.tuitionProjections?.totalCollegeCost || 0;
  const savingsAtGrad = analysis.savingsProjections?.plan529?.finalBalance || 0;
  const fallbackNeed = Math.max(0, tuitionTotal - savingsAtGrad);
  const estimatedNeed =
    efc.estimatedFinancialNeed && efc.estimatedFinancialNeed > 0
      ? efc.estimatedFinancialNeed
      : fallbackNeed;

  return (
    <div className="bg-white rounded-xl shadow-lg p-0 overflow-hidden">
      <div className="bg-blue-600 text-white px-6 py-4">
        <h3 className="text-xl font-semibold">
          Expected Family Contribution (EFC)
        </h3>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border rounded-lg p-4">
            <div className="text-sm text-gray-700">Calculated EFC</div>
            <div className="text-2xl font-bold text-gray-900">
              ₹{efc.efc.toLocaleString("en-IN")}
            </div>
          </div>
          <div className="border rounded-lg p-4">
            <div className="text-sm text-gray-700">
              Estimated Financial Need
            </div>
            <div className="text-2xl font-bold text-gray-900">
              ₹{estimatedNeed.toLocaleString("en-IN")}
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm font-semibold text-gray-800 mb-2">
              Eligibility
            </div>
            <div className="text-sm text-gray-700 flex items-center justify-between">
              <span>Educational Grant Eligible</span>
              <span
                className={`font-semibold ${
                  grantEligible ? "text-green-600" : "text-gray-900"
                }`}
              >
                {grantEligible ? "Yes" : "No"}
              </span>
            </div>
            <div className="text-sm text-gray-700 flex items-center justify-between mt-2">
              <span>Need-based Aid Eligible</span>
              <span
                className={`font-semibold ${
                  efc.financialAidEligibility.needBasedAidEligible
                    ? "text-green-600"
                    : "text-gray-900"
                }`}
              >
                {efc.financialAidEligibility.needBasedAidEligible
                  ? "Yes"
                  : "No"}
              </span>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm font-semibold text-gray-800 mb-2">
              Breakdown
            </div>
            <div className="text-sm text-gray-700 space-y-1">
              <div className="flex items-center justify-between">
                <span>Available Income</span>
                <span className="font-semibold">
                  ₹{efc.breakdown.availableIncome.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Protected Assets</span>
                <span className="font-semibold">
                  ₹{efc.breakdown.protectedAssets.toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
