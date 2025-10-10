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
  certificates,
} from "../db/schema";
import {
  sql,
  desc,
  asc,
  count,
  countDistinct,
  sum,
  avg,
  eq,
  ne,
  and,
  gte,
  lte,
  lt,
  inArray,
  isNotNull,
} from "drizzle-orm";

export const reportServices = {
  // Comprehensive Analytics Data - Single endpoint for all analytics
  getAllAnalyticsData: async () => {
    try {
      const [
        // Key Metrics
        totalUsers,
        totalFrontliners,
        newFrontliners,
        totalOrganizations,
        totalSubOrganizations,
        certificatesIssued,
        totalSubAdmins,
        averageCompletionRate,

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
        // Total Users (All users in the platform)
        db.select({ count: count() }).from(users),
        // Total Frontliners (All registered frontliners)
        db.select({ count: count() }).from(normalUsers),
        // New Frontliners (Joined this month)
        db
          .select({ count: count() })
          .from(users)
          .innerJoin(normalUsers, eq(users.id, normalUsers.userId))
          .where(
            and(
              gte(users.createdAt, sql`DATE_TRUNC('month', CURRENT_DATE)`),
              lt(
                users.createdAt,
                sql`DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month'`
              )
            )
          ),
        // Total Organizations (Registered organizations)
        db.select({ count: count() }).from(organizations),
        // Total Sub-Organizations (Registered sub-organizations)
        db.select({ count: count() }).from(subOrganizations),
        // Total Certificates (Certificates issued)
        db.select({ count: count() }).from(certificates),
        // Total Sub-Admins (Registered sub-admins)
        db
          .select({ count: count() })
          .from(users)
          .where(eq(users.userType, "sub_admin")),
        // Average Progress (Overall completion rate)
        db
          .select({
            totalProgress: sql<number>`SUM(CAST(${userTrainingAreaProgress.completionPercentage} AS FLOAT))`,
          })
          .from(userTrainingAreaProgress),

        // User Growth Data - Cumulative
        db
          .select({
            period: sql<string>`to_char(${users.createdAt}, 'YYYY-MM')`,
            newUsers: count(),
            totalUsers: sql<number>`SUM(COUNT(*)) OVER (ORDER BY to_char(${users.createdAt}, 'YYYY-MM') ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW)`,
          })
          .from(users)
          .where(ne(users.userType, "admin"))
          .groupBy(sql`to_char(${users.createdAt}, 'YYYY-MM')`)
          .orderBy(asc(sql`to_char(${users.createdAt}, 'YYYY-MM')`)),

        // Asset Distribution
        db
          .select({
            asset: users.asset,
            subAsset: users.subAsset,
            userCount: count(),
            percentage: sql<number>`ROUND((COUNT(*) * 100.0 / SUM(COUNT(*)) OVER()), 2)`,
          })
          .from(users)
          .where(ne(users.userType, "admin"))
          .groupBy(users.asset, users.subAsset)
          .orderBy(desc(count())),

        // Role Distribution - Fixed to aggregate by asset only
        db
          .select({
            asset: users.asset,
            userCount: count(),
          })
          .from(users)
          .innerJoin(normalUsers, eq(users.id, normalUsers.userId))
          .where(ne(users.userType, "admin"))
          .groupBy(users.asset)
          .orderBy(desc(count())),

        // Seniority Distribution - Fixed to only show managers and staff
        db
          .select({
            seniority: normalUsers.seniority,
            userCount: count(),
            percentage: sql<number>`ROUND((COUNT(*) * 100.0 / SUM(COUNT(*)) OVER()), 2)`,
          })
          .from(users)
          .innerJoin(normalUsers, eq(users.id, normalUsers.userId))
          .where(
            and(
              inArray(normalUsers.seniority, ["Manager", "Staff"]),
              ne(users.userType, "admin")
            )
          )
          .groupBy(normalUsers.seniority)
          .orderBy(desc(count())),

        // Certificate Analytics
        db
          .select({
            period: sql<string>`to_char(${assessmentAttempts.completedAt}, 'YYYY-MM')`,
            asset: users.asset,
            certificatesEarned: count(),
            averageScore: avg(assessmentAttempts.score),
          })
          .from(assessmentAttempts)
          .innerJoin(users, eq(assessmentAttempts.userId, users.id))
          .where(
            and(
              eq(assessmentAttempts.passed, true),
              ne(users.userType, "admin")
            )
          )
          .groupBy(
            sql`to_char(${assessmentAttempts.completedAt}, 'YYYY-MM')`,
            users.asset
          )
          .orderBy(
            asc(sql`to_char(${assessmentAttempts.completedAt}, 'YYYY-MM')`)
          ),

        // Registration Trends
        db
          .select({
            period: sql<string>`to_char(${users.createdAt}, 'YYYY-MM')`,
            newRegistrations: count(),
            cumulativeRegistrations: sql<number>`SUM(COUNT(*)) OVER (ORDER BY to_char(${users.createdAt}, 'YYYY-MM'))`,
          })
          .from(users)
          .where(ne(users.userType, "admin"))
          .groupBy(sql`to_char(${users.createdAt}, 'YYYY-MM')`)
          .orderBy(asc(sql`to_char(${users.createdAt}, 'YYYY-MM')`)),

        // Active vs Inactive Users
        db
          .select({
            period: sql<string>`to_char(${users.lastLogin}, 'YYYY-MM')`,
            activeUsers: sql<number>`COUNT(CASE WHEN ${
              users.lastLogin
            } >= ${new Date(
              Date.now() - 30 * 24 * 60 * 60 * 1000
            )} THEN 1 END)`,
            inactiveUsers: sql<number>`COUNT(CASE WHEN ${
              users.lastLogin
            } < ${new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)} THEN 1 END)`,
            totalUsers: count(),
          })
          .from(users)
          .where(ne(users.userType, "admin"))
          .groupBy(sql`to_char(${users.lastLogin}, 'YYYY-MM')`)
          .orderBy(asc(sql`to_char(${users.lastLogin}, 'YYYY-MM')`)),

        // Peak Usage Days - Changed from times to days
        db
          .select({
            dayOfWeek: sql<string>`to_char(${users.lastLogin}, 'Day')`,
            loginCount: count(),
            uniqueUsers: sql<number>`COUNT(DISTINCT ${users.id})`,
          })
          .from(users)
          .where(and(isNotNull(users.lastLogin), ne(users.userType, "admin")))
          .groupBy(sql`to_char(${users.lastLogin}, 'Day')`)
          .orderBy(desc(count())),

        // Training Area Enrollments
        db
          .select({
            period: sql<string>`to_char(${userTrainingAreaProgress.startedAt}, 'YYYY-MM')`,
            trainingArea: trainingAreas.name,
            enrollments: count(),
            completions: sql<number>`COUNT(CASE WHEN ${userTrainingAreaProgress.status} = 'completed' THEN 1 END)`,
          })
          .from(userTrainingAreaProgress)
          .innerJoin(users, eq(userTrainingAreaProgress.userId, users.id))
          .innerJoin(
            trainingAreas,
            eq(userTrainingAreaProgress.trainingAreaId, trainingAreas.id)
          )
          .where(ne(users.userType, "admin"))
          .groupBy(
            sql`to_char(${userTrainingAreaProgress.startedAt}, 'YYYY-MM')`,
            trainingAreas.name
          )
          .orderBy(
            asc(sql`to_char(${userTrainingAreaProgress.startedAt}, 'YYYY-MM')`)
          ),

        // Course Completion Rates - Fixed to group by training area only
        db
          .select({
            trainingArea: trainingAreas.name,
            totalEnrollments: count(),
            completedCourses: sql<number>`COUNT(CASE WHEN ${userCourseProgress.status} = 'completed' THEN 1 END)`,
            completionRate: sql<number>`ROUND((COUNT(CASE WHEN ${userCourseProgress.status} = 'completed' THEN 1 END) * 100.0 / COUNT(*)), 2)`,
          })
          .from(userCourseProgress)
          .innerJoin(users, eq(userCourseProgress.userId, users.id))
          .innerJoin(courses, eq(userCourseProgress.courseId, courses.id))
          .innerJoin(modules, eq(courses.moduleId, modules.id))
          .innerJoin(
            trainingAreas,
            eq(modules.trainingAreaId, trainingAreas.id)
          )
          .where(ne(users.userType, "admin"))
          .groupBy(trainingAreas.name)
          .orderBy(
            desc(
              sql`ROUND((COUNT(CASE WHEN ${userCourseProgress.status} = 'completed' THEN 1 END) * 100.0 / COUNT(*)), 2)`
            )
          ),

        // Training Completion Heatmap - Group by Training Area
        db
          .select({
            trainingArea: trainingAreas.name,
            totalUsers: sql<number>`COUNT(DISTINCT ${users.id})`,
            completedUsers: sql<number>`COUNT(DISTINCT CASE WHEN ${userTrainingAreaProgress.status} = 'completed' THEN ${users.id} END)`,
            completionRate: sql<number>`ROUND((COUNT(DISTINCT CASE WHEN ${userTrainingAreaProgress.status} = 'completed' THEN ${users.id} END) * 100.0 / COUNT(DISTINCT ${users.id})), 2)`,
          })
          .from(users)
          .innerJoin(
            userTrainingAreaProgress,
            eq(users.id, userTrainingAreaProgress.userId)
          )
          .innerJoin(
            trainingAreas,
            eq(userTrainingAreaProgress.trainingAreaId, trainingAreas.id)
          )
          .where(ne(users.userType, "admin"))
          .groupBy(trainingAreas.name)
          .orderBy(
            desc(
              sql`ROUND((COUNT(DISTINCT CASE WHEN ${userTrainingAreaProgress.status} = 'completed' THEN ${users.id} END) * 100.0 / COUNT(DISTINCT ${users.id})), 2)`
            )
          ),

        // Certificate Trends
        db
          .select({
            period: sql<string>`to_char(${assessmentAttempts.completedAt}, 'YYYY-MM')`,
            trainingArea: trainingAreas.name,
            certificatesEarned: count(),
            averageScore: avg(assessmentAttempts.score),
          })
          .from(assessmentAttempts)
          .innerJoin(users, eq(assessmentAttempts.userId, users.id))
          .innerJoin(
            assessments,
            eq(assessmentAttempts.assessmentId, assessments.id)
          )
          .innerJoin(
            trainingAreas,
            eq(assessments.trainingAreaId, trainingAreas.id)
          )
          .where(
            and(
              eq(assessmentAttempts.passed, true),
              ne(users.userType, "admin")
            )
          )
          .groupBy(
            sql`to_char(${assessmentAttempts.completedAt}, 'YYYY-MM')`,
            trainingAreas.name
          )
          .orderBy(
            asc(sql`to_char(${assessmentAttempts.completedAt}, 'YYYY-MM')`)
          ),

        // Organization Role Distribution - Fixed to aggregate by organization only
        db
          .select({
            organization: users.organization,
            userCount: count(),
          })
          .from(users)
          .innerJoin(normalUsers, eq(users.id, normalUsers.userId))
          .where(ne(users.userType, "admin"))
          .groupBy(users.organization)
          .orderBy(desc(count())),

        // Training Area Seniority Distribution
        db
          .select({
            trainingArea: trainingAreas.name,
            seniority: normalUsers.seniority,
            userCount: count(),
            percentage: sql<number>`ROUND((COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (PARTITION BY ${trainingAreas.name})), 2)`,
          })
          .from(users)
          .innerJoin(normalUsers, eq(users.id, normalUsers.userId))
          .innerJoin(
            userTrainingAreaProgress,
            eq(users.id, userTrainingAreaProgress.userId)
          )
          .innerJoin(
            trainingAreas,
            eq(userTrainingAreaProgress.trainingAreaId, trainingAreas.id)
          )
          .where(ne(users.userType, "admin"))
          .groupBy(trainingAreas.name, normalUsers.seniority),
      ]);

      const totalProgress = averageCompletionRate[0]?.totalProgress || 0;
      const totalFrontlinersCount = totalFrontliners[0]?.count || 0;
      const calculatedAverageProgress =
        totalFrontlinersCount > 0 ? totalProgress / totalFrontlinersCount : 0;

      return {
        // Key Metrics
        keyMetrics: {
          totalUsers: totalUsers[0]?.count || 0,
          totalFrontliners: totalFrontlinersCount,
          newFrontliners: newFrontliners[0]?.count || 0,
          totalOrganizations: totalOrganizations[0]?.count || 0,
          totalSubOrganizations: totalSubOrganizations[0]?.count || 0,
          certificatesIssued: certificatesIssued[0]?.count || 0,
          totalSubAdmins: totalSubAdmins[0]?.count || 0,
          averageProgress: Math.round(calculatedAverageProgress * 100) / 100,
        },

        // Analytics Data
        userGrowth: userGrowthData,
        assetDistribution: assetDistributionData,
        roleDistribution: roleDistributionData,
        seniorityDistribution: seniorityDistributionData,
        certificateAnalytics: certificateAnalyticsData,
        activeInactiveUsers: activeInactiveUsersData,
        peakUsageTimes: peakUsageTimesData,
        trainingAreaEnrollments: trainingAreaEnrollmentsData,
        courseCompletionRates: courseCompletionRatesData,
        trainingCompletionHeatmap: trainingCompletionHeatmapData,
        certificateTrends: certificateTrendsData,
        organizationRoleDistribution: organizationRoleDistributionData,
        trainingAreaSeniorityDistribution:
          trainingAreaSeniorityDistributionData,
      };
    } catch (error) {
      console.error("Error in getAllAnalyticsData:", error);
      // Return default values if there's an error
      return {
        keyMetrics: {
          totalUsers: 0,
          totalFrontliners: 0,
          newFrontliners: 0,
          totalOrganizations: 0,
          totalSubOrganizations: 0,
          certificatesIssued: 0,
          totalSubAdmins: 0,
          averageProgress: 0,
        },
        userGrowth: [],
        assetDistribution: [],
        roleDistribution: [],
        seniorityDistribution: [],
        certificateAnalytics: [],
        activeInactiveUsers: [],
        peakUsageTimes: [],
        trainingAreaEnrollments: [],
        courseCompletionRates: [],
        trainingCompletionHeatmap: [],
        certificateTrends: [],
        organizationRoleDistribution: [],
        trainingAreaSeniorityDistribution: [],
        organizationRoleTreeMap: [],
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
        alMidhyafOverallProgress,
      ] = await Promise.all([
        // Asset options for filters - get all available assets (distinct)
        db
          .selectDistinct({
            value: assets.name,
            label: assets.name,
          })
          .from(assets),

        // Sub-asset options for filters - get all available sub-assets (distinct)
        db
          .selectDistinct({
            value: subAssets.name,
            label: subAssets.name,
          })
          .from(subAssets),

        // Organization options for filters - get all available organizations (distinct)
        db
          .selectDistinct({
            value: organizations.name,
            label: organizations.name,
          })
          .from(organizations),

        // Sub-organization options for filters - get from all users
        db
          .select({
            value: sql<string>`COALESCE(${users.subOrganization}::text, 'N/A')`,
            label: sql<string>`COALESCE(${users.subOrganization}::text, 'N/A')`,
          })
          .from(users)
          .innerJoin(normalUsers, eq(users.id, normalUsers.userId))
          .groupBy(users.subOrganization),

        // Role category options for filters - get from all users
        db
          .select({
            value: normalUsers.roleCategory,
            label: normalUsers.roleCategory,
          })
          .from(users)
          .innerJoin(normalUsers, eq(users.id, normalUsers.userId))
          .groupBy(normalUsers.roleCategory),

        // Progress options for filters
        db
          .select({
            value: userTrainingAreaProgress.status,
            label: userTrainingAreaProgress.status,
          })
          .from(userTrainingAreaProgress)
          .where(eq(userTrainingAreaProgress.trainingAreaId, trainingArea.id))
          .groupBy(userTrainingAreaProgress.status),

        // Data table data - get all users who have enrolled in this training area
        db
          .select({
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
            SELECT AVG(CAST(ucp.completion_percentage AS FLOAT))
            FROM user_course_progress ucp
            INNER JOIN courses c ON ucp.course_id = c.id
            INNER JOIN modules m ON c.module_id = m.id
            WHERE ucp.user_id = ${users.id}
            AND m.training_area_id = ${trainingArea.id}
            AND m.name ILIKE '%module 1%'
          ), 0)`,
            vxPoints: users.xp,
            registrationDate: users.createdAt,
            lastLoginDate: users.lastLogin,
          })
          .from(users)
          .innerJoin(normalUsers, eq(users.id, normalUsers.userId))
          .leftJoin(
            userTrainingAreaProgress,
            and(
              eq(users.id, userTrainingAreaProgress.userId),
              eq(userTrainingAreaProgress.trainingAreaId, trainingArea.id)
            )
          )
          .orderBy(users.createdAt),

        // General numerical stats - get all frontliners (users with normalUsers)
        db
          .select({ count: count() })
          .from(users)
          .innerJoin(normalUsers, eq(users.id, normalUsers.userId)),

        // Total organizations
        db
          .select({ count: count() })
          .from(users)
          .innerJoin(normalUsers, eq(users.id, normalUsers.userId))
          .groupBy(users.organization),

        // Total certificates issued for this training area
        db
          .select({ count: count() })
          .from(certificates)
          .innerJoin(courses, eq(certificates.courseId, courses.id))
          .innerJoin(modules, eq(courses.moduleId, modules.id))
          .where(eq(modules.trainingAreaId, trainingArea.id)),

        // Total completed for this training area
        db
          .select({ count: count() })
          .from(userTrainingAreaProgress)
          .where(
            and(
              eq(userTrainingAreaProgress.trainingAreaId, trainingArea.id),
              eq(userTrainingAreaProgress.status, "completed")
            )
          ),

        // Total VX points earned by all users
        db
          .select({ total: sum(users.xp) })
          .from(users)
          .innerJoin(normalUsers, eq(users.id, normalUsers.userId)),

        // Average progress for this training area - Total progress divided by total users
        db
          .select({
            totalProgress: sql<number>`SUM(CAST(${userTrainingAreaProgress.completionPercentage} AS FLOAT))`,
            totalUsers: sql<number>`(
              SELECT COUNT(DISTINCT u.id)
              FROM users u
              INNER JOIN normal_users nu ON u.id = nu.user_id
              WHERE u.user_type != 'admin'
            )`,
          })
          .from(userTrainingAreaProgress)
          .where(eq(userTrainingAreaProgress.trainingAreaId, trainingArea.id)),
      ]);

      return {
        // Filter options
        filters: {
          assets: assetOptions,
          subAssets: subAssetOptions,
          organizations: organizationOptions,
          subOrganizations: subOrganizationOptions,
          roleCategories: roleCategoryOptions,
          progressStatuses: progressOptions,
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
          "Last Login Date",
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
          alMidhyafOverallProgress:
            alMidhyafOverallProgress[0]?.totalUsers &&
            alMidhyafOverallProgress[0].totalUsers > 0
              ? Math.round(
                  (alMidhyafOverallProgress[0].totalProgress /
                    alMidhyafOverallProgress[0].totalUsers) *
                    100
                ) / 100
              : 0,
        },
      };
    } catch (error) {
      console.error("Error in getTrainingAreaReportData:", error);
      throw error;
    }
  },

  // Certificate Report Data - All frontliners with their certificate completion status
  getCertificateReportData: async () => {
    try {
      // First, get the training area IDs for each certificate type
      const trainingAreaMappings = await db
        .select({
          id: trainingAreas.id,
          name: trainingAreas.name,
        })
        .from(trainingAreas);

      // Map training area names to IDs for certificate queries
      const getTrainingAreaId = (namePatterns: string[]) => {
        const matchingArea = trainingAreaMappings.find((area) =>
          namePatterns.some((pattern) =>
            area.name.toLowerCase().includes(pattern.toLowerCase())
          )
        );
        return matchingArea?.id || null;
      };

      const alMidhyafId = getTrainingAreaId(["al midhyaf", "midhyaf"]);
      const adInformationId = getTrainingAreaId([
        "ad information",
        "information",
      ]);
      const softSkillsId = getTrainingAreaId([
        "general vx soft skills",
        "soft skills",
        "soft",
      ]);
      const hardSkillsId = getTrainingAreaId([
        "general vx hard skills",
        "hard skills",
        "hard",
      ]);
      const managerialId = getTrainingAreaId([
        "managerial competencies",
        "managerial",
      ]);

      const [
        // Filter options
        assetOptions,
        subAssetOptions,
        organizationOptions,
        subOrganizationOptions,
        roleCategoryOptions,

        // Frontliner data with certificate status
        frontlinersData,

        totalCertificatesIssued,
        averageOverallProgress,

        // Training area names for certificate mapping
        trainingAreasData,
      ] = await Promise.all([
        // Asset options for filters - get all available assets (distinct)
        db
          .selectDistinct({
            value: assets.name,
            label: assets.name,
          })
          .from(assets),

        // Sub-asset options for filters - get all available sub-assets (distinct)
        db
          .selectDistinct({
            value: subAssets.name,
            label: subAssets.name,
          })
          .from(subAssets),

        // Organization options for filters - get all available organizations (distinct)
        db
          .selectDistinct({
            value: organizations.name,
            label: organizations.name,
          })
          .from(organizations),

        // Sub-organization options for filters
        db
          .select({
            value: sql<string>`COALESCE(${users.subOrganization}::text, 'N/A')`,
            label: sql<string>`COALESCE(${users.subOrganization}::text, 'N/A')`,
          })
          .from(users)
          .innerJoin(normalUsers, eq(users.id, normalUsers.userId))
          .groupBy(users.subOrganization),

        // Role category options for filters
        db
          .select({
            value: normalUsers.roleCategory,
            label: normalUsers.roleCategory,
          })
          .from(users)
          .innerJoin(normalUsers, eq(users.id, normalUsers.userId))
          .groupBy(normalUsers.roleCategory),

        // Frontliners data with certificate completion status
        db
          .select({
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
            // Certificate completion status - checking for issued certificates in each training area
            alMidhyafCertificate: alMidhyafId
              ? sql<boolean>`EXISTS (
            SELECT 1 FROM certificates c
            INNER JOIN courses co ON c.course_id = co.id
            INNER JOIN modules m ON co.module_id = m.id
            WHERE c.user_id = ${users.id}
            AND c.status = 'active'
            AND m.training_area_id = ${alMidhyafId}
          )`
              : sql<boolean>`false`,
            adInformationCertificate: adInformationId
              ? sql<boolean>`EXISTS (
            SELECT 1 FROM certificates c
            INNER JOIN courses co ON c.course_id = co.id
            INNER JOIN modules m ON co.module_id = m.id
            WHERE c.user_id = ${users.id}
            AND c.status = 'active'
            AND m.training_area_id = ${adInformationId}
          )`
              : sql<boolean>`false`,
            generalVXSoftSkillsCertificate: softSkillsId
              ? sql<boolean>`EXISTS (
            SELECT 1 FROM certificates c
            INNER JOIN courses co ON c.course_id = co.id
            INNER JOIN modules m ON co.module_id = m.id
            WHERE c.user_id = ${users.id}
            AND c.status = 'active'
            AND m.training_area_id = ${softSkillsId}
          )`
              : sql<boolean>`false`,
            generalVXHardSkillsCertificate: hardSkillsId
              ? sql<boolean>`EXISTS (
            SELECT 1 FROM certificates c
            INNER JOIN courses co ON c.course_id = co.id
            INNER JOIN modules m ON co.module_id = m.id
            WHERE c.user_id = ${users.id}
            AND c.status = 'active'
            AND m.training_area_id = ${hardSkillsId}
          )`
              : sql<boolean>`false`,
            managerialCompetenciesCertificate: managerialId
              ? sql<boolean>`EXISTS (
            SELECT 1 FROM certificates c
            INNER JOIN courses co ON c.course_id = co.id
            INNER JOIN modules m ON co.module_id = m.id
            WHERE c.user_id = ${users.id}
            AND c.status = 'active'
            AND m.training_area_id = ${managerialId}
          )`
              : sql<boolean>`false`,
            // Overall progress calculation across all training areas
            overallProgress: sql<number>`COALESCE((
            SELECT AVG(CAST(utap.completion_percentage AS FLOAT))
            FROM user_training_area_progress utap
            WHERE utap.user_id = ${users.id}
          ), 0)`,
          })
          .from(users)
          .innerJoin(normalUsers, eq(users.id, normalUsers.userId))
          .orderBy(users.createdAt),

        // Total certificates issued (from certificates table)
        db.select({ count: count() }).from(certificates),

        // Average overall progress - sum all progress from training areas divided by total users
        db
          .select({
            totalProgress: sql<number>`SUM(CAST(${userTrainingAreaProgress.completionPercentage} AS FLOAT))`,
            totalUsers: sql<number>`(
              SELECT COUNT(DISTINCT u.id)
              FROM users u
              INNER JOIN normal_users nu ON u.id = nu.user_id
              WHERE u.user_type != 'admin'
            )`,
          })
          .from(userTrainingAreaProgress),

        // Get all training areas for reference
        db
          .select({
            id: trainingAreas.id,
            name: trainingAreas.name,
          })
          .from(trainingAreas),
      ]);

      return {
        // Filter options
        filters: {
          assets: assetOptions,
          subAssets: subAssetOptions,
          organizations: organizationOptions,
          subOrganizations: subOrganizationOptions,
          roleCategories: roleCategoryOptions,
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
          "Managerial Competencies Certificate",
        ],

        // Data table rows
        dataTableRows: frontlinersData,

        // General numerical stats
        generalStats: {
          totalCertificatesIssued: totalCertificatesIssued[0]?.count || 0,
          averageOverallProgress:
            (averageOverallProgress[0] as any)?.totalUsers &&
            (averageOverallProgress[0] as any).totalUsers > 0
              ? Math.round(
                  ((averageOverallProgress[0] as any).totalProgress /
                    (averageOverallProgress[0] as any).totalUsers) *
                    100
                ) / 100
              : 0,
        },

        // Training areas for reference
        trainingAreas: trainingAreasData,
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

        // User type statistics
        totalUsers,
        totalFrontlinersCount,
        totalSubAdmins,
        totalAdmins,
      ] = await Promise.all([
        // User type options for filters
        db
          .select({
            value: users.userType,
            label: users.userType,
          })
          .from(users)
          .groupBy(users.userType),

        // Organization options for filters
        db
          .select({
            value: organizations.name,
            label: organizations.name,
          })
          .from(organizations)
          .orderBy(organizations.name),

        // Registration date options for filters (monthly)
        db
          .select({
            value: sql<string>`to_char(${users.createdAt}, 'YYYY-MM')`,
            label: sql<string>`to_char(${users.createdAt}, 'YYYY-MM')`,
          })
          .from(users)
          .groupBy(sql`to_char(${users.createdAt}, 'YYYY-MM')`)
          .orderBy(sql`to_char(${users.createdAt}, 'YYYY-MM')`),

        // All users data with normal user information
        db
          .select({
            userId: users.id,
            firstName: users.firstName,
            lastName: users.lastName,
            email: users.email,
            eid: sql<string>`COALESCE(${normalUsers.eid}, ${subAdmins.eid})`,
            phoneNumber: sql<string>`COALESCE(${normalUsers.phoneNumber}, ${subAdmins.phoneNumber})`,
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
          ), 0)`,
          })
          .from(users)
          .leftJoin(normalUsers, eq(users.id, normalUsers.userId))
          .leftJoin(subAdmins, eq(users.id, subAdmins.userId))
          .orderBy(users.createdAt),

        // Total Users (All users in the platform)
        db.select({ count: count() }).from(users),

        // Total Frontliners (All registered frontliners - users with normal user data)
        db
          .select({ count: count() })
          .from(users)
          .innerJoin(normalUsers, eq(users.id, normalUsers.userId)),

        // Total Sub-Admins (Registered sub-admins)
        db
          .select({ count: count() })
          .from(users)
          .where(eq(users.userType, "sub_admin")),

        // Total Admins (Assigned admins)
        db
          .select({ count: count() })
          .from(users)
          .where(eq(users.userType, "admin")),
      ]);

      return {
        // Filter options
        filters: {
          userTypes: userTypeOptions,
          organizations: organizationOptions,
          registrationDates: registrationDateOptions,
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
          "Last Login Date",
        ],

        // Data table rows
        dataTableRows: usersData,

        // User type statistics
        userTypeStats: {
          totalUsers: totalUsers[0]?.count || 0,
          totalFrontliners: totalFrontlinersCount[0]?.count || 0,
          totalSubAdmins: totalSubAdmins[0]?.count || 0,
          totalAdmins: totalAdmins[0]?.count || 0,
        },
      };
    } catch (error) {
      console.error("Error in getUsersReportData:", error);
      throw error;
    }
  },

  // Organizations Report Data - All organizations with frontliner statistics
  getOrganizationsReportData: async () => {
    try {
      // Get all organizations and related data
      const [
        allOrganizations,
        subAdminsData,
        normalUsersCount,
        allSubOrganizations,
      ] = await Promise.all([
        // Get all organizations from organizations table
        db
          .select({
            id: organizations.id,
            name: organizations.name,
          })
          .from(organizations)
          .orderBy(organizations.name),

        // Get sub-admins with their organization data
        db
          .select({
            organizationName: users.organization,
            asset: users.asset,
            subAsset: users.subAsset,
            subOrganization: sql<string>`COALESCE(${users.subOrganization}::text, 'N/A')`,
            totalFrontliners: sql<number>`COALESCE(${subAdmins.totalFrontliners}, 0)`,
            status: sql<string>`CASE WHEN ${users.lastLogin} >= NOW() - INTERVAL '15 days' THEN 'active' ELSE 'inactive' END`,
          })
          .from(users)
          .innerJoin(subAdmins, eq(users.id, subAdmins.userId)),

        // Count of normal users
        db.select({ count: count() }).from(normalUsers),

        // Get all sub-organizations grouped by organization with asset info
        db
          .select({
            organizationId: subOrganizations.organizationId,
            organizationName: organizations.name,
            subOrgName: subOrganizations.name,
            asset: assets.name,
            subAsset: subAssets.name,
          })
          .from(subOrganizations)
          .innerJoin(
            organizations,
            eq(subOrganizations.organizationId, organizations.id)
          )
          .leftJoin(assets, eq(subOrganizations.assetId, assets.id))
          .leftJoin(subAssets, eq(subOrganizations.subAssetId, subAssets.id))
          .orderBy(organizations.name, subOrganizations.name),
      ]);

      // Get all registered frontliners count by organization in one query
      const registeredFrontlinersByOrg = await db
        .select({
          organization: users.organization,
          count: count(),
        })
        .from(normalUsers)
        .innerJoin(users, eq(normalUsers.userId, users.id))
        .groupBy(users.organization);

      // Get active users count by organization (users who logged in within last 15 days)
      const activeUsersByOrg = await db
        .select({
          organization: users.organization,
          count: count(),
        })
        .from(users)
        .innerJoin(normalUsers, eq(users.id, normalUsers.userId))
        .where(
          gte(users.lastLogin, new Date(Date.now() - 15 * 24 * 60 * 60 * 1000))
        )
        .groupBy(users.organization);

      // Create maps for quick lookup
      const organizationDataMap = new Map();
      subAdminsData.forEach((data) => {
        organizationDataMap.set(data.organizationName, data);
      });

      const registeredCountMap = new Map();
      registeredFrontlinersByOrg.forEach((data) => {
        registeredCountMap.set(data.organization, data.count);
      });

      const activeUsersMap = new Map();
      activeUsersByOrg.forEach((data) => {
        activeUsersMap.set(data.organization, data.count);
      });

      // Create map of sub-organizations by organization name
      const subOrganizationsMap = new Map();
      const subOrgAssetMap = new Map();
      allSubOrganizations.forEach((data) => {
        if (!subOrganizationsMap.has(data.organizationName)) {
          subOrganizationsMap.set(data.organizationName, []);
          subOrgAssetMap.set(data.organizationName, {
            assets: new Set(),
            subAssets: new Set(),
          });
        }
        subOrganizationsMap.get(data.organizationName).push(data.subOrgName);

        // Store asset and sub-asset information
        if (data.asset) {
          subOrgAssetMap.get(data.organizationName).assets.add(data.asset);
        }
        if (data.subAsset) {
          subOrgAssetMap
            .get(data.organizationName)
            .subAssets.add(data.subAsset);
        }
      });

      // Build complete organizations data with N/A for missing values
      const organizationsWithCompleteData = allOrganizations.map((org) => {
        const orgData = organizationDataMap.get(org.name);
        const registeredCount = registeredCountMap.get(org.name) || 0;
        const hasSubAdmin = !!orgData;

        // Get count of sub-organizations for this organization
        const orgSubOrganizations = subOrganizationsMap.get(org.name) || [];
        const subOrganizationCount = orgSubOrganizations.length;

        // Get asset and sub-asset information
        let asset = orgData?.asset || "N/A";
        let subAsset = orgData?.subAsset || "N/A";

        // If no sub-admin, try to get asset info from sub-organizations
        if (!hasSubAdmin) {
          const subOrgAssets = subOrgAssetMap.get(org.name);
          if (subOrgAssets) {
            // Use the first available asset and sub-asset from sub-organizations
            const assetsArray = Array.from(subOrgAssets.assets);
            const subAssetsArray = Array.from(subOrgAssets.subAssets);

            if (assetsArray.length > 0) {
              asset = assetsArray[0];
            }
            if (subAssetsArray.length > 0) {
              subAsset = subAssetsArray[0];
            }
          }
        }

        // Determine status based on active users (any user active in last 15 days)
        const activeCount = activeUsersMap.get(org.name) || 0;
        const status = activeCount > 0 ? "active" : "inactive";

        return {
          id: org.id.toString(),
          name: org.name,
          asset: asset,
          subAsset: subAsset,
          subOrganization: subOrganizationCount,
          totalFrontliners: orgData?.totalFrontliners || 0,
          hasSubAdmin: hasSubAdmin,
          status: status,
          registeredFrontliners: registeredCount,
        };
      });

      // Get filter options - get all available assets and sub-assets
      const [assetOptions, subAssetOptions] = await Promise.all([
        db
          .select({
            value: assets.name,
            label: assets.name,
          })
          .from(assets),

        db
          .select({
            value: subAssets.name,
            label: subAssets.name,
          })
          .from(subAssets),
      ]);

      // Calculate totals
      const totalFrontliners = organizationsWithCompleteData.reduce(
        (sum, org) => sum + org.totalFrontliners,
        0
      );
      const activeOrganizations = organizationsWithCompleteData.filter(
        (org) => org.status === "active"
      ).length;

      return {
        // Filter options
        filters: {
          assets: assetOptions,
          subAssets: subAssetOptions,
        },

        // Organizations data - now includes ALL organizations
        organizations: organizationsWithCompleteData,

        // General numerical stats
        generalStats: {
          totalOrganizations: allOrganizations.length,
          activeOrganizations: activeOrganizations,
          totalFrontliners: totalFrontliners,
          registeredFrontliners: normalUsersCount[0]?.count || 0,
        },
      };
    } catch (error) {
      console.error("Error in getOrganizationsReportData:", error);
      throw error;
    }
  },

  // Sub-Organizations Report Data - All sub-organizations with comprehensive statistics
  getSubOrganizationsReportData: async () => {
    try {
      // Get basic statistics for organizations and sub-organizations
      const [
        totalOrganizations,
        activeOrganizations,
        totalSubOrganizations,
        activeSubOrganizations,
      ] = await Promise.all([
        // Total organizations
        db.select({ count: count() }).from(organizations),

        // Active organizations (organizations with users who logged in within last 15 days)
        db
          .select({ count: countDistinct(users.organization) })
          .from(users)
          .innerJoin(normalUsers, eq(users.id, normalUsers.userId))
          .where(
            gte(
              users.lastLogin,
              new Date(Date.now() - 15 * 24 * 60 * 60 * 1000)
            )
          ),

        // Total sub-organizations
        db.select({ count: count() }).from(subOrganizations),

        // Active sub-organizations (sub-organizations with users who logged in within last 15 days)
        db
          .select({
            count: sql<number>`(
              SELECT COUNT(DISTINCT sub_org_name)
              FROM (
                SELECT unnest(${users.subOrganization}) as sub_org_name
                FROM users
                INNER JOIN normal_users ON users.id = normal_users.user_id
                WHERE users.sub_organization IS NOT NULL
                  AND array_length(users.sub_organization, 1) > 0
                  AND users.last_login >= ${new Date(
                    Date.now() - 15 * 24 * 60 * 60 * 1000
                  )}
              ) as sub_orgs
            )`,
          })
          .from(users)
          .limit(1),
      ]);

      // Get sub-organizations with basic data
      const subOrganizationsData = await db
        .select({
          id: sql<string>`CAST(${subOrganizations.id} AS TEXT)`,
          name: subOrganizations.name,
          organization: organizations.name,
          asset: assets.name,
          subAsset: subAssets.name,
        })
        .from(subOrganizations)
        .leftJoin(
          organizations,
          eq(subOrganizations.organizationId, organizations.id)
        )
        .leftJoin(assets, eq(subOrganizations.assetId, assets.id))
        .leftJoin(subAssets, eq(subOrganizations.subAssetId, subAssets.id))
        .orderBy(subOrganizations.name);

      // Get registered frontliners count by sub-organization
      // Since subOrganization is an array, we need to unnest it and count all users (both normal users and sub_admins)
      const registeredFrontlinersBySubOrg = await db
        .select({
          subOrganization: sql<string>`unnest(${users.subOrganization})`,
          count: count(),
        })
        .from(users)
        .where(
          and(
            sql`${users.subOrganization} IS NOT NULL`,
            sql`array_length(${users.subOrganization}, 1) > 0`
          )
        )
        .groupBy(sql`unnest(${users.subOrganization})`);

      // Create map for quick lookup
      const registeredCountMap = new Map();
      registeredFrontlinersBySubOrg.forEach((data) => {
        registeredCountMap.set(data.subOrganization, data.count);
      });

      // Get active users count by sub-organization (users who logged in within last 15 days)
      const activeUsersBySubOrg = await db
        .select({
          subOrganization: sql<string>`unnest(${users.subOrganization})`,
          count: count(),
        })
        .from(users)
        .where(
          and(
            sql`${users.subOrganization} IS NOT NULL`,
            sql`array_length(${users.subOrganization}, 1) > 0`,
            gte(
              users.lastLogin,
              new Date(Date.now() - 15 * 24 * 60 * 60 * 1000)
            )
          )
        )
        .groupBy(sql`unnest(${users.subOrganization})`);

      // Create map for active users lookup
      const activeUsersMap = new Map();
      activeUsersBySubOrg.forEach((data) => {
        activeUsersMap.set(data.subOrganization, data.count);
      });

      // Create simplified sub-organizations data with actual registered frontliners count and status
      const subOrganizationsWithCounts = subOrganizationsData.map((subOrg) => {
        const registeredCount = registeredCountMap.get(subOrg.name) || 0;
        const activeCount = activeUsersMap.get(subOrg.name) || 0;

        // Mark as inactive if no users or no active users
        const status =
          registeredCount === 0 || activeCount === 0 ? "inactive" : "active";

        return {
          ...subOrg,
          registeredFrontliners: registeredCount,
          status: status,
        };
      });

      // Get filter options
      const [assetOptions, subAssetOptions] = await Promise.all([
        db
          .select({
            value: assets.name,
            label: assets.name,
          })
          .from(assets)
          .limit(10),

        db
          .select({
            value: subAssets.name,
            label: subAssets.name,
          })
          .from(subAssets)
          .limit(10),
      ]);

      return {
        filters: {
          assets: assetOptions,
          subAssets: subAssetOptions,
        },
        subOrganizations: subOrganizationsWithCounts,
        generalStats: {
          totalOrganizations: totalOrganizations[0]?.count || 0,
          activeOrganizations: activeOrganizations[0]?.count || 0,
          totalSubOrganizations: totalSubOrganizations[0]?.count || 0,
          activeSubOrganizations: activeSubOrganizations[0]?.count || 0,
        },
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
      ] = await Promise.all([
        // Asset options for filters - get all available assets (distinct)
        db
          .selectDistinct({
            value: assets.name,
            label: assets.name,
          })
          .from(assets),

        // Sub-asset options for filters - get all available sub-assets (distinct)
        db
          .selectDistinct({
            value: subAssets.name,
            label: subAssets.name,
          })
          .from(subAssets),

        // Organization options for filters - get all available organizations (distinct)
        db
          .selectDistinct({
            value: organizations.name,
            label: organizations.name,
          })
          .from(organizations),

        // Sub-admins data with comprehensive statistics - include only users who exist in both users and subAdmins tables
        db
          .select({
            userId: users.id,
            firstName: users.firstName,
            lastName: users.lastName,
            email: users.email,
            eid: sql<string>`COALESCE(${subAdmins.eid}, 'N/A')`,
            phoneNumber: sql<string>`COALESCE(${subAdmins.phoneNumber}, 'N/A')`,
            jobTitle: sql<string>`COALESCE(${subAdmins.jobTitle}, 'N/A')`,
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
            status: sql<string>`CASE WHEN ${users.lastLogin} >= NOW() - INTERVAL '15 days' THEN 'active' ELSE 'inactive' END`,
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
          )`,
          })
          .from(users)
          .leftJoin(subAdmins, eq(users.id, subAdmins.userId))
          .where(eq(users.userType, "sub_admin"))
          .orderBy(users.createdAt),

        // Total sub-admins count (users with userType 'sub_admin' who exist in both users and subAdmins tables)
        db
          .select({ count: count() })
          .from(users)
          .where(eq(users.userType, "sub_admin")),

        // Active sub-admins count (sub-admins who exist in both users and subAdmins tables and have logged in within 15 days)
        db
          .select({ count: countDistinct(users.id) })
          .from(users)
          .innerJoin(subAdmins, eq(users.id, subAdmins.userId))
          .where(
            and(
              eq(users.userType, "sub_admin"),
              gte(users.lastLogin, sql`NOW() - INTERVAL '15 days'`)
            )
          ),
      ]);

      return {
        // Filter options
        filters: {
          assets: assetOptions,
          subAssets: subAssetOptions,
          organizations: organizationOptions,
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
          "Total Frontliners",
          "Registered Frontliners",
          "Registration Date",
          "Last Login Date",
        ],

        // Sub-admins data
        dataTableRows: subAdminsData,

        // General numerical stats
        generalStats: {
          totalSubAdmins: totalSubAdmins[0]?.count || 0,
          activeSubAdmins: activeSubAdmins[0]?.count || 0,
        },
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
        totalCertificates,
        averageAlMidhyaf,
        averageProgress,
      ] = await Promise.all([
        // Asset options for filters - get all available assets (distinct)
        db
          .selectDistinct({
            value: assets.name,
            label: assets.name,
          })
          .from(assets),

        // Sub-asset options for filters - get all available sub-assets (distinct)
        db
          .selectDistinct({
            value: subAssets.name,
            label: subAssets.name,
          })
          .from(subAssets),

        // Organization options for filters - get all available organizations (distinct)
        db
          .selectDistinct({
            value: organizations.name,
            label: organizations.name,
          })
          .from(organizations),

        // Sub-organization options for filters - get all sub-organizations from subOrganizations table
        db
          .select({
            value: subOrganizations.name,
            label: subOrganizations.name,
          })
          .from(subOrganizations)
          .orderBy(subOrganizations.name),

        // Role category options for filters
        db
          .select({
            value: normalUsers.roleCategory,
            label: normalUsers.roleCategory,
          })
          .from(users)
          .innerJoin(normalUsers, eq(users.id, normalUsers.userId))
          .groupBy(normalUsers.roleCategory),

        // Frontliners data with comprehensive statistics
        db
          .select({
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
            frontlinerType: sql<string>`CASE WHEN ${normalUsers.existing} THEN 'Existing' ELSE 'New' END`,
            registrationDate: users.createdAt,
            lastLoginDate: users.lastLogin,
            status: sql<string>`CASE WHEN ${users.lastLogin} >= NOW() - INTERVAL '15 days' THEN 'active' ELSE 'inactive' END`,
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
          ), 0)`,
          })
          .from(users)
          .innerJoin(normalUsers, eq(users.id, normalUsers.userId))
          .orderBy(users.createdAt),

        // Total frontliners count (Registered Frontliners)
        db
          .select({ count: count() })
          .from(users)
          .innerJoin(normalUsers, eq(users.id, normalUsers.userId)),

        // Active frontliners count (last login within 15 days)
        db
          .select({ count: count() })
          .from(users)
          .innerJoin(normalUsers, eq(users.id, normalUsers.userId))
          .where(
            gte(
              users.lastLogin,
              new Date(Date.now() - 15 * 24 * 60 * 60 * 1000)
            )
          ),

        // Total certificates issued
        db.select({ count: count() }).from(certificates),

        // Average Al Midhyaf progress - Total progress divided by total users
        db
          .select({
            totalProgress: sql<number>`SUM(COALESCE((
            SELECT AVG(CAST(utap.completion_percentage AS FLOAT))
            FROM user_training_area_progress utap
            INNER JOIN training_areas ta ON utap.training_area_id = ta.id
            WHERE utap.user_id = ${users.id}
            AND LOWER(ta.name) LIKE '%midhyaf%'
          ), 0))`,
            totalUsers: count(),
          })
          .from(users)
          .innerJoin(normalUsers, eq(users.id, normalUsers.userId)),

        // Average overall progress
        db
          .select({
            avgProgress: sql<number>`AVG(COALESCE((
            SELECT AVG(CAST(utap.completion_percentage AS FLOAT))
            FROM user_training_area_progress utap
            WHERE utap.user_id = ${users.id}
          ), 0))`,
          })
          .from(users)
          .innerJoin(normalUsers, eq(users.id, normalUsers.userId)),
      ]);

      return {
        // Filter options
        filters: {
          assets: assetOptions,
          subAssets: subAssetOptions,
          organizations: organizationOptions,
          subOrganizations: subOrganizationOptions,
          roleCategories: roleCategoryOptions,
        },

        // Frontliners data
        frontliners: frontlinersData,

        // General numerical stats
        generalStats: {
          totalFrontliners: totalFrontliners[0]?.count || 0,
          activeFrontliners: activeFrontliners[0]?.count || 0,
          totalCertificates: totalCertificates[0]?.count || 0,
          alMidhyafProgress:
            averageAlMidhyaf[0]?.totalUsers &&
            averageAlMidhyaf[0].totalUsers > 0
              ? Math.round(
                  (averageAlMidhyaf[0].totalProgress /
                    averageAlMidhyaf[0].totalUsers) *
                    100
                ) / 100
              : 0,
          averageProgress:
            Math.round((averageProgress[0]?.avgProgress || 0) * 100) / 100,
        },
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
        // Total Users (All users excluding admins)
        totalUsers,
        // Total Frontliners (All registered frontliners)
        totalFrontliners,
        // New Frontliners (Joined this month)
        newFrontliners,
        // Total Organizations (Registered organizations)
        totalOrganizations,
        // Total Sub-Organizations (Registered sub-organizations)
        totalSubOrganizations,
        // Total Certificates (Certificates issued)
        totalCertificates,
        // Total Sub-Admins (Registered sub-admins)
        totalSubAdmins,
        // Average Progress (Overall completion rate)
        averageProgress,
      ] = await Promise.all([
        // Total Users (All users excluding admins)
        db.select({ count: count() }).from(users),

        // Total Frontliners (All registered frontliners)
        db.select({ count: count() }).from(normalUsers),

        // New Frontliners (Joined this month)
        db
          .select({ count: count() })
          .from(users)
          .innerJoin(normalUsers, eq(users.id, normalUsers.userId))
          .where(
            and(
              gte(users.createdAt, sql`DATE_TRUNC('month', CURRENT_DATE)`),
              lt(
                users.createdAt,
                sql`DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month'`
              )
            )
          ),

        // Total Organizations (Registered organizations)
        db.select({ count: count() }).from(organizations),

        // Total Sub-Organizations (Registered sub-organizations)
        db.select({ count: count() }).from(subOrganizations),

        // Total Certificates (Certificates issued)
        db.select({ count: count() }).from(certificates),

        // Total Sub-Admins (Registered sub-admins)
        db
          .select({ count: count() })
          .from(users)
          .where(eq(users.userType, "sub_admin")),

        // Average Progress (Overall completion rate)
        db
          .select({
            totalProgress: sql<number>`SUM(CAST(${userTrainingAreaProgress.completionPercentage} AS FLOAT))`,
          })
          .from(userTrainingAreaProgress),
      ]);

      const totalProgress = averageProgress[0]?.totalProgress || 0;
      const totalFrontlinersCount = totalFrontliners[0]?.count || 0;
      const calculatedAverageProgress =
        totalFrontlinersCount > 0 ? totalProgress / totalFrontlinersCount : 0;

      return {
        totalUsers: totalUsers[0]?.count || 0,
        totalFrontliners: totalFrontlinersCount,
        newFrontliners: newFrontliners[0]?.count || 0,
        totalOrganizations: totalOrganizations[0]?.count || 0,
        totalSubOrganizations: totalSubOrganizations[0]?.count || 0,
        totalCertificates: totalCertificates[0]?.count || 0,
        totalSubAdmins: totalSubAdmins[0]?.count || 0,
        averageProgress: Math.round(calculatedAverageProgress * 100) / 100,
      };
    } catch (error) {
      console.error("Error in getDashboardStats:", error);
      throw error;
    }
  },
};
