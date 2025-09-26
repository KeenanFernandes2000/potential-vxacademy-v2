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
  }
};
