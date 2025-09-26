'use client';

import React, { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/config/firebase';
import { generateRecommendations } from '@/lib/recommendationEngine'; // Corrected path
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, ReferenceLine } from 'recharts';

// --- MAIN DASHBOARD COMPONENT ---
const DashboardPage = () => {
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const user = auth.currentUser;
                if (user) {
                    const docRef = doc(db, 'userProfiles', user.uid);
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists()) {
                        setUserData(docSnap.data());
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
                fetchUserData();
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

    if (!userData) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-700">Please log in to view your dashboard.</h2>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
                {/* --- User Profile Section --- */}
                <UserProfileHeader userData={userData} />
                <QuickStats userData={userData} />
                <StudentProfileCard userData={userData} />

                {/* --- Recommendation Section --- */}
                <RecommendationDashboard userData={userData} />

                 {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <button className="bg-purple-500 hover:bg-purple-600 text-white font-semibold py-4 px-6 rounded-xl transition-all shadow-lg">
                        Export Report
                    </button>
                </div> */}
            </div>
        </div>
    );
};

// --- SUB-COMPONENTS ---

const UserProfileHeader = ({ userData }) => (
    <div className="bg-white rounded-2xl shadow-xl p-6">
        <div className="flex justify-between items-center">
            <div>
                <h1 className="text-3xl font-bold text-gray-800">
                    Welcome back, {userData?.parentName}!
                </h1>
                <p className="text-gray-600 mt-2">
                    Planning for {userData?.studentName}'s college journey
                </p>
            </div>
            <div className="text-right">
                <p className="text-sm text-gray-500">Years to college</p>
                <p className="text-3xl font-bold text-blue-600">
                    {userData?.timeHorizon || 'N/A'}
                </p>
            </div>
        </div>
    </div>
);

const QuickStats = ({ userData }) => (
     <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Current Savings</p>
              <p className="text-2xl font-bold text-gray-800">
                ${parseInt(userData?.currentSavings || 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Monthly Contribution</p>
              <p className="text-2xl font-bold text-gray-800">
                ${parseInt(userData?.monthlyContribution || 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Target Tuition</p>
              <p className="text-2xl font-bold text-gray-800">
                ${parseInt(userData?.targetSchoolCost || 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>
);

const StudentProfileCard = ({ userData }) => (
     <div className="bg-white rounded-2xl shadow-xl p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Student Profile</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-gray-500">Name</p>
            <p className="text-lg font-semibold text-gray-800">{userData?.studentName}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Current Age</p>
            <p className="text-lg font-semibold text-gray-800">{userData?.currentAge} years</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Current Grade</p>
            <p className="text-lg font-semibold text-gray-800 capitalize">
              {userData?.currentGrade?.replace('-', ' ') || 'Not specified'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Academic Performance</p>
            <p className="text-lg font-semibold text-gray-800 capitalize">
              {userData?.academicPerformance}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Interested Major</p>
            <p className="text-lg font-semibold text-gray-800">
              {userData?.interestedMajor || 'Not specified'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Preferred School Type</p>
            <p className="text-lg font-semibold text-gray-800 capitalize">
              {userData?.preferredSchoolType}
            </p>
          </div>
        </div>
      </div>
);


const RecommendationDashboard = ({ userData }) => {
  const [recommendations, setRecommendations] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const generateRecs = async () => {
      try {
        const recs = generateRecommendations(userData);
        setRecommendations(recs);
      } catch (error) {
        console.error('Error generating recommendations:', error);
      } finally {
        setLoading(false);
      }
    };

    if (userData) {
      generateRecs();
    }
  }, [userData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!recommendations) {
    return (
      <div className="text-center text-gray-500 py-8 bg-white rounded-2xl shadow-xl">
        Unable to generate recommendations. Please check your profile data.
      </div>
    );
  }

  const { analysis } = recommendations;

  const trajectoryData = analysis.savingsProjections.plan529.yearlyProjections.map((year, index) => ({
    year: new Date().getFullYear() + index + 1,
    savings: year.balance,
    target: (analysis.gapAnalysis.savingsGoal / analysis.timeline.yearsToCollege) * (index + 1),
    tuitionNeed: analysis.tuitionProjections.yearByCost[0]?.cost * (index + 1) || 0
  }));

  const savingsComparisonData = [
    { vehicle: '529 Plan', finalAmount: analysis.savingsProjections.plan529.finalBalance },
    { vehicle: 'Traditional Savings', finalAmount: analysis.savingsProjections.traditionalSavings.finalBalance },
    { vehicle: 'Coverdell ESA', finalAmount: analysis.savingsProjections.coverdellESA.finalBalance }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white shadow-2xl">
        <h1 className="text-3xl font-bold mb-4">Your College Savings Recommendations</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/20 rounded-lg p-4">
            <div className="text-2xl font-bold">{recommendations.summary.highPriorityCount}</div>
            <div className="text-blue-100">High Priority Actions</div>
          </div>
          <div className="bg-white/20 rounded-lg p-4">
            <div className="text-2xl font-bold">${recommendations.summary.estimatedImpact.toLocaleString()}</div>
            <div className="text-blue-100">Potential Additional Savings</div>
          </div>
          <div className="bg-white/20 rounded-lg p-4">
            <div className="text-2xl font-bold">{Math.round(analysis.gapAnalysis.coverage529)}%</div>
            <div className="text-blue-100">Goal Achievement</div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
        {[
          { id: 'overview', name: 'Overview', icon: '📊' },
          { id: 'recommendations', name: 'Recommendations', icon: '💡' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-blue-600'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.name}</span>
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold mb-4">Savings Trajectory</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trajectoryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, '']} />
                <Legend />
                <Line type="monotone" dataKey="savings" stroke="#3B82F6" strokeWidth={3} name="Projected Savings"/>
                <Line type="monotone" dataKey="target" stroke="#10B981" strokeDasharray="5 5" name="Savings Goal"/>
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold mb-4">Investment Vehicle Comparison</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={savingsComparisonData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="vehicle" />
                <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, '']} />
                <Bar dataKey="finalAmount" fill="#3B82F6" />
                <ReferenceLine y={analysis.gapAnalysis.savingsGoal} stroke="#10B981" strokeDasharray="3 3" />
              </BarChart>
            </ResponsiveContainer>
             <div className="mt-4 text-sm text-gray-600">
                <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 mr-2 rounded-full"></div>
                        Savings Goal: ${analysis.gapAnalysis.savingsGoal.toLocaleString()}
                </div>
            </div>
          </div>
        </div>
      )}

      {/* Recommendations Tab */}
      {activeTab === 'recommendations' && (
         <div className="space-y-6">
             <div>
               <h3 className="text-xl font-semibold mb-4 text-red-600">🚨 High Priority Actions</h3>
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 {recommendations.primary.map((rec) => (
                   <RecommendationCard key={rec.id} recommendation={rec} priority="high" />
                 ))}
               </div>
             </div>
             {recommendations.secondary.length > 0 && (
               <div>
                 <h3 className="text-xl font-semibold mb-4 text-orange-600">⚡ Consider These Options</h3>
                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                   {recommendations.secondary.map((rec) => (
                     <RecommendationCard key={rec.id} recommendation={rec} priority="medium" />
                   ))}
                 </div>
               </div>
             )}
         </div>
      )}
    </div>
  );
};


const RecommendationCard = ({ recommendation, priority }) => {
    const [expanded, setExpanded] = useState(false);
    
    const priorityClasses = {
        high: { border: 'border-red-200', bg: 'bg-red-50', text: 'text-red-600' },
        medium: { border: 'border-orange-200', bg: 'bg-orange-50', text: 'text-orange-600' },
        low: { border: 'border-blue-200', bg: 'bg-blue-50', text: 'text-blue-600' }
    };
    
    const icons = { high: '🚨', medium: '⚡', low: '🎯' };
    const selectedClass = priorityClasses[priority];

    return (
        <div className={`border-2 rounded-xl p-6 transition-all hover:shadow-lg ${selectedClass.border} ${selectedClass.bg}`}>
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                    <span className="text-xl">{icons[priority]}</span>
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${selectedClass.text} bg-white`}>
                        {priority.toUpperCase()} PRIORITY
                    </span>
                </div>
            </div>
            
            <h4 className="font-bold text-lg text-gray-800 mb-2">{recommendation.title}</h4>
            <p className="text-gray-600 mb-4">{recommendation.description}</p>
            
            <button 
                onClick={() => setExpanded(!expanded)}
                className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
                <span>{expanded ? 'Less Details' : 'More Details'}</span>
                <span className={`transform transition-transform ${expanded ? 'rotate-180' : ''}`}>↓</span>
            </button>
            
            {expanded && (
                <div className="mt-4 space-y-3 border-t pt-4">
                    {recommendation.benefits && (
                        <div>
                            <div className="text-sm font-medium text-gray-700 mb-2">Benefits:</div>
                            <ul className="text-sm text-gray-600 space-y-1">
                                {recommendation.benefits.map((benefit, index) => (
                                    <li key={index} className="flex items-start">
                                        <span className="text-green-500 mr-2">✓</span>
                                        {benefit}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default DashboardPage;