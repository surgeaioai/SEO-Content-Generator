import { Kafka, type Consumer, type ConsumerSubscribeTopic, logLevel } from "kafkajs";

import { logger } from "@/lib/logger";
import { processAiJob } from "@/lib/workers/aiWorker";
import { processSeoJob } from "@/lib/workers/seoWorker";

export const KAFKA_TOPICS = {
  aiContentJobs: "ai-content-jobs",
  seoAnalysisJobs: "seo-analysis-jobs",
  notificationJobs: "notification-jobs",
  analyticsEvents: "analytics-events",
} as const;

export interface AiContentJobMessage {
  jobId: string;
  projectId: string;
  userId: string;
  wordCount: number;
  brandGuidelines?: string;
  brandVoice?: string;
  contentType?: string;
  internalLinks?: string[];
  targetKeywords?: string[];
  customKeywords?: string[];
  quickMode?: boolean;
  ctas?: string[];
}

export interface SeoAnalysisJobMessage {
  jobId: string;
  projectId: string;
  userId: string;
}

export interface NotificationJobMessage {
  jobId: string;
  channel: "email" | "webhook" | "push";
  recipient: string;
  subject?: string;
  body: string;
}

export interface AnalyticsEventMessage {
  eventId: string;
  eventName: string;
  userId?: string;
  timestamp: string;
  payload: Record<string, unknown>;
}

export type KafkaMessageByTopic = {
  [KAFKA_TOPICS.aiContentJobs]: AiContentJobMessage;
  [KAFKA_TOPICS.seoAnalysisJobs]: SeoAnalysisJobMessage;
  [KAFKA_TOPICS.notificationJobs]: NotificationJobMessage;
  [KAFKA_TOPICS.analyticsEvents]: AnalyticsEventMessage;
};

let kafkaClient: Kafka | null = null;
let producerConnected = false;

function brokersFromEnv(): string[] {
  return (process.env.KAFKA_BROKERS ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

/**
 * Returns true when Kafka is configured via environment.
 */
export function isKafkaConfigured(): boolean {
  return brokersFromEnv().length > 0;
}

function getKafkaClient(): Kafka | null {
  if (kafkaClient) {
    return kafkaClient;
  }

  const brokers = brokersFromEnv();
  if (brokers.length === 0) {
    return null;
  }

  kafkaClient = new Kafka({
    clientId: process.env.KAFKA_CLIENT_ID ?? "seo-ai-writer",
    brokers,
    logLevel: logLevel.ERROR,
  });
  return kafkaClient;
}

/**
 * Publishes a typed message to Kafka topic. Returns false when Kafka is unavailable.
 */
export async function publishKafkaMessage<TTopic extends keyof KafkaMessageByTopic>(
  topic: TTopic,
  message: KafkaMessageByTopic[TTopic],
): Promise<boolean> {
  const kafka = getKafkaClient();
  if (!kafka) {
    return false;
  }

  try {
    const producer = kafka.producer();
    if (!producerConnected) {
      await producer.connect();
      producerConnected = true;
    }

    await producer.send({
      topic,
      messages: [{ key: "job", value: JSON.stringify(message) }],
    });
    return true;
  } catch (error: unknown) {
    logger.error({ err: error, topic: String(topic) }, "kafka publish failed");
    return false;
  }
}

/**
 * Creates and starts a Kafka consumer for one topic.
 */
export async function startKafkaConsumer<TTopic extends keyof KafkaMessageByTopic>(params: {
  groupId: string;
  topic: TTopic;
  fromBeginning?: boolean;
  handler: (message: KafkaMessageByTopic[TTopic]) => Promise<void>;
}): Promise<Consumer | null> {
  const kafka = getKafkaClient();
  if (!kafka) {
    return null;
  }

  const consumer = kafka.consumer({ groupId: params.groupId });
  const subscription: ConsumerSubscribeTopic = {
    topic: params.topic,
    fromBeginning: params.fromBeginning ?? false,
  };

  await consumer.connect();
  await consumer.subscribe(subscription);
  await consumer.run({
    eachMessage: async ({ message }) => {
      const raw = message.value?.toString();
      if (!raw) return;
      try {
        const parsed = JSON.parse(raw) as KafkaMessageByTopic[TTopic];
        await params.handler(parsed);
      } catch (error: unknown) {
        logger.error(
          { err: error, topic: String(params.topic) },
          "kafka consumer parse/handler error",
        );
      }
    },
  });

  return consumer;
}

/**
 * Starts default workers for AI and SEO job topics.
 */
export async function startDefaultKafkaWorkers(): Promise<Consumer[]> {
  const consumers: Consumer[] = [];
  const aiConsumer = await startKafkaConsumer({
    groupId: process.env.KAFKA_AI_GROUP_ID ?? "seo-ai-writer-ai-workers",
    topic: KAFKA_TOPICS.aiContentJobs,
    handler: processAiJob,
  });
  if (aiConsumer) consumers.push(aiConsumer);

  const seoConsumer = await startKafkaConsumer({
    groupId: process.env.KAFKA_SEO_GROUP_ID ?? "seo-ai-writer-seo-workers",
    topic: KAFKA_TOPICS.seoAnalysisJobs,
    handler: processSeoJob,
  });
  if (seoConsumer) consumers.push(seoConsumer);

  return consumers;
}
