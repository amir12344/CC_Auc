import { EventBridgeSchedulerManager } from "./EventBridgeSchedulerManager";

/**
 * Helper function to create EventBridge schedule for auction completion
 * This should be called when creating an auction listing
 */
export async function setupAuctionCompletionSchedule(
  auctionListingId: string,
  auctionEndTime: Date,
  completeAuctionFunctionArn: string,
  schedulerRoleArn: string,
  scheduleGroupName: string,
  completeAuctionDlq?: string
): Promise<void> {
  // Validate auction end time is in the future
  const now = new Date();
  if (auctionEndTime <= now) {
    console.warn(
      `Auction end time ${auctionEndTime.toISOString()} is in the past or too close to current time`
    );
    return; // Don't create schedule for past auctions
  }

  // Add buffer time to ensure auction doesn't end before scheduled time
  const bufferMinutes = 1; // 1 minute buffer
  const scheduledTime = new Date(
    auctionEndTime.getTime() + bufferMinutes * 60 * 1000
  );

  const schedulerManager = new EventBridgeSchedulerManager(
    undefined,
    schedulerRoleArn,
    scheduleGroupName
  );

  try {
    await schedulerManager.createAuctionCompletionSchedule({
      auctionListingId,
      auctionEndTime: scheduledTime,
      completeAuctionFunctionArn,
      completeAuctionDlq,
    });

    console.log(
      `Successfully set up auction completion schedule for auction: ${auctionListingId} at ${scheduledTime.toISOString()}`
    );
  } catch (error) {
    console.error(
      `Failed to set up auction completion schedule for auction: ${auctionListingId}`,
      error
    );
    // Don't throw here - auction creation can succeed even if schedule creation fails
    // The auction can still be manually completed
  }
}

/**
 * Helper function to update EventBridge schedule when auction end time changes
 * This should be called when updating an auction's end time (e.g., due to bid extensions)
 */
export async function updateAuctionCompletionSchedule(
  auctionListingId: string,
  newAuctionEndTime: Date,
  completeAuctionFunctionArn: string,
  schedulerRoleArn: string,
  scheduleGroupName: string,
  completeAuctionDlq: string
): Promise<void> {
  const schedulerManager = new EventBridgeSchedulerManager(
    undefined,
    schedulerRoleArn,
    scheduleGroupName
  );

  try {
    // Check if auction end time is in the future
    const now = new Date();
    if (newAuctionEndTime <= now) {
      console.log(
        `New auction end time is in the past, deleting EventBridge schedule for auction: ${auctionListingId}`
      );
      await schedulerManager.deleteAuctionCompletionSchedule(auctionListingId);
      return;
    }

    // Add buffer time
    const bufferMinutes = 1;
    const scheduledTime = new Date(
      newAuctionEndTime.getTime() + bufferMinutes * 60 * 1000
    );

    await schedulerManager.updateAuctionCompletionSchedule({
      auctionListingId,
      auctionEndTime: scheduledTime,
      completeAuctionFunctionArn,
      completeAuctionDlq,
    });

    console.log(
      `Successfully updated auction completion schedule for auction: ${auctionListingId} to ${scheduledTime.toISOString()}`
    );
  } catch (error) {
    console.error(
      `Failed to update auction completion schedule for auction: ${auctionListingId}`,
      error
    );
    // Don't throw here - auction update can succeed even if schedule update fails
  }
}

/**
 * Helper function to remove EventBridge schedule when auction is cancelled or manually completed
 * This should be called when cancelling an auction or completing it manually
 */
export async function removeAuctionCompletionSchedule(
  auctionListingId: string,
  schedulerRoleArn: string,
  scheduleGroupName: string
): Promise<void> {
  const schedulerManager = new EventBridgeSchedulerManager(
    undefined,
    schedulerRoleArn,
    scheduleGroupName
  );

  try {
    await schedulerManager.deleteAuctionCompletionSchedule(auctionListingId);
    console.log(
      `Successfully removed auction completion schedule for auction: ${auctionListingId}`
    );
  } catch (error) {
    console.error(
      `Failed to remove auction completion schedule for auction: ${auctionListingId}`,
      error
    );
    // Don't throw here - the operation can succeed even if cleanup fails
  }
}

/**
 * Helper function to check if an auction has an active EventBridge schedule
 */
export async function hasActiveCompletionSchedule(
  auctionListingId: string,
  schedulerRoleArn: string,
  scheduleGroupName: string
): Promise<boolean> {
  const schedulerManager = new EventBridgeSchedulerManager(
    undefined,
    schedulerRoleArn,
    scheduleGroupName
  );

  try {
    return await schedulerManager.scheduleExists(auctionListingId);
  } catch (error) {
    console.error(
      `Failed to check if completion schedule exists for auction: ${auctionListingId}`,
      error
    );
    return false;
  }
}

/**
 * Helper function to get schedule details for an auction
 */
export async function getAuctionScheduleDetails(
  auctionListingId: string,
  schedulerRoleArn: string,
  scheduleGroupName: string
): Promise<any> {
  const schedulerManager = new EventBridgeSchedulerManager(
    undefined,
    schedulerRoleArn,
    scheduleGroupName
  );

  try {
    return await schedulerManager.getScheduleDetails(auctionListingId);
  } catch (error) {
    console.error(
      `Failed to get schedule details for auction: ${auctionListingId}`,
      error
    );
    return null;
  }
}

/**
 * Batch function to set up schedules for multiple auctions
 * Useful for bulk auction creation scenarios
 */
export async function setupBatchAuctionCompletionSchedules(
  auctions: Array<{ auctionListingId: string; auctionEndTime: Date }>,
  completeAuctionFunctionArn: string,
  schedulerRoleArn: string,
  scheduleGroupName: string,
  completeAuctionDlq: string
): Promise<{ successful: string[]; failed: string[] }> {
  const successful: string[] = [];
  const failed: string[] = [];

  const schedulerManager = new EventBridgeSchedulerManager(
    undefined,
    schedulerRoleArn,
    scheduleGroupName
  );

  // Process in batches to avoid overwhelming the EventBridge Scheduler API
  const batchSize = 10;
  for (let i = 0; i < auctions.length; i += batchSize) {
    const batch = auctions.slice(i, i + batchSize);

    const batchPromises = batch.map(
      async ({ auctionListingId, auctionEndTime }) => {
        try {
          const now = new Date();
          if (auctionEndTime <= now) {
            console.warn(`Skipping past auction: ${auctionListingId}`);
            return { auctionListingId, success: false };
          }

          const bufferMinutes = 1;
          const scheduledTime = new Date(
            auctionEndTime.getTime() + bufferMinutes * 60 * 1000
          );

          await schedulerManager.createAuctionCompletionSchedule({
            auctionListingId,
            auctionEndTime: scheduledTime,
            completeAuctionFunctionArn,
            completeAuctionDlq,
          });

          return { auctionListingId, success: true };
        } catch (error) {
          console.error(
            `Failed to create schedule for auction: ${auctionListingId}`,
            error
          );
          return { auctionListingId, success: false };
        }
      }
    );

    const batchResults = await Promise.allSettled(batchPromises);

    batchResults.forEach((result) => {
      if (result.status === "fulfilled") {
        if (result.value.success) {
          successful.push(result.value.auctionListingId);
        } else {
          failed.push(result.value.auctionListingId);
        }
      } else {
        // This shouldn't happen since we're catching errors above
        console.error("Unexpected batch processing error:", result.reason);
      }
    });

    // Small delay between batches to be gentle on the API
    if (i + batchSize < auctions.length) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }

  console.log(
    `Batch schedule creation completed. Successful: ${successful.length}, Failed: ${failed.length}`
  );
  return { successful, failed };
}
