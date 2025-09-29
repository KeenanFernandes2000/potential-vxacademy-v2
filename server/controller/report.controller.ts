import type { Request, Response } from "express";
import { reportServices } from "../services/report.services";

export const reportController = {
  // Overall Analytics Dashboard - Single comprehensive endpoint
  getOverallAnalytics: async (req: Request, res: Response) => {
    try {
      const data = await reportServices.getAllAnalyticsData();
      res.json({ success: true, data });
    } catch (error) {
      console.error("Error fetching overall analytics:", error);
      res.status(500).json({ success: false, error: "Failed to fetch overall analytics data" });
    }
  },

  // Training Area Report - Single endpoint for specific training area
  getTrainingAreaReport: async (req: Request, res: Response) => {
    try {
      const { trainingAreaId } = req.params;
      
      if (!trainingAreaId) {
        return res.status(400).json({ 
          success: false, 
          error: "Training area ID is required" 
        });
      }

      const data = await reportServices.getTrainingAreaReportData(parseInt(trainingAreaId));
      res.json({ success: true, data });
    } catch (error) {
      console.error("Error fetching training area report:", error);
      res.status(500).json({ 
        success: false, 
        error: "Failed to fetch training area report data" 
      });
    }
  },

  // Certificate Report - All frontliners with their certificate data
  getCertificateReport: async (req: Request, res: Response) => {
    try {
      const data = await reportServices.getCertificateReportData();
      res.json({ success: true, data });
    } catch (error) {
      console.error("Error fetching certificate report:", error);
      res.status(500).json({ 
        success: false, 
        error: "Failed to fetch certificate report data" 
      });
    }
  },

  // Users Report - All users with normal user data and filters
  getUsersReport: async (req: Request, res: Response) => {
    try {
      const data = await reportServices.getUsersReportData();
      res.json({ success: true, data });
    } catch (error) {
      console.error("Error fetching users report:", error);
      res.status(500).json({ 
        success: false, 
        error: "Failed to fetch users report data" 
      });
    }
  },

  // Organizations Report - All organizations with frontliner statistics
  getOrganizationsReport: async (req: Request, res: Response) => {
    try {
      const data = await reportServices.getOrganizationsReportData();
      res.json({ success: true, data });
    } catch (error) {
      console.error("Error fetching organizations report:", error);
      res.status(500).json({ 
        success: false, 
        error: "Failed to fetch organizations report data" 
      });
    }
  },

  // Sub-Admins Report - All sub-admins with comprehensive statistics
  getSubAdminsReport: async (req: Request, res: Response) => {
    try {
      const data = await reportServices.getSubAdminsReportData();
      res.json({ success: true, data });
    } catch (error) {
      console.error("Error fetching sub-admins report:", error);
      res.status(500).json({ 
        success: false, 
        error: "Failed to fetch sub-admins report data" 
      });
    }
  },

  // Frontliners Report - All frontliners with comprehensive statistics
  getFrontlinersReport: async (req: Request, res: Response) => {
    try {
      const data = await reportServices.getFrontlinersReportData();
      res.json({ success: true, data });
    } catch (error) {
      console.error("Error fetching frontliners report:", error);
      res.status(500).json({ 
        success: false, 
        error: "Failed to fetch frontliners report data" 
      });
    }
  }
};
