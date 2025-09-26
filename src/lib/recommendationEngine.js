import {
  runScenarioAnalysis,
  runMonteCarloSimulation,
} from "@/lib/scenerioEngine";

/**
 * Advanced Recommendation Engine for College Savings
 * Generates personalized, actionable recommendations based on scenario analysis
 */

/**
 * Generate comprehensive recommendations based on user data
 * @param {object} userData - User profile data
 * @returns {object} Structured recommendations with priorities and actions
 */
export function generateRecommendations(userData) {
  const analysis = runScenarioAnalysis(userData);
  const recommendations = {
    primary: [],
    secondary: [],
    strategies: [],
    insights: [],
  };

  // Analyze current situation
  const { savingsProjections, gapAnalysis, financialAid, timeline } = analysis;

  const monthlyContrib = parseFloat(userData.monthlyContribution) || 0;
  const currentSavings = parseFloat(userData.currentSavings) || 0;
  const yearsToCollege = timeline.yearsToCollege;

  // PRIMARY RECOMMENDATIONS (High Priority)

  // 1. 529 Plan Recommendation
  if (gapAnalysis.coverage529 > gapAnalysis.coverageTraditional) {
    const taxSavings = savingsProjections.plan529.totalTaxSavings;
    recommendations.primary.push({
      id: "invest-529",
      type: "investment",
      priority: "high",
      title: "Maximize 529 Plan Benefits",
      description: `Switch to a 529 plan to save approximately $${taxSavings.toLocaleString()} in taxes over ${yearsToCollege} years.`,
      impact: "high",
      effort: "low",
      action: "Open a 529 college savings plan and transfer existing savings",
      benefits: [
        `Tax-free growth and withdrawals for qualified expenses`,
        `Potential state tax deductions`,
        `Higher investment returns than traditional savings`,
        `Professional fund management options`,
      ],
      metrics: {
        additionalSavings: taxSavings,
        betterCoverage: Math.round(
          gapAnalysis.coverage529 - gapAnalysis.coverageTraditional
        ),
        timeToImplement: "1-2 weeks",
      },
    });
  }

  // 2. Contribution Adjustment
  if (gapAnalysis.shortfall529 > 1000) {
    const additionalNeeded = Math.round(
      gapAnalysis.shortfall529 / (yearsToCollege * 12)
    );
    const newMonthlyTarget = monthlyContrib + additionalNeeded;

    recommendations.primary.push({
      id: "increase-contributions",
      type: "contribution",
      priority: "high",
      title: "Increase Monthly Contributions",
      description: `Increase monthly savings by $${additionalNeeded} to reach your ${userData.savingsGoalPercentage}% coverage goal.`,
      impact: "high",
      effort: "medium",
      action: `Adjust automatic contributions from $${monthlyContrib} to $${newMonthlyTarget} monthly`,
      benefits: [
        "Reach savings goal on schedule",
        "Reduce future financial stress",
        "Take advantage of compound growth",
      ],
      metrics: {
        currentGap: gapAnalysis.shortfall529,
        additionalMonthly: additionalNeeded,
        goalAchievementDate: `${yearsToCollege} years`,
      },
    });
  }

  // 3. Risk Tolerance Optimization
  const conservativeReturn = savingsProjections.plan529.effectiveReturn;
  if (userData.riskTolerance === "conservative" && yearsToCollege > 10) {
    recommendations.primary.push({
      id: "optimize-risk",
      type: "strategy",
      priority: "high",
      title: "Consider Moderate Risk Tolerance",
      description: `With ${yearsToCollege} years until college, a moderate risk approach could increase your savings by 15-25%.`,
      impact: "high",
      effort: "low",
      action: "Adjust 529 plan allocation to age-based moderate portfolio",
      benefits: [
        "Higher potential returns over long term",
        "Professional age-based rebalancing",
        "Still conservative compared to aggressive options",
      ],
      metrics: {
        potentialAdditionalReturn: "2-4% annually",
        timeHorizon: `${yearsToCollege} years`,
        riskLevel: "Moderate",
      },
    });
  }

  // SECONDARY RECOMMENDATIONS (Medium Priority)

  // 4. Emergency Fund Strategy
  const emergencyFundTarget = monthlyContrib * 6; // 6 months of contributions
  const liquidityRecommendation = Math.min(
    20,
    (emergencyFundTarget / gapAnalysis.savingsGoal) * 100
  );

  recommendations.secondary.push({
    id: "liquidity-balance",
    type: "strategy",
    priority: "medium",
    title: `Keep ${Math.round(liquidityRecommendation)}% in Liquid Savings`,
    description: `Maintain $${emergencyFundTarget.toLocaleString()} in traditional savings for emergencies while investing the rest.`,
    impact: "medium",
    effort: "low",
    action: `Split savings: ${
      100 - liquidityRecommendation
    }% in 529 plan, ${liquidityRecommendation}% in high-yield savings`,
    benefits: [
      "Financial flexibility for unexpected expenses",
      "Avoid early withdrawal penalties",
      "Peace of mind with accessible funds",
    ],
    metrics: {
      liquidAmount: emergencyFundTarget,
      investedAmount: gapAnalysis.savingsGoal - emergencyFundTarget,
      liquidityPercentage: liquidityRecommendation,
    },
  });

  // 5. Financial Aid Optimization
  if (financialAid.efc > 15000 && financialAid.assetContribution > 3000) {
    recommendations.secondary.push({
      id: "financial-aid-strategy",
      type: "planning",
      priority: "medium",
      title: "Optimize Financial Aid Eligibility",
      description: `Your current assets may reduce financial aid by $${financialAid.assetContribution.toLocaleString()}. Consider parent-owned 529 plans.`,
      impact: "medium",
      effort: "medium",
      action:
        "Move student assets to parent-owned 529 plans before junior year of high school",
      benefits: [
        "Reduce asset impact on financial aid (5.64% vs 20%)",
        "Potentially qualify for more need-based aid",
        "Maintain control over college funds",
      ],
      metrics: {
        potentialAidIncrease: Math.round(financialAid.assetContribution * 0.15),
        implementationTiming: "Before junior year",
        currentAssetImpact: financialAid.assetContribution,
      },
    });
  }

  // 6. Coverdell ESA for K-12 Expenses
  if (userData.currentAge <= 10 && monthlyContrib * 12 < 2000) {
    recommendations.secondary.push({
      id: "coverdell-esa",
      type: "investment",
      priority: "medium",
      title: "Consider Coverdell ESA for K-12 Flexibility",
      description:
        "Use Coverdell ESA for K-12 private school expenses while building college savings.",
      impact: "medium",
      effort: "medium",
      action:
        "Open Coverdell ESA alongside 529 plan for educational flexibility",
      benefits: [
        "Tax-free withdrawals for K-12 expenses",
        "More investment options than 529 plans",
        "Hedge against private school costs",
      ],
      metrics: {
        annualLimit: 2000,
        currentContribution: monthlyContrib * 12,
        flexibility: "K-12 and college",
      },
    });
  }

  // STRATEGIC RECOMMENDATIONS (Long-term)

  // 7. Grandparent 529 Strategy
  if (yearsToCollege > 5) {
    recommendations.strategies.push({
      id: "grandparent-529",
      type: "family-strategy",
      priority: "low",
      title: "Coordinate with Grandparent 529 Plans",
      description:
        "Grandparent-owned 529 plans can provide additional savings without affecting financial aid initially.",
      impact: "medium",
      effort: "high",
      action: "Discuss college savings coordination with grandparents",
      benefits: [
        "Additional college funding source",
        "No impact on financial aid until used",
        "Estate planning benefits for grandparents",
      ],
      timing: "Implement 2+ years before college",
      considerations: [
        "Coordinate timing of distributions",
        "May affect aid in subsequent years",
        "Requires family communication",
      ],
    });
  }

  // 8. State-Specific Optimization
  recommendations.strategies.push({
    id: "state-optimization",
    type: "tax-strategy",
    priority: "low",
    title: "Maximize State Tax Benefits",
    description:
      "Research your state's 529 plan benefits and contribution limits for tax deductions.",
    impact: "low",
    effort: "medium",
    action:
      "Review state-specific 529 plan benefits and consider in-state vs. out-of-state plans",
    benefits: [
      "State tax deductions or credits",
      "Potential matching contributions",
      "State-specific investment options",
    ],
    nextSteps: [
      "Research state tax benefits",
      "Compare in-state vs. national 529 plans",
      "Consult tax professional if needed",
    ],
  });

  // INSIGHTS AND PROJECTIONS

  recommendations.insights.push({
    id: "savings-trajectory",
    title: "Savings Trajectory Analysis",
    data: {
      onTrackPercentage: Math.round(gapAnalysis.coverage529),
      projectedShortfall: gapAnalysis.shortfall529,
      timeToGoal: yearsToCollege,
      confidenceLevel:
        gapAnalysis.coverage529 > 80
          ? "high"
          : gapAnalysis.coverage529 > 60
          ? "medium"
          : "low",
    },
    insight:
      gapAnalysis.coverage529 >= 90
        ? "You're on track to meet your college savings goal! Consider optimizing for tax benefits."
        : gapAnalysis.coverage529 >= 70
        ? "You're making good progress. Small adjustments can help you reach your goal."
        : "Significant action needed to reach your savings goal. Consider increasing contributions or extending timeline.",
  });

  recommendations.insights.push({
    id: "financial-aid-impact",
    title: "Financial Aid Eligibility",
    data: {
      efc: financialAid.efc,
      pellEligible: financialAid.financialAidEligibility.pellGrantEligible,
      estimatedAid: financialAid.estimatedFinancialNeed,
      assetImpact: financialAid.assetContribution,
    },
    insight: financialAid.financialAidEligibility.pellGrantEligible
      ? "You may qualify for federal Pell Grants, which don't need to be repaid."
      : "Your EFC suggests limited need-based aid eligibility. Focus on merit scholarships and savings.",
  });

  recommendations.insights.push({
    id: "investment-efficiency",
    title: "Investment Vehicle Comparison",
    data: {
      plan529Return: savingsProjections.plan529.effectiveReturn,
      traditionalReturn: savingsProjections.traditionalSavings.effectiveReturn,
      taxSavings: savingsProjections.plan529.totalTaxSavings,
      recommendedAllocation: "80% 529 Plan, 20% Liquid Savings",
    },
    insight: `529 plans offer ${(
      savingsProjections.plan529.effectiveReturn -
      savingsProjections.traditionalSavings.effectiveReturn
    ).toFixed(1)}% better returns than traditional savings, plus tax benefits.`,
  });

  return {
    ...recommendations,
    summary: {
      totalRecommendations:
        recommendations.primary.length +
        recommendations.secondary.length +
        recommendations.strategies.length,
      highPriorityCount: recommendations.primary.length,
      estimatedImpact: calculateTotalImpact(recommendations),
      implementationTimeframe: "2-4 weeks for priority actions",
    },
    analysis,
  };
}

/**
 * Calculate total financial impact of recommendations
 */
function calculateTotalImpact(recommendations) {
  let totalImpact = 0;

  recommendations.primary.forEach((rec) => {
    if (rec.metrics?.additionalSavings) {
      totalImpact += rec.metrics.additionalSavings;
    }
  });

  return totalImpact;
}
