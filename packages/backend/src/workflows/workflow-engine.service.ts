import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { AgentQueueService } from '@/queue/agent-queue.service';

@Injectable()
export class WorkflowEngineService {
  private readonly logger = new Logger(WorkflowEngineService.name);

  constructor(
    private prisma: PrismaService,
    private queueService: AgentQueueService,
  ) {}

  async executeWorkflow(workflowId: string, userId: string): Promise<any> {
    this.logger.log(`Executing workflow ${workflowId}`);

    try {
      const workflow = await this.prisma.agentWorkflow.findUnique({
        where: { id: workflowId },
        include: {
          agents: true,
        },
      });

      if (!workflow) {
        throw new Error('Workflow not found');
      }

      // Verify user owns the workflow
      if (workflow.userId !== userId) {
        throw new Error('Unauthorized access to workflow');
      }

      // Create workflow execution
      const execution = await this.prisma.agentWorkflowExecution.create({
        data: {
          workflowId,
          status: 'running',
        },
      });

      // Queue workflow execution
      await this.queueService.addWorkflow({
        executionId: execution.id,
        workflowId,
        userId,
        nodes: workflow.nodes,
        edges: workflow.edges,
        config: workflow.config,
      });

      return { status: 'queued', workflowId, executionId: execution.id };
    } catch (error) {
      this.logger.error(`Workflow execution failed: ${(error as Error).message}`);
      throw error;
    }
  }

  async getWorkflowExecution(executionId: string, userId: string): Promise<any> {
    const execution = await this.prisma.agentWorkflowExecution.findUnique({
      where: { id: executionId },
      include: {
        workflow: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!execution) {
      throw new Error('Execution not found');
    }

    if (execution.workflow.userId !== userId) {
      throw new Error('Unauthorized access');
    }

    return execution;
  }
}
