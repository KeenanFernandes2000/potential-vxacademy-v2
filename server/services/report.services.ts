import { db } from "../db/connection";
import { 
  users, 
  normalUsers, 
  assets, 
  subAssets, 
  organizations, 
  roleCategories, 
  roles, 
  seniorityLevels,
  trainingAreas, 
  modules, 
  courses, 
  userTrainingAreaProgress, 
  userModuleProgress, 
  userCourseProgress,
  assessments, 
  assessmentAttempts 
} from "../db/schema";
import { sql, desc, asc, count, sum, avg, eq, and, gte, lte, inArray } from "drizzle-orm";

export const reportServices = {

  // Comprehensive Analytics Data - Single endpoint for all analytics
  getAllAnalyticsData: async () => {
    try {
      const [
        // Key Metrics
        totalUsers,
        activeUsers,
        totalCourses,
        completedCourses,
        totalOrganizations,
        certificatesIssued,
        averageCompletionRate,
        monthlyGrowth,
        
        // User Growth Data
        userGrowthData,
        
        // Asset Distribution
        assetDistributionData,
        
        // Role Distribution
        roleDistributionData,
        
        // Seniority Distribution
        seniorityDistributionData,
        
        // Certificate Analytics
        certificateAnalyticsData,
        
        // Registration Trends
        registrationTrendsData,
        
        // Active vs Inactive Users
        activeInactiveUsersData,
        
        // Peak Usage Times
        peakUsageTimesData,
        
        // Training Area Enrollments
        trainingAreaEnrollmentsData,
        
        // Course Completion Rates
        courseCompletionRatesData,
        
        // Training Completion Heatmap
        trainingCompletionHeatmapData,
        
        // Certificate Trends
        certificateTrendsData,
        
        // Organization Role Distribution
        organizationRoleDistributionData,
        
        // Training Area Seniority Distribution
        trainingAreaSeniorityDistributionData,
        
        // Organization Role TreeMap
        organizationRoleTreeMapData
      ] = await Promise.all([
        // Key Metrics
        db.select({ count: count() }).from(users),
        db.select({ count: count() })
          .from(users)
          .where(gte(users.lastLogin, new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))),
        db.select({ count: count() }).from(courses),
        db.select({ count: count() })
          .from(userCourseProgress)
          .where(eq(userCourseProgress.status, "completed")),
        db.select({ count: count() }).from(organizations),
        db.select({ count: count() })
          .from(assessmentAttempts)
          .where(eq(assessmentAttempts.passed, true)),
        db.select({ 
          avgRate: sql<number>`ROUND(AVG(CASE WHEN ${userCourseProgress.status} = 'completed' THEN 100.0 ELSE 0.0 END), 2)`
        }).from(userCourseProgress),
        db.select({
          thisMonth: sql<number>`COUNT(CASE WHEN DATE_TRUNC('month', ${users.createdAt}) = DATE_TRUNC('month', CURRENT_DATE) THEN 1 END)`,
          lastMonth: sql<number>`COUNT(CASE WHEN DATE_TRUNC('month', ${users.createdAt}) = DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month') THEN 1 END)`
        }).from(users),
        
        // User Growth Data
        db.select({
          period: sql<string>`to_char(${users.createdAt}, 'YYYY-MM')`,
          totalUsers: count(),
          newUsers: count()
        })
        .from(users)
        .groupBy(sql`to_char(${users.createdAt}, 'YYYY-MM')`)
        .orderBy(asc(sql`to_char(${users.createdAt}, 'YYYY-MM')`)),
        
        // Asset Distribution
        db.select({
          asset: users.asset,
          subAsset: users.subAsset,
          userCount: count(),
          percentage: sql<number>`ROUND((COUNT(*) * 100.0 / SUM(COUNT(*)) OVER()), 2)`
        })
        .from(users)
        .groupBy(users.asset, users.subAsset)
        .orderBy(desc(count())),
        
        // Role Distribution
        db.select({
          asset: users.asset,
          subAsset: users.subAsset,
          roleCategory: normalUsers.roleCategory,
          userCount: count()
        })
        .from(users)
        .innerJoin(normalUsers, eq(users.id, normalUsers.userId))
        .groupBy(users.asset, users.subAsset, normalUsers.roleCategory),
        
        // Seniority Distribution
        db.select({
          asset: users.asset,
          seniority: normalUsers.seniority,
          userCount: count(),
          percentage: sql<number>`ROUND((COUNT(*) * 100.0 / SUM(COUNT(*)) OVER()), 2)`
        })
        .from(users)
        .innerJoin(normalUsers, eq(users.id, normalUsers.userId))
        .groupBy(users.asset, normalUsers.seniority),
        
        // Certificate Analytics
        db.select({
          period: sql<string>`to_char(${assessmentAttempts.completedAt}, 'YYYY-MM')`,
          asset: users.asset,
          certificatesEarned: count(),
          averageScore: avg(assessmentAttempts.score)
        })
        .from(assessmentAttempts)
        .innerJoin(users, eq(assessmentAttempts.userId, users.id))
        .where(eq(assessmentAttempts.passed, true))
        .groupBy(sql`to_char(${assessmentAttempts.completedAt}, 'YYYY-MM')`, users.asset)
        .orderBy(asc(sql`to_char(${assessmentAttempts.completedAt}, 'YYYY-MM')`)),
        
        // Registration Trends
        db.select({
          period: sql<string>`to_char(${users.createdAt}, 'YYYY-MM')`,
          newRegistrations: count(),
          cumulativeRegistrations: sql<number>`SUM(COUNT(*)) OVER (ORDER BY to_char(${users.createdAt}, 'YYYY-MM'))`
        })
        .from(users)
        .groupBy(sql`to_char(${users.createdAt}, 'YYYY-MM')`)
        .orderBy(asc(sql`to_char(${users.createdAt}, 'YYYY-MM')`)),
        
        // Active vs Inactive Users
        db.select({
          period: sql<string>`to_char(${users.lastLogin}, 'YYYY-MM')`,
          activeUsers: sql<number>`COUNT(CASE WHEN ${users.lastLogin} >= ${new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)} THEN 1 END)`,
          inactiveUsers: sql<number>`COUNT(CASE WHEN ${users.lastLogin} < ${new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)} THEN 1 END)`,
          totalUsers: count()
        })
        .from(users)
        .groupBy(sql`to_char(${users.lastLogin}, 'YYYY-MM')`)
        .orderBy(asc(sql`to_char(${users.lastLogin}, 'YYYY-MM')`)),
        
        // Peak Usage Times
        db.select({
          timePeriod: sql<string>`to_char(${users.lastLogin}, 'YYYY-MM-DD')`,
          loginCount: count(),
          uniqueUsers: sql<number>`COUNT(DISTINCT ${users.id})`
        })
        .from(users)
        .groupBy(sql`to_char(${users.lastLogin}, 'YYYY-MM-DD')`)
        .orderBy(desc(count()))
        .limit(20),
        
        // Training Area Enrollments
        db.select({
          period: sql<string>`to_char(${userTrainingAreaProgress.startedAt}, 'YYYY-MM')`,
          trainingArea: trainingAreas.name,
          enrollments: count(),
          completions: sql<number>`COUNT(CASE WHEN ${userTrainingAreaProgress.status} = 'completed' THEN 1 END)`
        })
        .from(userTrainingAreaProgress)
        .innerJoin(trainingAreas, eq(userTrainingAreaProgress.trainingAreaId, trainingAreas.id))
        .groupBy(sql`to_char(${userTrainingAreaProgress.startedAt}, 'YYYY-MM')`, trainingAreas.name)
        .orderBy(asc(sql`to_char(${userTrainingAreaProgress.startedAt}, 'YYYY-MM')`)),
        
        // Course Completion Rates
        db.select({
          trainingArea: trainingAreas.name,
          organization: users.organization,
          totalEnrollments: count(),
          completedCourses: sql<number>`COUNT(CASE WHEN ${userCourseProgress.status} = 'completed' THEN 1 END)`,
          completionRate: sql<number>`ROUND((COUNT(CASE WHEN ${userCourseProgress.status} = 'completed' THEN 1 END) * 100.0 / COUNT(*)), 2)`
        })
        .from(userCourseProgress)
        .innerJoin(courses, eq(userCourseProgress.courseId, courses.id))
        .innerJoin(modules, eq(courses.moduleId, modules.id))
        .innerJoin(trainingAreas, eq(modules.trainingAreaId, trainingAreas.id))
        .innerJoin(users, eq(userCourseProgress.userId, users.id))
        .groupBy(trainingAreas.name, users.organization),
        
        // Training Completion Heatmap
        db.select({
          roleCategory: normalUsers.roleCategory,
          asset: users.asset,
          subAsset: users.subAsset,
          trainingArea: trainingAreas.name,
          totalUsers: sql<number>`COUNT(DISTINCT ${users.id})`,
          completedUsers: sql<number>`COUNT(DISTINCT CASE WHEN ${userTrainingAreaProgress.status} = 'completed' THEN ${users.id} END)`,
          completionRate: sql<number>`ROUND((COUNT(DISTINCT CASE WHEN ${userTrainingAreaProgress.status} = 'completed' THEN ${users.id} END) * 100.0 / COUNT(DISTINCT ${users.id})), 2)`
        })
        .from(users)
        .innerJoin(normalUsers, eq(users.id, normalUsers.userId))
        .innerJoin(userTrainingAreaProgress, eq(users.id, userTrainingAreaProgress.userId))
        .innerJoin(trainingAreas, eq(userTrainingAreaProgress.trainingAreaId, trainingAreas.id))
        .groupBy(normalUsers.roleCategory, users.asset, users.subAsset, trainingAreas.name),
        
        // Certificate Trends
        db.select({
          period: sql<string>`to_char(${assessmentAttempts.completedAt}, 'YYYY-MM')`,
          trainingArea: trainingAreas.name,
          certificatesEarned: count(),
          averageScore: avg(assessmentAttempts.score)
        })
        .from(assessmentAttempts)
        .innerJoin(assessments, eq(assessmentAttempts.assessmentId, assessments.id))
        .innerJoin(trainingAreas, eq(assessments.trainingAreaId, trainingAreas.id))
        .where(eq(assessmentAttempts.passed, true))
        .groupBy(sql`to_char(${assessmentAttempts.completedAt}, 'YYYY-MM')`, trainingAreas.name)
        .orderBy(asc(sql`to_char(${assessmentAttempts.completedAt}, 'YYYY-MM')`)),
        
        // Organization Role Distribution
        db.select({
          organization: users.organization,
          roleCategory: normalUsers.roleCategory,
          userCount: count(),
          percentage: sql<number>`ROUND((COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (PARTITION BY ${users.organization})), 2)`
        })
        .from(users)
        .innerJoin(normalUsers, eq(users.id, normalUsers.userId))
        .groupBy(users.organization, normalUsers.roleCategory),
        
        // Training Area Seniority Distribution
        db.select({
          trainingArea: trainingAreas.name,
          seniority: normalUsers.seniority,
          userCount: count(),
          percentage: sql<number>`ROUND((COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (PARTITION BY ${trainingAreas.name})), 2)`
        })
        .from(users)
        .innerJoin(normalUsers, eq(users.id, normalUsers.userId))
        .innerJoin(userTrainingAreaProgress, eq(users.id, userTrainingAreaProgress.userId))
        .innerJoin(trainingAreas, eq(userTrainingAreaProgress.trainingAreaId, trainingAreas.id))
        .groupBy(trainingAreas.name, normalUsers.seniority),
        
        // Organization Role TreeMap
        db.select({
          organization: users.organization,
          roleCategory: normalUsers.roleCategory,
          role: normalUsers.role,
          userCount: count(),
          totalXp: sum(users.xp)
        })
        .from(users)
        .innerJoin(normalUsers, eq(users.id, normalUsers.userId))
        .groupBy(users.organization, normalUsers.roleCategory, normalUsers.role)
        .orderBy(users.organization, desc(count()))
      ]);

      const growthRate = monthlyGrowth[0]?.lastMonth && monthlyGrowth[0].lastMonth > 0 
        ? ((monthlyGrowth[0].thisMonth - monthlyGrowth[0].lastMonth) / monthlyGrowth[0].lastMonth) * 100
        : 0;

      return {
        // Key Metrics
        keyMetrics: {
          totalUsers: totalUsers[0]?.count || 0,
          activeUsers: activeUsers[0]?.count || 0,
          totalCourses: totalCourses[0]?.count || 0,
          completedCourses: completedCourses[0]?.count || 0,
          totalOrganizations: totalOrganizations[0]?.count || 0,
          certificatesIssued: certificatesIssued[0]?.count || 0,
          averageCompletionRate: averageCompletionRate[0]?.avgRate || 0,
          monthlyGrowth: Math.round(growthRate * 100) / 100
        },
        
        // Analytics Data
        userGrowth: userGrowthData,
        assetDistribution: assetDistributionData,
        roleDistribution: roleDistributionData,
        seniorityDistribution: seniorityDistributionData,
        certificateAnalytics: certificateAnalyticsData,
        registrationTrends: registrationTrendsData,
        activeInactiveUsers: activeInactiveUsersData,
        peakUsageTimes: peakUsageTimesData,
        trainingAreaEnrollments: trainingAreaEnrollmentsData,
        courseCompletionRates: courseCompletionRatesData,
        trainingCompletionHeatmap: trainingCompletionHeatmapData,
        certificateTrends: certificateTrendsData,
        organizationRoleDistribution: organizationRoleDistributionData,
        trainingAreaSeniorityDistribution: trainingAreaSeniorityDistributionData,
        organizationRoleTreeMap: organizationRoleTreeMapData
      };
    } catch (error) {
      console.error("Error in getAllAnalyticsData:", error);
      // Return default values if there's an error
      return {
        keyMetrics: {
          totalUsers: 0,
          activeUsers: 0,
          totalCourses: 0,
          completedCourses: 0,
          totalOrganizations: 0,
          certificatesIssued: 0,
          averageCompletionRate: 0,
          monthlyGrowth: 0
        },
        userGrowth: [],
        assetDistribution: [],
        roleDistribution: [],
        seniorityDistribution: [],
        certificateAnalytics: [],
        registrationTrends: [],
        activeInactiveUsers: [],
        peakUsageTimes: [],
        trainingAreaEnrollments: [],
        courseCompletionRates: [],
        trainingCompletionHeatmap: [],
        certificateTrends: [],
        organizationRoleDistribution: [],
        trainingAreaSeniorityDistribution: [],
        organizationRoleTreeMap: []
      };
    }
  }
};
