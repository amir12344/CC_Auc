import {
  ActionAfterCompletion,
  CreateScheduleCommand,
  DeleteScheduleCommand,
  FlexibleTimeWindowMode,
  GetScheduleCommand,
  SchedulerClient,
  ScheduleState,
  UpdateScheduleCommand,
} from "@aws-sdk/client-scheduler";

export interface SchedulerConfig {
  auctionListingId: string;
  auctionEndTime: Date;
  completeAuctionFunctionArn: string;
  completeAuctionDlq?: string;
}

export class EventBridgeSchedulerManager {
  private schedulerClient: SchedulerClient;
  private scheduleGroupName: string;
  private schedulerRoleArn: string;

  constructor(
    region: string = "us-east-1",
    schedulerRoleArn: string,
    scheduleGroupName: string
  ) {
    this.schedulerClient = new SchedulerClient({ region });
    this.scheduleGroupName = scheduleGroupName;
    this.schedulerRoleArn = schedulerRoleArn;
  }

  /**
   * Create a one-time schedule to trigger auction completion
   */
  async createAuctionCompletionSchedule(
    config: SchedulerConfig
  ): Promise<string> {
    const scheduleName = `auction-completion-${config.auctionListingId}`;

    try {
      // Ensure the schedule time is in the future
      const now = new Date();
      if (config.auctionEndTime <= now) {
        throw new Error(
          `Auction end time must be in the future. Provided: ${config.auctionEndTime.toISOString()}`
        );
      }

      console.log(
        `Creating EventBridge schedule: ${scheduleName} for time: ${config.auctionEndTime.toISOString()}`
      );

      const scheduleExpression = `at(${this.dateToScheduleExpression(config.auctionEndTime)})`;

      const createCommand = new CreateScheduleCommand({
        Name: scheduleName,
        GroupName: this.scheduleGroupName,
        Description: `Auto-complete auction ${config.auctionListingId}`,
        ScheduleExpression: scheduleExpression,
        State: ScheduleState.ENABLED,

        // Flexible time window (allows up to 5 minutes variance for better resource optimization)
        FlexibleTimeWindow: {
          Mode: FlexibleTimeWindowMode.FLEXIBLE,
          MaximumWindowInMinutes: 5,
        },

        Target: {
          Arn: config.completeAuctionFunctionArn,
          RoleArn: this.schedulerRoleArn,
          Input: JSON.stringify({
            auctionListingId: config.auctionListingId,
            triggerSource: "SCHEDULER",
          }),

          // Retry configuration
          RetryPolicy: {
            MaximumRetryAttempts: 2,
          },

          // Dead letter queue could be configured here if needed
          DeadLetterConfig: {
            Arn: config.completeAuctionDlq, // DLQ ARN would be passed via config if available
          },
        },

        // Automatically delete the schedule after completion
        ActionAfterCompletion: ActionAfterCompletion.DELETE,

        // Set timezone (optional, defaults to UTC)
        ScheduleExpressionTimezone: "UTC",
      });

      await this.schedulerClient.send(createCommand);
      console.log(`EventBridge schedule created successfully: ${scheduleName}`);
      return scheduleName;
    } catch (error) {
      console.error(
        `Failed to create EventBridge schedule: ${scheduleName}`,
        error
      );
      throw error;
    }
  }

  /**
   * Update an existing schedule with a new end time
   */
  async updateAuctionCompletionSchedule(
    config: SchedulerConfig
  ): Promise<string> {
    const scheduleName = `auction-completion-${config.auctionListingId}`;

    try {
      // Check if schedule exists first
      const exists = await this.scheduleExists(config.auctionListingId);
      if (!exists) {
        // If it doesn't exist, create it
        return await this.createAuctionCompletionSchedule(config);
      }

      // Ensure the schedule time is in the future
      const now = new Date();
      if (config.auctionEndTime <= now) {
        // If time is in the past, delete the schedule
        await this.deleteAuctionCompletionSchedule(config.auctionListingId);
        return scheduleName;
      }

      console.log(
        `Updating EventBridge schedule: ${scheduleName} to time: ${config.auctionEndTime.toISOString()}`
      );

      const scheduleExpression = `at(${this.dateToScheduleExpression(config.auctionEndTime)})`;

      const updateCommand = new UpdateScheduleCommand({
        Name: scheduleName,
        GroupName: this.scheduleGroupName,
        Description: `Auto-complete auction ${config.auctionListingId}`,
        ScheduleExpression: scheduleExpression,
        State: ScheduleState.ENABLED,

        FlexibleTimeWindow: {
          Mode: FlexibleTimeWindowMode.FLEXIBLE,
          MaximumWindowInMinutes: 5,
        },

        Target: {
          Arn: config.completeAuctionFunctionArn,
          RoleArn: this.schedulerRoleArn,
          Input: JSON.stringify({
            auctionListingId: config.auctionListingId,
            triggerSource: "SCHEDULER",
          }),

          RetryPolicy: {
            MaximumRetryAttempts: 2,
          },

          DeadLetterConfig: {
            Arn: undefined, // DLQ ARN would be passed via config if available
          },
        },

        ActionAfterCompletion: ActionAfterCompletion.DELETE,
        ScheduleExpressionTimezone: "UTC",
      });

      await this.schedulerClient.send(updateCommand);
      console.log(`EventBridge schedule updated successfully: ${scheduleName}`);
      return scheduleName;
    } catch (error) {
      console.error(
        `Failed to update EventBridge schedule: ${scheduleName}`,
        error
      );
      throw error;
    }
  }

  /**
   * Delete a schedule for auction completion
   */
  async deleteAuctionCompletionSchedule(
    auctionListingId: string
  ): Promise<void> {
    const scheduleName = `auction-completion-${auctionListingId}`;

    try {
      console.log(`Deleting EventBridge schedule: ${scheduleName}`);

      const deleteCommand = new DeleteScheduleCommand({
        Name: scheduleName,
        GroupName: this.scheduleGroupName,
      });

      await this.schedulerClient.send(deleteCommand);
      console.log(`EventBridge schedule deleted successfully: ${scheduleName}`);
    } catch (error: any) {
      // Don't throw if schedule doesn't exist
      if (error.name === "ResourceNotFoundException") {
        console.log(
          `EventBridge schedule not found (already deleted): ${scheduleName}`
        );
        return;
      }
      console.error(
        `Failed to delete EventBridge schedule: ${scheduleName}`,
        error
      );
      throw error;
    }
  }

  /**
   * Check if a schedule exists for an auction
   */
  async scheduleExists(auctionListingId: string): Promise<boolean> {
    const scheduleName = `auction-completion-${auctionListingId}`;

    try {
      const getCommand = new GetScheduleCommand({
        Name: scheduleName,
        GroupName: this.scheduleGroupName,
      });

      await this.schedulerClient.send(getCommand);
      return true;
    } catch (error: any) {
      if (error.name === "ResourceNotFoundException") {
        return false;
      }
      throw error;
    }
  }

  /**
   * Get the current schedule details
   */
  async getScheduleDetails(auctionListingId: string): Promise<any> {
    const scheduleName = `auction-completion-${auctionListingId}`;

    try {
      const getCommand = new GetScheduleCommand({
        Name: scheduleName,
        GroupName: this.scheduleGroupName,
      });

      const response = await this.schedulerClient.send(getCommand);
      return response;
    } catch (error: any) {
      if (error.name === "ResourceNotFoundException") {
        return null;
      }
      throw error;
    }
  }

  /**
   * Convert a Date object to EventBridge Scheduler expression
   * Format: YYYY-MM-DDTHH:MM:SS
   */
  private dateToScheduleExpression(date: Date): string {
    // EventBridge Scheduler expects UTC time in ISO format without milliseconds or timezone
    const utcDate = new Date(date.toISOString());

    const year = utcDate.getUTCFullYear();
    const month = String(utcDate.getUTCMonth() + 1).padStart(2, "0");
    const day = String(utcDate.getUTCDate()).padStart(2, "0");
    const hours = String(utcDate.getUTCHours()).padStart(2, "0");
    const minutes = String(utcDate.getUTCMinutes()).padStart(2, "0");
    const seconds = String(utcDate.getUTCSeconds()).padStart(2, "0");

    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  }
}
