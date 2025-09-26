'use client';

import React, { useState } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { db, auth } from '@/config/firebase';

const DataEntryForm = ({ onDataSubmit }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Student Details
    studentName: '',
    currentAge: '',
    currentGrade: '',
    academicPerformance: 'average',
    interestedMajor: '',
    preferredSchoolType: 'public',
    preferredState: '',
    
    // Family Details
    parentName: '',
    relationshipStatus: 'married',
    householdIncome: '',
    employmentStatus: 'employed',
    numberOfDependents: '1',
    
    // Financial Details
    currentSavings: '',
    monthlyContribution: '',
    riskTolerance: 'moderate',
    expectedTuitionIncrease: '5',
    
    // Goals
    targetSchoolCost: '',
    savingsGoalPercentage: '70',
    timeHorizon: ''
  });

  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    
    try {
      const user = auth.currentUser;
      if (user) {
        // Calculate time horizon
        const timeHorizon = 18 - parseInt(formData.currentAge);
        const updatedFormData = { ...formData, timeHorizon: timeHorizon.toString() };
        
        await setDoc(doc(db, 'userProfiles', user.uid), {
          ...updatedFormData,
          userId: user.uid,
          createdAt: new Date(),
          lastUpdated: new Date()
        });
        
        onDataSubmit(updatedFormData);
      }
    } catch (error) {
      console.error('Error saving data:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {[1, 2, 3, 4].map((step) => (
        <div key={step} className="flex items-center">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
              step <= currentStep
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-600'
            }`}
          >
            {step}
          </div>
          {step < 4 && (
            <div
              className={`w-16 h-1 ${
                step < currentStep ? 'bg-blue-500' : 'bg-gray-200'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );

  const renderStudentDetails = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Student Information</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Student Name *
          </label>
          <input
            type="text"
            name="studentName"
            value={formData.studentName}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter student's name"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Current Age *
          </label>
          <select
            name="currentAge"
            value={formData.currentAge}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          >
            <option value="">Select age</option>
            {Array.from({ length: 18 }, (_, i) => (
              <option key={i} value={i + 1}>{i + 1} years old</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Current Grade
          </label>
          <select
            name="currentGrade"
            value={formData.currentGrade}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select grade</option>
            <option value="pre-k">Pre-K</option>
            <option value="kindergarten">Kindergarten</option>
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i} value={`grade-${i + 1}`}>Grade {i + 1}</option>
            ))}
            <option value="graduated">High School Graduate</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Academic Performance
          </label>
          <select
            name="academicPerformance"
            value={formData.academicPerformance}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="excellent">Excellent (A+ average)</option>
            <option value="good">Good (A-/B+ average)</option>
            <option value="average">Average (B/C+ average)</option>
            <option value="below-average">Below Average</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Interested Major/Field
          </label>
          <input
            type="text"
            name="interestedMajor"
            value={formData.interestedMajor}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., Engineering, Medicine, Business"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Preferred School Type
          </label>
          <select
            name="preferredSchoolType"
            value={formData.preferredSchoolType}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="public">Public University</option>
            <option value="private">Private University</option>
            <option value="community">Community College</option>
            <option value="trade">Trade School</option>
            <option value="mixed">Open to all options</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Preferred State for College
        </label>
        <input
          type="text"
          name="preferredState"
          value={formData.preferredState}
          onChange={handleInputChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="e.g., California, Texas, New York (or 'Any')"
        />
      </div>
    </div>
  );

  const renderFamilyDetails = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Family Information</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Parent/Guardian Name *
          </label>
          <input
            type="text"
            name="parentName"
            value={formData.parentName}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter your name"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Relationship Status
          </label>
          <select
            name="relationshipStatus"
            value={formData.relationshipStatus}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="married">Married</option>
            <option value="single">Single</option>
            <option value="divorced">Divorced</option>
            <option value="widowed">Widowed</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Annual Household Income *
          </label>
          <select
            name="householdIncome"
            value={formData.householdIncome}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          >
            <option value="">Select income range</option>
            <option value="under-30k">Under $30,000</option>
            <option value="30k-50k">$30,000 - $50,000</option>
            <option value="50k-75k">$50,000 - $75,000</option>
            <option value="75k-100k">$75,000 - $100,000</option>
            <option value="100k-150k">$100,000 - $150,000</option>
            <option value="150k-200k">$150,000 - $200,000</option>
            <option value="200k-250k">$200,000 - $250,000</option>
            <option value="over-250k">Over $250,000</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Employment Status
          </label>
          <select
            name="employmentStatus"
            value={formData.employmentStatus}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="employed">Employed Full-time</option>
            <option value="part-time">Employed Part-time</option>
            <option value="self-employed">Self-employed</option>
            <option value="unemployed">Unemployed</option>
            <option value="retired">Retired</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Number of Dependents (including this student)
          </label>
          <select
            name="numberOfDependents"
            value={formData.numberOfDependents}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {Array.from({ length: 8 }, (_, i) => (
              <option key={i} value={i + 1}>{i + 1}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );

  const renderFinancialDetails = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Financial Information</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Current College Savings ($)
          </label>
          <input
            type="number"
            name="currentSavings"
            value={formData.currentSavings}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="0"
            min="0"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Monthly Contribution Capacity ($)
          </label>
          <input
            type="number"
            name="monthlyContribution"
            value={formData.monthlyContribution}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="0"
            min="0"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Investment Risk Tolerance
          </label>
          <select
            name="riskTolerance"
            value={formData.riskTolerance}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="conservative">Conservative (Lower risk, stable returns)</option>
            <option value="moderate">Moderate (Balanced risk and growth)</option>
            <option value="aggressive">Aggressive (Higher risk, higher potential returns)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Expected Annual Tuition Increase (%)
          </label>
          <select
            name="expectedTuitionIncrease"
            value={formData.expectedTuitionIncrease}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="3">3% (Conservative)</option>
            <option value="4">4% (Moderate)</option>
            <option value="5">5% (Historical Average)</option>
            <option value="6">6% (Aggressive)</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderGoalsAndTargets = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Goals & Targets</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Target Annual Tuition Cost ($)
          </label>
          <input
            type="number"
            name="targetSchoolCost"
            value={formData.targetSchoolCost}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., 25000"
            min="0"
          />
          <p className="text-sm text-gray-500 mt-1">
            Average public: ~$25,000, Private: ~$55,000
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Savings Goal (% of total cost)
          </label>
          <select
            name="savingsGoalPercentage"
            value={formData.savingsGoalPercentage}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="25">25% (Supplemental support)</option>
            <option value="50">50% (Half coverage)</option>
            <option value="70">70% (Substantial coverage)</option>
            <option value="100">100% (Full coverage)</option>
          </select>
        </div>
      </div>

      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="font-semibold text-blue-800 mb-2">Planning Summary</h3>
        <div className="text-sm text-blue-700 space-y-1">
          <p><strong>Student:</strong> {formData.studentName || 'Not specified'}</p>
          <p><strong>Current Age:</strong> {formData.currentAge ? `${formData.currentAge} years` : 'Not specified'}</p>
          <p><strong>Years to College:</strong> {formData.currentAge ? 18 - parseInt(formData.currentAge) : 'N/A'}</p>
          <p><strong>Monthly Contribution:</strong> ${formData.monthlyContribution || '0'}</p>
          <p><strong>Current Savings:</strong> ${formData.currentSavings || '0'}</p>
        </div>
      </div>
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return renderStudentDetails();
      case 2:
        return renderFamilyDetails();
      case 3:
        return renderFinancialDetails();
      case 4:
        return renderGoalsAndTargets();
      default:
        return renderStudentDetails();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {renderStepIndicator()}
          
          <div className="mb-8">
            {renderCurrentStep()}
          </div>

          <div className="flex justify-between">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Previous
            </button>

            {currentStep < 4 ? (
              <button
                onClick={nextStep}
                className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all"
              >
                Next Step
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {loading ? 'Saving...' : 'Complete Setup'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataEntryForm;