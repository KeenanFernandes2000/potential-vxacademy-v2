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
  }
};
