import { AuctionCreationPayload } from '../components/AuctionExcelUploadForm';

/**
 * Service for handling auction-related API calls
 */
export class AuctionService {
  private static baseUrl = '/api/auctions'; // Update with your actual API base URL

  /**
   * Creates auction listings from Excel upload form data
   * @param payload - The auction creation payload including form data and file keys
   * @returns Promise with the API response
   */
  static async createAuctionListings(payload: AuctionCreationPayload): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating auction listings:', error);
      throw error;
    }
  }

  /**
   * Validates file upload before processing
   * @param fileKey - The S3 file key
   * @param fileType - Type of file (listings or manifest)
   * @returns Promise with validation result
   */
  static async validateUploadedFile(fileKey: string, fileType: 'listings' | 'manifest'): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/validate-file`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fileKey, fileType }),
      });

      if (!response.ok) {
        throw new Error(`File validation failed! status: ${response.status}`);
      }

      const result = await response.json();
      return result.isValid;
    } catch (error) {
      console.error('Error validating file:', error);
      return false;
    }
  }
} 