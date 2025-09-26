
/**
 * College Savings Scenario Engine
 * Handles all financial calculations for college savings planning
 */

// Investment return rates by risk tolerance
const INVESTMENT_RETURNS = {
  conservative: 0.05, // 5% annual return
  moderate: 0.07,     // 7% annual return
  aggressive: 0.09    // 9% annual return
};

// Average tuition costs by school type in INR (illustrative baselines)
const BASELINE_TUITION_COSTS = {
  public: 250000,       // Public in-state (₹)
  'public-out': 450000, // Public out-of-state (₹)
  private: 550000,      // Private university (₹)
  community: 40000,     // Community college (₹)
  trade: 150000         // Trade school (₹)
};

// State tax benefits for 529 plans (simplified - varies by state)
const STATE_TAX_BENEFITS = {
  deduction: 0.05,    // Average state tax deduction benefit
  credit: 0.03        // Some states offer credits instead
};

/**
 * 1. TUITION ESTIMATION FUNCTIONS
 */

/**
 * Calculate future tuition cost with inflation
 * @param {number} currentCost - Current annual tuition cost
 * @param {number} inflationRate - Annual tuition inflation rate (as decimal)
 * @param {number} yearsToCollege - Years until college starts
 * @returns {number} Future tuition cost
 */
export function calculateFutureTuition(currentCost, inflationRate, yearsToCollege) {
  return currentCost * Math.pow(1 + inflationRate, yearsToCollege);
}

/**
 * Estimate tuition based on school type and preferences
 * @param {string} schoolType - Type of school (public, private, etc.)
 * @param {string} preferredState - Preferred state (for in-state vs out-of-state)
 * @param {string} homeState - Student's home state
 * @param {number} customCost - Custom tuition cost if provided
 * @returns {number} Estimated annual tuition
 */
export function estimateBaseTuition(schoolType, preferredState, homeState, customCost = null) {
  if (customCost) return customCost;
  
  // Determine if student would be in-state or out-of-state
  const isInState = preferredState === homeState || preferredState === 'Any';
  
  switch (schoolType) {
    case 'public':
      return isInState ? BASELINE_TUITION_COSTS.public : BASELINE_TUITION_COSTS['public-out'];
    case 'private':
      return BASELINE_TUITION_COSTS.private;
    case 'community':
      return BASELINE_TUITION_COSTS.community;
    case 'trade':
      return BASELINE_TUITION_COSTS.trade;
    case 'mixed':
      // Average of public in-state and private
      return (BASELINE_TUITION_COSTS.public + BASELINE_TUITION_COSTS.private) / 2;
    default:
      return BASELINE_TUITION_COSTS.public;
  }
}

/**
 * Calculate total 4-year college cost
 * @param {number} annualTuition - Annual tuition cost
 * @param {number} inflationRate - Annual inflation rate
 * @returns {object} Year-by-year costs and total
 */
export function calculateTotalCollegeCost(annualTuition, inflationRate) {
  const costs = [];
  let totalCost = 0;
  
  for (let year = 1; year <= 4; year++) {
    const yearCost = annualTuition * Math.pow(1 + inflationRate, year - 1);
    costs.push({
      year,
      cost: Math.round(yearCost)
    });
    totalCost += yearCost;
  }
  
  return {
    yearByCosts: costs,
    totalCost: Math.round(totalCost)
  };
}

/**
 * 2. SAVINGS GROWTH SIMULATION FUNCTIONS
 */

/**
 * Calculate 529 plan growth with tax advantages
 * @param {number} initialAmount - Starting savings amount
 * @param {number} monthlyContribution - Monthly contribution
 * @param {number} annualReturn - Expected annual return rate
 * @param {number} years - Investment time horizon
 * @param {number} taxRate - Marginal tax rate for tax benefit calculation
 * @returns {object} Detailed 529 projection
 */
export function simulate529Growth(initialAmount, monthlyContribution, annualReturn, years, taxRate = 0.22) {
  const monthlyReturn = annualReturn / 12;
  let balance = initialAmount;
  let totalContributions = initialAmount;
  let taxSavings = 0;
  
  const yearlyProjections = [];
  
  for (let year = 1; year <= years; year++) {
    let yearStartBalance = balance;
    let yearContributions = 0;
    
    // Calculate monthly growth for the year
    for (let month = 1; month <= 12; month++) {
      balance = balance * (1 + monthlyReturn) + monthlyContribution;
      yearContributions += monthlyContribution;
      totalContributions += monthlyContribution;
    }
    
    // Calculate tax savings (simplified - varies by state)
    const yearTaxSavings = yearContributions * STATE_TAX_BENEFITS.deduction;
    taxSavings += yearTaxSavings;
    
    yearlyProjections.push({
      year,
      balance: Math.round(balance),
      contributions: Math.round(yearContributions),
      growth: Math.round(balance - yearStartBalance - yearContributions),
      taxSavings: Math.round(yearTaxSavings)
    });
  }
  
  return {
    finalBalance: Math.round(balance),
    totalContributions: Math.round(totalContributions),
    totalGrowth: Math.round(balance - totalContributions),
    totalTaxSavings: Math.round(taxSavings),
    yearlyProjections,
    effectiveReturn: totalContributions > 0 ? 
      ((balance - totalContributions) / totalContributions * 100) : 0
  };
}

/**
 * Calculate traditional savings account growth
 * @param {number} initialAmount - Starting amount
 * @param {number} monthlyContribution - Monthly contribution
 * @param {number} interestRate - Annual interest rate (typically low)
 * @param {number} years - Time horizon
 * @returns {object} Traditional savings projection
 */
export function simulateTraditionalSavings(initialAmount, monthlyContribution, interestRate = 0.04, years) {
  const monthlyRate = interestRate / 12;
  let balance = initialAmount;
  let totalContributions = initialAmount;
  
  const yearlyProjections = [];
  
  for (let year = 1; year <= years; year++) {
    let yearStartBalance = balance;
    let yearContributions = 0;
    
    for (let month = 1; month <= 12; month++) {
      balance = balance * (1 + monthlyRate) + monthlyContribution;
      yearContributions += monthlyContribution;
      totalContributions += monthlyContribution;
    }
    
    yearlyProjections.push({
      year,
      balance: Math.round(balance),
      contributions: Math.round(yearContributions),
      growth: Math.round(balance - yearStartBalance - yearContributions)
    });
  }
  
  return {
    finalBalance: Math.round(balance),
    totalContributions: Math.round(totalContributions),
    totalGrowth: Math.round(balance - totalContributions),
    yearlyProjections,
    effectiveReturn: totalContributions > 0 ? 
      ((balance - totalContributions) / totalContributions * 100) : 0
  };
}

/**
 * Simulate Coverdell ESA growth
 * @param {number} initialAmount - Starting amount
 * @param {number} annualContribution - Annual contribution (max $2,000)
 * @param {number} annualReturn - Expected annual return
 * @param {number} years - Time horizon
 * @returns {object} Coverdell ESA projection
 */
export function simulateCoverdellESA(initialAmount, annualContribution, annualReturn, years) {
  // Coverdell has $2,000 annual contribution limit
  const maxContribution = Math.min(annualContribution, 2000);
  let balance = initialAmount;
  let totalContributions = initialAmount;
  
  const yearlyProjections = [];
  
  for (let year = 1; year <= years; year++) {
    const yearStartBalance = balance;
    balance = balance * (1 + annualReturn) + maxContribution;
    totalContributions += maxContribution;
    
    yearlyProjections.push({
      year,
      balance: Math.round(balance),
      contributions: Math.round(maxContribution),
      growth: Math.round(balance - yearStartBalance - maxContribution)
    });
  }
  
  return {
    finalBalance: Math.round(balance),
    totalContributions: Math.round(totalContributions),
    totalGrowth: Math.round(balance - totalContributions),
    yearlyProjections,
    effectiveReturn: totalContributions > 0 ? 
      ((balance - totalContributions) / totalContributions * 100) : 0,
    contributionLimit: 2000
  };
}

/**
 * 3. FINANCIAL AID ESTIMATION (EFC - Expected Family Contribution)
 */

/**
 * Convert income range to numeric value for calculations
 * @param {string} incomeRange - Income range string
 * @returns {number} Numeric income estimate
 */
function parseIncomeRange(incomeRange) {
  const incomeMap = {
    'under-30k': 25000,
    '30k-50k': 40000,
    '50k-75k': 62500,
    '75k-100k': 87500,
    '100k-150k': 125000,
    '150k-200k': 175000,
    '200k-250k': 225000,
    'over-250k': 300000
  };
  return incomeMap[incomeRange] || 87500;
}

/**
 * Calculate Expected Family Contribution (EFC) - Simplified Federal Methodology
 * @param {object} familyData - Family financial information
 * @returns {object} EFC calculation results
 */
export function calculateEFC(familyData) {
  const {
    householdIncome,
    relationshipStatus,
    numberOfDependents,
    currentSavings,
    parentAge = 45 // Default parent age
  } = familyData;
  
  const income = parseIncomeRange(householdIncome);
  const dependents = parseInt(numberOfDependents);
  const assets = parseInt(currentSavings) || 0;
  
  // Income Assessment
  let adjustedGrossIncome = income;
  
  // Standard deductions (simplified)
  const standardDeductions = relationshipStatus === 'married' ? 25900 : 12950;
  const stateLocalTaxes = income * 0.05; // Approximate state/local tax
  const employmentAllowance = Math.min(income * 0.35, 4000);
  
  const totalDeductions = standardDeductions + stateLocalTaxes + employmentAllowance;
  const availableIncome = Math.max(0, adjustedGrossIncome - totalDeductions);
  
  // Income contribution calculation (progressive rates)
  let incomeContribution = 0;
  if (availableIncome > 31300) {
    incomeContribution = (availableIncome - 31300) * 0.47 + 31300 * 0.22;
  } else {
    incomeContribution = availableIncome * 0.22;
  }
  
  // Asset Assessment
  // Asset protection allowance based on age and marital status
  const assetProtectionAllowance = relationshipStatus === 'married' ? 
    Math.max(0, 30000 + (parentAge - 45) * 600) : 
    Math.max(0, 15000 + (parentAge - 45) * 400);
  
  const protectedAssets = Math.min(assets, assetProtectionAllowance);
  const assessableAssets = Math.max(0, assets - protectedAssets);
  const assetContribution = assessableAssets * 0.12; // 12% of assessable assets
  
  // Family size adjustment
  const familySizeAdjustment = Math.max(0, (dependents - 1) * 2000);
  
  // Calculate EFC
  const preliminaryEFC = incomeContribution + assetContribution - familySizeAdjustment;
  const efc = Math.max(0, Math.round(preliminaryEFC));
  
  // Calculate financial aid eligibility (simplified)
  const averageCollegeCost = 30000; // Average annual college cost
  const estimatedFinancialNeed = Math.max(0, averageCollegeCost - efc);
  
  return {
    efc,
    incomeContribution: Math.round(incomeContribution),
    assetContribution: Math.round(assetContribution),
    familySizeAdjustment: Math.round(familySizeAdjustment),
    estimatedFinancialNeed,
    financialAidEligibility: {
      pellGrantEligible: efc <= 6500,
      needBasedAidEligible: estimatedFinancialNeed > 0,
      estimatedPellGrant: efc <= 6500 ? Math.max(0, 6500 - efc) : 0
    },
    breakdown: {
      availableIncome: Math.round(availableIncome),
      assessableAssets: Math.round(assessableAssets),
      protectedAssets: Math.round(protectedAssets)
    }
  };
}

/**
 * 4. COMPREHENSIVE SCENARIO ANALYSIS
 */

/**
 * Run complete scenario analysis
 * @param {object} userData - Complete user profile data
 * @returns {object} Comprehensive analysis results
 */
export function runScenarioAnalysis(userData) {
  const {
    currentAge,
    currentSavings,
    monthlyContribution,
    riskTolerance,
    expectedTuitionIncrease,
    targetSchoolCost,
    savingsGoalPercentage,
    preferredSchoolType,
    preferredState,
    householdIncome,
    relationshipStatus,
    numberOfDependents
  } = userData;
  
  // Calculate time horizon
  const yearsToCollege = Math.max(1, 18 - parseInt(currentAge));
  const inflationRate = parseFloat(expectedTuitionIncrease) / 100;
  const initialSavings = parseFloat(currentSavings) || 0;
  const monthlyContrib = parseFloat(monthlyContribution) || 0;
  const annualContrib = monthlyContrib * 12;
  
  // 1. Tuition Projections
  const baseTuition = targetSchoolCost ? 
    parseFloat(targetSchoolCost) : 
    estimateBaseTuition(preferredSchoolType, preferredState, 'home');
    
  const futureTuition = calculateFutureTuition(baseTuition, inflationRate, yearsToCollege);
  const collegeCosts = calculateTotalCollegeCost(futureTuition, inflationRate);
  
  // 2. Savings Projections
  const returnRate = INVESTMENT_RETURNS[riskTolerance] || INVESTMENT_RETURNS.moderate;
  
  const plan529 = simulate529Growth(initialSavings, monthlyContrib, returnRate, yearsToCollege);
  const traditionalSavings = simulateTraditionalSavings(initialSavings, monthlyContrib, 0.02, yearsToCollege);
  const coverdellESA = simulateCoverdellESA(initialSavings, annualContrib, returnRate, yearsToCollege);
  
  // 3. Financial Aid Analysis
  const efcAnalysis = calculateEFC({
    householdIncome,
    relationshipStatus,
    numberOfDependents,
    currentSavings: initialSavings
  });
  
  // 4. Gap Analysis
  const savingsGoal = (collegeCosts.totalCost * parseFloat(savingsGoalPercentage)) / 100;
  const shortfall529 = Math.max(0, savingsGoal - plan529.finalBalance);
  const shortfallTraditional = Math.max(0, savingsGoal - traditionalSavings.finalBalance);
  
  // 5. Recommendations
  const recommendations = generateRecommendations({
    shortfall529,
    shortfallTraditional,
    monthlyContrib,
    yearsToCollege,
    efcAnalysis,
    plan529,
    savingsGoal
  });
  
  return {
    timeline: {
      yearsToCollege,
      currentAge: parseInt(currentAge),
      collegeStartYear: new Date().getFullYear() + yearsToCollege
    },
    tuitionProjections: {
      currentAnnualCost: baseTuition,
      futureAnnualCost: Math.round(futureTuition),
      totalCollegeCost: collegeCosts.totalCost,
      yearByCost: collegeCosts.yearByCosts,
      inflationRate: inflationRate * 100
    },
    savingsProjections: {
      plan529,
      traditionalSavings,
      coverdellESA
    },
    financialAid: efcAnalysis,
    gapAnalysis: {
      savingsGoal: Math.round(savingsGoal),
      shortfall529: Math.round(shortfall529),
      shortfallTraditional: Math.round(shortfallTraditional),
      coverage529: Math.min(100, (plan529.finalBalance / savingsGoal) * 100),
      coverageTraditional: Math.min(100, (traditionalSavings.finalBalance / savingsGoal) * 100)
    },
    recommendations
  };
}

/**
 * Generate personalized recommendations
 * @param {object} analysisData - Analysis results
 * @returns {array} Array of recommendation objects
 */
function generateRecommendations(analysisData) {
  const {
    shortfall529,
    monthlyContrib,
    yearsToCollege,
    efcAnalysis,
    plan529,
    savingsGoal
  } = analysisData;
  
  const recommendations = [];
  
  // 529 Plan recommendation
  if (plan529.finalBalance >= savingsGoal * 0.9) {
    recommendations.push({
      type: 'success',
      title: 'On Track with 529 Plan',
      description: 'Your current 529 plan strategy will meet most of your savings goal.',
      priority: 'high',
      action: 'Continue current contributions and consider minor adjustments.'
    });
  } else if (shortfall529 > 0) {
    const additionalMonthly = shortfall529 / (yearsToCollege * 12);
    recommendations.push({
      type: 'action',
      title: 'Increase 529 Contributions',
      description: `Consider increasing monthly contributions by $${Math.round(additionalMonthly)} to meet your goal.`,
      priority: 'high',
      action: `Increase from $${monthlyContrib} to $${Math.round(monthlyContrib + additionalMonthly)} monthly.`
    });
  }
  
  // Financial aid recommendations
  if (efcAnalysis.pellGrantEligible) {
    recommendations.push({
      type: 'opportunity',
      title: 'Pell Grant Eligible',
      description: 'You may qualify for federal Pell Grants. This can significantly reduce college costs.',
      priority: 'medium',
      action: 'Complete FAFSA application when available.'
    });
  }
  
  // Asset strategy recommendations
  if (efcAnalysis.assetContribution > 5000) {
    recommendations.push({
      type: 'strategy',
      title: 'Asset Protection Strategy',
      description: 'Consider 529 plans to reduce asset impact on financial aid eligibility.',
      priority: 'medium',
      action: 'Move savings to parent-owned 529 plans for better financial aid treatment.'
    });
  }
  
  return recommendations;
}

/**
 * 5. MONTE CARLO SIMULATION FOR MARKET VOLATILITY
 */

/**
 * Run Monte Carlo simulation for investment returns
 * @param {number} initialAmount - Starting investment
 * @param {number} monthlyContribution - Monthly contribution
 * @param {number} expectedReturn - Expected annual return
 * @param {number} volatility - Standard deviation of returns
 * @param {number} years - Investment horizon
 * @param {number} simulations - Number of simulations to run
 * @returns {object} Simulation results with percentiles
 */
export function runMonteCarloSimulation(
  initialAmount, 
  monthlyContribution, 
  expectedReturn, 
  volatility, 
  years, 
  simulations = 1000
) {
  const results = [];
  
  for (let sim = 0; sim < simulations; sim++) {
    let balance = initialAmount;
    
    for (let year = 1; year <= years; year++) {
      // Generate random return using normal distribution (simplified)
      const randomReturn = expectedReturn + (Math.random() - 0.5) * 2 * volatility;
      const yearlyReturn = Math.max(-0.5, Math.min(0.5, randomReturn)); // Cap extreme values
      
      // Apply monthly contributions and growth
      for (let month = 1; month <= 12; month++) {
        balance = balance * (1 + yearlyReturn / 12) + monthlyContribution;
      }
    }
    
    results.push(Math.round(balance));
  }
  
  // Sort results for percentile calculation
  results.sort((a, b) => a - b);
  
  const percentile = (p) => results[Math.floor((p / 100) * results.length)];
  
  return {
    mean: Math.round(results.reduce((a, b) => a + b, 0) / results.length),
    median: percentile(50),
    percentile10: percentile(10),
    percentile25: percentile(25),
    percentile75: percentile(75),
    percentile90: percentile(90),
    worstCase: results[0],
    bestCase: results[results.length - 1],
    successRate: (results.filter(r => r >= 0).length / results.length) * 100
  };
}

// Export all functions
export default {
  calculateFutureTuition,
  estimateBaseTuition,
  calculateTotalCollegeCost,
  simulate529Growth,
  simulateTraditionalSavings,
  simulateCoverdellESA,
  calculateEFC,
  runScenarioAnalysis,
  runMonteCarloSimulation
};