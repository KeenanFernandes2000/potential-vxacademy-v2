import { db } from "../db/connection";
import { 
  users, 
  normalUsers, 
  subAdmins,
  assets, 
  subAssets, 
  organizations, 
  subOrganizations,
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
  assessmentAttempts,
  certificates
} from "../db/schema";
import { sql, desc, asc, count, sum, avg, eq, and, gte, lte, inArray, isNotNull } from "drizzle-orm";

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
        db.select({ count: count() })
          .from(users)
          .innerJoin(normalUsers, eq(users.id, normalUsers.userId))
          .groupBy(users.organization),
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
        
        // User Growth Data - Cumulative
        db.select({
          period: sql<string>`to_char(${users.createdAt}, 'YYYY-MM')`,
          newUsers: count(),
          totalUsers: sql<number>`SUM(COUNT(*)) OVER (ORDER BY to_char(${users.createdAt}, 'YYYY-MM') ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW)`
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
        
        // Role Distribution - Fixed to aggregate by asset only
        db.select({
          asset: users.asset,
          userCount: count()
        })
        .from(users)
        .innerJoin(normalUsers, eq(users.id, normalUsers.userId))
        .groupBy(users.asset)
        .orderBy(desc(count())),
        
        // Seniority Distribution - Fixed to only show managers and staff
        db.select({
          seniority: normalUsers.seniority,
          userCount: count(),
          percentage: sql<number>`ROUND((COUNT(*) * 100.0 / SUM(COUNT(*)) OVER()), 2)`
        })
        .from(users)
        .innerJoin(normalUsers, eq(users.id, normalUsers.userId))
        .where(inArray(normalUsers.seniority, ['Manager', 'Staff']))
        .groupBy(normalUsers.seniority)
        .orderBy(desc(count())),
        
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
        
        // Peak Usage Days - Changed from times to days
        db.select({
          dayOfWeek: sql<string>`to_char(${users.lastLogin}, 'Day')`,
          loginCount: count(),
          uniqueUsers: sql<number>`COUNT(DISTINCT ${users.id})`
        })
        .from(users)
        .where(isNotNull(users.lastLogin))
        .groupBy(sql`to_char(${users.lastLogin}, 'Day')`)
        .orderBy(desc(count())),
        
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
        
        // Course Completion Rates - Fixed to group by training area only
        db.select({
          trainingArea: trainingAreas.name,
          totalEnrollments: count(),
          completedCourses: sql<number>`COUNT(CASE WHEN ${userCourseProgress.status} = 'completed' THEN 1 END)`,
          completionRate: sql<number>`ROUND((COUNT(CASE WHEN ${userCourseProgress.status} = 'completed' THEN 1 END) * 100.0 / COUNT(*)), 2)`
        })
        .from(userCourseProgress)
        .innerJoin(courses, eq(userCourseProgress.courseId, courses.id))
        .innerJoin(modules, eq(courses.moduleId, modules.id))
        .innerJoin(trainingAreas, eq(modules.trainingAreaId, trainingAreas.id))
        .groupBy(trainingAreas.name)
        .orderBy(desc(sql`ROUND((COUNT(CASE WHEN ${userCourseProgress.status} = 'completed' THEN 1 END) * 100.0 / COUNT(*)), 2)`)),
        
        // Training Completion Heatmap - Group by Training Area
        db.select({
          trainingArea: trainingAreas.name,
          totalUsers: sql<number>`COUNT(DISTINCT ${users.id})`,
          completedUsers: sql<number>`COUNT(DISTINCT CASE WHEN ${userTrainingAreaProgress.status} = 'completed' THEN ${users.id} END)`,
          completionRate: sql<number>`ROUND((COUNT(DISTINCT CASE WHEN ${userTrainingAreaProgress.status} = 'completed' THEN ${users.id} END) * 100.0 / COUNT(DISTINCT ${users.id})), 2)`
        })
        .from(users)
        .innerJoin(userTrainingAreaProgress, eq(users.id, userTrainingAreaProgress.userId))
        .innerJoin(trainingAreas, eq(userTrainingAreaProgress.trainingAreaId, trainingAreas.id))
        .groupBy(trainingAreas.name)
        .orderBy(desc(sql`ROUND((COUNT(DISTINCT CASE WHEN ${userTrainingAreaProgress.status} = 'completed' THEN ${users.id} END) * 100.0 / COUNT(DISTINCT ${users.id})), 2)`)),
        
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
        
        // Organization Role Distribution - Fixed to aggregate by organization only
        db.select({
          organization: users.organization,
          userCount: count()
        })
        .from(users)
        .innerJoin(normalUsers, eq(users.id, normalUsers.userId))
        .groupBy(users.organization)
        .orderBy(desc(count())),
        
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
          totalOrganizations: totalOrganizations.length,
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
        trainingAreaSeniorityDistribution: trainingAreaSeniorityDistributionData
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
  },

  // Training Area Report Data - Single endpoint for specific training area
  getTrainingAreaReportData: async (trainingAreaId: number) => {
    try {
      // First, get the training area by ID
      const [trainingArea] = await db
        .select()
        .from(trainingAreas)
        .where(eq(trainingAreas.id, trainingAreaId))
        .limit(1);

      if (!trainingArea) {
        throw new Error(`Training area with ID '${trainingAreaId}' not found`);
      }

      const [
        // Filter options
        assetOptions,
        subAssetOptions,
        organizationOptions,
        subOrganizationOptions,
        roleCategoryOptions,
        progressOptions,
        
        // Data table data
        userProgressData,
        
        // General numerical stats
        totalFrontliners,
        totalOrganizations,
        totalCertificatesIssued,
        totalCompletedAlMidhyaf,
        totalVxPointsEarned,
        alMidhyafOverallProgress
      ] = await Promise.all([
        // Asset options for filters - get from all users
        db.select({
          value: users.asset,
          label: users.asset
        })
        .from(users)
        .innerJoin(normalUsers, eq(users.id, normalUsers.userId))
        .groupBy(users.asset),

        // Sub-asset options for filters - get from all users
        db.select({
          value: users.subAsset,
          label: users.subAsset
        })
        .from(users)
        .innerJoin(normalUsers, eq(users.id, normalUsers.userId))
        .groupBy(users.subAsset),

        // Organization options for filters - get from all users
        db.select({
          value: users.organization,
          label: users.organization
        })
        .from(users)
        .innerJoin(normalUsers, eq(users.id, normalUsers.userId))
        .groupBy(users.organization),

        // Sub-organization options for filters - get from all users
        db.select({
          value: sql<string>`COALESCE(${users.subOrganization}::text, 'N/A')`,
          label: sql<string>`COALESCE(${users.subOrganization}::text, 'N/A')`
        })
        .from(users)
        .innerJoin(normalUsers, eq(users.id, normalUsers.userId))
        .groupBy(users.subOrganization),

        // Role category options for filters - get from all users
        db.select({
          value: normalUsers.roleCategory,
          label: normalUsers.roleCategory
        })
        .from(users)
        .innerJoin(normalUsers, eq(users.id, normalUsers.userId))
        .groupBy(normalUsers.roleCategory),

        // Progress options for filters
        db.select({
          value: userTrainingAreaProgress.status,
          label: userTrainingAreaProgress.status
        })
        .from(userTrainingAreaProgress)
        .where(eq(userTrainingAreaProgress.trainingAreaId, trainingArea.id))
        .groupBy(userTrainingAreaProgress.status),

        // Data table data - get all users who have enrolled in this training area
        db.select({
          userId: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
          eid: normalUsers.eid,
          phoneNumber: normalUsers.phoneNumber,
          asset: users.asset,
          subAsset: users.subAsset,
          organization: users.organization,
          subOrganization: users.subOrganization,
          roleCategory: normalUsers.roleCategory,
          role: normalUsers.role,
          seniority: normalUsers.seniority,
          frontlinerType: sql<string>`CASE WHEN ${normalUsers.existing} THEN 'Existing' ELSE 'New' END`,
          alMidhyafOverallProgress: sql<string>`COALESCE(CAST(${userTrainingAreaProgress.completionPercentage} AS TEXT), '0')`,
          module1Progress: sql<number>`COALESCE((
            SELECT AVG(CAST(ump.completion_percentage AS FLOAT))
            FROM user_module_progress ump
            INNER JOIN modules m ON ump.module_id = m.id
            WHERE ump.user_id = ${users.id} 
            AND m.training_area_id = ${trainingArea.id}
            AND m.name ILIKE '%module 1%'
          ), 0)`,
          vxPoints: users.xp,
          registrationDate: users.createdAt,
          lastLoginDate: users.lastLogin
        })
        .from(users)
        .innerJoin(normalUsers, eq(users.id, normalUsers.userId))
        .leftJoin(userTrainingAreaProgress, and(
          eq(users.id, userTrainingAreaProgress.userId),
          eq(userTrainingAreaProgress.trainingAreaId, trainingArea.id)
        ))
        .orderBy(users.createdAt),

        // General numerical stats - get all frontliners (users with normalUsers)
        db.select({ count: count() })
        .from(users)
        .innerJoin(normalUsers, eq(users.id, normalUsers.userId)),

        // Total organizations
        db.select({ count: count() })
        .from(users)
        .innerJoin(normalUsers, eq(users.id, normalUsers.userId))
        .groupBy(users.organization),

        // Total certificates issued for this training area
        db.select({ count: count() })
        .from(assessmentAttempts)
        .innerJoin(assessments, eq(assessmentAttempts.assessmentId, assessments.id))
        .where(and(
          eq(assessments.trainingAreaId, trainingArea.id),
          eq(assessmentAttempts.passed, true)
        )),

        // Total completed for this training area
        db.select({ count: count() })
        .from(userTrainingAreaProgress)
        .where(and(
          eq(userTrainingAreaProgress.trainingAreaId, trainingArea.id),
          eq(userTrainingAreaProgress.status, "completed")
        )),

        // Total VX points earned by all users
        db.select({ total: sum(users.xp) })
        .from(users)
        .innerJoin(normalUsers, eq(users.id, normalUsers.userId)),

        // Average progress for this training area
        db.select({ 
          avgProgress: sql<number>`AVG(CAST(${userTrainingAreaProgress.completionPercentage} AS FLOAT))`
        })
        .from(userTrainingAreaProgress)
        .where(eq(userTrainingAreaProgress.trainingAreaId, trainingArea.id))
      ]);

      return {
        // Filter options
        filters: {
          assets: assetOptions,
          subAssets: subAssetOptions,
          organizations: organizationOptions,
          subOrganizations: subOrganizationOptions,
          roleCategories: roleCategoryOptions,
          progressStatuses: progressOptions
        },
        
        // Data table columns (matching the image exactly)
        dataTableColumns: [
          "User ID",
          "First Name", 
          "Last Name",
          "Email Address",
          "EID",
          "Phone Number",
          "Asset",
          "Asset Sub-Category",
          "Organization",
          "Sub-Organization",
          "Role Category",
          "Role",
          "Seniority",
          "Frontliner Type",
          "Al Midhyaf Overall Progress",
          "Module 1 Progress",
          "VX Points",
          "Registration Date",
          "Last Login Date"
        ],
        
        // Data table rows
        dataTableRows: userProgressData,
        
        // General numerical stats
        generalStats: {
          totalFrontliners: totalFrontliners[0]?.count || 0,
          totalOrganizations: totalOrganizations.length,
          totalCertificatesIssued: totalCertificatesIssued[0]?.count || 0,
          totalCompletedAlMidhyaf: totalCompletedAlMidhyaf[0]?.count || 0,
          totalVxPointsEarned: totalVxPointsEarned[0]?.total || 0,
          alMidhyafOverallProgress: Math.round((alMidhyafOverallProgress[0]?.avgProgress || 0) * 100) / 100
        }
      };
    } catch (error) {
      console.error("Error in getTrainingAreaReportData:", error);
      throw error;
    }
  },

  // Certificate Report Data - All frontliners with their certificate completion status
  getCertificateReportData: async () => {
    try {
      const [
        // Filter options
        assetOptions,
        subAssetOptions,
        organizationOptions,
        subOrganizationOptions,
        roleCategoryOptions,
        
        // Frontliner data with certificate status
        frontlinersData,
        
        // General numerical stats
        totalFrontliners,
        totalOrganizations,
        totalCertificatesIssued,
        totalVxPointsEarned,
        averageOverallProgress,
        
        // Training area names for certificate mapping
        trainingAreasData
      ] = await Promise.all([
        // Asset options for filters
        db.select({
          value: users.asset,
          label: users.asset
        })
        .from(users)
        .innerJoin(normalUsers, eq(users.id, normalUsers.userId))
        .groupBy(users.asset),

        // Sub-asset options for filters
        db.select({
          value: users.subAsset,
          label: users.subAsset
        })
        .from(users)
        .innerJoin(normalUsers, eq(users.id, normalUsers.userId))
        .groupBy(users.subAsset),

        // Organization options for filters
        db.select({
          value: users.organization,
          label: users.organization
        })
        .from(users)
        .innerJoin(normalUsers, eq(users.id, normalUsers.userId))
        .groupBy(users.organization),

        // Sub-organization options for filters
        db.select({
          value: sql<string>`COALESCE(${users.subOrganization}::text, 'N/A')`,
          label: sql<string>`COALESCE(${users.subOrganization}::text, 'N/A')`
        })
        .from(users)
        .innerJoin(normalUsers, eq(users.id, normalUsers.userId))
        .groupBy(users.subOrganization),

        // Role category options for filters
        db.select({
          value: normalUsers.roleCategory,
          label: normalUsers.roleCategory
        })
        .from(users)
        .innerJoin(normalUsers, eq(users.id, normalUsers.userId))
        .groupBy(normalUsers.roleCategory),

        // Frontliners data with certificate completion status
        db.select({
          userId: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
          eid: normalUsers.eid,
          phoneNumber: normalUsers.phoneNumber,
          asset: users.asset,
          subAsset: users.subAsset,
          organization: users.organization,
          subOrganization: users.subOrganization,
          roleCategory: normalUsers.roleCategory,
          role: normalUsers.role,
          seniority: normalUsers.seniority,
          frontlinerType: sql<string>`CASE WHEN ${normalUsers.existing} THEN 'Existing' ELSE 'New' END`,
          vxPoints: users.xp,
          registrationDate: users.createdAt,
          lastLoginDate: users.lastLogin,
          // Certificate completion status - checking for passed assessments in each training area
          alMidhyafCertificate: sql<boolean>`EXISTS (
            SELECT 1 FROM assessment_attempts aa 
            INNER JOIN assessments a ON aa.assessment_id = a.id 
            INNER JOIN training_areas ta ON a.training_area_id = ta.id 
            WHERE aa.user_id = ${users.id} 
            AND aa.passed = true 
            AND LOWER(ta.name) LIKE '%midhyaf%'
          )`,
          adInformationCertificate: sql<boolean>`EXISTS (
            SELECT 1 FROM assessment_attempts aa 
            INNER JOIN assessments a ON aa.assessment_id = a.id 
            INNER JOIN training_areas ta ON a.training_area_id = ta.id 
            WHERE aa.user_id = ${users.id} 
            AND aa.passed = true 
            AND LOWER(ta.name) LIKE '%information%'
          )`,
          generalVXSoftSkillsCertificate: sql<boolean>`EXISTS (
            SELECT 1 FROM assessment_attempts aa 
            INNER JOIN assessments a ON aa.assessment_id = a.id 
            INNER JOIN training_areas ta ON a.training_area_id = ta.id 
            WHERE aa.user_id = ${users.id} 
            AND aa.passed = true 
            AND LOWER(ta.name) LIKE '%soft%'
          )`,
          generalVXHardSkillsCertificate: sql<boolean>`EXISTS (
            SELECT 1 FROM assessment_attempts aa 
            INNER JOIN assessments a ON aa.assessment_id = a.id 
            INNER JOIN training_areas ta ON a.training_area_id = ta.id 
            WHERE aa.user_id = ${users.id} 
            AND aa.passed = true 
            AND LOWER(ta.name) LIKE '%hard%'
          )`,
          managerialCompetenciesCertificate: sql<boolean>`EXISTS (
            SELECT 1 FROM assessment_attempts aa 
            INNER JOIN assessments a ON aa.assessment_id = a.id 
            INNER JOIN training_areas ta ON a.training_area_id = ta.id 
            WHERE aa.user_id = ${users.id} 
            AND aa.passed = true 
            AND LOWER(ta.name) LIKE '%managerial%'
          )`,
          // Overall progress calculation across all training areas
          overallProgress: sql<number>`COALESCE((
            SELECT AVG(CAST(utap.completion_percentage AS FLOAT))
            FROM user_training_area_progress utap
            WHERE utap.user_id = ${users.id}
          ), 0)`
        })
        .from(users)
        .innerJoin(normalUsers, eq(users.id, normalUsers.userId))
        .orderBy(users.createdAt),

        // Total frontliners count
        db.select({ count: count() })
        .from(users)
        .innerJoin(normalUsers, eq(users.id, normalUsers.userId)),

        // Total organizations count
        db.select({ count: count() })
        .from(users)
        .innerJoin(normalUsers, eq(users.id, normalUsers.userId))
        .groupBy(users.organization),

        // Total certificates issued (passed assessments)
        db.select({ count: count() })
        .from(assessmentAttempts)
        .where(eq(assessmentAttempts.passed, true)),

        // Total VX points earned
        db.select({ total: sum(users.xp) })
        .from(users)
        .innerJoin(normalUsers, eq(users.id, normalUsers.userId)),

        // Average overall progress
        db.select({ 
          avgProgress: sql<number>`AVG(COALESCE((
            SELECT AVG(CAST(utap.completion_percentage AS FLOAT))
            FROM user_training_area_progress utap
            WHERE utap.user_id = ${users.id}
          ), 0))`
        })
        .from(users)
        .innerJoin(normalUsers, eq(users.id, normalUsers.userId)),

        // Get all training areas for reference
        db.select({
          id: trainingAreas.id,
          name: trainingAreas.name
        })
        .from(trainingAreas)
      ]);

      return {
        // Filter options
        filters: {
          assets: assetOptions,
          subAssets: subAssetOptions,
          organizations: organizationOptions,
          subOrganizations: subOrganizationOptions,
          roleCategories: roleCategoryOptions
        },
        
        // Data table columns
        dataTableColumns: [
          "User ID",
          "First Name", 
          "Last Name",
          "Email Address",
          "EID",
          "Phone Number",
          "Asset",
          "Asset Sub-Category",
          "Organization",
          "Sub-Organization",
          "Role Category",
          "Role",
          "Seniority",
          "Frontliner Type",
          "VX Points",
          "Overall Progress",
          "Registration Date",
          "Last Login Date",
          "Al Midhyaf Certificate",
          "AD Information Certificate",
          "General VX Soft Skills Certificate",
          "General VX Hard Skills Certificate",
          "Managerial Competencies Certificate"
        ],
        
        // Data table rows
        dataTableRows: frontlinersData,
        
        // General numerical stats
        generalStats: {
          totalFrontliners: totalFrontliners[0]?.count || 0,
          totalOrganizations: totalOrganizations.length,
          totalCertificatesIssued: totalCertificatesIssued[0]?.count || 0,
          totalVxPointsEarned: totalVxPointsEarned[0]?.total || 0,
          averageOverallProgress: Math.round((averageOverallProgress[0]?.avgProgress || 0) * 100) / 100
        },

        // Training areas for reference
        trainingAreas: trainingAreasData
      };
    } catch (error) {
      console.error("Error in getCertificateReportData:", error);
      throw error;
    }
  },

  // Users Report Data - All users with normal user data and comprehensive filters
  getUsersReportData: async () => {
    try {
      const [
        // Filter options
        userTypeOptions,
        organizationOptions,
        registrationDateOptions,
        
        // All users data with normal user information
        usersData,
        
        // General numerical stats
        totalFrontliners,
        totalOrganizations,
        totalCertificatesIssued,
        totalCompletedAlMidhyaf,
        totalVxPointsEarned,
        overallProgress
      ] = await Promise.all([
        // User type options for filters
        db.select({
          value: users.userType,
          label: users.userType
        })
        .from(users)
        .groupBy(users.userType),

        // Organization options for filters
        db.select({
          value: users.organization,
          label: users.organization
        })
        .from(users)
        .groupBy(users.organization),

        // Registration date options for filters (monthly)
        db.select({
          value: sql<string>`to_char(${users.createdAt}, 'YYYY-MM')`,
          label: sql<string>`to_char(${users.createdAt}, 'YYYY-MM')`
        })
        .from(users)
        .groupBy(sql`to_char(${users.createdAt}, 'YYYY-MM')`)
        .orderBy(sql`to_char(${users.createdAt}, 'YYYY-MM')`),

        // All users data with normal user information
        db.select({
          userId: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
          eid: normalUsers.eid,
          phoneNumber: normalUsers.phoneNumber,
          userType: users.userType,
          organization: users.organization,
          subOrganization: users.subOrganization,
          registrationDate: users.createdAt,
          lastLoginDate: users.lastLogin,
          // Additional normal user fields
          asset: users.asset,
          subAsset: users.subAsset,
          roleCategory: normalUsers.roleCategory,
          role: normalUsers.role,
          seniority: normalUsers.seniority,
          frontlinerType: sql<string>`CASE WHEN ${normalUsers.existing} THEN 'Existing' ELSE 'New' END`,
          vxPoints: users.xp,
          // Overall progress calculation
          overallProgress: sql<number>`COALESCE((
            SELECT AVG(CAST(utap.completion_percentage AS FLOAT))
            FROM user_training_area_progress utap
            WHERE utap.user_id = ${users.id}
          ), 0)`
        })
        .from(users)
        .leftJoin(normalUsers, eq(users.id, normalUsers.userId))
        .orderBy(users.createdAt),

        // Total frontliners (users with normal user data)
        db.select({ count: count() })
        .from(users)
        .innerJoin(normalUsers, eq(users.id, normalUsers.userId)),

        // Total organizations
        db.select({ count: count() })
        .from(users)
        .groupBy(users.organization),

        // Total certificates issued
        db.select({ count: count() })
        .from(assessmentAttempts)
        .where(eq(assessmentAttempts.passed, true)),

        // Total completed Al Midhyaf
        db.select({ count: count() })
        .from(userTrainingAreaProgress)
        .innerJoin(trainingAreas, eq(userTrainingAreaProgress.trainingAreaId, trainingAreas.id))
        .where(and(
          eq(userTrainingAreaProgress.status, "completed"),
          sql`LOWER(${trainingAreas.name}) LIKE '%midhyaf%'`
        )),

        // Total VX points earned
        db.select({ total: sum(users.xp) })
        .from(users)
        .innerJoin(normalUsers, eq(users.id, normalUsers.userId)),

        // Overall progress average
        db.select({ 
          avgProgress: sql<number>`AVG(COALESCE((
            SELECT AVG(CAST(utap.completion_percentage AS FLOAT))
            FROM user_training_area_progress utap
            WHERE utap.user_id = ${users.id}
          ), 0))`
        })
        .from(users)
        .innerJoin(normalUsers, eq(users.id, normalUsers.userId))
      ]);

      return {
        // Filter options
        filters: {
          userTypes: userTypeOptions,
          organizations: organizationOptions,
          registrationDates: registrationDateOptions
        },
        
        // Data table columns (matching the image exactly)
        dataTableColumns: [
          "User ID",
          "First Name",
          "Last Name", 
          "Email Address",
          "EID",
          "Phone Number",
          "User Type",
          "Organization",
          "Sub-Organization",
          "Registration Date",
          "Last Login Date"
        ],
        
        // Data table rows
        dataTableRows: usersData,
        
        // General numerical stats (matching the image)
        generalStats: {
          totalFrontliners: totalFrontliners[0]?.count || 0,
          totalOrganizations: totalOrganizations.length,
          totalCertificatesIssued: totalCertificatesIssued[0]?.count || 0,
          totalCompletedAlMidhyaf: totalCompletedAlMidhyaf[0]?.count || 0,
          totalVxPointsEarned: totalVxPointsEarned[0]?.total || 0,
          overallProgress: Math.round((overallProgress[0]?.avgProgress || 0) * 100) / 100
        }
      };
    } catch (error) {
      console.error("Error in getUsersReportData:", error);
      throw error;
    }
  },

  // Organizations Report Data - All organizations with frontliner statistics
  getOrganizationsReportData: async () => {
    try {
      console.log("Starting getOrganizationsReportData...");
      
      // First, let's test basic queries
      const [subAdminsData, normalUsersCount] = await Promise.all([
        // Get sub-admins with their organizations
        db.select({
          id: sql<string>`CAST(${users.id} AS TEXT)`,
          name: users.organization,
          asset: users.asset,
          subAsset: users.subAsset,
          subOrganization: sql<string>`COALESCE(${users.subOrganization}::text, 'N/A')`,
          totalFrontliners: sql<number>`COALESCE(${subAdmins.totalFrontliners}, 0)`,
          subAdminName: sql<string>`CONCAT(${users.firstName}, ' ', ${users.lastName})`,
          subAdminEmail: users.email,
          createdAt: users.createdAt,
          status: sql<string>`CASE WHEN ${users.lastLogin} >= NOW() - INTERVAL '30 days' THEN 'active' ELSE 'inactive' END`
        })
        .from(users)
        .innerJoin(subAdmins, eq(users.id, subAdmins.userId))
        .orderBy(users.organization),

        // Count of normal users
        db.select({ count: count() })
        .from(normalUsers)
      ]);

      console.log("Sub-admins data:", subAdminsData.length);
      console.log("Normal users count:", normalUsersCount[0]?.count);

      // Get registered frontliners count for each organization
      const organizationsWithCounts = await Promise.all(
        subAdminsData.map(async (org) => {
          const registeredCount = await db.select({ count: count() })
            .from(normalUsers)
            .innerJoin(users, eq(normalUsers.userId, users.id))
            .where(eq(users.organization, org.name));

          return {
            ...org,
            registeredFrontliners: registeredCount[0]?.count || 0
          };
        })
      );

      // Get filter options
      const [assetOptions, subAssetOptions] = await Promise.all([
        db.select({
          value: users.asset,
          label: users.asset
        })
        .from(users)
        .innerJoin(subAdmins, eq(users.id, subAdmins.userId))
        .groupBy(users.asset),

        db.select({
          value: users.subAsset,
          label: users.subAsset
        })
        .from(users)
        .innerJoin(subAdmins, eq(users.id, subAdmins.userId))
        .groupBy(users.subAsset)
      ]);

      // Calculate totals
      const totalFrontliners = subAdminsData.reduce((sum, org) => sum + org.totalFrontliners, 0);
      const activeOrganizations = subAdminsData.filter(org => org.status === 'active').length;

      return {
        // Filter options
        filters: {
          assets: assetOptions,
          subAssets: subAssetOptions
        },
        
        // Organizations data
        organizations: organizationsWithCounts,
        
        // General numerical stats
        generalStats: {
          totalOrganizations: subAdminsData.length,
          activeOrganizations: activeOrganizations,
          totalFrontliners: totalFrontliners,
          registeredFrontliners: normalUsersCount[0]?.count || 0
        }
      };
    } catch (error) {
      console.error("Error in getOrganizationsReportData:", error);
      throw error;
    }
  },

  // Sub-Organizations Report Data - All sub-organizations with comprehensive statistics
  getSubOrganizationsReportData: async () => {
    try {
      console.log("Starting getSubOrganizationsReportData...");
      
      // Get total VX points from normal users XP
      console.log("Calculating total VX points from normal users...");
      const totalVxPointsResult = await db.select({ 
        total: sql<number>`COALESCE(SUM(${users.xp}), 0)`
      })
      .from(users)
      .innerJoin(normalUsers, eq(users.id, normalUsers.userId));
      
      const totalVxPointsEarned = totalVxPointsResult[0]?.total || 0;
      console.log(`Total VX points earned: ${totalVxPointsEarned}`);
      
      // Get basic statistics
      console.log("Getting basic statistics...");
      const [
        totalSubOrganizations,
        totalFrontliners,
        registeredFrontliners,
        totalCertificatesIssued,
        totalCompletedAlMidhyaf
      ] = await Promise.all([
        // Total sub-organizations
        db.select({ count: count() }).from(subOrganizations),
        
        // Total frontliners
        db.select({ count: count() })
        .from(normalUsers)
        .innerJoin(users, eq(normalUsers.userId, users.id)),
        
        // Registered frontliners
        db.select({ count: count() })
        .from(normalUsers)
        .innerJoin(users, eq(normalUsers.userId, users.id))
        .where(sql`${users.subOrganization} IS NOT NULL`),
        
        // Total certificates issued
        db.select({ count: count() }).from(certificates),
        
        // Total completed Al Midhyaf
        db.select({ count: count() })
        .from(userTrainingAreaProgress)
        .where(and(
          eq(userTrainingAreaProgress.trainingAreaId, 1), // Assuming Al Midhyaf is training area 1
          isNotNull(userTrainingAreaProgress.completedAt)
        ))
      ]);

      // Get sub-organizations with basic data
      console.log("Getting sub-organizations data...");
      const subOrganizationsData = await db.select({
        id: sql<string>`CAST(${subOrganizations.id} AS TEXT)`,
        name: subOrganizations.name,
        organization: organizations.name,
        asset: assets.name,
        subAsset: subAssets.name,
        createdAt: sql<string>`NOW()`
      })
      .from(subOrganizations)
      .leftJoin(organizations, eq(subOrganizations.organizationId, organizations.id))
      .leftJoin(assets, eq(subOrganizations.assetId, assets.id))
      .leftJoin(subAssets, eq(subOrganizations.subAssetId, subAssets.id))
      .orderBy(subOrganizations.name);

      // Create simplified sub-organizations data
      const subOrganizationsWithCounts = subOrganizationsData.map((subOrg) => ({
        ...subOrg,
        totalFrontliners: 0,
        registeredFrontliners: 0,
        subAdminName: 'N/A',
        subAdminEmail: 'N/A',
        status: 'inactive'
      }));

      // Get filter options
      console.log("Getting filter options...");
      const [assetOptions, subAssetOptions] = await Promise.all([
        db.select({
          value: assets.name,
          label: assets.name
        })
        .from(assets)
        .limit(10),
        
        db.select({
          value: subAssets.name,
          label: subAssets.name
        })
        .from(subAssets)
        .limit(10)
      ]);

      console.log("Sub-organizations report data prepared successfully");
      return {
        filters: {
          assets: assetOptions,
          subAssets: subAssetOptions
        },
        subOrganizations: subOrganizationsWithCounts,
        generalStats: {
          totalSubOrganizations: totalSubOrganizations[0]?.count || 0,
          activeSubOrganizations: 0,
          totalFrontliners: totalFrontliners[0]?.count || 0,
          registeredFrontliners: registeredFrontliners[0]?.count || 0,
          totalCertificatesIssued: totalCertificatesIssued[0]?.count || 0,
          totalCompletedAlMidhyaf: totalCompletedAlMidhyaf[0]?.count || 0,
          totalVxPointsEarned: totalVxPointsEarned,
          overallProgress: 50 // Placeholder value
        }
      };
    } catch (error) {
      console.error("Error in getSubOrganizationsReportData:", error);
      console.error("Error details:", error);
      throw error;
    }
  },

  // Sub-Admins Report Data - All sub-admins with comprehensive statistics
  getSubAdminsReportData: async () => {
    try {
      console.log("Starting getSubAdminsReportData...");
      
      const [
        // Filter options
        assetOptions,
        subAssetOptions,
        organizationOptions,
        
        // Sub-admins data with comprehensive statistics
        subAdminsData,
        
        // General numerical stats
        totalSubAdmins,
        activeSubAdmins,
        totalUsersManaged,
        totalOrganizations,
        totalCertificatesIssued,
        totalCompletedAlMidhyaf,
        totalVxPointsEarned,
        overallProgress
      ] = await Promise.all([
        // Asset options for filters
        db.select({
          value: users.asset,
          label: users.asset
        })
        .from(users)
        .innerJoin(subAdmins, eq(users.id, subAdmins.userId))
        .groupBy(users.asset),

        // Sub-asset options for filters
        db.select({
          value: users.subAsset,
          label: users.subAsset
        })
        .from(users)
        .innerJoin(subAdmins, eq(users.id, subAdmins.userId))
        .groupBy(users.subAsset),

        // Organization options for filters
        db.select({
          value: users.organization,
          label: users.organization
        })
        .from(users)
        .innerJoin(subAdmins, eq(users.id, subAdmins.userId))
        .groupBy(users.organization),

        // Sub-admins data with comprehensive statistics
        db.select({
          userId: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
          eid: subAdmins.eid,
          phoneNumber: subAdmins.phoneNumber,
          jobTitle: subAdmins.jobTitle,
          asset: users.asset,
          subAsset: users.subAsset,
          organization: users.organization,
          subOrganization: users.subOrganization,
          totalFrontliners: sql<number>`COALESCE(${subAdmins.totalFrontliners}, 0)`,
          registeredFrontliners: sql<number>`(
            SELECT COUNT(*) 
            FROM normal_users nu 
            INNER JOIN users u ON nu.user_id = u.id
            WHERE u.organization = ${users.organization}
          )`,
          registrationDate: users.createdAt,
          lastLoginDate: users.lastLogin,
          status: sql<string>`CASE WHEN ${users.lastLogin} >= NOW() - INTERVAL '30 days' THEN 'active' ELSE 'inactive' END`,
          // Certificate statistics
          certificatesIssued: sql<number>`(
            SELECT COUNT(*) 
            FROM assessment_attempts aa 
            INNER JOIN users u ON aa.user_id = u.id
            WHERE u.organization = ${users.organization}
            AND aa.passed = true
          )`,
          alMidhyafCompleted: sql<number>`(
            SELECT COUNT(*) 
            FROM user_training_area_progress utap
            INNER JOIN users u ON utap.user_id = u.id
            INNER JOIN training_areas ta ON utap.training_area_id = ta.id
            WHERE u.organization = ${users.organization}
            AND utap.status = 'completed'
            AND LOWER(ta.name) LIKE '%midhyaf%'
          )`,
          totalVxPoints: sql<number>`(
            SELECT COALESCE(SUM(u.xp), 0)
            FROM users u
            WHERE u.organization = ${users.organization}
          )`,
          overallProgress: sql<number>`(
            SELECT COALESCE(AVG(CAST(utap.completion_percentage AS FLOAT)), 0)
            FROM user_training_area_progress utap
            INNER JOIN users u ON utap.user_id = u.id
            WHERE u.organization = ${users.organization}
          )`
        })
        .from(users)
        .innerJoin(subAdmins, eq(users.id, subAdmins.userId))
        .orderBy(users.createdAt),

        // Total sub-admins count
        db.select({ count: count() })
        .from(users)
        .innerJoin(subAdmins, eq(users.id, subAdmins.userId)),

        // Active sub-admins count (last login within 30 days)
        db.select({ count: count() })
        .from(users)
        .innerJoin(subAdmins, eq(users.id, subAdmins.userId))
        .where(gte(users.lastLogin, new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))),

        // Total users managed by all sub-admins
        db.select({ total: sum(subAdmins.totalFrontliners) })
        .from(subAdmins),

        // Total organizations
        db.select({ count: count() })
        .from(users)
        .innerJoin(subAdmins, eq(users.id, subAdmins.userId))
        .groupBy(users.organization),

        // Total certificates issued
        db.select({ count: count() })
        .from(assessmentAttempts)
        .where(eq(assessmentAttempts.passed, true)),

        // Total completed Al Midhyaf
        db.select({ count: count() })
        .from(userTrainingAreaProgress)
        .innerJoin(trainingAreas, eq(userTrainingAreaProgress.trainingAreaId, trainingAreas.id))
        .where(and(
          eq(userTrainingAreaProgress.status, "completed"),
          sql`LOWER(${trainingAreas.name}) LIKE '%midhyaf%'`
        )),

        // Total VX points earned
        db.select({ total: sum(users.xp) })
        .from(users)
        .innerJoin(normalUsers, eq(users.id, normalUsers.userId)),

        // Overall progress average
        db.select({ 
          avgProgress: sql<number>`AVG(COALESCE((
            SELECT AVG(CAST(utap.completion_percentage AS FLOAT))
            FROM user_training_area_progress utap
            WHERE utap.user_id = ${users.id}
          ), 0))`
        })
        .from(users)
        .innerJoin(normalUsers, eq(users.id, normalUsers.userId))
      ]);

      return {
        // Filter options
        filters: {
          assets: assetOptions,
          subAssets: subAssetOptions,
          organizations: organizationOptions
        },
        
        // Data table columns (matching the image)
        dataTableColumns: [
          "User ID",
          "First Name",
          "Last Name",
          "Email Address",
          "EID",
          "Phone Number",
          "Asset",
          "Asset Sub-Category",
          "Organization",
          "Sub-Organization",
          "Total Frontliners",
          "Registered Frontliners",
          "Registration Date",
          "Last Login Date",
          "Remind Sub-Admin"
        ],
        
        // Sub-admins data
        dataTableRows: subAdminsData,
        
        // General numerical stats (matching the image)
        generalStats: {
          totalFrontliners: totalUsersManaged[0]?.total || 0,
          totalOrganizations: totalOrganizations.length,
          totalCertificatesIssued: totalCertificatesIssued[0]?.count || 0,
          totalCompletedAlMidhyaf: totalCompletedAlMidhyaf[0]?.count || 0,
          totalVxPointsEarned: totalVxPointsEarned[0]?.total || 0,
          overallProgress: Math.round((overallProgress[0]?.avgProgress || 0) * 100) / 100
        }
      };
    } catch (error) {
      console.error("Error in getSubAdminsReportData:", error);
      throw error;
    }
  },

  // Frontliners Report Data - All frontliners with comprehensive statistics
  getFrontlinersReportData: async () => {
    try {
      console.log("Starting getFrontlinersReportData...");
      
      const [
        // Filter options
        assetOptions,
        subAssetOptions,
        organizationOptions,
        subOrganizationOptions,
        roleCategoryOptions,
        
        // Frontliners data with comprehensive statistics
        frontlinersData,
        
        // General numerical stats
        totalFrontliners,
        activeFrontliners,
        totalVxPoints,
        averageAlMidhyaf,
        averageProgress,
        totalOrganizations
      ] = await Promise.all([
        // Asset options for filters
        db.select({
          value: users.asset,
          label: users.asset
        })
        .from(users)
        .innerJoin(normalUsers, eq(users.id, normalUsers.userId))
        .groupBy(users.asset),

        // Sub-asset options for filters
        db.select({
          value: users.subAsset,
          label: users.subAsset
        })
        .from(users)
        .innerJoin(normalUsers, eq(users.id, normalUsers.userId))
        .groupBy(users.subAsset),

        // Organization options for filters
        db.select({
          value: users.organization,
          label: users.organization
        })
        .from(users)
        .innerJoin(normalUsers, eq(users.id, normalUsers.userId))
        .groupBy(users.organization),

        // Sub-organization options for filters
        db.select({
          value: users.subOrganization,
          label: users.subOrganization
        })
        .from(users)
        .innerJoin(normalUsers, eq(users.id, normalUsers.userId))
        .where(sql`${users.subOrganization} IS NOT NULL`)
        .groupBy(users.subOrganization),

        // Role category options for filters
        db.select({
          value: normalUsers.roleCategory,
          label: normalUsers.roleCategory
        })
        .from(users)
        .innerJoin(normalUsers, eq(users.id, normalUsers.userId))
        .groupBy(normalUsers.roleCategory),

        // Frontliners data with comprehensive statistics
        db.select({
          id: sql<string>`CAST(${users.id} AS TEXT)`,
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
          eid: normalUsers.eid,
          phoneNumber: normalUsers.phoneNumber,
          asset: users.asset,
          subAsset: users.subAsset,
          organization: users.organization,
          subOrganization: users.subOrganization,
          roleCategory: normalUsers.roleCategory,
          role: normalUsers.role,
          seniority: normalUsers.seniority,
          registrationDate: users.createdAt,
          lastLoginDate: users.lastLogin,
          status: sql<string>`CASE WHEN ${users.lastLogin} >= NOW() - INTERVAL '30 days' THEN 'active' ELSE 'inactive' END`,
          vxPoints: users.xp,
          // Progress calculations
          overallProgress: sql<number>`COALESCE((
            SELECT AVG(CAST(utap.completion_percentage AS FLOAT))
            FROM user_training_area_progress utap
            WHERE utap.user_id = ${users.id}
          ), 0)`,
          alMidhyaf: sql<number>`COALESCE((
            SELECT AVG(CAST(utap.completion_percentage AS FLOAT))
            FROM user_training_area_progress utap
            INNER JOIN training_areas ta ON utap.training_area_id = ta.id
            WHERE utap.user_id = ${users.id}
            AND LOWER(ta.name) LIKE '%midhyaf%'
          ), 0)`,
          adInformation: sql<number>`COALESCE((
            SELECT AVG(CAST(utap.completion_percentage AS FLOAT))
            FROM user_training_area_progress utap
            INNER JOIN training_areas ta ON utap.training_area_id = ta.id
            WHERE utap.user_id = ${users.id}
            AND LOWER(ta.name) LIKE '%information%'
          ), 0)`,
          generalVxSoftSkills: sql<number>`COALESCE((
            SELECT AVG(CAST(utap.completion_percentage AS FLOAT))
            FROM user_training_area_progress utap
            INNER JOIN training_areas ta ON utap.training_area_id = ta.id
            WHERE utap.user_id = ${users.id}
            AND LOWER(ta.name) LIKE '%soft%'
          ), 0)`,
          generalVxHardSkills: sql<number>`COALESCE((
            SELECT AVG(CAST(utap.completion_percentage AS FLOAT))
            FROM user_training_area_progress utap
            INNER JOIN training_areas ta ON utap.training_area_id = ta.id
            WHERE utap.user_id = ${users.id}
            AND LOWER(ta.name) LIKE '%hard%'
          ), 0)`,
          managerialCompetencies: sql<number>`COALESCE((
            SELECT AVG(CAST(utap.completion_percentage AS FLOAT))
            FROM user_training_area_progress utap
            INNER JOIN training_areas ta ON utap.training_area_id = ta.id
            WHERE utap.user_id = ${users.id}
            AND LOWER(ta.name) LIKE '%managerial%'
          ), 0)`
        })
        .from(users)
        .innerJoin(normalUsers, eq(users.id, normalUsers.userId))
        .orderBy(users.createdAt),

        // Total frontliners count
        db.select({ count: count() })
        .from(users)
        .innerJoin(normalUsers, eq(users.id, normalUsers.userId)),

        // Active frontliners count (last login within 30 days)
        db.select({ count: count() })
        .from(users)
        .innerJoin(normalUsers, eq(users.id, normalUsers.userId))
        .where(gte(users.lastLogin, new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))),

        // Total VX points
        db.select({ total: sum(users.xp) })
        .from(users)
        .innerJoin(normalUsers, eq(users.id, normalUsers.userId)),

        // Average Al Midhyaf progress
        db.select({ 
          avgProgress: sql<number>`AVG(COALESCE((
            SELECT AVG(CAST(utap.completion_percentage AS FLOAT))
            FROM user_training_area_progress utap
            INNER JOIN training_areas ta ON utap.training_area_id = ta.id
            WHERE utap.user_id = ${users.id}
            AND LOWER(ta.name) LIKE '%midhyaf%'
          ), 0))`
        })
        .from(users)
        .innerJoin(normalUsers, eq(users.id, normalUsers.userId)),

        // Average overall progress
        db.select({ 
          avgProgress: sql<number>`AVG(COALESCE((
            SELECT AVG(CAST(utap.completion_percentage AS FLOAT))
            FROM user_training_area_progress utap
            WHERE utap.user_id = ${users.id}
          ), 0))`
        })
        .from(users)
        .innerJoin(normalUsers, eq(users.id, normalUsers.userId)),

        // Total organizations
        db.select({ count: count() })
        .from(users)
        .innerJoin(normalUsers, eq(users.id, normalUsers.userId))
        .groupBy(users.organization)
      ]);

      return {
        // Filter options
        filters: {
          assets: assetOptions,
          subAssets: subAssetOptions,
          organizations: organizationOptions,
          subOrganizations: subOrganizationOptions,
          roleCategories: roleCategoryOptions
        },
        
        // Frontliners data
        frontliners: frontlinersData,
        
        // General numerical stats
        generalStats: {
          totalFrontliners: totalFrontliners[0]?.count || 0,
          activeFrontliners: activeFrontliners[0]?.count || 0,
          totalVxPoints: totalVxPoints[0]?.total || 0,
          averageAlMidhyaf: Math.round((averageAlMidhyaf[0]?.avgProgress || 0) * 100) / 100,
          averageProgress: Math.round((averageProgress[0]?.avgProgress || 0) * 100) / 100,
          totalOrganizations: totalOrganizations.length
        }
      };
    } catch (error) {
      console.error("Error in getFrontlinersReportData:", error);
      throw error;
    }
  },

  // Dashboard Statistics - Get key metrics for admin dashboard
  getDashboardStats: async () => {
    try {
      const [
        // Total organizations count
        totalOrganizations,
        // Total certificates count (passed assessments)
        totalCertificates,
        // Total VX points from normal users only
        totalVxPoints,
        // Average progress from course progress table
        averageProgress
      ] = await Promise.all([
        // Total organizations count
        db.select({ count: count() })
        .from(users)
        .innerJoin(normalUsers, eq(users.id, normalUsers.userId))
        .groupBy(users.organization),

        // Total certificates count (passed assessments)
        db.select({ count: count() })
        .from(assessmentAttempts)
        .where(eq(assessmentAttempts.passed, true)),

        // Total VX points from normal users only
        db.select({ total: sum(users.xp) })
        .from(users)
        .innerJoin(normalUsers, eq(users.id, normalUsers.userId)),

        // Average progress from course progress table
        db.select({ 
          avgProgress: sql<number>`AVG(CAST(${userCourseProgress.completionPercentage} AS FLOAT))`
        })
        .from(userCourseProgress)
      ]);

      return {
        totalOrganizations: totalOrganizations.length,
        totalCertificates: totalCertificates[0]?.count || 0,
        totalVxPoints: totalVxPoints[0]?.total || 0,
        averageProgress: Math.round((averageProgress[0]?.avgProgress || 0) * 100) / 100
      };
    } catch (error) {
      console.error("Error in getDashboardStats:", error);
      throw error;
    }
  }
};
