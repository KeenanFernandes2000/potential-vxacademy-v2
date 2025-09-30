import { PDFDocument, rgb } from 'pdf-lib';
import fs from 'fs';
import path from 'path';
import { db } from '../db/connection';
import { certificates, users, trainingAreas } from '../db/schema';
import { eq, and } from 'drizzle-orm';

export class CertificateGenerationService {
  /**
   * Generate a certificate PDF with user name filled in
   */
  static async generateCertificatePDF(
    userId: number,
    trainingAreaId: number,
    userName: string
  ): Promise<Buffer> {
    try {
      // Path to the AlMidhyaf.pdf template
      const templatePath = path.join(process.cwd(), '..', 'client', 'public', 'AlMidhyaf.pdf');
      
      // Check if template exists
      if (!fs.existsSync(templatePath)) {
        throw new Error('Certificate template not found');
      }

      // Read the PDF template
      const templateBytes = fs.readFileSync(templatePath);
      const pdfDoc = await PDFDocument.load(templateBytes);
      const pages = pdfDoc.getPages();
      const firstPage = pages[0];
      const { width, height } = firstPage.getSize();

      // Add text to the PDF (fill2 field)
      // You may need to adjust these coordinates based on the actual PDF layout
      firstPage.drawText(userName, {
        x: width * 0.5 - (userName.length * 3), // Center horizontally
        y: height * 0.6, // Adjust Y position as needed
        size: 16,
        color: rgb(0, 0, 0),
      });

      // Generate the PDF bytes
      const pdfBytes = await pdfDoc.save();
      return Buffer.from(pdfBytes);
    } catch (error) {
      console.error('Error generating certificate PDF:', error);
      throw error;
    }
  }

  /**
   * Generate certificate and save to database
   */
  static async generateAndSaveCertificate(
    userId: number,
    trainingAreaId: number
  ): Promise<{ success: boolean; message: string; certificateId?: number; pdfBuffer?: Buffer }> {
    try {
      // Get user information
      const [user] = await db
        .select({
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
        })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (!user) {
        return {
          success: false,
          message: 'User not found',
        };
      }

      // Get training area information
      const [trainingArea] = await db
        .select({
          id: trainingAreas.id,
          name: trainingAreas.name,
        })
        .from(trainingAreas)
        .where(eq(trainingAreas.id, trainingAreaId))
        .limit(1);

      if (!trainingArea) {
        return {
          success: false,
          message: 'Training area not found',
        };
      }

      // Check if certificate already exists
      const existingCertificate = await db
        .select({ id: certificates.id })
        .from(certificates)
        .where(
          and(
            eq(certificates.userId, userId),
            eq(certificates.courseId, trainingAreaId)
          )
        )
        .limit(1);

      if (existingCertificate[0]) {
        return {
          success: true,
          message: 'Certificate already exists for this training area',
          certificateId: existingCertificate[0].id,
        };
      }

      // Generate certificate number
      const certificateNumber = `TA-${trainingAreaId}-${userId}-${Date.now()}`;

      // Calculate expiry date (2 years from now)
      const expiryDate = new Date();
      expiryDate.setFullYear(expiryDate.getFullYear() + 2);

      // Create user's full name
      const fullName = `${user.firstName} ${user.lastName}`;

      // Generate the PDF with user name
      const pdfBuffer = await this.generateCertificatePDF(
        userId,
        trainingAreaId,
        fullName
      );

      // Save certificate to database
      const [newCertificate] = await db
        .insert(certificates)
        .values({
          userId,
          courseId: trainingAreaId,
          certificateNumber,
          expiryDate,
          status: 'active',
        })
        .returning({ id: certificates.id });

      return {
        success: true,
        message: 'Certificate generated successfully',
        certificateId: newCertificate.id,
        pdfBuffer,
      };
    } catch (error) {
      console.error('Error generating certificate:', error);
      return {
        success: false,
        message: 'Failed to generate certificate',
      };
    }
  }
}
